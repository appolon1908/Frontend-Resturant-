import { paymentsApi } from '~/api/payments'
import type {
  Payment,
  PaymentLedger,
  PaymentIntentCreateRequest,
  PaymentIntentResponse,
  PaymentSettleRequest,
  RefundCreateRequest,
} from '~/types/api'
import type { PaymentListParams } from '~/api/payments'

export function usePayments() {
  const latestIntent = ref<PaymentIntentResponse | null>(null)
  const latestStatusPayment = ref<Payment | null>(null)
  const payments = ref<PaymentLedger[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createIntent = async (payload: PaymentIntentCreateRequest) => {
    error.value = null
    latestIntent.value = await paymentsApi.createIntent(payload)
    return latestIntent.value
  }

  const fetchPaymentStatus = async (paymentId: number) => {
    error.value = null
    latestStatusPayment.value = await paymentsApi.getStatus(paymentId)
    return latestStatusPayment.value
  }

  const settlePayment = async (payload: PaymentSettleRequest) => {
    error.value = null
    return paymentsApi.settle(payload)
  }

  const refundPayment = async (paymentId: number, payload: RefundCreateRequest) => {
    error.value = null
    return paymentsApi.refund(paymentId, payload)
  }

  const fetchRestaurantPayments = async (params?: PaymentListParams) => {
    loading.value = true
    error.value = null

    try {
      const result = await paymentsApi.restaurantList(params)
      payments.value = result.results
      count.value = result.count
      return result
    } catch (e: any) {
      error.value = e?.detail ?? e?.message ?? 'Failed to load payments.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    latestIntent,
    latestStatusPayment,
    payments,
    count,
    loading,
    error,
    createIntent,
    fetchPaymentStatus,
    settlePayment,
    refundPayment,
    fetchRestaurantPayments,
  }
}
