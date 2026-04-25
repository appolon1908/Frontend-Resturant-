export type RealtimeChannel = 'restaurant' | 'customer'

export type RealtimeEventType =
  | 'connection.ready'
  | 'error'
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

export interface ConnectionReadyMessage {
  type: 'connection.ready'
  user_id: number
  role: string
  groups: string[]
}

export interface ErrorMessage {
  type: 'error'
  message: string
}

export interface ReservationCreatedPayload {
  reservation_id: number
  restaurant_id: number
  status: string
  reserved_at?: string
  guest_name?: string
}

export interface ReservationUpdatedPayload {
  reservation_id: number
  restaurant_id: number
  status: string
  reserved_at?: string
}

export interface OrderCreatedPayload {
  order_id: number
  restaurant_id: number
  status: string
  table_id?: number | null
}

export interface OrderStatusChangedPayload {
  order_id: number
  restaurant_id: number
  old_status?: string
  status: string
  table_id?: number | null
}

export interface KitchenTicketCreatedPayload {
  ticket_id: number
  restaurant_id: number
  order_id: number
  status: string
  priority?: string
}

export interface KitchenTicketReadyPayload {
  ticket_id: number
  restaurant_id: number
  order_id: number
  status: string
}

export interface TableStatusChangedPayload {
  table_id: number
  restaurant_id: number
  status: string
}

export interface PaymentSucceededPayload {
  payment_id: number
  restaurant_id: number
  order_id?: number | null
  check_id?: number | null
  booking_id?: number | null
  amount?: string
  currency?: string
  status: string
}

export interface WaitlistCalledPayload {
  waitlist_entry_id: number
  restaurant_id: number
  party_size?: number
  guest_name?: string
}

export interface StaffAlertCreatedPayload {
  alert_id: string | number
  restaurant_id: number
  level?: 'info' | 'warning' | 'critical' | string
  title: string
  message?: string
}

export interface ReservationCreatedEvent {
  type: 'reservation.created'
  payload: ReservationCreatedPayload
}

export interface ReservationUpdatedEvent {
  type: 'reservation.updated'
  payload: ReservationUpdatedPayload
}

export interface OrderCreatedEvent {
  type: 'order.created'
  payload: OrderCreatedPayload
}

export interface OrderStatusChangedEvent {
  type: 'order.status_changed'
  payload: OrderStatusChangedPayload
}

export interface KitchenTicketCreatedEvent {
  type: 'kitchen.ticket_created'
  payload: KitchenTicketCreatedPayload
}

export interface KitchenTicketReadyEvent {
  type: 'kitchen.ticket_ready'
  payload: KitchenTicketReadyPayload
}

export interface TableStatusChangedEvent {
  type: 'table.status_changed'
  payload: TableStatusChangedPayload
}

export interface PaymentSucceededEvent {
  type: 'payment.succeeded'
  payload: PaymentSucceededPayload
}

export interface WaitlistCalledEvent {
  type: 'waitlist.called'
  payload: WaitlistCalledPayload
}

export interface StaffAlertCreatedEvent {
  type: 'staff.alert_created'
  payload: StaffAlertCreatedPayload
}

export type RealtimeEvent =
  | ReservationCreatedEvent
  | ReservationUpdatedEvent
  | OrderCreatedEvent
  | OrderStatusChangedEvent
  | KitchenTicketCreatedEvent
  | KitchenTicketReadyEvent
  | TableStatusChangedEvent
  | PaymentSucceededEvent
  | WaitlistCalledEvent
  | StaffAlertCreatedEvent

export type RealtimeInboundMessage = ConnectionReadyMessage | ErrorMessage | RealtimeEvent

export interface RealtimeToast {
  id: string
  title: string
  message?: string
  level?: 'info' | 'success' | 'warning' | 'error'
  ttlMs?: number
}

export function isRealtimeEvent(message: RealtimeInboundMessage): message is RealtimeEvent {
  return [
    'reservation.created',
    'reservation.updated',
    'order.created',
    'order.status_changed',
    'kitchen.ticket_created',
    'kitchen.ticket_ready',
    'table.status_changed',
    'payment.succeeded',
    'waitlist.called',
    'staff.alert_created',
  ].includes(message.type)
}
