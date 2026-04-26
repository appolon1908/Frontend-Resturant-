<script setup lang="ts">
import type { PaymentStatus } from '~/types/api'

const props = defineProps<{
  status: PaymentStatus | string
}>()

const tone = computed(() => {
  if (['settled', 'succeeded'].includes(props.status)) {
    return 'green'
  }

  if (['failed', 'cancelled', 'refunded'].includes(props.status)) {
    return 'red'
  }

  return 'orange'
})
</script>

<template>
  <AppBadge :tone="tone">{{ status }}</AppBadge>
</template>
