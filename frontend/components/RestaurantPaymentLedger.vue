<script setup lang="ts">

import type { PaymentStatus } from '~/types/api'
import type { PaymentListParams } from '~/api/payments'

const { realtime, connect, disconnect } = useRealtime()
const restaurant = useRestaurantStore()
const {
  payments,
  count,
  loading,
  error,
  latestStatusPayment,
  fetchPaymentStatus,
  fetchRestaurantPayments,
} = usePayments()

const statusFilter = ref<PaymentStatus | ''>('')
const successBanner = ref('')
const statusPaymentId = ref<number | null>(null)

async function load(params?: PaymentListParams) {
  successBanner.value = ''

  try {
    await fetchRestaurantPayments(params)
  } catch {
    // error already set in composable
  }
}

await load()

if (import.meta.client) {
  connect({ restaurantId: restaurant.activeRestaurantId ?? undefined })
}

watch(statusFilter, (status) => {
  load({ status: status || undefined })
})

watch(
  () => realtime.lastEventAt,
  (_, prev) => {
    if (prev) {
      load({ status: statusFilter.value || undefined })
    }
  },
)

onBeforeUnmount(() => disconnect())

async function lookupStatus() {
  if (!statusPaymentId.value) return

  successBanner.value = ''

  try {
    await fetchPaymentStatus(statusPaymentId.value)
  } catch {
    // error already set in composable
  }
}

const totalSettled = computed(() =>
  payments.value
    .filter((p) => p.status === 'succeeded' || p.status === 'captured')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    .toFixed(2),
)

const totalRefunded = computed(() =>
  payments.value
    .filter((p) => p.status === 'refunded' || p.status === 'partially_refunded')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    .toFixed(2),
)

const STATUS_FILTERS: Array<{ label: string; value: PaymentStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Succeeded', value: 'succeeded' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed' },
]
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Transaction history</h2>

      <AppBadge :tone="realtime.connected ? 'green' : 'orange'">
        {{ realtime.connected ? 'Live' : 'Offline' }}
      </AppBadge>
    </div>

    <p
      v-if="error"
      class="error-banner"
    >
      {{ error }}
    </p>

    <p
      v-if="successBanner"
      class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
    >
      {{ successBanner }}
    </p>

    <div class="card-grid sm:grid-cols-3">
      <DashboardMetricCard
        label="Transactions shown"
        :value="count"
      />
      <DashboardMetricCard
        label="Settled"
        :value="`$${totalSettled}`"
      />
      <DashboardMetricCard
        label="Refunded"
        :value="`$${totalRefunded}`"
      />
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <button
        v-for="f in STATUS_FILTERS"
        :key="f.value"
        class="rounded-full px-3 py-1 transition"
        :class="
          statusFilter === f.value
            ? 'bg-slate-800 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        "
        @click="statusFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <AppCard class="flex flex-wrap items-end gap-3">
      <AppInput
        v-model.number="statusPaymentId"
        type="number"
        label="Look up payment by ID"
        class="w-48"
      />
      <AppButton
        :disabled="!statusPaymentId || loading"
        @click="lookupStatus"
      >
        Check status
      </AppButton>

      <div
        v-if="latestStatusPayment"
        class="flex flex-wrap items-center gap-2 text-sm text-slate-700"
      >
        <span class="font-medium">ID {{ latestStatusPayment.id }}</span>
        <PaymentStatusBadge :status="latestStatusPayment.status" />
        <span>{{ latestStatusPayment.amount }} {{ latestStatusPayment.currency ?? 'USD' }}</span>
        <span class="text-slate-400">· {{ latestStatusPayment.provider }}</span>
      </div>
    </AppCard>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <AppSkeleton
        v-for="n in 5"
        :key="n"
        :lines="1"
      />
    </div>

    <AppCard
      v-else-if="payments.length"
      class="overflow-x-auto p-0"
    >
      <table class="w-full text-sm">
        <thead class="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Kind</th>
            <th class="px-4 py-3">Provider</th>
            <th class="px-4 py-3 text-right">Amount</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Date</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="p in payments"
            :key="p.id"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-3 font-mono text-slate-500">
              #{{ p.id }}
            </td>
            <td class="px-4 py-3 text-slate-600">
              {{ p.kind.replace(/_/g, ' ') }}
            </td>
            <td class="px-4 py-3 text-slate-600">
              {{ p.provider }}
            </td>
            <td class="px-4 py-3 text-right font-medium text-slate-800">
              {{ p.amount }} {{ p.currency ?? 'USD' }}
            </td>
            <td class="px-4 py-3">
              <PaymentStatusBadge :status="p.status" />
            </td>
            <td class="px-4 py-3 text-slate-400">
              {{ new Date(p.created_at).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </AppCard>

    <AppEmptyState v-else>
      {{ statusFilter ? `No ${statusFilter} payments found.` : 'No payments yet.' }}
    </AppEmptyState>
  </section>
</template>
