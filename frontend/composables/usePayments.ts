import { paymentsApi } from '~/api/payments'
import type {
  Payment,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentSettleRequest,
  RefundCreateRequest,
} from '~/types/api'

export function usePayments() {
  const latestIntent = ref<PaymentIntentResponse | null>(null)
  const latestPayment = ref<Payment | null>(null)
  const payments = ref<Payment[]>([])
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

  const settlePayment = async (payload: PaymentSettleRequest) => paymentsApi.settle(payload)

  const refundPayment = async (paymentId: number, payload: RefundCreateRequest) => paymentsApi.refund(paymentId, payload)

  const fetchRestaurantPayments = async (params?: { page?: number; page_size?: number; status?: string }) => {
    loading.value = true
    try {
      const result = await (paymentsApi as any).restaurantList(params)
      payments.value = Array.isArray(result) ? result : result.results || []
      count.value = Array.isArray(result) ? result.length : result.count || payments.value.length
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
    createOrderPaymentIntent: createIntent,
    getPaymentStatus: fetchPaymentStatus,
  }
}
