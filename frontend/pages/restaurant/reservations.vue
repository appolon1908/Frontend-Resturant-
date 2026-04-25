<script setup lang="ts">
import { reservationsApi } from '~/api/reservations'
definePageMeta({ layout: 'restaurant' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()

const restaurantId = computed(() => Number(auth.user?.id || 0) || null)
const loading = ref(true)
const error = ref('')
const success = ref('')
const reservations = ref<any[]>([])

async function fetchReservationQueue(options?: { announce?: string }) {
  loading.value = true
  error.value = ''

  try {
    reservations.value = await reservationsApi.restaurantList()
    if (options?.announce) {
      success.value = options.announce
      setTimeout(() => {
        if (success.value === options.announce) success.value = ''
      }, 2500)
    }
  } catch (err) {
    error.value = handleApiError(err, 'Could not load reservation queue.')
  } finally {
    loading.value = false
  }
}

await fetchReservationQueue()

const { status, connected, reconnect } = useRealtime({
  channel: 'restaurant',
  restaurantId: restaurantId.value,
})

watch(restaurantId, () => {
  if (restaurantId.value) reconnect()
})

watch(
  () => realtimeStore.reservationRefreshKey,
  async () => {
    await fetchReservationQueue({ announce: 'Reservations updated in real time.' })
  },
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Reservations</h1>
        <p class="section-subtitle">Manage bookings and monitor live changes.</p>
      </div>
      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <ReservationCalendar />

    <p v-if="success" class="success-banner">{{ success }}</p>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div v-else-if="loading" class="space-y-3">
      <AppSkeleton v-for="n in 3" :key="n" :lines="3" />
    </div>

    <div v-else-if="reservations.length" class="space-y-2">
      <ReservationCard v-for="item in reservations" :key="item.id" :reservation="item" />
    </div>

    <AppEmptyState v-else>No reservations found.</AppEmptyState>
  </section>
</template>
