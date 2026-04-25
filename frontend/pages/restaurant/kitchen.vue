<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const { auth } = useAuth()
const { realtime, connect, disconnect } = useRealtime()

const defaultTickets = [
  { id: 1, title: 'Ticket #101', subtitle: '2x Pasta, 1x Soup', status: 'preparing' },
  { id: 2, title: 'Ticket #102', subtitle: '1x Burger, 1x Salad', status: 'queued' },
]

if (!realtime.kitchenTickets.length) {
  realtime.kitchenTickets = [...defaultTickets]
}

const restaurantId = computed(() => Number(auth.user?.id || 0))
if (import.meta.client && restaurantId.value) {
  connect({ restaurantId: restaurantId.value })
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
