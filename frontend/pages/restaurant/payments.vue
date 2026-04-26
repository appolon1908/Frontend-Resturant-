<script setup lang="ts">
import { paymentsApi } from '~/api/payments'
import type { Payment } from '~/types/api'

definePageMeta({ layout: 'restaurant' })

const { handleApiError } = useAuth()
const loading = ref(false)
const error = ref('')
const success = ref('')
const currentPayment = ref<Payment | null>(null)

const statusPaymentId = ref<number | null>(null)
const settleForm = reactive({
  amount: '0.00',
  paymentId: null as number | null,
  idempotencyKey: '',
  requestId: '',
})
const refundForm = reactive({
  paymentId: null as number | null,
  amount: '0.00',
  reason: '',
  idempotencyKey: '',
  requestId: '',
})

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

onMounted(() => {
  settleForm.idempotencyKey = uid('settle')
  settleForm.requestId = uid('settle-request')
  refundForm.idempotencyKey = uid('refund')
  refundForm.requestId = uid('refund-request')
})

function clearBanners() {
  error.value = ''
  success.value = ''
}

async function loadPaymentStatus() {
  if (!statusPaymentId.value) {
    error.value = 'Enter a payment ID to look up status.'
    return
  }

  loading.value = true
  clearBanners()
  try {
    currentPayment.value = await paymentsApi.getStatus(statusPaymentId.value)
    success.value = 'Payment status loaded.'
  } catch (err) {
    error.value = handleApiError(err, 'Unable to load payment status.')
  } finally {
    loading.value = false
  }
}

async function settlePayment() {
  loading.value = true
  clearBanners()
  try {
    currentPayment.value = await paymentsApi.settle({
      amount: settleForm.amount,
      payment_id: settleForm.paymentId || undefined,
      idempotency_key: settleForm.idempotencyKey,
      request_id: settleForm.requestId,
    })
    success.value = 'Payment settled successfully.'
  } catch (err) {
    error.value = handleApiError(err, 'Unable to settle payment.')
  } finally {
    loading.value = false
  }
}

async function refundPayment() {
  if (!refundForm.paymentId) {
    error.value = 'Payment ID is required to issue a refund.'
    return
  }

  loading.value = true
  clearBanners()
  try {
    currentPayment.value = await paymentsApi.refund(refundForm.paymentId, {
      amount: refundForm.amount,
      reason: refundForm.reason || undefined,
      idempotency_key: refundForm.idempotencyKey,
      request_id: refundForm.requestId,
    })
    success.value = 'Refund submitted.'
  } catch (err) {
    error.value = handleApiError(err, 'Unable to submit refund.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Payments</h1>
      <AppBadge :tone="loading ? 'orange' : 'green'">{{ loading ? 'Processing' : 'Ready' }}</AppBadge>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ success }}</p>

    <div class="grid gap-4 xl:grid-cols-3">
      <AppCard class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-800">Lookup Status</h2>
        <AppInput v-model.number="statusPaymentId" type="number" label="Payment ID" />
        <AppButton :disabled="loading" @click="loadPaymentStatus">Check status</AppButton>
      </AppCard>

      <AppCard class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-800">Settle Payment</h2>
        <AppInput v-model.number="settleForm.paymentId" type="number" label="Payment ID (optional)" />
        <AppInput v-model="settleForm.amount" label="Amount" />
        <AppInput v-model="settleForm.idempotencyKey" label="Idempotency Key" />
        <AppInput v-model="settleForm.requestId" label="Request ID" />
        <AppButton :disabled="loading" @click="settlePayment">Settle</AppButton>
      </AppCard>

      <AppCard class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-800">Refund Payment</h2>
        <AppInput v-model.number="refundForm.paymentId" type="number" label="Payment ID" />
        <AppInput v-model="refundForm.amount" label="Amount" />
        <AppInput v-model="refundForm.reason" label="Reason (optional)" />
        <AppInput v-model="refundForm.idempotencyKey" label="Idempotency Key" />
        <AppInput v-model="refundForm.requestId" label="Request ID" />
        <AppButton :disabled="loading" variant="secondary" @click="refundPayment">Refund</AppButton>
      </AppCard>
    </div>

    <AppCard v-if="currentPayment" class="space-y-2">
      <h2 class="text-sm font-semibold text-slate-800">Latest payment response</h2>
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700">
        <span class="font-medium">ID:</span>
        <span>{{ currentPayment.id }}</span>
        <span class="font-medium">Status:</span>
        <PaymentStatusBadge :status="currentPayment.status" />
      </div>
      <p class="text-sm text-slate-600">{{ currentPayment.amount }} {{ currentPayment.currency || 'USD' }} · {{ currentPayment.provider }}</p>
      <p class="text-xs text-slate-500">Created {{ currentPayment.created_at }}</p>
    </AppCard>
  </section>
</template>
