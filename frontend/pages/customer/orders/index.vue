<script setup lang="ts">
definePageMeta({ layout: 'customer' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()
const { orders, loading, fetchOrders } = useOrders()

const error = ref('')
const success = ref('')
const customerId = computed(() => Number(auth.user?.id || 0) || null)

async function refreshOrders(options?: { announce?: string }) {
  try {
    await fetchOrders()
    error.value = ''
    if (options?.announce) {
      success.value = options.announce
      setTimeout(() => {
        if (success.value === options.announce) success.value = ''
      }, 2500)
    }
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load your orders.')
  }
}

await refreshOrders()

const { status, connected, reconnect } = useRealtime({
  channel: 'customer',
  customerId: customerId.value,
})

watch(customerId, () => {
  if (customerId.value) reconnect()
})

watch(
  () => realtimeStore.ordersRefreshKey,
  async () => {
    await refreshOrders({ announce: 'Orders updated in real time.' })
  },
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">My orders</h1>
        <p class="section-subtitle">Track your active and completed orders.</p>
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

    <div v-else-if="orders.length" class="space-y-3">
      <OrderCard v-for="order in orders" :key="order.id" :order="order" />
    </div>

    <AppEmptyState v-else>No orders yet.</AppEmptyState>
  </section>
</template>
