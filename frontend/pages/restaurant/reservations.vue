<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const loading = ref(true)
const error = ref('')
const reservations = ref<any[]>([])

try {
  reservations.value = await reservationsApi.restaurantList()
} catch {
  error.value = 'Could not load reservation queue.'
} finally {
  loading.value = false
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Reservations</h1>
    <ReservationCalendar />
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <div v-else-if="reservations.length" class="space-y-2">
      <ReservationCard v-for="item in reservations" :key="item.id" :reservation="item" />
    </div>
    <AppEmptyState v-else>No reservations found.</AppEmptyState>
  </section>
</template>
