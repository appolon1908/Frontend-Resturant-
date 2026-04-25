import type { Order, CheckoutPayload } from '~/types/api'
import { get, post } from '~/api/client'

export const ordersApi = {
  list: () => get<Order[]>('/customer/orders/'),
  checkout: (payload: CheckoutPayload) => post<Order>('/customer/orders/checkout/', payload),
  restaurantQueue: () => get<Order[]>('/restaurant/orders/'),
}
