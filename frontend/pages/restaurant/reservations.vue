<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

import type { Reservation } from '~/types/api'

const { auth, handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()
const loading = ref(true)
const error = ref('')
const reservations = ref<Reservation[]>([])

async function fetchReservations() {
  try {
    reservations.value = await reservationsApi.restaurantList()
  } catch (err) {
    error.value = handleApiError(err, 'Could not load reservation queue.')
  } finally {
    loading.value = false
  }
}

await fetchReservations()

const restaurantId = computed(() => Number(auth.user?.id || 0))
if (import.meta.client && restaurantId.value) {
  connect({ restaurantId: restaurantId.value })
}

watch(
  () => realtime.lastEventType,
  async (eventType) => {
    if (['reservation.created', 'reservation.updated'].includes(eventType)) {
      await fetchReservations()
    }
  },
)

onBeforeUnmount(() => disconnect())
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Reservations</h1>
      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">{{ realtime.connected ? 'Live' : 'Offline' }}</AppBadge>
    </div>

    <ReservationCalendar />
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="space-y-3"><AppSkeleton v-for="n in 3" :key="n" :lines="2" /></div>
    <div v-else-if="reservations.length" class="space-y-2">
      <ReservationCard v-for="item in reservations" :key="item.id" :reservation="item" />
    </div>
    <AppEmptyState v-else>No reservations found.</AppEmptyState>
  </section>
</template>
