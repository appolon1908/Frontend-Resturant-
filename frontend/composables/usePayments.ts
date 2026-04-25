import { paymentsApi } from '~/api/payments'

export function usePayments() {
  const methods = ref([])
  const fetchMethods = async () => {
    methods.value = await paymentsApi.customerMethods()
  }
  return { methods, fetchMethods }
}
