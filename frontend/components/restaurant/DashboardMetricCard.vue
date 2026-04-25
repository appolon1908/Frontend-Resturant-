<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

<template>
  <AppCard>
    <p class="text-sm font-medium text-slate-500">{{ label }}</p>
    <p class="mt-2 text-3xl font-bold tracking-tight">{{ value }}</p>
  </AppCard>
</template>
