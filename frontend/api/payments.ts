import { get, post } from '~/api/client'
import type {
  BookingConfirmation,
  BookingDepositPaymentCreate,
  CheckAmount,
  DiningCheckDetail,
  Paginated,
  Payment,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentLedger,
  PaymentSettleRequest,
  PublicDiningCheck,
  RefundCreateRequest,
} from '~/types/api'

type QV = string | number | boolean | null | undefined

export const paymentsApi = {
  // ── Customer ────────────────────────────────────────────────
  createIntent(payload: PaymentIntentCreateRequest) {
    return post<PaymentIntentResponse>('/customer/payments/intent/', payload)
  },

  getStatus(id: number) {
    return get<Payment>(`/public/payments/${id}/status/`)
  },

  // ── Public QR checks ────────────────────────────────────────
  getPublicCheck(qrToken: string) {
    return get<PublicDiningCheck>(`/public/checks/pay/${qrToken}/`)
  },

  publicCheckStatus(qrToken: string) {
    return get<PublicDiningCheck>(`/public/checks/pay/${qrToken}/status/`)
  },

  publicCheckPaymentIntent(qrToken: string, payload: { provider?: string; amount?: string }) {
    return post<unknown>(`/public/checks/pay/${qrToken}/payment-intent/`, payload)
  },

  // ── Booking deposit (public) ─────────────────────────────────
  createBookingDeposit(confirmationCode: string, payload: BookingDepositPaymentCreate) {
    return post<BookingDepositPaymentCreate>(`/public/bookings/${confirmationCode}/payments/deposit/`, payload)
  },

  getBookingConfirmation(confirmationCode: string) {
    return get<BookingConfirmation>(`/public/bookings/${confirmationCode}/confirmation/`)
  },

  // ── Restaurant payments ──────────────────────────────────────
  restaurantList(params?: { page?: number; page_size?: number; search?: string; ordering?: string; status?: string }) {
    return get<Paginated<PaymentLedger>>('/restaurant/payments/', params as Record<string, QV>)
  },

  restaurantDetail(id: number) {
    return get<PaymentLedger>(`/restaurant/payments/${id}/`)
  },

  settle(payload: PaymentSettleRequest) {
    return post<PaymentLedger>('/restaurant/payments/settle/', payload)
  },

  refund(id: number, payload: RefundCreateRequest) {
    return post<PaymentLedger>(`/restaurant/payments/${id}/refund/`, payload)
  },

  markReviewed(id: number, note?: string) {
    return post<unknown>(`/restaurant/payments/${id}/mark-reviewed/`, note ? { note } : {})
  },

  retrySync(id: number) {
    return post<unknown>(`/restaurant/payments/${id}/retry-sync/`, {})
  },

  // ── Dining checks (staff) ────────────────────────────────────
  getCheck(id: number) {
    return get<DiningCheckDetail>(`/restaurant/checks/${id}/`)
  },

  addTip(id: number, payload: CheckAmount) {
    return post<CheckAmount>(`/restaurant/checks/${id}/add-tip/`, payload)
  },

  addServiceCharge(id: number, payload: CheckAmount) {
    return post<CheckAmount>(`/restaurant/checks/${id}/service-charge/`, payload)
  },

  voidCheck(id: number, payload: CheckAmount) {
    return post<CheckAmount>(`/restaurant/checks/${id}/void/`, payload)
  },

  recordCashPayment(id: number, payload: { amount: string; reference?: string }) {
    return post<unknown>(`/restaurant/checks/${id}/record-cash-payment/`, payload)
  },

  createPaymentLink(id: number, payload?: { amount?: string; expires_minutes?: number }) {
    return post<unknown>(`/restaurant/checks/${id}/payment-link/`, payload ?? {})
  },

  // Backward-compatible aliases
  createOrderPaymentIntent: (p: PaymentIntentCreateRequest) => paymentsApi.createIntent(p),
  getPaymentStatus: (id: number) => paymentsApi.getStatus(id),
  settlePayment: (p: PaymentSettleRequest) => paymentsApi.settle(p),
  refundPayment: (id: number, p: RefundCreateRequest) => paymentsApi.refund(id, p),
}
