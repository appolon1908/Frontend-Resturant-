import { get, post } from '~/api/client'
import type { Payment, PaymentIntentCreateRequest, PaymentIntentResponse, PaymentSettleRequest, RefundCreateRequest } from '~/types/api'

export const paymentsApi = {
  createIntent(payload: PaymentIntentCreateRequest) {
    return post<PaymentIntentResponse>('/customer/payments/intent/', payload)
  },

  getStatus(id: number) {
    return get<Payment>(`/public/payments/${id}/status/`)
  },

  settle(payload: PaymentSettleRequest) {
    return post<Payment>('/restaurant/payments/settle/', payload)
  },

  refund(id: number, payload: RefundCreateRequest) {
    return post<Payment>(`/restaurant/payments/${id}/refund/`, payload)
  },

  // Backward-compatible aliases.
  createOrderPaymentIntent(payload: PaymentIntentCreateRequest) {
    return post<PaymentIntentResponse>('/customer/payments/intent/', payload)
  },

  getPaymentStatus(id: number) {
    return get<Payment>(`/public/payments/${id}/status/`)
  },

  settlePayment(payload: PaymentSettleRequest) {
    return post<Payment>('/restaurant/payments/settle/', payload)
  },

  refundPayment(id: number, payload: RefundCreateRequest) {
    return post<Payment>(`/restaurant/payments/${id}/refund/`, payload)
  },
}
