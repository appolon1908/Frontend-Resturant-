<script setup lang="ts">
const props = defineProps<{ status: string }>()

const tone = computed(() => {
  const normalized = String(props.status || '').toLowerCase()
  if (['paid', 'settled', 'succeeded', 'authorized'].includes(normalized)) return 'green'
  if (['failed', 'cancelled', 'refunded'].includes(normalized)) return 'red'
  return 'orange'
})
</script>

<template>
  <AppBadge :tone="tone">{{ status }}</AppBadge>
</template>
