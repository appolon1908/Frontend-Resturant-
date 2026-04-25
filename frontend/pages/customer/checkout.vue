<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const cart = useCartStore()
const { handleApiError } = useAuth()
const paymentMethod = ref('card')
const message = ref('')
const error = ref('')
const paying = ref(false)

async function checkout() {
  message.value = ''
  error.value = ''
  paying.value = true
  try {
    await cart.checkout(paymentMethod.value)
    message.value = 'Checkout complete. Your order has been placed.'
  } catch (err) {
    error.value = handleApiError(err, 'Checkout failed. Please try again.')
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Checkout</h1>
    <AppCard>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Order summary</h2>
      <div class="space-y-1 text-sm text-slate-600">
        <p>Items: {{ cart.totalItems }}</p>
        <p class="text-lg font-semibold text-slate-900">Subtotal: ${{ cart.subtotal.toFixed(2) }}</p>
      </div>
      <AppInput v-model="paymentMethod" class="mt-3" label="Payment method" hint="Example: card, apple_pay" />
      <AppButton class="mt-3" :loading="paying" :disabled="cart.totalItems === 0" @click="checkout">Pay now</AppButton>
      <p v-if="error" class="error-banner mt-3">{{ error }}</p>
      <p v-if="message" class="success-banner mt-3">{{ message }}</p>
    </AppCard>
  </section>
</template>
