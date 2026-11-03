<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const { handleApiError } = useAuth()
const restaurant = useRestaurantStore()
const { realtime, connect, disconnect } = useRealtime()
const { kitchenTickets, fetchKitchenTickets } = useOrders()
const error = ref('')

async function loadTickets() {
  error.value = ''
  try {
    await fetchKitchenTickets()
    realtime.setKitchenTickets(kitchenTickets.value.map((ticket) => ({
      id: ticket.id,
      title: `Order #${ticket.order}, course ${ticket.course}`,
      subtitle: ticket.items.map((item) => item.menu_item_name).join(', '),
      status: ticket.status,
    })))
  } catch (cause) {
    error.value = handleApiError(cause, 'Unable to load kitchen tickets.')
  }
}

await loadTickets()
watch(() => realtime.kitchenRefreshKey, loadTickets)

if (import.meta.client) {
  watch(() => restaurant.activeRestaurantId, (restaurantId) => {
    disconnect()
    if (restaurantId) connect({ restaurantId })
  }, { immediate: true })
}
onBeforeUnmount(() => {
  disconnect()
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Kitchen</h1>
      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">{{ realtime.connected ? 'Live' : 'Offline' }}</AppBadge>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <KitchenTicketCard
        v-for="ticket in realtime.kitchenTickets"
        :key="ticket.id"
        :title="ticket.title"
        :subtitle="ticket.subtitle"
        :status="ticket.status"
      />
    </div>

    <AppEmptyState v-if="!realtime.kitchenTickets.length">No active kitchen tickets.</AppEmptyState>
  </section>
</template>
