<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

const restaurant = useRestaurantStore()
const { handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()
const loading = ref(true)
const error = ref('')

const restaurantId = computed(() => restaurant.activeRestaurantId || restaurant.activeRestaurant?.id || 0)
const updatedAtText = computed(() => {
  if (!realtime.lastEventAt) return 'Not yet updated'
  return new Date(realtime.lastEventAt).toLocaleString()
})
const revenueTodayLabel = computed(() => {
  const value = Number(restaurant.dashboard?.revenue_today || 0)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
})

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

watch(
  () => restaurantId.value,
  (id) => {
    if (!import.meta.client || !id) return
    connect({ restaurantId: Number(id) })
  },
  { immediate: true },
)

watch(
  () => realtime.dashboardRefreshKey,
  async () => {
    await fetchDashboard()
  },
)

onBeforeUnmount(() => disconnect())
</script>

<template>
  <section class="space-y-4">
    <AppPageHeader title="Dashboard" subtitle="Track today's booking and order performance.">
      <template #actions>
        <div class="flex items-center justify-between gap-2 sm:justify-end">
          <AppBadge :tone="realtime.connected ? 'green' : realtime.connecting ? 'orange' : 'red'">
            {{ realtime.status }}
          </AppBadge>
        </div>
      </template>
    </AppPageHeader>

    <p class="text-xs text-slate-500">Last updated: {{ updatedAtText }}</p>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="card-grid sm:grid-cols-2 xl:grid-cols-4">
      <AppSkeleton v-for="n in 4" :key="n" :lines="2" />
    </div>
    <div v-else-if="restaurant.dashboard" class="card-grid sm:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard label="Reservations Today" :value="restaurant.dashboard.today_reservations" />
      <DashboardMetricCard label="Active Orders" :value="restaurant.dashboard.active_orders" />
      <DashboardMetricCard label="Revenue Today" :value="revenueTodayLabel" />
      <DashboardMetricCard label="Occupancy" :value="`${restaurant.dashboard.occupancy_rate}%`" />
    </div>
    <AppEmptyState v-else>Dashboard data is not available yet.</AppEmptyState>
  </section>
</template>
