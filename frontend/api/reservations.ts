import type { Reservation } from '~/types/api'
import { get, post } from '~/api/client'

export const reservationsApi = {
  list: () => get<Reservation[]>('/customer/reservations/'),
  create: (payload: { restaurant: number; party_size: number; reservation_time: string }) =>
    post<Reservation>('/customer/reservations/', payload),
  restaurantList: () => get<Reservation[]>('/restaurant/reservations/'),
}
