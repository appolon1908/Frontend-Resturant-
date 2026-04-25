<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const loading = ref(true)
const error = ref('')
const orders = ref<any[]>([])

try {
  orders.value = await ordersApi.restaurantQueue()
} catch {
  error.value = 'Unable to load order queue.'
} finally {
  loading.value = false
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Orders</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <div v-else-if="orders.length" class="space-y-3">
      <OrderCard v-for="order in orders" :key="order.id" :order="order" />
    </div>
    <AppEmptyState v-else>No active orders.</AppEmptyState>
  </section>
</template>
