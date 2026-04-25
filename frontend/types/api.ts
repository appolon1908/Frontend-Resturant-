// ONLY TYPES — no API client logic.

export interface AuthUser {
  id: number
  email: string
  full_name?: string
  role: 'customer' | 'restaurant' | 'admin'
}

export interface TokenPair {
  token: string
  user?: AuthUser
  access?: string
  refresh?: string
}

export interface TokenRefreshRequest {
  refresh: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface Restaurant {
  id: number
  name: string
  slug: string
  cuisine?: string
  description?: string
  image_url?: string
  rating?: number
}

export interface Reservation {
  id: number
  restaurant: number
  restaurant_name?: string
  party_size: number
  reservation_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface OrderItem {
  id: number
  menu_item_id: number
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  restaurant: number
  status: 'draft' | 'submitted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total: number
  items: OrderItem[]
  created_at?: string
}

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface DashboardSummary {
  today_reservations: number
  active_orders: number
  revenue_today: number
  occupancy_rate: number
}

export interface CheckoutPayload {
  restaurant: number
  items: Array<{ menu_item_id: number; quantity: number }>
  payment_method: string
}

export interface OnboardingSession {
  id: number
  status: 'not_started' | 'in_progress' | 'completed'
  current_step: string
  completed_steps: string[]
}

export type PaymentStatus = 'pending' | 'authorized' | 'settled' | 'refunded' | 'failed' | 'cancelled'
export type PaymentProvider = 'stripe' | 'paypal' | 'adyen' | 'manual' | string

export interface Payment {
  id: number
  restaurant_name: string
  provider: string
  status: string
  amount: string
  currency?: string
  provider_payment_id?: string
  created_at: string
}

export interface PaymentIntentResponse {
  payment_id: number
  client_secret: string
  status?: PaymentStatus
  checkout_url?: string
}

export interface PaymentIntentCreateRequest {
  order_id?: number
  check_id?: number
  booking_id?: number
  amount?: string
  currency?: string
  provider?: PaymentProvider
  return_url?: string
  cancel_url?: string
}

export interface PaymentSettleRequest {
  amount: string
  idempotency_key: string
  request_id: string
  payment_id?: number
}

export interface RefundCreateRequest {
  amount: string
  reason?: string
  idempotency_key: string
  request_id: string
}

export type RealtimeEventType =
  | 'reservation.created'
  | 'reservation.updated'
  | 'order.created'
  | 'order.status_changed'
  | 'kitchen.ticket_created'
  | 'kitchen.ticket_ready'
  | 'table.status_changed'
  | 'payment.succeeded'
  | 'waitlist.called'
  | 'staff.alert_created'

export interface RealtimeEventEnvelope {
  type: RealtimeEventType
  restaurant_id?: number
  customer_id?: number
  occurred_at?: string
  payload: Record<string, unknown>
}
