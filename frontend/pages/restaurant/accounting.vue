<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })

import { billingApi } from '~/api/billing'
import type { Invoice, Plan, Subscription } from '~/types/api'

const loading = ref(true)
const error = ref('')

const subscription = ref<Subscription | null>(null)
const plans = ref<Plan[]>([])
const invoices = ref<Invoice[]>([])

async function loadAccounting() {
  loading.value = true
  error.value = ''
  try {
    const [subRes, plansRes, invoicesRes] = await Promise.all([
      billingApi.getSubscription().catch(() => null),
      billingApi.plans().catch(() => null),
      billingApi.invoices().catch(() => null),
    ])

    subscription.value = subRes
    plans.value = plansRes?.results ?? []
    invoices.value = invoicesRes?.results ?? []
  } catch (err: any) {
    error.value = err?.detail ?? err?.message ?? 'Unable to load accounting data.'
  } finally {
    loading.value = false
  }
}

await loadAccounting()

const activePlanName = computed(() => subscription.value?.plan?.name ?? '—')
const invoiceCount = computed(() => invoices.value.length)

const fallbackRevenue = computed(() => {
  // Fallback revenue from invoices currently only covers page 1 of invoice results.
  return invoices.value
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0)
    .toFixed(2)
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Accounting</h1>
      <AppButton variant="secondary" :disabled="loading" @click="loadAccounting">Refresh</AppButton>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <div v-else-if="loading" class="card-grid sm:grid-cols-3">
      <AppSkeleton v-for="n in 3" :key="n" :lines="2" />
    </div>

    <div v-else class="card-grid sm:grid-cols-3">
      <DashboardMetricCard label="Active plan" :value="activePlanName" />
      <DashboardMetricCard label="Invoices (page)" :value="invoiceCount" />
      <DashboardMetricCard label="Paid revenue (fallback)" :value="`$${fallbackRevenue}`" />
    </div>

    <AppCard>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent invoices</h2>
      <div v-if="invoices.length" class="space-y-2">
        <div v-for="invoice in invoices" :key="invoice.id" class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
          <span>#{{ invoice.id }} · {{ invoice.status }}</span>
          <span class="font-medium">{{ invoice.amount }} {{ invoice.currency }}</span>
        </div>
      </div>
      <AppEmptyState v-else>No invoices found.</AppEmptyState>
    </AppCard>
  </section>
</template>
