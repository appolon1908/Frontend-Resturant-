import type { BookingConfirmation, BookingCreateRequest, MenuCategory, Paginated, Restaurant, RestaurantDetail, RestaurantListParams } from '~/types/api'
import { get, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const restaurantsApi = {
  /** GET /public/restaurants/ — paginated, filterable */
  list(params?: RestaurantListParams) {
    return get<Paginated<Restaurant> | Restaurant[]>('/public/restaurants/', params as Record<string, QV>).then((res) =>
      Array.isArray(res) ? res : res.results,
    )
  },

  /** GET /public/restaurants/{slug}/ */
  detail(slug: string) {
    return get<RestaurantDetail>(`/public/restaurants/${slug}/`)
  },

  /** GET /public/restaurants/{slug}/availability/ */
  availability(slug: string, date?: string) {
    return get<unknown>(`/public/restaurants/${slug}/availability/`, date ? { date } : undefined)
  },

  /** POST /public/restaurants/{slug}/bookings/ */
  createBooking(slug: string, payload: BookingCreateRequest) {
    return post<BookingConfirmation>(`/public/restaurants/${slug}/bookings/`, payload)
  },

  /** GET /public/menu/ */
  publicMenu() {
    return get<MenuCategory[]>('/public/menu/')
  },
}
