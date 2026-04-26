import { get, post } from '~/api/client'
import type {
  Payment,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentSettleRequest,
  RefundCreateRequest,
  PaymentStatus,
  PaymentRefundResponse,
} from '~/types/api'

type QueryValue = string | number | boolean | null | undefined

export interface PaymentListParams extends Record<string, QueryValue> {
  page?: number
  page_size?: number
  status?: PaymentStatus | ''
}

export interface PaymentListResponse {
  results: Payment[]
  count: number
}

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
    return post<Payment | PaymentRefundResponse>(`/restaurant/payments/${id}/refund/`, payload)
  },

  restaurantList(params?: PaymentListParams) {
    return get<PaymentListResponse>('/restaurant/payments/', params)
  },
}
