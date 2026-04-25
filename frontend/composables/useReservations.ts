import { reservationsApi } from '~/api/reservations'

export function useReservations() {
  const reservations = ref([])
  const loading = ref(false)

  async function fetchReservations() {
    loading.value = true
    try {
      reservations.value = await reservationsApi.list()
    } finally {
      loading.value = false
    }
  }

  async function createReservation(payload: { restaurant: number; party_size: number; reservation_time: string }) {
    return reservationsApi.create(payload)
  }

  return { reservations, loading, fetchReservations, createReservation }
}
