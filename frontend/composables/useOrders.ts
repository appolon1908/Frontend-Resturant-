import { ordersApi } from '~/api/orders'
import type { KitchenTicket, Order, OrderCreateRequest, OrderUpdateRequest } from '~/types/api'

export function useOrders() {
  const orders = ref<Order[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const kitchenTickets = ref<KitchenTicket[]>([])
  const { handleApiError } = useAuth()

  async function fetchOrders(params?: Parameters<typeof ordersApi.list>[0]) {
    loading.value = true
    error.value = null
    try {
      const result = await ordersApi.list(params)
      orders.value = result.results
      count.value = result.count
    } catch (cause) {
      error.value = handleApiError(cause, 'Failed to load orders')
    } finally {
      loading.value = false
    }
  }

  async function fetchRestaurantQueue(params?: Parameters<typeof ordersApi.restaurantQueue>[0]) {
    const result = await ordersApi.restaurantQueue(params)
    orders.value = result.results
    count.value = result.count
    return result
  }

  async function fetchKitchenTickets(params?: Parameters<typeof ordersApi.kitchenTickets>[0]) {
    const result = await ordersApi.kitchenTickets(params)
    kitchenTickets.value = result.results
    return result
  }

  return {
    orders, count, loading, error, kitchenTickets, fetchOrders, fetchRestaurantQueue, fetchKitchenTickets,
    createOrder: (payload: OrderCreateRequest) => ordersApi.create(payload),
    updateOrderStatus: (id: number, payload: OrderUpdateRequest) => ordersApi.updateStatus(id, payload),
    fireKitchen: (order_id: number, course: number) => ordersApi.fireKitchen({ order_id, course }),
  }
}
