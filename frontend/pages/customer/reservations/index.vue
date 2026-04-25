<script setup lang="ts">
definePageMeta({ layout: 'customer' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()
const { reservations, loading, fetchReservations } = useReservations()

const error = ref('')
const success = ref('')
const customerId = computed(() => Number(auth.user?.id || 0) || null)

async function refreshReservations(options?: { announce?: string }) {
  try {
    await fetchReservations()
    error.value = ''
    if (options?.announce) {
      success.value = options.announce
      setTimeout(() => {
        if (success.value === options.announce) success.value = ''
      }, 2500)
    }
  } catch (err) {
    error.value = handleApiError(err, 'Failed to load reservations.')
  }
}

await refreshReservations()

const { status, connected, reconnect } = useRealtime({
  channel: 'customer',
  customerId: customerId.value,
})

watch(customerId, () => {
  if (customerId.value) reconnect()
})

watch(
  () => realtimeStore.reservationRefreshKey,
  async () => {
    await refreshReservations({ announce: 'Reservations updated in real time.' })
  },
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">My reservations</h1>
        <p class="section-subtitle">See your upcoming and recent bookings.</p>
      </div>
      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <p v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</p>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <div v-else-if="loading" class="space-y-3">
      <AppSkeleton v-for="n in 3" :key="n" :lines="3" />
    </div>

    <div v-else-if="reservations.length" class="space-y-3">
      <ReservationCard v-for="item in reservations" :key="item.id" :reservation="item" />
    </div>

    <AppEmptyState v-else>No reservations yet.</AppEmptyState>
  </section>
</template>
