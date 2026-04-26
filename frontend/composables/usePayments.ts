import { paymentsApi } from '~/api/payments'
import type {
  Payment,
  PaymentLedger,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentSettleRequest,
  PaymentStatus,
  PaymentRefundResponse,
  RefundCreateRequest,
} from '~/types/api'

export function usePayments() {
  const latestIntent = ref<PaymentIntentResponse | null>(null)
  const latestPayment = ref<Payment | PaymentLedger | PaymentRefundResponse | null>(null)
  const payments = ref<Array<Payment | PaymentLedger>>([])
  const count = ref(0)
  const loading = ref(false)

  const createIntent = async (payload: PaymentIntentCreateRequest) => {
    latestIntent.value = await paymentsApi.createIntent(payload)
    return latestIntent.value
  }

  const fetchPaymentStatus = async (paymentId: number) => {
    latestPayment.value = await paymentsApi.getStatus(paymentId)
    return latestPayment.value
  }

  const settlePayment = async (payload: PaymentSettleRequest) => {
    latestPayment.value = await paymentsApi.settle(payload)
    return latestPayment.value
  }

  const refundPayment = async (paymentId: number, payload: RefundCreateRequest) => {
    latestPayment.value = await paymentsApi.refund(paymentId, payload)
    return latestPayment.value
  }

  const fetchRestaurantPayments = async (params?: {
    page?: number
    page_size?: number
    status?: PaymentStatus | ''
  }) => {
    loading.value = true
    try {
      const result = await paymentsApi.restaurantList(params)
      payments.value = Array.isArray(result) ? result : result.results ?? []
      count.value = Array.isArray(result) ? result.length : result.count ?? payments.value.length
      return result
    } finally {
      loading.value = false
    }
  }

  return {
    latestIntent,
    latestPayment,
    payments,
    count,
    loading,
    createIntent,
    fetchPaymentStatus,
    settlePayment,
    refundPayment,
    fetchRestaurantPayments,
  }
}
