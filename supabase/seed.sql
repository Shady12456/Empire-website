-- Empire Lounge - Seed Data
-- Initial data for development and testing

-- Insert default business settings
INSERT INTO business_settings (
  business_name,
  restaurant_name,
  club_name,
  timezone,
  restaurant_opens_at,
  restaurant_closes_at,
  club_opens_at,
  club_closes_at,
  address,
  phone,
  email,
  default_currency,
  payment_provider,
  is_active
) VALUES (
  'Empire Lounge',
  'Empire Restaurant',
  'Empire Night Club',
  'Africa/Douala',
  '08:00',
  '17:30',
  '20:00',
  '06:00',
  'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon',
  '+237600000000',
  'info@empire-lounge.com',
  'XAF',
  'sandbox',
  true
);

-- Insert restaurant categories
INSERT INTO restaurant_categories (name_en, name_fr, slug, description_en, description_fr, display_order, is_active) VALUES
('Starters', 'Entrées', 'starters', 'Begin your culinary journey', 'Commencez votre voyage culinaire', 1, true),
('Main Courses', 'Plats Principaux', 'main-courses', 'Hearty dishes for every appetite', 'Plats copieux pour tous les appétits', 2, true),
('Grilled Specialties', 'Spécialités Grillées', 'grilled', 'Flame-kissed perfection', 'Perfection marquée à la flamme', 3, true),
('Seafood', 'Fruits de Mer', 'seafood', 'Fresh from the coast', 'Frais de la côte', 4, true),
('Desserts', 'Desserts', 'desserts', 'Sweet endings', 'Fins sucrées', 5, true),
('Beverages', 'Boissons', 'beverages', 'Refreshing drinks and cocktails', 'Boissons rafraichissantes et cocktails', 6, true);

-- Insert menu items
INSERT INTO menu_items (category_id, name_en, name_fr, description_en, description_fr, price_xaf, preparation_time_minutes, is_available, late_night_available, is_featured, display_order) 
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'starters'),
  'Crispy Plantain Chips',
  'Chips de Plantain Croustillants',
  'Golden fried plantain with spicy dip',
  'Plantain frit doré avec sauce épicée',
  1500,
  10,
  true,
  true,
  true,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'starters'),
  'Grilled Fish Skewers',
  'Brochettes de Poisson Grillé',
  'Marinated fish cubes on bamboo sticks',
  'Dés de poisson mariné sur bâtons de bambou',
  2500,
  12,
  true,
  true,
  false,
  2
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'main-courses'),
  'Ndole',
  'Ndolé',
  'Traditional bitter leaf stew with peanuts and shrimp',
  'Ragoût traditionnel de feuilles amères aux arachides et crevettes',
  4500,
  25,
  true,
  false,
  true,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'main-courses'),
  'Eru with Stockfish',
  'Eru au Poisson Séché',
  'Rich palm broth with waterleaf and stockfish',
  'Bouillon de palme riche avec Talinum triangulare et poisson séché',
  4000,
  20,
  true,
  false,
  true,
  2
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'main-courses'),
  'Koki',
  'Koki',
  'Steamed corn and bean cake wrapped in banana leaves',
  'Gâteau de maïs et haricots cuit à la vapeur dans des feuilles de bananier',
  2000,
  30,
  true,
  false,
  false,
  3
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'grilled'),
  'Soya Beignets (5 pieces)',
  'Soya Beignets (5 pièces)',
  'Spiced grilled beef skewers, Nigerian style',
  'Brochettes de bœuf épicées grillées, style nigérian',
  3500,
  15,
  true,
  true,
  true,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'grilled'),
  'Whole Grilled Fish',
  'Poisson Entier Grillé',
  'Fresh tilapia grilled to perfection with herbs',
  'Tilapia frais grillé à la perfection avec des herbes',
  6000,
  25,
  true,
  false,
  true,
  2
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'seafood'),
  'Prawn Curry',
  'Curry de Crevettes',
  'Creamy coconut curry with large tiger prawns',
  'Curry crémeux de noix de coco avec de grosses crevettes tigrées',
  5500,
  20,
  true,
  false,
  false,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'seafood'),
  'Grilled Lobster',
  'Homard Grillé',
  'Premium lobster with garlic butter',
  'Homard premium au beurre à l''ail',
  12000,
  30,
  true,
  false,
  true,
  2
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'desserts'),
  'Sweet Plantain',
  'Plantain Sucré',
  'Caramelized ripe plantain with vanilla ice cream',
  'Plantain mûr caramelisé avec glace à la vanille',
  2000,
  5,
  true,
  true,
  false,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'desserts'),
  'Puff-Puff',
  'Puff-Puff',
  'Deep-fried dough balls coated in powdered sugar',
  'Boules de pâte frites enrobées de sucre glace',
  1000,
  5,
  true,
  true,
  true,
  2
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'beverages'),
  'Palm Wine',
  'Vin de Palme',
  'Fresh tapped palm wine',
  'Vin de palme frais tapé',
  1000,
  2,
  true,
  true,
  true,
  1
UNION ALL
SELECT 
  (SELECT id FROM restaurant_categories WHERE slug = 'beverages'),
  'Champagne Bottle',
  'Bouteille de Champagne',
  'Premium champagne for celebrations',
  'Champagne premium pour les célébrations',
  45000,
  2,
  true,
  false,
  true,
  2;

-- Insert physical tables
INSERT INTO physical_tables (table_code, display_name, table_type, section, capacity, minimum_spend_xaf, map_x, map_y, width, height, is_active) VALUES
-- Restaurant tables
('R1', 'Table R1', 'restaurant_standard', 'Main Hall', 2, 0, 50, 50, 60, 60, true),
('R2', 'Table R2', 'restaurant_standard', 'Main Hall', 2, 0, 150, 50, 60, 60, true),
('R3', 'Table R3', 'restaurant_standard', 'Main Hall', 4, 0, 250, 50, 80, 60, true),
('R4', 'Table R4', 'restaurant_standard', 'Window', 4, 0, 50, 150, 80, 60, true),
('R5', 'Table R5', 'restaurant_standard', 'Window', 4, 0, 150, 150, 80, 60, true),
('R6', 'Table R6', 'restaurant_standard', 'VIP Section', 6, 0, 250, 150, 100, 60, true),
-- Club regular tables
('C1', 'Table C1', 'club_regular', 'Floor', 4, 10000, 100, 100, 60, 60, true),
('C2', 'Table C2', 'club_regular', 'Floor', 4, 10000, 200, 100, 60, 60, true),
('C3', 'Table C3', 'club_regular', 'Floor', 6, 15000, 300, 100, 70, 60, true),
-- VIP tables
('V1', 'VIP Booth V1', 'club_vip', 'VIP Area', 8, 50000, 100, 200, 100, 80, true),
('V2', 'VIP Booth V2', 'club_vip', 'VIP Area', 8, 50000, 250, 200, 100, 80, true),
-- VVIP tables
('VV1', 'Royal Suite', 'club_vvip', 'Royal Section', 12, 150000, 175, 300, 140, 100, true);

-- Insert sample events
INSERT INTO events (
  title_en, title_fr, slug, description_en, description_fr,
  start_at, end_at, doors_open_at, venue, is_published, is_featured,
  age_policy, dress_code
) VALUES
(
  'Afrobeat Night',
  'Soirée Afrobeat',
  'afrobeat-night',
  'Experience the best of African music with live performances from top artists. Dance to the rhythm of Nigeria, Ghana, and Cameroon!',
  'Vivez le meilleur de la musique africaine avec des performances live des meilleurs artistes. Dansez au rythme du Nigeria, du Ghana et du Cameroun!',
  NOW() + INTERVAL '7 days' + INTERVAL '20 hours',
  NOW() + INTERVAL '8 days' + INTERVAL '4 hours',
  '20:00',
  'Empire Night Club',
  true,
  true,
  '18+ only. Valid ID required at entry.',
  'Smart casual. No sportswear or flip-flops.'
),
(
  'Ladies Night',
  'Soirée Ladies',
  'ladies-night',
  'Exclusive ladies night with complimentary drinks, performances, and amazing vibes. Ladies enter free before midnight!',
  'Soirée ladies exclusive avec boissons offertes, performances et ambiances incroyables. Les ladies entrent gratuitement avant minuit!',
  NOW() + INTERVAL '14 days' + INTERVAL '21 hours',
  NOW() + INTERVAL '15 days' + INTERVAL '3 hours',
  '21:00',
  'Empire Night Club',
  true,
  true,
  '18+ only. Valid ID required.',
  'Dress to impress. Heels encouraged!'
),
(
  'Live Jazz & Cocktails',
  'Jazz Live & Cocktails',
  'live-jazz-cocktails',
  'Unwind with smooth jazz, craft cocktails, and a sophisticated atmosphere. Perfect for a relaxed evening.',
  'Détendez-vous avec du jazz suave, des cocktails artisanaux et une atmosphère sophistiquée. Parfait pour une soirée décontractée.',
  NOW() + INTERVAL '21 days' + INTERVAL '19 hours',
  NOW() + INTERVAL '22 days' + INTERVAL '23 hours',
  '19:00',
  'Empire Night Club',
  true,
  false,
  '21+ only. Valid ID required.',
  'Smart casual. No jeans or sneakers.'
);

-- Insert ticket types for events
INSERT INTO ticket_types (event_id, name_en, name_fr, description_en, description_fr, price_xaf, total_inventory, sales_start_at, sales_end_at, max_per_purchase, is_active)
SELECT 
  e.id,
  'Early Bird',
  'Tarif Réduit',
  'Limited early bird tickets at special price',
  'Billets tarif réduit limités à prix spécial',
  3000,
  50,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '5 days',
  4,
  true
FROM events e WHERE e.slug = 'afrobeat-night'
UNION ALL
SELECT 
  e.id,
  'General Admission',
  'Entrée Générale',
  'Standard entry to Afrobeat Night',
  'Entrée standard pour Soirée Afrobeat',
  5000,
  200,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '7 days',
  6,
  true
FROM events e WHERE e.slug = 'afrobeat-night'
UNION ALL
SELECT 
  e.id,
  'VIP Access',
  'Accès VIP',
  'VIP area access with complimentary drinks',
  'Accès zone VIP avec boissons offertes',
  15000,
  30,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '7 days',
  2,
  true
FROM events e WHERE e.slug = 'afrobeat-night'
UNION ALL
SELECT 
  e.id,
  'Free Entry',
  'Entrée Gratuite',
  'Ladies free entry before midnight',
  'Entrée gratuite pour les ladies avant minuit',
  0,
  100,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '14 days',
  1,
  true
FROM events e WHERE e.slug = 'ladies-night'
UNION ALL
SELECT 
  e.id,
  'General Admission',
  'Entrée Générale',
  'Standard entry for gentlemen',
  'Entrée standard pour messieurs',
  3000,
  150,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '14 days',
  4,
  true
FROM events e WHERE e.slug = 'ladies-night'
UNION ALL
SELECT 
  e.id,
  'VIP Package',
  'Package VIP',
  'VIP table with bottle service',
  'Table VIP avec service de bouteilles',
  40000,
  10,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '14 days',
  1,
  true
FROM events e WHERE e.slug = 'ladies-night'
UNION ALL
SELECT 
  e.id,
  'General Admission',
  'Entrée Générale',
  'Entry to Live Jazz & Cocktails',
  'Entrée pour Jazz Live & Cocktails',
  4000,
  100,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '21 days',
  4,
  true
FROM events e WHERE e.slug = 'live-jazz-cocktails'
UNION ALL
SELECT 
  e.id,
  'VIP Seating',
  'Place VIP',
  'Reserved VIP seating with premium view',
  'Place VIP réservée avec vue premium',
  12000,
  20,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '21 days',
  2,
  true
FROM events e WHERE e.slug = 'live-jazz-cocktails';

-- Insert event tables
INSERT INTO event_tables (event_id, physical_table_id, price_xaf, minimum_spend_xaf, status)
SELECT 
  e.id,
  pt.id,
  20000,
  30000,
  'available'
FROM events e
CROSS JOIN physical_tables pt
WHERE e.slug = 'afrobeat-night'
  AND pt.table_type IN ('club_regular', 'club_vip', 'club_vvip')
UNION ALL
SELECT 
  e.id,
  pt.id,
  50000,
  80000,
  'available'
FROM events e
CROSS JOIN physical_tables pt
WHERE e.slug = 'ladies-night'
  AND pt.table_type IN ('club_vip', 'club_vvip');
