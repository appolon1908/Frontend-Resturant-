<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

const restaurant = useRestaurantStore()
const { handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()

const loading = ref(true)
const error = ref('')

async function fetchDashboard() {
  loading.value = true
  error.value = ''

  try {
    await restaurant.fetchDashboard()
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load dashboard.')
  } finally {
    loading.value = false
  }
}

await fetchDashboard()

if (import.meta.client) {
  connect({ restaurantId: restaurant.activeRestaurantId ?? undefined })
}

watch(
  () => realtime.lastEventAt,
  (_, prev) => {
    if (prev) {
      fetchDashboard()
    }
  },
)

onBeforeUnmount(() => disconnect())

const revenue = computed(() => {
  const val = restaurant.dashboard?.revenue_today
  if (val == null) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val)
})

const occupancy = computed(() => {
  const val = restaurant.dashboard?.occupancy_rate
  return val != null ? `${val}%` : '—'
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="section-title">Dashboard</h1>
        <p
          v-if="realtime.lastEventAt"
          class="section-subtitle"
        >
          Last updated {{ new Date(realtime.lastEventAt).toLocaleTimeString() }}
        </p>
        <p
          v-else
          class="section-subtitle"
        >
          Track today's booking and order performance.
        </p>
      </div>

      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">
        {{ realtime.connected ? 'Live' : 'Offline' }}
      </AppBadge>
    </div>

    <p
      v-if="error"
      class="error-banner"
    >
      {{ error }}
    </p>

    <div
      v-else-if="loading"
      class="card-grid sm:grid-cols-2 xl:grid-cols-4"
    >
      <AppSkeleton
        v-for="n in 4"
        :key="n"
        :lines="2"
      />
    </div>

    <div
      v-else-if="restaurant.dashboard"
      class="card-grid sm:grid-cols-2 xl:grid-cols-4"
    >
      <DashboardMetricCard
        label="Reservations Today"
        :value="restaurant.dashboard.today_reservations ?? '—'"
      />
      <DashboardMetricCard
        label="Active Orders"
        :value="restaurant.dashboard.active_orders ?? '—'"
      />
      <DashboardMetricCard
        label="Revenue Today"
        :value="revenue"
      />
      <DashboardMetricCard
        label="Occupancy"
        :value="occupancy"
      />
    </div>

    <AppEmptyState v-else>
      Dashboard data is not available yet.
    </AppEmptyState>
  </section>
</template>
