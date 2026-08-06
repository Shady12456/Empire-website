-- Empire Hybrid Lounge - Initial Schema Migration
-- Version: 001
-- Description: Initial database schema with all tables, enums, and helper functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUM types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'restaurant_manager',
  'kitchen_staff',
  'club_manager',
  'bouncer',
  'customer'
);

CREATE TYPE locale AS ENUM ('en', 'fr');

CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway');

CREATE TYPE order_status AS ENUM (
  'draft',
  'pending_payment',
  'paid',
  'preparing',
  'ready',
  'completed',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'initiated',
  'pending',
  'successful',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded'
);

CREATE TYPE payment_provider AS ENUM ('campay', 'monetbil', 'sandbox');

CREATE TYPE reservation_status AS ENUM (
  'pending_payment',
  'confirmed',
  'checked_in',
  'cancelled',
  'expired',
  'refunded'
);

CREATE TYPE pass_status AS ENUM (
  'active',
  'checked_in',
  'cancelled',
  'expired',
  'revoked'
);

CREATE TYPE event_table_status AS ENUM (
  'available',
  'locked',
  'reserved',
  'occupied',
  'unavailable'
);

CREATE TYPE guest_list_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'checked_in',
  'cancelled'
);

CREATE TYPE table_type AS ENUM (
  'restaurant_standard',
  'club_regular',
  'club_vip',
  'club_vvip'
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  preferred_language locale DEFAULT 'en',
  role user_role DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business settings table
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL DEFAULT 'Empire Lounge',
  restaurant_name TEXT NOT NULL DEFAULT 'Empire Restaurant',
  club_name TEXT NOT NULL DEFAULT 'Empire Night Club',
  timezone TEXT NOT NULL DEFAULT 'Africa/Douala',
  restaurant_opens_at TIME NOT NULL DEFAULT '08:00',
  restaurant_closes_at TIME NOT NULL DEFAULT '17:30',
  restaurant_order_override BOOLEAN DEFAULT false,
  restaurant_order_override_reason TEXT,
  club_opens_at TIME NOT NULL DEFAULT '20:00',
  club_closes_at TIME NOT NULL DEFAULT '06:00',
  address TEXT NOT NULL DEFAULT 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon',
  coordinates TEXT,
  phone TEXT NOT NULL DEFAULT '+237600000000',
  email TEXT NOT NULL DEFAULT 'info@empire-lounge.com',
  whatsapp TEXT,
  default_currency TEXT NOT NULL DEFAULT 'XAF',
  payment_provider payment_provider DEFAULT 'sandbox',
  cancellation_policy TEXT,
  social_links JSONB DEFAULT '{}',
  map_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant categories
CREATE TABLE restaurant_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_fr TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES restaurant_categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_xaf INTEGER NOT NULL CHECK (price_xaf >= 0),
  preparation_time_minutes INTEGER DEFAULT 15,
  image_path TEXT,
  is_available BOOLEAN DEFAULT true,
  late_night_available BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Physical tables (for both restaurant and club)
CREATE TABLE physical_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  table_type table_type NOT NULL,
  section TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  minimum_spend_xaf INTEGER DEFAULT 0,
  map_x INTEGER NOT NULL DEFAULT 0,
  map_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 60,
  height INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_type order_type NOT NULL DEFAULT 'dine_in',
  restaurant_table_id UUID REFERENCES physical_tables(id),
  status order_status DEFAULT 'draft',
  subtotal_xaf INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_xaf >= 0),
  fees_xaf INTEGER NOT NULL DEFAULT 0 CHECK (fees_xaf >= 0),
  total_xaf INTEGER NOT NULL DEFAULT 0 CHECK (total_xaf >= 0),
  customer_note TEXT,
  kitchen_note TEXT,
  payment_status payment_status DEFAULT 'initiated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  item_name_snapshot TEXT NOT NULL,
  unit_price_snapshot INTEGER NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_xaf INTEGER NOT NULL CHECK (line_total_xaf >= 0),
  customer_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_fr TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  doors_open_at TIME DEFAULT '20:00',
  flyer_path TEXT,
  venue TEXT DEFAULT 'Empire Night Club',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  age_policy TEXT,
  dress_code TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  seo_title_en TEXT,
  seo_title_fr TEXT,
  seo_description_en TEXT,
  seo_description_fr TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket types
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_xaf INTEGER NOT NULL DEFAULT 0 CHECK (price_xaf >= 0),
  total_inventory INTEGER NOT NULL CHECK (total_inventory >= 0),
  reserved_inventory INTEGER NOT NULL DEFAULT 0 CHECK (reserved_inventory >= 0),
  sold_inventory INTEGER NOT NULL DEFAULT 0 CHECK (sold_inventory >= 0),
  sales_start_at TIMESTAMPTZ NOT NULL,
  sales_end_at TIMESTAMPTZ NOT NULL,
  max_per_purchase INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event tables
CREATE TABLE event_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  physical_table_id UUID NOT NULL REFERENCES physical_tables(id),
  price_xaf INTEGER NOT NULL DEFAULT 0 CHECK (price_xaf >= 0),
  minimum_spend_xaf INTEGER DEFAULT 0,
  status event_table_status DEFAULT 'available',
  locked_by_user_id UUID REFERENCES profiles(id),
  locked_until TIMESTAMPTZ,
  reservation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, physical_table_id)
);

-- Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id),
  event_table_id UUID REFERENCES event_tables(id),
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  status reservation_status DEFAULT 'pending_payment',
  deposit_amount_xaf INTEGER DEFAULT 0 CHECK (deposit_amount_xaf >= 0),
  total_amount_xaf INTEGER NOT NULL DEFAULT 0 CHECK (total_amount_xaf >= 0),
  payment_status payment_status DEFAULT 'initiated',
  customer_note TEXT,
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event ticket orders
CREATE TABLE event_ticket_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id),
  status order_status DEFAULT 'draft',
  subtotal_xaf INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_xaf >= 0),
  fees_xaf INTEGER NOT NULL DEFAULT 0 CHECK (fees_xaf >= 0),
  total_xaf INTEGER NOT NULL DEFAULT 0 CHECK (total_xaf >= 0),
  payment_status payment_status DEFAULT 'initiated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Event ticket items
CREATE TABLE event_ticket_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_order_id UUID NOT NULL REFERENCES event_ticket_orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  ticket_name_snapshot TEXT NOT NULL,
  unit_price_snapshot INTEGER NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_xaf INTEGER NOT NULL CHECK (line_total_xaf >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest list entries
CREATE TABLE guest_list_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  status guest_list_status DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  internal_reference TEXT NOT NULL UNIQUE,
  provider_reference TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('order', 'reservation', 'ticket_order')),
  target_id UUID NOT NULL,
  payment_method TEXT,
  phone_number TEXT,
  amount_xaf INTEGER NOT NULL CHECK (amount_xaf > 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  status payment_status DEFAULT 'initiated',
  failure_code TEXT,
  failure_message TEXT,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment events (webhook records)
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  payment_reference UUID,
  event_type TEXT NOT NULL,
  signature_valid BOOLEAN DEFAULT false,
  sanitized_payload JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'received' CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processing_error TEXT
);

-- Passes
CREATE TABLE passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('order', 'reservation', 'ticket_order')),
  target_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_version INTEGER DEFAULT 1,
  status pass_status DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  locale locale DEFAULT 'en',
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_success_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_fr TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_role user_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  request_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_events_published ON events(is_published) WHERE is_published = true;
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX idx_event_tables_event_id ON event_tables(event_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_event_id ON reservations(event_id);
CREATE INDEX idx_passes_user_id ON passes(user_id);
CREATE INDEX idx_passes_token_hash ON passes(token_hash);
CREATE INDEX idx_passes_event_id ON passes(event_id);
CREATE INDEX idx_payments_internal_reference ON payments(internal_reference);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
