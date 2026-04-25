<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const restaurant = useRestaurantStore()
const loading = ref(true)
const error = ref('')

try {
  await restaurant.fetchDashboard()
} catch {
  error.value = 'Unable to load dashboard.'
} finally {
  loading.value = false
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Dashboard</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <div v-else-if="restaurant.dashboard" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard label="Reservations Today" :value="restaurant.dashboard.today_reservations" />
      <DashboardMetricCard label="Active Orders" :value="restaurant.dashboard.active_orders" />
      <DashboardMetricCard label="Revenue Today" :value="`$${restaurant.dashboard.revenue_today}`" />
      <DashboardMetricCard label="Occupancy" :value="`${restaurant.dashboard.occupancy_rate}%`" />
    </div>
    <AppEmptyState v-else>Dashboard data is not available yet.</AppEmptyState>
  </section>
</template>
