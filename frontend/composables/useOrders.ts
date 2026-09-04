import type { Order } from '~/types/api'
import { ordersApi } from '~/api/orders'

export function useOrders() {
  const orders = ref<Order[]>([])
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
