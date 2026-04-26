<script setup lang="ts">
import { reservationsApi } from '~/api/reservations'
import type { Reservation } from '~/types/api'

definePageMeta({ layout: 'restaurant' })

const restaurant = useRestaurantStore()
const { handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()
const loading = ref(true)
const error = ref('')
const selectedStatus = ref<Reservation['status'] | 'all'>('all')
const reservations = ref<Reservation[]>([])

const restaurantId = computed(() => restaurant.activeRestaurantId || restaurant.activeRestaurant?.id || 0)
const statuses: Array<Reservation['status']> = ['pending', 'confirmed', 'completed', 'cancelled']
const statusCounts = computed(() => {
  const counts: Record<Reservation['status'], number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const item of reservations.value) {
    counts[item.status] += 1
  }

  return counts
})
const filteredReservations = computed(() => {
  if (selectedStatus.value === 'all') return reservations.value
  return reservations.value.filter((item) => item.status === selectedStatus.value)
})

async function fetchReservations() {
  loading.value = true
  error.value = ''

  try {
    reservations.value = await reservationsApi.restaurantList()
  } catch (err) {
    error.value = handleApiError(err, 'Could not load reservation queue.')
  } finally {
    loading.value = false
  }
}

await fetchReservations()

watch(
  () => restaurantId.value,
  (id) => {
    if (!import.meta.client || !id) return
    connect({ restaurantId: Number(id) })
  },
  { immediate: true },
)

watch(
  () => realtime.reservationRefreshKey,
  async () => {
    await fetchReservations()
  },
)

onBeforeUnmount(() => disconnect())
</script>

<template>
  <section class="space-y-4">
    <AppPageHeader title="Reservations" subtitle="Manage incoming reservations and table timing.">
      <template #actions>
        <AppBadge :tone="realtime.connected ? 'green' : realtime.connecting ? 'orange' : 'red'">{{ realtime.status }}</AppBadge>
      </template>
    </AppPageHeader>

    <ReservationCalendar />

    <div class="flex flex-wrap gap-2">
      <AppButton :variant="selectedStatus === 'all' ? 'primary' : 'secondary'" class="!w-auto" @click="selectedStatus = 'all'">
        All ({{ reservations.length }})
      </AppButton>
      <AppButton
        v-for="status in statuses"
        :key="status"
        :variant="selectedStatus === status ? 'primary' : 'secondary'"
        class="!w-auto"
        @click="selectedStatus = status"
      >
        {{ status }} ({{ statusCounts[status] }})
      </AppButton>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="space-y-3"><AppSkeleton v-for="n in 3" :key="n" :lines="2" /></div>
    <div v-else-if="filteredReservations.length" class="space-y-2">
      <ReservationCard v-for="item in filteredReservations" :key="item.id" :reservation="item" />
    </div>
    <AppEmptyState v-else-if="reservations.length">No reservations match the selected status.</AppEmptyState>
    <AppEmptyState v-else>No reservations found.</AppEmptyState>
  </section>
</template>
