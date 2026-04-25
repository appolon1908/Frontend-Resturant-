<script setup lang="ts">
definePageMeta({ layout: 'customer' })

const auth = useAuthStore()
const realtimeStore = useRealtimeStore()
const { handleApiError } = useAuth()

const customerId = computed(() => Number(auth.user?.id || 0) || null)
const notifications = ref<any[]>([])
const pending = ref(true)
const error = ref('')
const markingAllRead = ref(false)
const success = ref('')

async function refreshNotifications() {
  pending.value = true
  error.value = ''
  try {
    notifications.value = await notificationsApi.list()
  } catch (err) {
    error.value = handleApiError(err, 'Failed to load notifications.')
  } finally {
    pending.value = false
  }
}

await refreshNotifications()

const { status, connected, reconnect } = useRealtime({
  channel: 'customer',
  customerId: customerId.value,
})

watch(customerId, () => {
  if (customerId.value) reconnect()
})

watch(
  () => realtimeStore.unreadAlertsCount,
  async () => {
    await refreshNotifications()
  },
)

async function markAllRead() {
  markingAllRead.value = true
  try {
    await Promise.all(
      notifications.value
        .filter((item) => !item.is_read)
        .map((item) => notificationsApi.markRead(item.id)),
    )
    await refreshNotifications()
    success.value = 'All notifications marked as read.'
    setTimeout(() => { success.value = '' }, 2500)
  } finally {
    markingAllRead.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Notifications</h1>
        <p class="section-subtitle">Updates for reservations, orders, and payments</p>
      </div>

      <div class="flex items-center gap-3">
        <AppBadge :tone="connected ? 'green' : 'orange'">
          {{ status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline' }}
        </AppBadge>

        <AppButton variant="secondary" :disabled="!notifications.some((item) => !item.is_read)" :loading="markingAllRead" @click="markAllRead">Mark all read</AppButton>
      </div>
    </div>

    <p v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</p>

    <div v-if="pending" class="space-y-3">
      <AppSkeleton v-for="i in 5" :key="i" :lines="2" />
    </div>

    <div v-else-if="error">
      <AppCard class="border border-rose-200 bg-rose-50">
        <p class="text-sm font-medium text-rose-700">{{ error }}</p>
      </AppCard>
    </div>

    <AppEmptyState v-else-if="!notifications.length">Reservation, order, and payment updates will appear here.</AppEmptyState>

    <div v-else class="space-y-3">
      <AppCard
        v-for="item in notifications"
        :key="item.public_id ?? item.id"
        class="transition hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-slate-900">{{ item.title }}</p>
              <AppBadge v-if="!item.is_read" tone="orange">New</AppBadge>
            </div>

            <p v-if="item.message" class="text-sm text-slate-600">{{ item.message }}</p>
            <p class="text-xs text-slate-400">{{ item.created_at }}</p>
          </div>

          <AppBadge tone="slate">{{ item.category || 'general' }}</AppBadge>
        </div>
      </AppCard>
    </div>
  </section>
</template>
