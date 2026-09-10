<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

import { reservationsApi } from '~/api/reservations'
import type { RestaurantBooking } from '~/types/api'

const restaurant = useRestaurantStore()
const { handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()

const loading = ref(true)
const error = ref('')
const reservations = ref<RestaurantBooking[]>([])

async function fetchReservations() {
  loading.value = true
  error.value = ''

  try {
    const result = await reservationsApi.restaurantList()
    reservations.value = result.results
  } catch (err) {
    error.value = handleApiError(err, 'Could not load reservation queue.')
  } finally {
    loading.value = false
  }
}

await fetchReservations()

if (import.meta.client) {
  watch(() => restaurant.activeRestaurantId, (restaurantId) => {
    disconnect()
    if (restaurantId) connect({ restaurantId })
  }, { immediate: true })
}

watch(
  () => realtime.lastEventAt,
  (_, prev) => {
    if (prev) {
      fetchReservations()
    }
  },
)

onBeforeUnmount(() => disconnect())

const counts = computed(() => {
  const base = { confirmed: 0, pending: 0, checked_in: 0, seated: 0 }

  for (const r of reservations.value) {
    if (r.status in base) {
      base[r.status as keyof typeof base]++
    }
  }

  return base
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Reservations</h1>

      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">
        {{ realtime.connected ? 'Live' : 'Offline' }}
      </AppBadge>
    </div>

    <ReservationCalendar />

    <div
      v-if="!loading && !error"
      class="flex flex-wrap gap-2 text-sm"
    >
      <span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
        Confirmed {{ counts.confirmed }}
      </span>
      <span class="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
        Pending {{ counts.pending }}
      </span>
      <span class="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
        Checked in {{ counts.checked_in }}
      </span>
      <span class="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
        Seated {{ counts.seated }}
      </span>
    </div>

    <p
      v-if="error"
      class="error-banner"
    >
      {{ error }}
    </p>

    <div
      v-else-if="loading"
      class="space-y-3"
    >
      <AppSkeleton
        v-for="n in 3"
        :key="n"
        :lines="2"
      />
    </div>

    <div
      v-else-if="reservations.length"
      class="space-y-2"
    >
      <ReservationCard
        v-for="item in reservations"
        :key="item.id"
        :reservation="item"
      />
    </div>

    <AppEmptyState v-else>
      No reservations found.
    </AppEmptyState>
  </section>
</template>
