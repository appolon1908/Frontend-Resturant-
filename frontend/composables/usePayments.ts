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

  return {
    latestIntent,
    latestPayment,
    createIntent,
    fetchPaymentStatus,
    settlePayment,
    refundPayment,
  }
}
