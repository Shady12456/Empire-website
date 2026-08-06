-- Empire Hybrid Lounge - RLS Policies and Helper Functions
-- Version: 002
-- Description: Row Level Security policies and helper functions

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() = 'super_admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() IN ('super_admin', 'restaurant_manager', 'kitchen_staff', 'club_manager', 'bouncer');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_role(roles text[])
RETURNS BOOLEAN AS $$
  SELECT current_user_role() = ANY(roles);
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profile policies
CREATE POLICY "Public can view active profiles"
  ON profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Business settings policies
CREATE POLICY "Anyone can view business settings"
  ON business_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admin can manage business settings"
  ON business_settings FOR ALL
  USING (is_super_admin());

-- Restaurant categories policies
CREATE POLICY "Anyone can view active categories"
  ON restaurant_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Restaurant manager can manage categories"
  ON restaurant_categories FOR ALL
  USING (has_role(ARRAY['super_admin', 'restaurant_manager']));

-- Menu items policies
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (
    is_available = true
    AND category_id IN (
      SELECT id FROM restaurant_categories WHERE is_active = true
    )
  );

CREATE POLICY "Staff can view all menu items"
  ON menu_items FOR SELECT
  USING (is_staff());

CREATE POLICY "Restaurant manager can manage menu items"
  ON menu_items FOR ALL
  USING (has_role(ARRAY['super_admin', 'restaurant_manager']));

-- Physical tables policies
CREATE POLICY "Anyone can view active tables"
  ON physical_tables FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage tables"
  ON physical_tables FOR ALL
  USING (has_role(ARRAY['super_admin', 'restaurant_manager', 'club_manager']));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kitchen staff can view paid orders"
  ON orders FOR SELECT
  USING (
    has_role(ARRAY['super_admin', 'restaurant_manager', 'kitchen_staff'])
    OR (has_role(ARRAY['restaurant_manager']) AND status != 'draft')
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Kitchen staff can update order status"
  ON orders FOR UPDATE
  USING (
    has_role(ARRAY['super_admin', 'restaurant_manager', 'kitchen_staff'])
    AND status IN ('paid', 'preparing', 'ready', 'completed')
  );

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Kitchen staff can view order items"
  ON order_items FOR SELECT
  USING (has_role(ARRAY['super_admin', 'restaurant_manager', 'kitchen_staff']));

CREATE POLICY "Users can manage their own order items"
  ON order_items FOR ALL
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() AND status = 'draft')
  );

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (
    is_published = true
    OR is_super_admin()
    OR has_role(ARRAY['club_manager'])
  );

CREATE POLICY "Club manager can manage events"
  ON events FOR ALL
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Ticket types policies
CREATE POLICY "Anyone can view active ticket types for published events"
  ON ticket_types FOR SELECT
  USING (
    is_active = true
    AND event_id IN (
      SELECT id FROM events WHERE is_published = true
    )
  );

CREATE POLICY "Staff can view all ticket types"
  ON ticket_types FOR SELECT
  USING (has_role(ARRAY['super_admin', 'club_manager']));

CREATE POLICY "Club manager can manage ticket types"
  ON ticket_types FOR ALL
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Event tables policies
CREATE POLICY "Anyone can view event tables for published events"
  ON event_tables FOR SELECT
  USING (
    event_id IN (SELECT id FROM events WHERE is_published = true)
    OR is_super_admin()
    OR has_role(ARRAY['club_manager'])
  );

CREATE POLICY "Club manager can manage event tables"
  ON event_tables FOR ALL
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view reservations"
  ON reservations FOR SELECT
  USING (has_role(ARRAY['super_admin', 'club_manager', 'bouncer']));

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending_payment');

CREATE POLICY "Club manager can update any reservation"
  ON reservations FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Event ticket orders policies
CREATE POLICY "Users can view their own ticket orders"
  ON event_ticket_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view ticket orders"
  ON event_ticket_orders FOR SELECT
  USING (has_role(ARRAY['super_admin', 'club_manager']));

CREATE POLICY "Users can create ticket orders"
  ON event_ticket_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Event ticket items policies
CREATE POLICY "Users can view their own ticket items"
  ON event_ticket_items FOR SELECT
  USING (
    ticket_order_id IN (
      SELECT id FROM event_ticket_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view ticket items"
  ON event_ticket_items FOR SELECT
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Guest list policies
CREATE POLICY "Anyone can view guest list for published events"
  ON guest_list_entries FOR SELECT
  USING (
    event_id IN (SELECT id FROM events WHERE is_published = true)
    AND (
      auth.uid() = user_id
      OR is_super_admin()
      OR has_role(ARRAY['club_manager', 'bouncer'])
    )
  );

CREATE POLICY "Anyone can register for guest list"
  ON guest_list_entries FOR INSERT
  WITH CHECK (
    event_id IN (SELECT id FROM events WHERE is_published = true AND is_cancelled = false)
  );

CREATE POLICY "Users can update their own pending entries"
  ON guest_list_entries FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );

CREATE POLICY "Club manager can manage guest list"
  ON guest_list_entries FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'club_manager']));

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view payments"
  ON payments FOR SELECT
  USING (has_role(ARRAY['super_admin', 'restaurant_manager', 'club_manager']));

CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (has_role(ARRAY['super_admin']));

-- Payment events policies
CREATE POLICY "Staff can view payment events"
  ON payment_events FOR SELECT
  USING (has_role(ARRAY['super_admin', 'restaurant_manager', 'club_manager']));

-- Passes policies
CREATE POLICY "Users can view their own passes"
  ON passes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view passes"
  ON passes FOR SELECT
  USING (has_role(ARRAY['super_admin', 'club_manager', 'bouncer']));

CREATE POLICY "Bouncer can check in passes"
  ON passes FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'bouncer']));

-- Push subscriptions policies
CREATE POLICY "Users can manage their own subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  USING (has_role(ARRAY['super_admin', 'restaurant_manager', 'club_manager']));

-- Audit logs policies
CREATE POLICY "Staff can view audit logs"
  ON audit_logs FOR SELECT
  USING (has_role(ARRAY['super_admin']));

CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
