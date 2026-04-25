<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()

const restaurantId = computed(() => Number(auth.user?.id || 0) || null)

const pending = ref(true)
const error = ref('')
const fetchedTickets = ref<Array<{ id: number; title: string; subtitle?: string; status?: string }>>([])

function mapOrdersToTickets(orders: any[]) {
  return orders.map((order) => ({
    id: Number(order.id),
    title: `Ticket #${order.id}`,
    subtitle: `${order.items?.length ?? 0} item(s)`,
    status: order.status,
  }))
}

async function fetchKitchenTickets() {
  pending.value = true
  error.value = ''
  try {
    const queue = await ordersApi.restaurantQueue()
    fetchedTickets.value = mapOrdersToTickets(queue as any[])
  } catch (err) {
    error.value = handleApiError(err, 'Failed to load kitchen tickets.')
  } finally {
    pending.value = false
  }
}

await fetchKitchenTickets()

const { status, connected, reconnect } = useRealtime({
  channel: 'restaurant',
  restaurantId: restaurantId.value,
})

watch(restaurantId, () => {
  if (restaurantId.value) reconnect()
})

watch(
  () => realtimeStore.kitchenRefreshKey,
  async () => {
    if (restaurantId.value) {
      await fetchKitchenTickets()
    }
  },
)

const liveTickets = computed(() => {
  return (realtimeStore.kitchenTickets.length ? realtimeStore.kitchenTickets : fetchedTickets.value) ?? []
})

const openTickets = computed(() =>
  liveTickets.value.filter((ticket) => ['pending', 'preparing', 'submitted', 'in_progress'].includes(String(ticket.status))),
)

const readyTickets = computed(() => liveTickets.value.filter((ticket) => String(ticket.status) === 'ready'))
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Kitchen</h1>
        <p class="section-subtitle">Live ticket queue for your kitchen team</p>
      </div>

      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live queue' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
      <AppSkeleton v-for="i in 4" :key="i" :lines="3" />
    </div>

    <div v-else-if="error">
      <AppCard class="border border-rose-200 bg-rose-50">
        <p class="text-sm font-medium text-rose-700">{{ error }}</p>
      </AppCard>
    </div>

    <AppEmptyState v-else-if="!liveTickets.length">New tickets will appear here in real time.</AppEmptyState>

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-2">
        <AppCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">In progress</h2>
            <AppBadge tone="orange">{{ openTickets.length }}</AppBadge>
          </div>

          <div class="space-y-4">
            <KitchenTicketCard
              v-for="ticket in openTickets"
              :key="ticket.id"
              :title="ticket.title"
              :subtitle="ticket.subtitle"
              :status="ticket.status"
            />
            <AppEmptyState v-if="!openTickets.length">No in-progress tickets right now.</AppEmptyState>
          </div>
        </AppCard>

        <AppCard>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Ready</h2>
            <AppBadge tone="green">{{ readyTickets.length }}</AppBadge>
          </div>

          <div class="space-y-4">
            <KitchenTicketCard
              v-for="ticket in readyTickets"
              :key="ticket.id"
              :title="ticket.title"
              :subtitle="ticket.subtitle"
              :status="ticket.status"
            />
            <AppEmptyState v-if="!readyTickets.length">No ready tickets yet.</AppEmptyState>
          </div>
        </AppCard>
      </div>
    </template>
  </section>
</template>
