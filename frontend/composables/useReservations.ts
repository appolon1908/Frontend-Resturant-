import { reservationsApi } from '~/api/reservations'
import type { Reservation } from '~/types/api'

export function useReservations() {
  const reservations = ref<Reservation[]>([])
  const timeline = ref<Reservation[]>([])
  const restaurantBookings = ref<Reservation[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchReservations(params?: { page?: number; page_size?: number; search?: string }) {
    loading.value = true
    error.value = null
    try {
      const result = await (reservationsApi as any).list(params)
      if (Array.isArray(result)) {
        reservations.value = result
        count.value = result.length
      } else {
        reservations.value = result.results || []
        count.value = result.count || reservations.value.length
      }
    } catch (e: any) {
      error.value = e?.detail ?? e?.message ?? 'Failed to load reservations'
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeline(params?: { page?: number; page_size?: number }) {
    const api = reservationsApi as any
    if (typeof api.timeline === 'function') {
      const result = await api.timeline(params)
      timeline.value = Array.isArray(result) ? result : result.results || []
    }
  }

  async function createReservation(payload: { restaurant: number; party_size: number; reservation_time: string }) {
    return reservationsApi.create(payload)
  }

  async function cancelReservation(id: number) {
    const api = reservationsApi as any
    if (typeof api.cancel !== 'function') return null
    const updated = await api.cancel(id)
    const idx = reservations.value.findIndex((r) => r.id === id)
    if (idx !== -1 && updated) reservations.value[idx] = updated
    return updated
  }

  async function fetchRestaurantBookings(params?: { page?: number; page_size?: number }) {
    const result = await (reservationsApi as any).restaurantList(params)
    restaurantBookings.value = Array.isArray(result) ? result : result.results || []
    return result
  }

  async function fetchToday() {
    const api = reservationsApi as any
    return typeof api.restaurantToday === 'function' ? api.restaurantToday() : []
  }

  async function checkIn(id: number) {
    const api = reservationsApi as any
    return typeof api.checkIn === 'function' ? api.checkIn(id) : null
  }

  async function markNoShow(id: number) {
    const api = reservationsApi as any
    return typeof api.markNoShow === 'function' ? api.markNoShow(id) : null
  }

  return {
    reservations,
    timeline,
    restaurantBookings,
    count,
    loading,
    error,
    fetchReservations,
    fetchTimeline,
    createReservation,
    cancelReservation,
    fetchRestaurantBookings,
    fetchToday,
    checkIn,
    markNoShow,
  }
}
