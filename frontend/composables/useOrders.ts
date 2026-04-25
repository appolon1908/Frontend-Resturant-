import { ordersApi } from '~/api/orders'

export function useOrders() {
  const orders = ref([])
  const loading = ref(false)

  async function fetchOrders() {
    loading.value = true
    try {
      orders.value = await ordersApi.list()
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, fetchOrders }
}
