import type { BookingAction, BookingCreateRequest, Paginated, Reservation, ReservationTimeline, RestaurantBooking } from '~/types/api'
import { get, patch, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const reservationsApi = {
  // ── Customer ────────────────────────────────────────────────
  list(params?: { page?: number; page_size?: number; ordering?: string; search?: string }) {
    return get<Paginated<Reservation>>('/customer/reservations/', params as Record<string, QV>)
  },

  timeline(params?: { page?: number; page_size?: number }) {
    return get<Paginated<ReservationTimeline>>('/customer/reservations/timeline/', params as Record<string, QV>)
  },

  retrieve(id: number) {
    return get<Reservation>(`/customer/reservations/${id}/`)
  },

  /** Backward compatible create signature */
  create(slugOrPayload: string | { restaurant: number; party_size: number; reservation_time: string }, payload?: BookingCreateRequest) {
    if (typeof slugOrPayload === 'string') {
      return post<Reservation>(`/public/restaurants/${slugOrPayload}/bookings/`, payload)
    }

    return post<Reservation>('/customer/reservations/', slugOrPayload)
  },

  cancel(id: number) {
    return patch<Reservation>(`/customer/reservations/${id}/cancel/`, {})
  },

  // ── Restaurant staff ────────────────────────────────────────
  restaurantList(params?: { page?: number; page_size?: number; search?: string; ordering?: string }) {
    return get<Paginated<RestaurantBooking>>('/restaurant/bookings/', params as Record<string, QV>)
  },

  restaurantToday(params?: { page?: number; page_size?: number }) {
    return get<Paginated<RestaurantBooking>>('/restaurant/bookings/today/', params as Record<string, QV>)
  },

  restaurantUpcoming(params?: { page?: number; page_size?: number }) {
    return get<Paginated<RestaurantBooking>>('/restaurant/bookings/upcoming/', params as Record<string, QV>)
  },

  restaurantWaitlist(params?: { page?: number; page_size?: number }) {
    return get<Paginated<RestaurantBooking>>('/restaurant/bookings/waitlist/', params as Record<string, QV>)
  },

  restaurantInService(params?: { page?: number; page_size?: number }) {
    return get<Paginated<RestaurantBooking>>('/restaurant/bookings/in-service/', params as Record<string, QV>)
  },

  checkIn(id: number) {
    return post<RestaurantBooking>(`/restaurant/bookings/${id}/check-in/`, {})
  },

  markNoShow(id: number) {
    return post<RestaurantBooking>(`/restaurant/bookings/${id}/mark-no-show/`, {})
  },

  restaurantCancel(id: number) {
    return patch<RestaurantBooking>(`/restaurant/bookings/${id}/cancel/`, {})
  },

  confirm(id: number) {
    return patch<RestaurantBooking>(`/restaurant/bookings/${id}/confirm/`, {})
  },

  seat(id: number, payload: BookingAction) {
    return post<BookingAction>(`/restaurant/bookings/${id}/seat/`, payload)
  },

  autoAssign(id: number) {
    return patch<RestaurantBooking>(`/restaurant/bookings/${id}/auto-assign/`, {})
  },

  reassignTable(id: number, payload: BookingAction) {
    return post<BookingAction>(`/restaurant/bookings/${id}/reassign-table/`, payload)
  },

  addInternalNote(id: number, payload: BookingAction) {
    return post<BookingAction>(`/restaurant/bookings/${id}/internal-note/`, payload)
  },
}
