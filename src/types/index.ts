// Empire Lounge - Type Definitions

export type UserRole = 
  | 'super_admin'
  | 'restaurant_manager'
  | 'kitchen_staff'
  | 'club_manager'
  | 'bouncer'
  | 'customer';

export type Locale = 'en' | 'fr';

export type OrderType = 'dine_in' | 'takeaway';

export type OrderStatus = 
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'initiated'
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentProvider = 'campay' | 'monetbil' | 'sandbox';

export type ReservationStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export type PassStatus = 
  | 'active'
  | 'checked_in'
  | 'cancelled'
  | 'expired'
  | 'revoked';

export type EventTableStatus = 
  | 'available'
  | 'locked'
  | 'reserved'
  | 'occupied'
  | 'unavailable';

export type GuestListStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'checked_in'
  | 'cancelled';

export type TableType = 
  | 'restaurant_standard'
  | 'club_regular'
  | 'club_vip'
  | 'club_vvip';

// Profile
export interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  preferred_language: Locale;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Business Settings
export interface BusinessSettings {
  id: string;
  business_name: string;
  restaurant_name: string;
  club_name: string;
  timezone: string;
  restaurant_opens_at: string; // HH:MM format
  restaurant_closes_at: string; // HH:MM format
  restaurant_order_override: boolean;
  restaurant_order_override_reason: string | null;
  club_opens_at: string;
  club_closes_at: string;
  address: string;
  coordinates: string | null; // "lat,lng" format
  phone: string;
  email: string;
  whatsapp: string | null;
  default_currency: string;
  payment_provider: PaymentProvider;
  cancellation_policy: string;
  social_links: Record<string, string>;
  map_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Restaurant Categories
export interface RestaurantCategory {
  id: string;
  name_en: string;
  name_fr: string;
  slug: string;
  description_en: string | null;
  description_fr: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Menu Items
export interface MenuItem {
  id: string;
  category_id: string;
  name_en: string;
  name_fr: string;
  description_en: string | null;
  description_fr: string | null;
  price_xaf: number;
  preparation_time_minutes: number;
  image_path: string | null;
  is_available: boolean;
  late_night_available: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Menu Item with Category
export interface MenuItemWithCategory extends MenuItem {
  category: RestaurantCategory;
}

// Physical Tables
export interface PhysicalTable {
  id: string;
  table_code: string;
  display_name: string;
  table_type: TableType;
  section: string;
  capacity: number;
  minimum_spend_xaf: number;
  map_x: number;
  map_y: number;
  width: number;
  height: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Orders
export interface Order {
  id: string;
  user_id: string;
  delivery_type: OrderType;
  restaurant_table_id: string | null;
  status: OrderStatus;
  subtotal_xaf: number;
  fees_xaf: number;
  total_xaf: number;
  customer_note: string | null;
  kitchen_note: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  paid_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

// Order with Items
export interface OrderWithItems extends Order {
  items: OrderItem[];
  table: PhysicalTable | null;
  user: Profile;
}

// Order Items
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total_xaf: number;
  customer_instructions: string | null;
  created_at: string;
}

// Events
export interface Event {
  id: string;
  title_en: string;
  title_fr: string;
  slug: string;
  description_en: string | null;
  description_fr: string | null;
  start_at: string;
  end_at: string;
  doors_open_at: string;
  flyer_path: string | null;
  venue: string;
  is_published: boolean;
  is_featured: boolean;
  age_policy: string | null;
  dress_code: string | null;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  seo_title_en: string | null;
  seo_title_fr: string | null;
  seo_description_en: string | null;
  seo_description_fr: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Ticket Types
export interface TicketType {
  id: string;
  event_id: string;
  name_en: string;
  name_fr: string;
  description_en: string | null;
  description_fr: string | null;
  price_xaf: number;
  total_inventory: number;
  reserved_inventory: number;
  sold_inventory: number;
  sales_start_at: string;
  sales_end_at: string;
  max_per_purchase: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Event Tables
export interface EventTable {
  id: string;
  event_id: string;
  physical_table_id: string;
  price_xaf: number;
  minimum_spend_xaf: number;
  status: EventTableStatus;
  locked_by_user_id: string | null;
  locked_until: string | null;
  reservation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventTableWithPhysical extends EventTable {
  physical_table: PhysicalTable;
}

// Reservations
export interface Reservation {
  id: string;
  user_id: string;
  event_id: string;
  event_table_id: string | null;
  guest_count: number;
  status: ReservationStatus;
  deposit_amount_xaf: number;
  total_amount_xaf: number;
  payment_status: PaymentStatus;
  customer_note: string | null;
  confirmed_at: string | null;
  checked_in_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface ReservationWithDetails extends Reservation {
  event: Event;
  event_table: EventTableWithPhysical | null;
  user: Profile;
}

// Event Ticket Orders
export interface EventTicketOrder {
  id: string;
  user_id: string;
  event_id: string;
  status: OrderStatus;
  subtotal_xaf: number;
  fees_xaf: number;
  total_xaf: number;
  payment_status: PaymentStatus;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
}

export interface EventTicketOrderWithItems extends EventTicketOrder {
  items: EventTicketItem[];
  event: Event;
  user: Profile;
}

// Event Ticket Items
export interface EventTicketItem {
  id: string;
  ticket_order_id: string;
  ticket_type_id: string;
  ticket_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total_xaf: number;
  created_at: string;
}

// Guest List Entries
export interface GuestListEntry {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  guest_count: number;
  status: GuestListStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  checked_in_at: string | null;
  created_at: string;
}

// Payments
export interface Payment {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  internal_reference: string;
  provider_reference: string | null;
  target_type: 'order' | 'reservation' | 'ticket_order';
  target_id: string;
  payment_method: string | null;
  phone_number: string | null;
  amount_xaf: number;
  currency: string;
  status: PaymentStatus;
  failure_code: string | null;
  failure_message: string | null;
  initiated_at: string;
  confirmed_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  idempotency_key: string;
  created_at: string;
}

// Passes
export interface Pass {
  id: string;
  user_id: string;
  event_id: string;
  target_type: 'order' | 'reservation' | 'ticket_order';
  target_id: string;
  token_hash: string;
  token_version: number;
  status: PassStatus;
  issued_at: string;
  expires_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface PassWithDetails extends Pass {
  event: Event;
  user: Profile;
}

// Push Subscriptions
export interface PushSubscription {
  id: string;
  user_id: string | null;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  locale: Locale;
  user_agent: string | null;
  is_active: boolean;
  last_success_at: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string | null;
  title_en: string;
  title_fr: string;
  body_en: string;
  body_fr: string;
  data: Record<string, unknown>;
  sent_at: string | null;
  created_at: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  request_id: string | null;
  ip_hash: string | null;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Restaurant Status
export interface RestaurantStatus {
  is_open: boolean;
  is_ordering_open: boolean;
  closes_at: string;
  reason?: string;
  override_active?: boolean;
}

// Cart Types
export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  instructions?: string;
}

export interface Cart {
  items: CartItem[];
  delivery_type: OrderType;
  table_id: string | null;
  customer_note: string | null;
}

// Timezone helper
export interface TimeInfo {
  timezone: string;
  current_time: string;
  offset: string;
}
