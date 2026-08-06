-- Empire Lounge - Club Packages and Restaurant Delivery
-- Version: 004
-- Description: Add club drink packages and restaurant delivery support

-- ============================================
-- CLUB DRINK PACKAGES
-- ============================================

CREATE TYPE package_category AS ENUM (
  'drinks',
  'champagne',
  'bottles',
  'vip_gold',
  'custom'
);

CREATE TYPE package_status AS ENUM (
  'active',
  'inactive',
  'sold_out'
);

-- Club packages table
CREATE TABLE club_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  category package_category NOT NULL,
  includes_en TEXT, -- JSON array of included items in English
  includes_fr TEXT, -- JSON array of included items in French
  price_xaf INTEGER NOT NULL CHECK (price_xaf >= 0),
  deposit_xaf INTEGER DEFAULT 0 CHECK (deposit_xaf >= 0),
  minimum_spend_xaf INTEGER DEFAULT 0 CHECK (minimum_spend_xaf >= 0),
  capacity INTEGER DEFAULT 1 CHECK (capacity > 0), -- Number of tables included
  max_per_event INTEGER CHECK (max_per_event > 0),
  inventory INTEGER CHECK (inventory > 0 OR inventory = -1), -- -1 for unlimited
  reserved INTEGER DEFAULT 0 CHECK (reserved >= 0),
  sold INTEGER DEFAULT 0 CHECK (sold >= 0),
  is_vip BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  sales_start_at TIMESTAMPTZ,
  sales_end_at TIMESTAMPTZ,
  status package_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package availability by event
CREATE TABLE event_package_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES club_packages(id) ON DELETE CASCADE,
  custom_price_xaf INTEGER, -- Override package price for this event
  custom_deposit_xaf INTEGER, -- Override deposit for this event
  available_inventory INTEGER, -- Event-specific inventory limit
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, package_id)
);

-- Reservation to package mapping
CREATE TABLE reservation_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES club_packages(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price_snapshot INTEGER NOT NULL CHECK (unit_price_snapshot >= 0),
  line_total_snapshot INTEGER NOT NULL CHECK (line_total_snapshot >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reservation_id, package_id)
);

-- ============================================
-- RESTAURANT DELIVERY
-- ============================================

-- Delivery zones with pricing
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  delivery_fee_xaf INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_xaf >= 0),
  min_order_xaf INTEGER DEFAULT 0 CHECK (min_order_xaf >= 0),
  estimated_minutes INTEGER DEFAULT 30,
  estimated_max_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add delivery address fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type order_type DEFAULT 'dine_in';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivery BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zone_id UUID REFERENCES delivery_zones(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_landmark TEXT; -- Landmark for easier location
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_coordinates TEXT; -- lat,lng for maps
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_xaf INTEGER DEFAULT 0 CHECK (delivery_fee_xaf >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMPTZ;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_club_packages_category ON club_packages(category);
CREATE INDEX idx_club_packages_status ON club_packages(status);
CREATE INDEX idx_club_packages_vip ON club_packages(is_vip) WHERE is_vip = true;
CREATE INDEX idx_club_packages_featured ON club_packages(is_featured) WHERE is_featured = true;
CREATE INDEX idx_event_package_availability_event ON event_package_availability(event_id);
CREATE INDEX idx_reservation_packages_reservation ON reservation_packages(reservation_id);
CREATE INDEX idx_delivery_zones_active ON delivery_zones(is_active) WHERE is_active = true;

-- ============================================
-- UPDATED SEED DATA
-- ============================================

-- Insert club packages
INSERT INTO club_packages (name_en, name_fr, description_en, description_fr, category, includes_en, includes_fr, price_xaf, deposit_xaf, minimum_spend_xaf, capacity, is_vip, is_featured, display_order, status) VALUES
-- Regular drink packages
(
  'Classic Night',
  'Nuit Classique',
  'Perfect for groups wanting drinks and good vibes',
  'Parfait pour les groupes qui veulent des boissons et de bonnes ambiances',
  'drinks',
  '["2 Vodka bottles", "4 Energy drinks", "Mixers and ice", "Snacks"]',
  '["2 Bouteilles Vodka", "4 Boissons énergisantes", "Mixers et glaçons", "Snacks"]',
  25000, 10000, 15000, 1, false, false, 1, 'active'
),
(
  'Premium Party',
  'Fête Premium',
  'Our most popular package for celebrations',
  'Notre forfait le plus populaire pour les célébrations',
  'drinks',
  '["2 Whisky bottles", "6 Mixers", "Premium ice", "Fruit platter", "DJ request"]',
  '["2 Bouteilles Whisky", "6 Mixers", "Glaçons premium", "Plateau de fruits", "Demande DJ"]',
  45000, 20000, 25000, 1, false, true, 2, 'active'
),
(
  'Executive Mix',
  'Mix Exécutif',
  'For the sophisticated party-goer',
  'Pour le fêtard sophistiqué',
  'drinks',
  '["1 Vodka", "1 Rum", "1 Whisky", "8 Mixers", "Premium snacks", "Dedicated server"]',
  '["1 Vodka", "1 Rhum", "1 Whisky", "8 Mixers", "Snacks premium", "Serveur dédié"]',
  65000, 30000, 40000, 1, false, false, 3, 'active'
),

-- Champagne packages
(
  'Moët & Chandon',
  'Moët & Chandon',
  'Iconic champagne for special occasions',
  'Champagne iconique pour les occasions spéciales',
  'champagne',
  '["Moët & Chandon Imperial 750ml", "6 Mixers", "Strawberries", "VIP section access"]',
  '["Moët & Chandon Imperial 750ml", "6 Mixers", "Fraises", "Accès section VIP"]',
  85000, 40000, 50000, 1, true, true, 4, 'active'
),
(
  'Veuve Clicquot',
  'Veuve Clicquot',
  'Luxury champagne experience',
  'Expérience champagne de luxe',
  'champagne',
  '["Veuve Clicquot Yellow Label 750ml", "8 Mixers", "Chocolate truffles", "VIP section", "Photo service"]',
  '["Veuve Clicquot Yellow Label 750ml", "8 Mixers", "Truffes au chocolat", "Section VIP", "Service photo"]',
  120000, 60000, 80000, 1, true, false, 5, 'active'
),
(
  'Dom Pérignon',
  'Dom Pérignon',
  'The ultimate champagne experience',
  "L'expérience champagne ultime",
  'champagne',
  '["Dom Pérignon 750ml", "10 Mixers", "Oysters", "Private lounge", "Dedicated host", "Premium fruit"]',
  '["Dom Pérignon 750ml", "10 Mixers", "Huîtres", "Lounge privé", "Hôte dédié", "Fruits premium"]',
  250000, 125000, 150000, 1, true, true, 6, 'active'
),

-- Bottle service packages
(
  'Bottle Trio',
  'Trio de Bouteilles',
  'Three premium bottles with everything you need',
  'Trois bouteilles premium avec tout ce qu\'il faut',
  'bottles',
  '["Choice of 3 bottles (Vodka/Whisky/Rum)", "9 Mixers", "Ice bucket", "Snack bowl", "Table service"]',
  '["Choix de 3 bouteilles (Vodka/Whisky/Rhum)", "9 Mixers", "Seau à glace", "Bol de snacks", "Service à table"]',
  55000, 25000, 35000, 1, false, false, 7, 'active'
),

-- VIP Gold packages
(
  'Gold Rush',
  'Gold Rush',
  'Exclusive gold package with top-shelf spirits',
  'Package or exclusif avec des spiritueux haut de gamme',
  'vip_gold',
  '["Grey Goose Vodka", "Hennessy Cognac", "18 Mixers", "Premium snacks", "Private booth", "Dedicated host", "Complimentary shots"]',
  '["Grey Goose Vodka", "Hennessy Cognac", "18 Mixers", "Snacks premium", "Box privé", "Hôte dédié", "Shots offerts"]',
  150000, 75000, 100000, 1, true, true, 8, 'active'
),
(
  'Royal Suite',
  'Suite Royale',
  'The most exclusive experience at Empire',
  "L'expérience la plus exclusive à Empire",
  'vip_gold',
  '["Crystal Head Vodka", "Remy Martin VSOP", "24 Mixers", "Gourmet platter", "VVIP booth", "Personal host", "Welcome champagne", "Shisha"]',
  '["Crystal Head Vodka", "Remy Martin VSOP", "24 Mixers", "Plateau gourmet", "Box VVIP", "Hôte personnel", "Champagne de bienvenue", "Chicha"]',
  350000, 175000, 250000, 2, true, true, 9, 'active'
);

-- Insert delivery zones for Limbe area
INSERT INTO delivery_zones (name_en, name_fr, description_en, description_fr, delivery_fee_xaf, min_order_xaf, estimated_minutes, estimated_max_minutes, display_order) VALUES
(
  'Downtown Limbe',
  'Centre-ville de Limbé',
  'Limbe town center area',
  'Zone du centre-ville de Limbé',
  1000, 5000, 20, 35, 1
),
(
  'Mile 1-4',
  'Mile 1-4',
  'Mile 1 to Mile 4 area',
  'Zone Mile 1 à Mile 4',
  1500, 8000, 25, 40, 2
),
(
  'Botmkak',
  'Botmkak',
  'Botmkak area',
  'Zone Botmkak',
  2000, 10000, 30, 45, 3
),
(
  'Bali',
  'Bali',
  'Bali neighborhood',
  'Quartier Bali',
  2000, 10000, 30, 45, 4
),
(
  'Isokwe',
  'Isokwe',
  'Isokwe area',
  "Zone d'Isokwe",
  2500, 12000, 35, 50, 5
),
(
  'Outside Limbe',
  'Hors de Limbé',
  'Areas outside Limbe town (delivery fee varies)',
  'Zones hors de Limbé (frais variables)',
  5000, 20000, 45, 70, 6
);

-- ============================================
-- UPDATED RLS POLICIES
-- ============================================

-- Allow public read of active club packages
CREATE POLICY "Public can view active club packages" ON club_packages
  FOR SELECT USING (status = 'active');

-- Allow authenticated users to view all packages for admin
CREATE POLICY "Staff can manage club packages" ON club_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'club_manager')
      AND is_active = true
    )
  );

-- Allow public read of active delivery zones
CREATE POLICY "Public can view active delivery zones" ON delivery_zones
  FOR SELECT USING (is_active = true);

-- Allow staff to manage delivery zones
CREATE POLICY "Staff can manage delivery zones" ON delivery_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'restaurant_manager')
      AND is_active = true
    )
  );

-- Event package availability policies
CREATE POLICY "Public can view event package availability" ON event_package_availability
  FOR SELECT USING (is_available = true);

CREATE POLICY "Staff can manage event package availability" ON event_package_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'club_manager')
      AND is_active = true
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check package availability
CREATE OR REPLACE FUNCTION check_package_availability(
  p_package_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_package club_packages;
  v_available INTEGER;
BEGIN
  SELECT * INTO v_package FROM club_packages WHERE id = p_package_id AND status = 'active';
  
  IF v_package IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if inventory is unlimited (-1) or has stock
  IF v_package.inventory = -1 THEN
    RETURN true;
  END IF;
  
  -- Check remaining inventory
  v_available := v_package.inventory - v_package.reserved - v_package.sold;
  RETURN v_available >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reserve package inventory
CREATE OR REPLACE FUNCTION reserve_package_inventory(
  p_package_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_package club_packages;
  v_available INTEGER;
BEGIN
  -- Lock the row
  SELECT * INTO v_package FROM club_packages WHERE id = p_package_id FOR UPDATE;
  
  IF v_package IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate available
  IF v_package.inventory = -1 THEN
    -- Unlimited, just reserve
    UPDATE club_packages SET reserved = reserved + p_quantity WHERE id = p_package_id;
    RETURN true;
  END IF;
  
  v_available := v_package.inventory - v_package.reserved - v_package.sold;
  
  IF v_available >= p_quantity THEN
    UPDATE club_packages SET reserved = reserved + p_quantity WHERE id = p_package_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release reserved inventory
CREATE OR REPLACE FUNCTION release_package_inventory(
  p_package_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE club_packages 
  SET reserved = GREATEST(0, reserved - p_quantity)
  WHERE id = p_package_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert reserved to sold
CREATE OR REPLACE FUNCTION confirm_package_sale(
  p_package_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE club_packages 
  SET 
    reserved = GREATEST(0, reserved - p_quantity),
    sold = sold + p_quantity
  WHERE id = p_package_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at trigger for club_packages
CREATE OR REPLACE FUNCTION update_club_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_club_packages_updated_at
  BEFORE UPDATE ON club_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_club_packages_updated_at();

-- Update updated_at trigger for delivery_zones
CREATE OR REPLACE FUNCTION update_delivery_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_zones_updated_at();
