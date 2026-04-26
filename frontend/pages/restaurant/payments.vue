<script setup lang="ts">
import { paymentsApi } from '~/api/payments'
import type { Payment, PaymentStatus } from '~/types/api'

definePageMeta({ layout: 'restaurant' })

const restaurant = useRestaurantStore()
const { handleApiError } = useAuth()
const { realtime, connect, disconnect } = useRealtime()

const loading = ref(true)
const error = ref('')
const success = ref('')
const selectedStatus = ref<PaymentStatus | 'all'>('all')
const payments = ref<Payment[]>([])

const restaurantId = computed(() => restaurant.activeRestaurantId || restaurant.activeRestaurant?.id || 0)
const statusFilters: Array<PaymentStatus> = ['pending', 'authorized', 'settled', 'refunded', 'failed', 'cancelled']

const filteredPayments = computed(() => {
  if (selectedStatus.value === 'all') return payments.value
  return payments.value.filter((payment) => payment.status === selectedStatus.value)
})

const metrics = computed(() => {
  const settledTotal = filteredPayments.value
    .filter((payment) => payment.status === 'settled')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const refundedCount = filteredPayments.value.filter((payment) => payment.status === 'refunded').length

  return {
    settledTotal,
    transactionsShown: filteredPayments.value.length,
    refundedCount,
  }
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

function formatAmount(amount: string) {
  return formatCurrency(Number(amount || 0))
}

async function fetchPayments(options?: { fromRealtime?: boolean }) {
  loading.value = true
  error.value = ''

  try {
    const status = selectedStatus.value === 'all' ? '' : selectedStatus.value
    payments.value = await paymentsApi.restaurantList({ status })
    if (options?.fromRealtime) {
      success.value = 'Payments refreshed from a live update.'
    }
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load payments.')
  } finally {
    loading.value = false
  }
}

await fetchPayments()

watch(selectedStatus, async () => {
  success.value = ''
  await fetchPayments()
})

watch(
  () => restaurantId.value,
  (id) => {
    if (!import.meta.client || !id) return
    connect({ restaurantId: Number(id) })
  },
  { immediate: true },
)

watch(
  () => realtime.checkoutRefreshKey,
  async () => {
    await fetchPayments({ fromRealtime: true })
  },
)

onBeforeUnmount(() => disconnect())
</script>

<template>
  <section class="space-y-4">
    <AppPageHeader title="Payments" subtitle="Track transactions and payout health.">
      <template #actions>
        <AppBadge :tone="realtime.connected ? 'green' : realtime.connecting ? 'orange' : 'red'">{{ realtime.status }}</AppBadge>
      </template>
    </AppPageHeader>

    <p v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ success }}</p>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <div class="card-grid md:grid-cols-3">
      <DashboardMetricCard label="Total Settled" :value="formatCurrency(metrics.settledTotal)" />
      <DashboardMetricCard label="Transactions Shown" :value="metrics.transactionsShown" />
      <DashboardMetricCard label="Refunded" :value="metrics.refundedCount" />
    </div>

    <div class="flex flex-wrap gap-2">
      <AppButton :variant="selectedStatus === 'all' ? 'primary' : 'secondary'" class="!w-auto" @click="selectedStatus = 'all'">All</AppButton>
      <AppButton
        v-for="status in statusFilters"
        :key="status"
        :variant="selectedStatus === status ? 'primary' : 'secondary'"
        class="!w-auto"
        @click="selectedStatus = status"
      >
        {{ status }}
      </AppButton>
    </div>

    <div v-if="loading" class="space-y-3">
      <AppSkeleton v-for="n in 3" :key="n" :lines="2" />
    </div>

    <AppEmptyState v-else-if="!payments.length">No payments found yet.</AppEmptyState>
    <AppEmptyState v-else-if="!filteredPayments.length">No payments match the selected filter.</AppEmptyState>

    <AppTable v-else>
      <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">Payment ID</th>
          <th class="px-4 py-3">Customer</th>
          <th class="px-4 py-3">Provider</th>
          <th class="px-4 py-3 text-right">Amount</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in filteredPayments" :key="payment.id" class="border-t border-slate-100 text-sm text-slate-700">
          <td class="px-4 py-3 font-medium">#{{ payment.id }}</td>
          <td class="px-4 py-3">{{ payment.customer_name || 'Guest' }}</td>
          <td class="px-4 py-3 capitalize">{{ payment.provider }}</td>
          <td class="px-4 py-3 text-right font-medium">{{ formatAmount(payment.amount) }}</td>
          <td class="px-4 py-3"><PaymentStatusBadge :status="payment.status" /></td>
          <td class="px-4 py-3">{{ new Date(payment.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </AppTable>
  </section>
</template>
