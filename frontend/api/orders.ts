import type { CheckoutPayload, KitchenFire, KitchenTicket, Order, OrderCreateRequest, OrderUpdateRequest, Paginated } from '~/types/api'
import { get, patch, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const ordersApi = {
  // ── Customer ────────────────────────────────────────────────
  list(params?: { page?: number; page_size?: number; search?: string; ordering?: string }) {
    return get<Paginated<Order>>('/customer/orders/history/', params as Record<string, QV>)
  },

  create(payload: OrderCreateRequest) {
    return post<Order>('/customer/orders/', payload)
  },

  /** Legacy checkout used by cart store */
  checkout(payload: CheckoutPayload) {
    return post<Order>('/customer/orders/', {
      restaurant_id: payload.restaurant,
      order_type: 'dine_in',
      items: payload.items,
    })
  },

  // ── Restaurant ──────────────────────────────────────────────
  restaurantQueue(params?: { page?: number; page_size?: number; search?: string; ordering?: string }) {
    return get<Paginated<Order>>('/restaurant/orders/', params as Record<string, QV>)
  },

  updateStatus(id: number, payload: OrderUpdateRequest) {
    return patch<Order>(`/restaurant/orders/${id}/`, payload)
  },

  // ── Kitchen ─────────────────────────────────────────────────
  kitchenTickets(params?: { page?: number; page_size?: number }) {
    return get<Paginated<KitchenTicket>>('/restaurant/kitchen/tickets/', params as Record<string, QV>)
  },

  fireKitchen(payload: KitchenFire) {
    return post<KitchenFire>('/restaurant/kitchen/fire/', payload)
  },
}
