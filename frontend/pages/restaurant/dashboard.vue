<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

const restaurantStore = useRestaurantStore()
const realtimeStore = useRealtimeStore()
const { auth, handleApiError } = useAuth()

const restaurantId = computed(() => Number(auth.user?.id || 0) || null)

const loading = ref(true)
const error = ref('')
const recentActivity = ref<Array<{ type: string; label: string; created_at: string }>>([])
const tables = ref<Array<{ id: number; name: string; seats: number; status: string }>>([])

async function fetchDashboard() {
  loading.value = true
  error.value = ''
  try {
    await restaurantStore.fetchDashboard()
    recentActivity.value = []
    tables.value = Object.entries(realtimeStore.tableStatusById).map(([id, status]) => ({
      id: Number(id),
      name: `Table ${id}`,
      seats: 4,
      status,
    }))
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load dashboard data.')
  } finally {
    loading.value = false
  }
}

await fetchDashboard()

const { status, connected, reconnect } = useRealtime({
  channel: 'restaurant',
  restaurantId: restaurantId.value,
})

watch(restaurantId, () => {
  if (restaurantId.value) reconnect()
})

watch(
  () => realtimeStore.dashboardRefreshKey,
  async () => {
    if (restaurantId.value) await fetchDashboard()
  },
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Dashboard</h1>
        <p class="section-subtitle">Live restaurant overview</p>
      </div>
      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <AppEmptyState v-if="!loading && !error && !restaurantStore.dashboard">
      Your dashboard data will appear here once the restaurant is set up.
    </AppEmptyState>

    <div v-else-if="loading" class="card-grid sm:grid-cols-2 xl:grid-cols-4">
      <AppSkeleton v-for="i in 4" :key="i" :lines="2" />
    </div>

    <div v-else-if="error">
      <AppCard class="border border-rose-200 bg-rose-50">
        <p class="text-sm font-medium text-rose-700">{{ error }}</p>
      </AppCard>
    </div>

    <template v-else>
      <div class="card-grid sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard label="Today orders" :value="restaurantStore.dashboard?.active_orders ?? 0" />
        <DashboardMetricCard label="Open tables" :value="tables.length" />
        <DashboardMetricCard label="Reservations" :value="restaurantStore.dashboard?.today_reservations ?? 0" />
        <DashboardMetricCard label="Revenue" :value="`$${restaurantStore.dashboard?.revenue_today ?? 0}`" />
      </div>

      <div class="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <AppCard>
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Recent activity</h2>
          <AppEmptyState v-if="!recentActivity.length">No recent activity yet.</AppEmptyState>
          <AppTable v-else>
            <thead>
              <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Details</th>
                <th class="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in recentActivity" :key="idx" class="border-b border-slate-100 last:border-0">
                <td class="px-4 py-3">{{ row.type }}</td>
                <td class="px-4 py-3">{{ row.label }}</td>
                <td class="px-4 py-3 text-slate-500">{{ row.created_at }}</td>
              </tr>
            </tbody>
          </AppTable>
        </AppCard>

        <AppCard>
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Live table status</h2>
          <AppEmptyState v-if="!tables.length">No live table updates yet.</AppEmptyState>
          <div v-else class="space-y-3">
            <div
              v-for="table in tables"
              :key="table.id"
              class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
            >
              <div>
                <p class="font-medium text-slate-900">{{ table.name }}</p>
                <p class="text-sm text-slate-500">Seats {{ table.seats }}</p>
              </div>

              <AppBadge :tone="table.status === 'occupied' ? 'orange' : 'green'">
                {{ table.status }}
              </AppBadge>
            </div>
          </div>
        </AppCard>
      </div>
    </template>
  </section>
</template>
