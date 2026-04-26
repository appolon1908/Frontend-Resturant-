import { ordersApi } from '~/api/orders'
import type { KitchenTicket, Order } from '~/types/api'

export function useOrders() {
  const orders = ref<Order[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const kitchenTickets = ref<KitchenTicket[]>([])

  async function fetchOrders(params?: { page?: number; page_size?: number; search?: string }) {
    loading.value = true
    error.value = null
    try {
      const result = await (ordersApi as any).list(params)
      if (Array.isArray(result)) {
        orders.value = result
        count.value = result.length
      } else {
        orders.value = result.results || []
        count.value = result.count || orders.value.length
      }
    } catch (e: any) {
      error.value = e?.detail ?? e?.message ?? 'Failed to load orders'
    } finally {
      loading.value = false
    }
  }

  async function createOrder(payload: unknown) {
    const api = ordersApi as any
    return typeof api.create === 'function' ? api.create(payload) : null
  }

  async function fetchRestaurantQueue(params?: { page?: number; page_size?: number }) {
    const result = await (ordersApi as any).restaurantQueue(params)
    orders.value = Array.isArray(result) ? result : result.results || []
    count.value = Array.isArray(result) ? result.length : result.count || orders.value.length
    return result
  }

  async function updateOrderStatus(id: number, payload: unknown) {
    const api = ordersApi as any
    return typeof api.updateStatus === 'function' ? api.updateStatus(id, payload) : null
  }

  async function fetchKitchenTickets(params?: { page?: number }) {
    const api = ordersApi as any
    if (typeof api.kitchenTickets !== 'function') return { results: [] as KitchenTicket[] }
    const result = await api.kitchenTickets(params)
    kitchenTickets.value = Array.isArray(result) ? result : result.results || []
    return result
  }

  async function fireKitchen(order_id: number, course: number) {
    const api = ordersApi as any
    return typeof api.fireKitchen === 'function' ? api.fireKitchen({ order_id, course }) : null
  }

  return {
    orders,
    count,
    loading,
    error,
    kitchenTickets,
    fetchOrders,
    createOrder,
    fetchRestaurantQueue,
    updateOrderStatus,
    fetchKitchenTickets,
    fireKitchen,
  }
}
