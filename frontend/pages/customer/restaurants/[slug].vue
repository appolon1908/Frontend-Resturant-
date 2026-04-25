<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const route = useRoute()
const customer = useCustomerStore()
const { createReservation } = useReservations()
const partySize = ref(2)
const reservationTime = ref('')
const message = ref('')
const error = ref('')
const loading = ref(true)

try {
  await customer.fetchRestaurant(String(route.params.slug))
} catch {
  error.value = 'Restaurant details failed to load.'
} finally {
  loading.value = false
}

async function reserve() {
  message.value = ''
  error.value = ''
  if (!customer.selectedRestaurant) return
  try {
    await createReservation({ restaurant: customer.selectedRestaurant.id, party_size: Number(partySize.value), reservation_time: reservationTime.value })
    message.value = 'Reservation request submitted successfully.'
  } catch {
    error.value = 'Unable to submit reservation at this time.'
  }
}
</script>

<template>
  <section class="space-y-4">
    <div v-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <p v-else-if="error && !customer.selectedRestaurant" class="error-banner">{{ error }}</p>

    <template v-else-if="customer.selectedRestaurant">
      <div class="h-60 rounded-3xl bg-gradient-to-br from-orange-200 to-amber-50" />
      <h1 class="section-title">{{ customer.selectedRestaurant.name }}</h1>
      <p class="text-slate-600">{{ customer.selectedRestaurant.description || 'A cozy spot for your next meal.' }}</p>

      <AppCard>
        <h2 class="mb-3 font-semibold">Book a table</h2>
        <div class="space-y-3">
          <AppInput v-model="reservationTime" type="datetime-local" label="Date & Time" />
          <AppInput v-model="partySize" type="number" label="Party size" />
          <AppButton :disabled="!reservationTime" @click="reserve">Reserve now</AppButton>
          <p v-if="error" class="error-banner">{{ error }}</p>
          <p v-if="message" class="success-banner">{{ message }}</p>
        </div>
      </AppCard>
    </template>
  </section>
</template>
