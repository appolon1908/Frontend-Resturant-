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

  const { handleApiError } = useAuth()
  let pending = 0

  async function request<T>(action: () => Promise<T>): Promise<T> {
    pending++
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (cause) {
      error.value = handleApiError(cause, 'Payment request failed.')
      throw cause
    } finally {
      pending--
      loading.value = pending > 0
    }
  }

  const createIntent = async (payload: PaymentIntentCreateRequest) => {
    error.value = null
    latestIntent.value = await request(() => paymentsApi.createIntent(payload))
    return latestIntent.value
  }

  const fetchPaymentStatus = async (paymentId: number) => {
    error.value = null
    latestStatusPayment.value = await request(() => paymentsApi.getStatus(paymentId))
    return latestStatusPayment.value
  }

  const settlePayment = async (payload: PaymentSettleRequest) => {
    error.value = null
    return request(() => paymentsApi.settle(payload))
  }

  const refundPayment = async (paymentId: number, payload: RefundCreateRequest) => {
    error.value = null
    return request(() => paymentsApi.refund(paymentId, payload))
  }

  const fetchRestaurantPayments = async (params?: PaymentListParams) => {
    return request(async () => {
      const result = await paymentsApi.restaurantList(params)
      payments.value = result.results
      count.value = result.count
      return result
    })
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
