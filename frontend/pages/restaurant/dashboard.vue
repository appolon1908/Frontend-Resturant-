<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const restaurant = useRestaurantStore()
const { auth, handleApiError } = useAuth()
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

const restaurantId = computed(() => Number(auth.user?.id || 0))
if (import.meta.client && restaurantId.value) {
  connect({ restaurantId: restaurantId.value })
}

watch(
  () => realtime.lastEventType,
  async (eventType) => {
    if (['reservation.created', 'reservation.updated', 'order.created', 'order.status_changed', 'payment.succeeded'].includes(eventType)) {
      await fetchDashboard()
    }
  },
)

onBeforeUnmount(() => {
  disconnect()
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="section-title">Dashboard</h1>
        <p class="section-subtitle">Track today's booking and order performance.</p>
      </div>
      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">{{ realtime.connected ? 'Live' : 'Offline' }}</AppBadge>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="card-grid sm:grid-cols-2 xl:grid-cols-4">
      <AppSkeleton v-for="n in 4" :key="n" :lines="2" />
    </div>
    <div v-else-if="restaurant.dashboard" class="card-grid sm:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard label="Reservations Today" :value="restaurant.dashboard.today_reservations" />
      <DashboardMetricCard label="Active Orders" :value="restaurant.dashboard.active_orders" />
      <DashboardMetricCard label="Revenue Today" :value="`$${restaurant.dashboard.revenue_today}`" />
      <DashboardMetricCard label="Occupancy" :value="`${restaurant.dashboard.occupancy_rate}%`" />
    </div>
    <AppEmptyState v-else>Dashboard data is not available yet.</AppEmptyState>
  </section>
</template>
