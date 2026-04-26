<script setup lang="ts">
import type { Invoice } from '~/types/api'

definePageMeta({ layout: 'restaurant' })

const { handleApiError } = useAuth()
const { summary, invoices, fetchSummary, fetchInvoices } = useBilling()

const loading = ref(true)
const error = ref('')

type BillingSummary = {
  plan?: string
  renewal_date?: string
  balance?: number
  revenue_this_month?: number
}

async function loadAccounting() {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      fetchSummary(),
      fetchInvoices({ page: 1 }),
    ])
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load accounting.')
  } finally {
    loading.value = false
  }
}

await loadAccounting()

const billingSummary = computed(() => (summary.value ?? {}) as BillingSummary)
const invoiceRows = computed(() => (invoices.value ?? []) as Invoice[])

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString()
}

function isCurrentMonth(value: string | null | undefined) {
  if (!value) return false
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return false

  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const revenueThisMonth = computed(() => {
  if (billingSummary.value.revenue_this_month != null) {
    return Number(billingSummary.value.revenue_this_month)
  }

  return invoiceRows.value
    .filter((invoice) => invoice.status === 'paid' && isCurrentMonth(invoice.created_at))
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
})

const recentPaidInvoices = computed(() =>
  invoiceRows.value
    .filter((invoice) => invoice.status === 'paid')
    .slice()
    .sort((a, b) => {
      const left = new Date(a.created_at).getTime()
      const right = new Date(b.created_at).getTime()
      return right - left
    })
    .slice(0, 5),
)
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="section-title">Accounting</h1>
        <p class="section-subtitle">
          Billing snapshot, renewal info, and recent paid invoices.
        </p>
      </div>
    </div>

    <p
      v-if="error"
      class="error-banner"
    >
      {{ error }}
    </p>

    <div
      v-else-if="loading"
      class="card-grid sm:grid-cols-2 xl:grid-cols-4"
    >
      <AppSkeleton
        v-for="n in 4"
        :key="n"
        :lines="2"
      />
    </div>

    <template v-else>
      <div class="card-grid sm:grid-cols-2 xl:grid-cols-4">
        <AppCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plan
          </p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            {{ billingSummary.plan || '—' }}
          </p>
        </AppCard>

        <AppCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Renewal date
          </p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            {{ formatDate(billingSummary.renewal_date) }}
          </p>
        </AppCard>

        <AppCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Balance
          </p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            {{ formatCurrency(billingSummary.balance) }}
          </p>
        </AppCard>

        <AppCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Revenue this month
          </p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            {{ formatCurrency(revenueThisMonth) }}
          </p>
        </AppCard>
      </div>

      <AppCard v-if="recentPaidInvoices.length">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">
            Recent settled invoices
          </h2>
          <span class="text-sm text-slate-400">
            {{ recentPaidInvoices.length }} shown
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <tr>
                <th class="px-4 py-3">Invoice</th>
                <th class="px-4 py-3 text-right">Amount</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Created</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="invoice in recentPaidInvoices"
                :key="invoice.id"
                class="hover:bg-slate-50"
              >
                <td class="px-4 py-3 font-mono text-slate-500">
                  #{{ invoice.id }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-slate-800">
                  {{ formatCurrency(invoice.amount) }}
                </td>
                <td class="px-4 py-3">
                  <AppBadge tone="green">
                    {{ invoice.status }}
                  </AppBadge>
                </td>
                <td class="px-4 py-3 text-slate-500">
                  {{ formatDate(invoice.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <AppEmptyState
        v-else
        title="No settled invoices yet"
      >
        Your billing activity will appear here once invoices are paid.
      </AppEmptyState>
    </template>
  </section>
</template>
