-- Empire Hybrid Lounge - Database Functions
-- Version: 003
-- Description: Core database functions for business logic

-- Check if restaurant is within ordering hours
CREATE OR REPLACE FUNCTION is_restaurant_ordering_open()
RETURNS BOOLEAN AS $$
DECLARE
  settings business_settings;
  current_time TIME;
  open_time TIME;
  close_time TIME;
BEGIN
  SELECT * INTO settings FROM business_settings WHERE is_active = true LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If override is active, ordering is open
  IF settings.restaurant_order_override THEN
    RETURN true;
  END IF;
  
  current_time := CURRENT_TIME AT TIME ZONE settings.timezone;
  open_time := settings.restaurant_opens_at::TIME;
  close_time := settings.restaurant_closes_at::TIME;
  
  -- Handle overnight closing (e.g., 06:00)
  IF close_time < open_time THEN
    RETURN current_time >= open_time OR current_time < close_time;
  END IF;
  
  RETURN current_time >= open_time AND current_time < close_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get restaurant status
CREATE OR REPLACE FUNCTION get_restaurant_status()
RETURNS JSONB AS $$
DECLARE
  settings business_settings;
  result JSONB;
BEGIN
  SELECT * INTO settings FROM business_settings WHERE is_active = true LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'is_open', false,
      'is_ordering_open', false,
      'reason', 'Business settings not configured'
    );
  END IF;
  
  result := jsonb_build_object(
    'is_open', 
      CASE 
        WHEN CURRENT_TIME AT TIME ZONE settings.timezone >= settings.restaurant_opens_at::TIME
          AND (
            settings.restaurant_closes_at::TIME > settings.restaurant_opens_at::TIME
            AND CURRENT_TIME AT TIME ZONE settings.timezone < settings.restaurant_closes_at::TIME
            OR settings.restaurant_closes_at::TIME <= settings.restaurant_opens_at::TIME
            AND (CURRENT_TIME AT TIME ZONE settings.timezone >= settings.restaurant_opens_at::TIME OR CURRENT_TIME AT TIME ZONE settings.timezone < settings.restaurant_closes_at::TIME)
          )
        THEN true
        ELSE false
      END,
    'is_ordering_open', is_restaurant_ordering_open(),
    'closes_at', settings.restaurant_closes_at,
    'override_active', settings.restaurant_order_override
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create order with items (atomic operation)
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_delivery_type order_type,
  p_restaurant_table_id UUID,
  p_customer_note TEXT,
  p_items JSONB
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_subtotal INTEGER := 0;
  v_fees INTEGER := 0;
  v_total INTEGER := 0;
BEGIN
  -- Validate ordering is open
  IF NOT is_restaurant_ordering_open() THEN
    RAISE EXCEPTION 'Restaurant ordering is currently closed';
  END IF;
  
  -- Calculate totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'quantity')::INTEGER * (v_item->>'price')::INTEGER;
  END LOOP;
  
  -- Calculate fees (e.g., 2% service fee)
  v_fees := GREATEST(100, ROUND(v_subtotal * 0.02));
  v_total := v_subtotal + v_fees;
  
  -- Create order
  INSERT INTO orders (
    user_id, delivery_type, restaurant_table_id, customer_note,
    subtotal_xaf, fees_xaf, total_xaf, status, payment_status
  ) VALUES (
    p_user_id, p_delivery_type, p_restaurant_table_id, p_customer_note,
    v_subtotal, v_fees, v_total, 'draft', 'initiated'
  ) RETURNING id INTO v_order_id;
  
  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id, menu_item_id, item_name_snapshot, unit_price_snapshot,
      quantity, line_total_xaf, customer_instructions
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::UUID,
      v_item->>'name',
      (v_item->>'price')::INTEGER,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'quantity')::INTEGER * (v_item->>'price')::INTEGER,
      v_item->>'instructions'
    );
  END LOOP;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock event table (with atomic operation)
CREATE OR REPLACE FUNCTION lock_event_table(
  p_event_table_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_table event_tables;
  v_lock_result JSONB;
  v_lock_duration INTERVAL := INTERVAL '15 minutes';
BEGIN
  -- Use advisory lock for the event_table_id
  IF NOT pg_try_advisory_lock(hashtext(p_event_table_id::TEXT)) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Could not acquire lock'
    );
  END IF;
  
  BEGIN
    -- Get current table state
    SELECT * INTO v_table FROM event_tables WHERE id = p_event_table_id FOR UPDATE;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Table not found');
    END IF;
    
    -- Check if table is available
    IF v_table.status != 'available' THEN
      -- Check if lock has expired
      IF v_table.status = 'locked' AND v_table.locked_until IS NOT NULL 
         AND v_table.locked_until < NOW() THEN
        -- Lock expired, release and allow new lock
        UPDATE event_tables 
        SET status = 'available', locked_by_user_id = NULL, locked_until = NULL, updated_at = NOW()
        WHERE id = p_event_table_id;
      ELSE
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Table is not available',
          'current_status', v_table.status
        );
      END IF;
    END IF;
    
    -- Lock the table
    UPDATE event_tables 
    SET status = 'locked', 
        locked_by_user_id = p_user_id, 
        locked_until = NOW() + v_lock_duration,
        updated_at = NOW()
    WHERE id = p_event_table_id
    RETURNING row_to_json(*) INTO v_lock_result;
    
    RETURN jsonb_build_object(
      'success', true,
      'table', v_lock_result,
      'expires_at', NOW() + v_lock_duration
    );
    
  END;
  
  PERFORM pg_advisory_unlock(hashtext(p_event_table_id::TEXT));
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Release event table lock
CREATE OR REPLACE FUNCTION release_event_table_lock(
  p_event_table_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_table event_tables;
BEGIN
  SELECT * INTO v_table FROM event_tables WHERE id = p_event_table_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Table not found');
  END IF;
  
  -- Check if user owns the lock
  IF v_table.locked_by_user_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your lock');
  END IF;
  
  UPDATE event_tables
  SET status = 'available', locked_by_user_id = NULL, locked_until = NULL, updated_at = NOW()
  WHERE id = p_event_table_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reserve ticket inventory (atomic operation)
CREATE OR REPLACE FUNCTION reserve_ticket_inventory(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_ticket ticket_types;
  v_available INTEGER;
BEGIN
  SELECT * INTO v_ticket FROM ticket_types WHERE id = p_ticket_type_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if sales are active
  IF NOT (v_ticket.sales_start_at <= NOW() AND v_ticket.sales_end_at >= NOW()) THEN
    RETURN false;
  END IF;
  
  -- Check availability
  v_available := v_ticket.total_inventory - v_ticket.reserved_inventory - v_ticket.sold_inventory;
  
  IF v_available < p_quantity THEN
    RETURN false;
  END IF;
  
  -- Reserve inventory
  UPDATE ticket_types
  SET reserved_inventory = reserved_inventory + p_quantity,
      updated_at = NOW()
  WHERE id = p_ticket_type_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirm ticket reservation after payment
CREATE OR REPLACE FUNCTION confirm_ticket_inventory(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ticket_types
  SET 
    reserved_inventory = GREATEST(0, reserved_inventory - p_quantity),
    sold_inventory = sold_inventory + p_quantity,
    updated_at = NOW()
  WHERE id = p_ticket_type_id
    AND reserved_inventory >= p_quantity;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel ticket reservation
CREATE OR REPLACE FUNCTION cancel_ticket_reservation(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ticket_types
  SET 
    reserved_inventory = GREATEST(0, reserved_inventory - p_quantity),
    updated_at = NOW()
  WHERE id = p_ticket_type_id
    AND reserved_inventory >= p_quantity;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process successful payment (atomic operation)
CREATE OR REPLACE FUNCTION process_successful_payment(
  p_internal_reference TEXT,
  p_provider_reference TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_payment payments%ROWTYPE;
  v_order orders%ROWTYPE;
  v_reservation reservations%ROWTYPE;
  v_ticket_order event_ticket_orders%ROWTYPE;
BEGIN
  -- Get payment
  SELECT * INTO v_payment FROM payments 
  WHERE internal_reference = p_internal_reference 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  -- Check if already processed
  IF v_payment.status = 'successful' THEN
    RETURN jsonb_build_object('success', true, 'already_processed', true);
  END IF;
  
  -- Update payment status
  UPDATE payments
  SET status = 'successful',
      provider_reference = p_provider_reference,
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = v_payment.id;
  
  -- Update target based on type
  CASE v_payment.target_type
    WHEN 'order' THEN
      UPDATE orders
      SET status = 'paid',
          payment_status = 'successful',
          paid_at = NOW(),
          updated_at = NOW()
      WHERE id = v_payment.target_id
      RETURNING * INTO v_order;
      
    WHEN 'reservation' THEN
      UPDATE reservations
      SET status = 'confirmed',
          payment_status = 'successful',
          confirmed_at = NOW(),
          updated_at = NOW()
      WHERE id = v_payment.target_id
      RETURNING * INTO v_reservation;
      
      -- Update event table
      IF v_reservation.event_table_id IS NOT NULL THEN
        UPDATE event_tables
        SET status = 'reserved',
            reservation_id = v_reservation.id,
            locked_by_user_id = NULL,
            locked_until = NULL,
            updated_at = NOW()
        WHERE id = v_reservation.event_table_id;
      END IF;
      
    WHEN 'ticket_order' THEN
      UPDATE event_ticket_orders
      SET status = 'paid',
          payment_status = 'successful',
          paid_at = NOW(),
          updated_at = NOW()
      WHERE id = v_payment.target_id
      RETURNING * INTO v_ticket_order;
  END CASE;
  
  RETURN jsonb_build_object('success', true, 'payment_id', v_payment.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check in pass (atomic operation)
CREATE OR REPLACE FUNCTION check_in_pass(
  p_token_hash TEXT,
  p_bouncer_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_pass passes%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Get pass with lock
  SELECT * INTO v_pass FROM passes 
  WHERE token_hash = p_token_hash 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid',
      'message', 'Pass not found'
    );
  END IF;
  
  -- Check status
  CASE v_pass.status
    WHEN 'checked_in' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'already_used',
        'message', 'Pass already used',
        'checked_in_at', v_pass.checked_in_at
      );
      
    WHEN 'cancelled' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'cancelled',
        'message', 'Pass has been cancelled'
      );
      
    WHEN 'expired' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'expired',
        'message', 'Pass has expired'
      );
      
    WHEN 'revoked' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'revoked',
        'message', 'Pass has been revoked'
      );
      
    WHEN 'active' THEN
      -- Check expiration
      IF v_pass.expires_at < NOW() THEN
        UPDATE passes SET status = 'expired' WHERE id = v_pass.id;
        RETURN jsonb_build_object(
          'success', false,
          'error', 'expired',
          'message', 'Pass has expired'
        );
      END IF;
      
      -- Perform check-in
      UPDATE passes
      SET status = 'checked_in',
          checked_in_at = NOW(),
          checked_in_by = p_bouncer_id,
          updated_at = NOW()
      WHERE id = v_pass.id;
      
      -- Update reservation if applicable
      IF v_pass.target_type = 'reservation' AND v_pass.target_id IS NOT NULL THEN
        UPDATE reservations
        SET status = 'checked_in',
            checked_in_at = NOW(),
            updated_at = NOW()
        WHERE id = v_pass.target_id;
        
        -- Update event table
        UPDATE event_tables
        SET status = 'occupied',
            updated_at = NOW()
        WHERE reservation_id = v_pass.target_id;
      END IF;
      
      RETURN jsonb_build_object(
        'success', true,
        'error', null,
        'message', 'Check-in successful',
        'pass_id', v_pass.id,
        'event_id', v_pass.event_id,
        'user_id', v_pass.user_id
      );
  END CASE;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', 'unknown',
    'message', 'Unknown pass status'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire abandoned reservations
CREATE OR REPLACE FUNCTION expire_abandoned_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Release expired table locks
  UPDATE event_tables
  SET status = 'available',
      locked_by_user_id = NULL,
      locked_until = NULL,
      updated_at = NOW()
  WHERE status = 'locked'
    AND locked_until < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Expire abandoned reservations
  UPDATE reservations
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '30 minutes'
    AND payment_status != 'successful';
  
  GET DIAGNOSTICS v_count = v_count + ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate pass token
CREATE OR REPLACE FUNCTION generate_pass_token()
RETURNS TEXT AS $$
BEGIN
  -- Generate a cryptographically random token
  RETURN encode(
    gen_random_bytes(32),
    'hex'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hash pass token (one-way)
CREATE OR REPLACE FUNCTION hash_pass_token(p_token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    sha256(convert_to(p_token || COALESCE(current_setting('app.pepper', true), ''), 'utf8')::bytea),
    'hex'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_before_state JSONB DEFAULT NULL,
  p_after_state JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_actor_id UUID;
  v_actor_role user_role;
  v_log_id UUID;
BEGIN
  -- Get current user info
  BEGIN
    SELECT id, role INTO v_actor_id, v_actor_role
    FROM profiles
    WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
    v_actor_role := NULL;
  END;
  
  INSERT INTO audit_logs (
    actor_id, actor_role, action, entity_type, entity_id,
    before_state, after_state
  ) VALUES (
    v_actor_id, v_actor_role, p_action, p_entity_type, p_entity_id,
    p_before_state, p_after_state
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurant_categories_updated_at
  BEFORE UPDATE ON restaurant_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_physical_tables_updated_at
  BEFORE UPDATE ON physical_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_event_tables_updated_at
  BEFORE UPDATE ON event_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
