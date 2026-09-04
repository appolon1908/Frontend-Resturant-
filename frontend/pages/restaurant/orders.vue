<script setup lang="ts">
import type { Order } from '~/types/api'
import { ordersApi } from '~/api/orders'

definePageMeta({ layout: 'restaurant' })

const { auth, handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()
const loading = ref(true)
const error = ref('')
const orders = ref<Order[]>([])

async function fetchQueue() {
  try {
    orders.value = await ordersApi.restaurantQueue()
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load order queue.')
  } finally {
    loading.value = false
  }
}

await fetchQueue()

const restaurantId = computed(() => Number(auth.user?.id || 0))
if (import.meta.client && restaurantId.value) {
  connect({ restaurantId: restaurantId.value })
}

watch(
  () => realtime.lastEventType,
  async (eventType) => {
    if (['order.created', 'order.status_changed'].includes(eventType)) {
      await fetchQueue()
    }
  },
)

onBeforeUnmount(() => disconnect())
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Orders</h1>
      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">
        {{ realtime.connected ? 'Live' : 'Offline' }}
      </AppBadge>
    </div>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="space-y-3">
      <AppSkeleton v-for="n in 2" :key="n" :lines="3" />
    </div>
    <div v-else-if="orders.length" class="space-y-3">
      <OrderCard v-for="order in orders" :key="order.id" :order="order" />
    </div>
    <AppEmptyState v-else>No active orders.</AppEmptyState>
  </section>
</template>
