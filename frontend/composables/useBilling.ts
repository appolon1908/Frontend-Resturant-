import { billingApi } from '~/api/billing'

export function useBilling() {
  const summary = ref()
  const fetchSummary = async () => {
    summary.value = await billingApi.summary()
  }
  return { summary, fetchSummary }
}
