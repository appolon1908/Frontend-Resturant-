<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()

const restaurantId = computed(() => Number(auth.user?.id || 0) || null)
const loading = ref(true)
const error = ref('')
const orders = ref<any[]>([])

async function fetchOrders() {
  loading.value = true
  error.value = ''
  try {
    orders.value = await ordersApi.restaurantQueue()
  } catch (err) {
    error.value = handleApiError(err, 'Failed to load orders.')
  } finally {
    loading.value = false
  }
}

await fetchOrders()

const { status, connected, reconnect } = useRealtime({
  channel: 'restaurant',
  restaurantId: restaurantId.value,
})

watch(restaurantId, () => {
  if (restaurantId.value) reconnect()
})

watch(
  () => realtimeStore.ordersRefreshKey,
  async () => {
    await fetchOrders()
  },
)

const openOrders = computed(() =>
  (orders.value ?? []).filter((order: any) => ['pending', 'submitted', 'preparing', 'ready'].includes(order.status)),
)

const completedOrders = computed(() =>
  (orders.value ?? []).filter((order: any) => ['completed', 'cancelled'].includes(order.status)),
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Orders</h1>
        <p class="section-subtitle">Track live order flow</p>
      </div>
      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live queue' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <AppSkeleton v-for="i in 4" :key="i" :lines="3" />
    </div>

    <div v-else-if="error">
      <AppCard class="border border-rose-200 bg-rose-50">
        <p class="text-sm font-medium text-rose-700">{{ error }}</p>
      </AppCard>
    </div>

    <AppEmptyState v-else-if="!orders.length">Incoming restaurant orders will appear here.</AppEmptyState>

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-2">
        <AppCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Open orders</h2>
            <AppBadge tone="orange">{{ openOrders.length }}</AppBadge>
          </div>

          <div class="space-y-4">
            <OrderCard v-for="order in openOrders" :key="order.id" :order="order" />
            <AppEmptyState v-if="!openOrders.length">No open orders right now.</AppEmptyState>
          </div>
        </AppCard>

        <AppCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Completed / closed</h2>
            <AppBadge tone="green">{{ completedOrders.length }}</AppBadge>
          </div>

          <div class="space-y-4">
            <OrderCard v-for="order in completedOrders" :key="order.id" :order="order" />
            <AppEmptyState v-if="!completedOrders.length">No completed orders yet.</AppEmptyState>
          </div>
        </AppCard>
      </div>
    </template>
  </section>
</template>
