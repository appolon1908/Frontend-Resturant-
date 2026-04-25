<script setup lang="ts">
import { billingApi } from '~/api/billing'
definePageMeta({ layout: 'restaurant' })

const { auth, handleApiError } = useAuth()
const realtimeStore = useRealtimeStore()

const restaurantId = computed(() => Number(auth.user?.id || 0) || null)
const loading = ref(true)
const error = ref('')
const summary = ref<{ plan: string; renewal_date: string; balance: number } | null>(null)
const latestStatus = ref('pending')
const success = ref('')

async function fetchBillingSummary(options?: { announce?: string }) {
  loading.value = true
  error.value = ''
  try {
    summary.value = await billingApi.summary()
    if (options?.announce) {
      success.value = options.announce
      setTimeout(() => {
        if (success.value === options.announce) success.value = ''
      }, 2500)
    }
  } catch (err) {
    error.value = handleApiError(err, 'Failed to load payment summary.')
  } finally {
    loading.value = false
  }
}

await fetchBillingSummary()

const { status, connected, reconnect } = useRealtime({
  channel: 'restaurant',
  restaurantId: restaurantId.value,
})

watch(restaurantId, () => {
  if (restaurantId.value) reconnect()
})

watch(
  () => realtimeStore.checkoutRefreshKey,
  async () => {
    latestStatus.value = 'settled'
    await fetchBillingSummary({ announce: 'Payment activity updated in real time.' })
  },
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="section-title">Payments</h1>
        <p class="section-subtitle">Track settlement health and billing status.</p>
      </div>
      <AppBadge :tone="connected ? 'green' : 'orange'">
        {{ status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline' }}
      </AppBadge>
    </div>

    <p v-if="success" class="success-banner">{{ success }}</p>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AppSkeleton v-for="i in 3" :key="i" :lines="2" />
    </div>

    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <template v-else-if="summary">
      <div class="card-grid sm:grid-cols-2 xl:grid-cols-3">
        <AppCard>
          <p class="text-sm text-slate-500">Current plan</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ summary.plan || 'N/A' }}</p>
        </AppCard>

        <AppCard>
          <p class="text-sm text-slate-500">Renewal date</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ summary.renewal_date || 'N/A' }}</p>
        </AppCard>

        <AppCard>
          <p class="text-sm text-slate-500">Outstanding balance</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">${{ Number(summary.balance || 0).toFixed(2) }}</p>
        </AppCard>
      </div>

      <AppCard>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm text-slate-500">Latest settlement status</p>
            <p class="mt-1 text-lg font-semibold text-slate-900">Realtime payment status</p>
          </div>
          <PaymentStatusBadge :status="latestStatus" />
        </div>
      </AppCard>
    </template>

    <AppEmptyState v-else>Payment summary is not available yet.</AppEmptyState>
  </section>
</template>
