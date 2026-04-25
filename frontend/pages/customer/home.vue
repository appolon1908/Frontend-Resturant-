<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const customer = useCustomerStore()
const q = ref('')
const loading = ref(true)
const error = ref('')

try {
  await customer.fetchRestaurants()
} catch {
  error.value = 'Could not load restaurants right now.'
} finally {
  loading.value = false
}

const filtered = computed(() => customer.restaurants.filter((r) => r.name.toLowerCase().includes(q.value.toLowerCase())))
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Discover restaurants</h1>
    <RestaurantSearchBar v-model="q" />

    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <AppEmptyState v-else-if="!filtered.length">Try another search term.</AppEmptyState>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <RestaurantCard v-for="restaurant in filtered" :key="restaurant.id" :restaurant="restaurant" />
    </div>
  </section>
</template>
