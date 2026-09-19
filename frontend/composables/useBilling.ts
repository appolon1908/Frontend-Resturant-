import { billingApi } from '~/api/billing'
import type { CheckoutSessionCreate, Invoice, Plan, Subscription } from '~/types/api'

export function useBilling() {
  const subscription = ref<Subscription | null>(null)
  const plans = ref<Plan[]>([])
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const summary = ref<Awaited<ReturnType<typeof billingApi.summary>> | null>(null)
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
      error.value = handleApiError(cause, 'Billing request failed.')
      throw cause
    } finally {
      pending--
      loading.value = pending > 0
    }
  }

  return {
    subscription, plans, invoices, loading, summary, error,
    fetchSubscription: () => request(async () => {
      subscription.value = await billingApi.getSubscription()
      return subscription.value
    }),
    fetchPlans: (params?: Parameters<typeof billingApi.plans>[0]) => request(async () => {
      const result = await billingApi.plans(params)
      plans.value = result.results
      return result
    }),
    fetchInvoices: (params?: Parameters<typeof billingApi.invoices>[0]) => request(async () => {
      const result = await billingApi.invoices(params)
      invoices.value = result.results
      return result
    }),
    createCheckoutSession: (payload: CheckoutSessionCreate) => request(() => billingApi.createCheckoutSession(payload)),
    fetchSummary: () => request(async () => {
      summary.value = await billingApi.summary()
      return summary.value
    }),
  }
}
