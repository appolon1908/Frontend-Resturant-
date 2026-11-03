import { reservationsApi } from '~/api/reservations'
import type { Reservation, ReservationTimeline, RestaurantBooking } from '~/types/api'

export function useReservations() {
  const reservations = ref<Reservation[]>([])
  const timeline = ref<ReservationTimeline[]>([])
  const restaurantBookings = ref<RestaurantBooking[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { handleApiError } = useAuth()

  async function fetchReservations(params?: Parameters<typeof reservationsApi.list>[0]) {
    loading.value = true
    error.value = null
    try {
      const result = await reservationsApi.list(params)
      reservations.value = result.results
      count.value = result.count
    } catch (cause) {
      error.value = handleApiError(cause, 'Failed to load reservations')
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeline(params?: Parameters<typeof reservationsApi.timeline>[0]) {
    const result = await reservationsApi.timeline(params)
    timeline.value = result.results
    return result
  }

  async function cancelReservation(id: number) {
    const updated = await reservationsApi.cancel(id)
    const index = reservations.value.findIndex((reservation) => reservation.id === id)
    if (index !== -1) reservations.value[index] = updated
    return updated
  }

  async function fetchRestaurantBookings(params?: Parameters<typeof reservationsApi.restaurantList>[0]) {
    const result = await reservationsApi.restaurantList(params)
    restaurantBookings.value = result.results
    return result
  }

  return {
    reservations, timeline, restaurantBookings, count, loading, error,
    fetchReservations, fetchTimeline, cancelReservation, fetchRestaurantBookings,
    createReservation: (payload: { restaurant: number; party_size: number; reservation_time: string }) => reservationsApi.create(payload),
    fetchToday: () => reservationsApi.restaurantToday(),
    checkIn: (id: number) => reservationsApi.checkIn(id),
    markNoShow: (id: number) => reservationsApi.markNoShow(id),
  }
}
