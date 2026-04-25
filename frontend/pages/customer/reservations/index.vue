<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const { reservations, loading, fetchReservations } = useReservations()
const { handleApiError } = useAuth()
const error = ref('')

try {
  await fetchReservations()
} catch (err) {
  error.value = handleApiError(err, 'Failed to load reservations.')
}
</script>

<template>
  <section class="space-y-3">
    <h1 class="section-title">My reservations</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="space-y-3">
      <AppSkeleton v-for="n in 2" :key="n" :lines="3" />
    </div>
    <div v-else-if="reservations.length" class="space-y-3">
      <ReservationCard v-for="item in reservations" :key="item.id" :reservation="item" />
    </div>
    <AppEmptyState v-else>No reservations yet.</AppEmptyState>
  </section>
</template>
