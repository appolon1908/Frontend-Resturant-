// types/api.ts — derived from openapi.yaml (Restaurant Platform API v1.0.0)

export type RoleEnum = 'customer' | 'restaurant' | 'admin'
export type BookingStatus = 'pending' | 'pending_payment' | 'confirmed' | 'waitlist' | 'checked_in' | 'seated' | 'cancelled' | 'completed' | 'no_show'
export type OrderStatus = 'draft' | 'submitted' | 'in_progress' | 'ready' | 'completed' | 'canceled'
export type OrderType = 'dine_in' | 'pickup'
export type OrderServiceState = 'ordered' | 'served' | 'needs_bill'
export type CheckStatus = 'open' | 'payment_pending' | 'paid' | 'closed' | 'void'
export type PaymentStatus = 'created' | 'pending' | 'requires_action' | 'authorized' | 'processing' | 'succeeded' | 'captured' | 'failed' | 'cancelled' | 'canceled' | 'refunded' | 'partially_refunded'
export type PaymentProvider = 'manual' | 'mock' | 'stripe' | 'paypal' | 'mercado_pago' | 'square' | 'azul' | 'cardnet'
export type PaymentKind = 'booking_deposit' | 'booking_prepayment' | 'order_prepayment' | 'check_settlement' | 'no_show_fee' | 'cancellation_fee'
export type TableStatus = 'available' | 'reserved' | 'seated' | 'occupied' | 'dirty' | 'blocked' | 'merged'
export type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'
export type PreparationStation = 'kitchen' | 'bar' | 'grill' | 'dessert'
export type CustomerTag = 'vip' | 'frequent' | 'no_show_risk' | 'birthday' | 'allergy' | 'quiet'
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled'
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'failed' | 'void'
export type DunningAttemptStatus = 'scheduled' | 'retrying' | 'succeeded' | 'failed' | 'skipped'
export type WaitlistStatus = 'waiting' | 'called' | 'seated' | 'cancelled' | 'expired'
export type KitchenTicketStatus = 'queued' | 'fired' | 'ready'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type BillingInterval = 'monthly' | 'yearly'
export type AlertLevel = 'info' | 'success' | 'warning' | 'error'
export type AlertType = 'table_assigned' | 'check_opened' | 'payment_link_ready' | 'check_paid' | 'help_requested'

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[] }

// Auth
export interface AuthUser { id: number; email: string | null; username: string; phone?: string | null; role: RoleEnum }
export interface TokenPair { access: string; refresh: string; token?: string; user?: AuthUser }
export interface TokenRefreshRequest { refresh: string }
export interface RegisterRequest { email?: string; username?: string; phone?: string; role: RoleEnum; password: string; full_name?: string }

// Customer profile
export interface CustomerMe { id: number; email: string | null; username: string; phone: string | null; role: RoleEnum }
export interface CustomerProfile { id: number; full_name: string; phone?: string; preferred_city?: string; dietary_notes?: string; allergies?: string; preferences?: string; visit_notes?: string; is_vip?: boolean }
export type PatchedCustomerProfile = Partial<CustomerProfile>

// Restaurants
export interface Restaurant { id: number; name: string; slug: string; cuisine?: string; city: string; country: string; cover_image?: string; image_url?: string; description?: string; rating?: number }
export interface OpeningHour { weekday: Weekday; open_time: string; close_time: string; is_closed?: boolean }
export interface RestaurantDetail { id: number; name: string; slug: string; description?: string; cuisine?: string; phone?: string; email?: string; address: string; city: string; country: string; cover_image?: string; opening_hours: OpeningHour[] }
export interface RestaurantListParams { accepts_bookings?: boolean; city?: string; country?: string; cuisine?: string; open_now?: boolean; search?: string; ordering?: string; page?: number; page_size?: number }

// Reservations
export interface Reservation { id: number; restaurant_name: string; guest_name: string; guest_email: string; party_size: number; booking_date: string; booking_time: string; reservation_time?: string; status: BookingStatus; confirmation_code: string; notes?: string; table_name: string; payment_summary: string; restaurant?: number }
export interface ReservationTimeline { id: number; restaurant_name: string; booking_date: string; booking_time: string; status: BookingStatus; table_name: string; confirmation_code: string; payment_summary: string; events: string }
export interface BookingCreateRequest { guest_name: string; guest_email: string; guest_phone?: string; party_size: number; booking_date: string; booking_time: string; notes?: string; table_id?: number }
export interface BookingConfirmation { id: number; restaurant_name: string; guest_name: string; guest_email: string; party_size: number; booking_date: string; booking_time: string; status: BookingStatus; confirmation_code: string; payment_summary: string }
export interface BookingDepositPaymentCreate { amount: string; currency?: string; provider?: PaymentProvider; return_url?: string; cancel_url?: string }

// Orders
export interface OrderItemModifier { id: number; name: string; price_delta?: string }
export interface OrderItem { id: number; menu_item: number; menu_item_name: string; quantity: number; course?: number; course_status?: 'held' | 'fired' | 'ready'; unit_price: string; modifiers_total?: string; line_total?: string; notes?: string; modifiers: OrderItemModifier[]; menu_item_id?: number; name?: string; price?: number }
export interface Order { id: number; restaurant: number; restaurant_name: string; table: number | null; order_type: OrderType; status: OrderStatus; service_state: OrderServiceState; scheduled_for: string | null; guest_name?: string; notes?: string; subtotal?: string; tax_amount?: string; fee_amount?: string; discount_amount?: string; total_amount?: string; total?: number; loyalty_points_earned?: number; eta_minutes?: number; version?: number; items: OrderItem[]; created_at: string }
export interface OrderItemCreate { menu_item_id: number; quantity?: number; course?: number; course_status?: 'held' | 'fired'; modifier_option_ids?: number[]; notes?: string }
export interface OrderCreateRequest { restaurant_id: number; table_id?: number | null; booking_id?: number | null; order_type?: OrderType; scheduled_for?: string | null; guest_name?: string; notes?: string; discount_amount?: string; items: OrderItemCreate[] }
export interface OrderUpdateRequest { version?: number; notes?: string; service_state?: OrderServiceState; status?: Exclude<OrderStatus, 'draft'>; add_items?: OrderItemCreate[] }
export interface CheckoutPayload { restaurant: number; items: Array<{ menu_item_id: number; quantity: number }>; payment_method: string }

// Payments
export interface Payment { id: number; restaurant_name: string; booking: number | null; booking_confirmation_code: string; provider: PaymentProvider; kind: PaymentKind; status: PaymentStatus; currency?: string; amount: string; provider_payment_id?: string; checkout_url?: string; created_at: string }
export interface PaymentLedger { id: number; check_id: number; order_id: number; provider: PaymentProvider; kind: PaymentKind; status: PaymentStatus; currency?: string; amount: string; provider_payment_id?: string; paid_at: string | null; created_at: string; updated_at: string }
export interface PaymentIntentResponse { payment_id: number; client_secret?: string; status?: PaymentStatus; checkout_url?: string; order_id?: number; amount?: string; currency?: string; provider?: PaymentProvider; return_url?: string; cancel_url?: string }
export interface PaymentIntentCreateRequest { order_id?: number; check_id?: number; booking_id?: number; amount?: string; currency?: string; provider?: PaymentProvider; return_url?: string; cancel_url?: string }
export interface PaymentSettleRequest { check_id?: number; order_id?: number; amount: string; currency?: string; provider?: PaymentProvider; idempotency_key: string; request_id: string }
export interface RefundCreateRequest { amount: string; reason?: string; idempotency_key: string; request_id: string }
export interface PaymentRefundResponse { payment_id?: number; refund_id?: string; status?: PaymentStatus; amount?: string; currency?: string; provider_refund_id?: string; [key: string]: unknown }

// Public dining checks
export interface PublicDiningCheck { id: number; restaurant_name: string; table_name: string; guest_name: string | null; status: CheckStatus; subtotal?: string; tax_amount?: string; service_charge_amount?: string; tip_amount?: string; total_amount?: string; paid_amount?: string; remaining_amount: string; qr_token: string; payment_url?: string; updated_at: string }

// Dining checks (staff)
export interface CheckAdjustment { id: number; adjustment_type: 'tip' | 'service_charge' | 'void' | 'reopen'; amount: string; note?: string; created_at: string }
export interface CheckPayment { id: number; amount: string; method: 'online' | 'cash' | 'external_pos'; status?: string; reference?: string; created_at: string }
export interface CheckPaymentLink { id: number; payment_id: number | null; checkout_url?: string; is_active?: boolean; expires_at: string | null; created_at: string }
export interface DiningCheckDetail { id: number; restaurant_name: string; booking: number | null; table: number; table_name: string; assigned_waiter: number | null; assigned_waiter_email: string | null; status: CheckStatus; guest_name?: string; currency?: string; subtotal?: string; tax_amount?: string; service_charge_amount?: string; tip_amount?: string; total_amount?: string; paid_amount?: string; qr_token: string; payment_url?: string; notes?: string; created_at: string; updated_at: string; adjustments: CheckAdjustment[]; manual_payments: CheckPayment[]; payment_links: CheckPaymentLink[] }
export interface CheckAmount { amount: string; note?: string }

// Menu (public)
export interface MenuModifierOption { id: number; name: string; price_delta?: string }
export interface MenuModifierGroup { id: number; name: string; min_select?: number; max_select?: number; is_required?: boolean; options: MenuModifierOption[] }
export interface MenuItem { id: number; name: string; description?: string; ingredient_summary?: string; price: string; popularity_score?: number; preparation_station?: PreparationStation; is_featured?: boolean; is_available?: boolean; modifier_groups: MenuModifierGroup[] }
export interface MenuCategory { id: number; name: string; description?: string; sort_order?: number; items: MenuItem[] }

// Menu (restaurant managed)
export interface RestaurantMenuCategory { id: number; restaurant_id: number; name: string; description?: string; sort_order?: number; is_active?: boolean; created_at: string; updated_at: string }
export interface RestaurantMenuItem { id: number; restaurant_id: number; category: RestaurantMenuCategory; category_id: number; name: string; description?: string; ingredient_summary?: string; price: string; popularity_score?: number; preparation_station?: PreparationStation; is_featured?: boolean; is_available?: boolean; is_active?: boolean; created_at: string; updated_at: string }

// Restaurant management
export interface RestaurantSettings { timezone?: string; booking_slot_interval_minutes?: number; default_booking_duration_minutes?: number; min_party_size?: number; max_party_size?: number; max_advance_days?: number; allow_walk_ins?: boolean }
export interface RestaurantManage { id: number; settings: RestaurantSettings; group_id: number; group_name: string | null; is_active?: boolean; name: string; slug: string; description?: string; cuisine?: string; phone?: string; email?: string; address: string; city: string; country: string; cover_image?: string; accepts_bookings?: boolean; approval_status: ApprovalStatus; rejection_reason: string; group?: number | null }
export interface RestaurantLocationSettings { default_currency?: string; accepts_walk_ins?: boolean; auto_close_check_on_full_payment?: boolean; waiter_rotation_enabled?: boolean; default_payment_provider?: string; support_email?: string; support_phone?: string; restaurant: number }
export interface OpeningHourManage { id: number; weekday: Weekday; open_time: string; close_time: string; is_closed?: boolean }

// Restaurant bookings (staff)
export interface RestaurantBooking { id: number; guest_name: string; guest_email?: string; guest_phone?: string; party_size: number; booking_date: string; booking_time: string; status: BookingStatus; confirmation_code: string; customer_email: string; table_name: string; notes?: string; payment_summary: string }
export interface BookingAction { table_id?: number; quoted_minutes?: number; priority_score?: number; internal_notes?: string }

// Tables
export interface Table { id: number; name: string; number: number | null; color_code?: string; shape?: string; capacity: number; min_capacity?: number; status?: TableStatus; is_active?: boolean; is_mergeable?: boolean; service_area: number | null; service_area_name: string; assigned_waiter_id: number | null; assigned_waiter_email: string | null }
export interface TableWrite { name: string; number?: number | null; color_code?: string; shape?: string; capacity: number; min_capacity?: number; status?: TableStatus; is_active?: boolean; is_mergeable?: boolean; service_area?: number | null }

// Customers (restaurant-facing)
export interface RestaurantCustomer { id: number; full_name: string; email?: string; phone?: string; notes?: string; preferred_service_area: number | null; preferred_service_area_name: string; preferred_party_size: number | null; is_vip?: boolean; is_no_show_risk?: boolean; total_visits?: number; total_no_shows?: number; last_visit_at: string | null }
export interface CustomerPreference { id: number; key: string; value: string }
export interface RestaurantCustomerTag { id: number; tag: CustomerTag; note?: string }
export interface RestaurantCustomerDetail extends RestaurantCustomer { preferences: CustomerPreference[]; tags: RestaurantCustomerTag[]; upcoming_reservations: string; past_reservations: string }

// Waitlist
export interface WaitlistEntry { id: number; quoted_minutes?: number; priority_score?: number; status?: WaitlistStatus; called_at: string | null; booking: RestaurantBooking }
export interface WalkInCreate { guest_name: string; guest_email?: string; guest_phone?: string; party_size: number; notes?: string; quoted_minutes?: number; priority_score?: number }

// Kitchen
export interface KitchenTicketItem { id: number; order_item: number; menu_item_name: string; station?: string }
export interface KitchenTicket { id: number; order: number; course: number; status?: KitchenTicketStatus; fired_at: string; items: KitchenTicketItem[] }
export interface KitchenFire { order_id: number; course: number }

// Billing
export interface Plan { id: number; name: string; plan_type?: 'subscription' | 'usage' | 'hybrid'; price_monthly?: string; price_yearly?: string; currency?: string; features?: unknown; is_active?: boolean; created_at: string; updated_at: string }
export interface Subscription { id: number; restaurant_id: number; plan: Plan; plan_id: number; status: SubscriptionStatus; current_period_start: string; current_period_end: string; trial_end: string | null; created_at: string; updated_at: string }
export interface Invoice { id: number; restaurant_id: number; subscription_id: number; amount: string; currency: string; status: InvoiceStatus; period_start: string | null; period_end: string | null; created_at: string }
export interface DunningAttempt { id: number; subscription_id: number; invoice_id: number; plan_id: number; invoice_amount: string; attempt_number: number; scheduled_at: string; executed_at: string | null; status: DunningAttemptStatus; failure_reason: string; created_at: string; updated_at: string }
export interface CheckoutSessionCreate { plan_id: number; interval?: BillingInterval; success_url: string; cancel_url: string; request_id: string }
export interface BillingPortalSession { return_url: string; request_id?: string }
export interface CostBudget { id: number; restaurant_id: number; metric_type: string; period?: 'daily' | 'monthly'; limit_amount: string; threshold_pct?: number; hard_limit?: boolean; is_active?: boolean; created_at: string; updated_at: string }
export interface UsageRecord { id: number; restaurant_id: number; metric_type: string; quantity: string; period_start: string; period_end: string; created_at: string }

// Notifications
export interface Notification { id: number; title: string; message?: string; is_read: boolean; created_at: string; notification_id?: number }
export interface StaffAlert { id: number; alert_type: AlertType; level: AlertLevel; title: string; message?: string; is_read?: boolean; table: number | null; table_name: string; booking: number | null; dining_check: number | null; metadata?: unknown; created_at: string }

// Staff
export interface StaffBooking { id: number; guest_name: string; guest_email?: string; party_size: number; booking_date: string; booking_time: string; status: BookingStatus; table: number | null; table_name: string }
export interface StaffDiningCheck { id: number; status: CheckStatus; table: number; table_name: string; booking: number | null; booking_guest_name: string; subtotal?: string; tax_amount?: string; service_charge_amount?: string; tip_amount?: string; total_amount?: string; payment_url?: string; updated_at: string }
export interface StaffHelpRequestInput { issue_type: string; table_id?: number | null; check_id?: number | null; booking_id?: number | null; priority?: 'low' | 'normal' | 'high' | 'urgent'; message?: string }
export interface SendHighFive { receiver_id: number; emoji?: string; message?: string; table_id?: number | null; check_id?: number | null }

// Location
export interface RestaurantLocation { id: number; name: string; slug: string; restaurant_id: number; restaurant_name: string; city: string; country: string; address: string; phone?: string; email?: string; is_active?: boolean; accepts_bookings?: boolean; timezone?: string; is_default?: boolean }
export interface LocationPaymentPolicy { id: number; default_provider?: PaymentProvider | ''; default_currency?: string; deposit_enabled?: boolean; default_deposit_amount?: string; online_prepay_enabled?: boolean; no_show_fee_enabled?: boolean; no_show_fee_amount?: string; no_show_grace_minutes?: number; paypal_enabled?: boolean; card_processor_enabled?: boolean }

// Risk
export interface RiskScore { id: number; restaurant_id: number; score: number; risk_level: RiskLevel; reason_summary?: string; evidence: string; calculated_at?: string; created_at: string }

// Dashboard
export interface DashboardSummary { today_reservations?: number; active_orders?: number; revenue_today?: number; occupancy_rate?: number }

// Onboarding
export interface OnboardingSession { id: number; status: 'not_started' | 'in_progress' | 'completed'; current_step: string; completed_steps: string[] }

// Realtime
export type RealtimeEventType = 'reservation.created' | 'reservation.updated' | 'order.created' | 'order.status_changed' | 'kitchen.ticket_created' | 'kitchen.ticket_ready' | 'table.status_changed' | 'payment.succeeded' | 'waitlist.called' | 'staff.alert_created'
export interface RealtimeEventEnvelope { type: RealtimeEventType; restaurant_id?: number; customer_id?: number; occurred_at?: string; payload: Record<string, unknown> }
