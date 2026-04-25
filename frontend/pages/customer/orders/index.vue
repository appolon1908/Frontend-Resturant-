<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const { orders, loading, fetchOrders } = useOrders()
const error = ref('')

try {
  await fetchOrders()
} catch {
  error.value = 'Unable to load your orders.'
}
</script>

<template>
  <section class="space-y-3">
    <h1 class="section-title">My orders</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <div v-else-if="orders.length" class="space-y-3">
      <OrderCard v-for="order in orders" :key="order.id" :order="order" />
    </div>
    <AppEmptyState v-else>No orders yet.</AppEmptyState>
  </section>
</template>
