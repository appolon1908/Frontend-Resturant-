<script setup lang="ts">
definePageMeta({ layout: 'customer' })
const { notifications, fetchNotifications } = useNotifications()
const loading = ref(true)
const error = ref('')

try {
  await fetchNotifications()
} catch {
  error.value = 'Unable to load notifications.'
} finally {
  loading.value = false
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Notifications</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-10 text-center"><AppSpinner /></div>
    <div v-else-if="notifications.length" class="space-y-3">
      <AppCard v-for="item in notifications" :key="item.id">
        <p class="font-semibold">{{ item.title }}</p>
        <p class="text-sm text-slate-600">{{ item.message }}</p>
      </AppCard>
    </div>
    <AppEmptyState v-else>You're all caught up.</AppEmptyState>
  </section>
</template>
