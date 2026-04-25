<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; status?: string }>()
</script>

<template>
  <AppCard>
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">{{ title }}</h3>
      <AppBadge tone="orange">{{ status || 'preparing' }}</AppBadge>
    </div>
    <p class="mt-2 text-sm text-slate-500">{{ subtitle || 'No details yet' }}</p>
  </AppCard>
</template>
