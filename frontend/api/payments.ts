import { get, post } from '~/api/client'
import type {
  Payment,
  PaymentLedger,
  Paginated,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentSettleRequest,
  RefundCreateRequest,
  PaymentStatus,
} from '~/types/api'

export interface PaymentListParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  status?: PaymentStatus | ''
}

export type PaymentListResponse = Paginated<PaymentLedger>

export const paymentsApi = {
  createIntent(payload: PaymentIntentCreateRequest) {
    return post<PaymentIntentResponse>('/customer/payments/intent/', payload)
  },

  getStatus(id: number) {
    return get<Payment>(`/public/payments/${id}/status/`)
  },

  settle(payload: PaymentSettleRequest) {
    return post<PaymentLedger>('/restaurant/payments/settle/', payload)
  },

  refund(id: number, payload: RefundCreateRequest) {
    return post<PaymentLedger>(`/restaurant/payments/${id}/refund/`, payload)
  },

  restaurantList(params?: PaymentListParams) {
    return get<PaymentListResponse>('/restaurant/payments/', params)
  },

  restaurantDetail(id: number) {
    return get<PaymentLedger>(`/restaurant/payments/${id}/`)
  },
}
