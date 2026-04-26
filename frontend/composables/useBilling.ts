import { billingApi } from '~/api/billing'

export function useBilling() {
  const subscription = ref<unknown | null>(null)
  const plans = ref<unknown[]>([])
  const invoices = ref<unknown[]>([])
  const loading = ref(false)
  const summary = ref<unknown>(null)

  const fetchSubscription = async () => {
    const api = billingApi as any
    subscription.value = typeof api.getSubscription === 'function' ? await api.getSubscription() : null
  }

  const fetchPlans = async () => {
    const api = billingApi as any
    if (typeof api.plans !== 'function') {
      plans.value = []
      return
    }
    const result = await api.plans()
    plans.value = Array.isArray(result) ? result : result.results || []
  }

  const fetchInvoices = async (params?: { page?: number }) => {
    const api = billingApi as any
    if (typeof api.invoices !== 'function') return { results: [] }
    const result = await api.invoices(params)
    invoices.value = Array.isArray(result) ? result : result.results || []
    return result
  }

  const createCheckoutSession = async (payload: unknown) => {
    const api = billingApi as any
    return typeof api.createCheckoutSession === 'function' ? api.createCheckoutSession(payload) : null
  }

  const fetchSummary = async () => {
    summary.value = await billingApi.summary()
  }

  return {
    subscription,
    plans,
    invoices,
    loading,
    summary,
    fetchSubscription,
    fetchPlans,
    fetchInvoices,
    createCheckoutSession,
    fetchSummary,
  }
}
