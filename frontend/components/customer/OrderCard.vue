<script setup lang="ts">
import type { Order } from '~/types/api'
defineProps<{ order: Order }>()

function tone(status: string) {
  if (status === 'ready' || status === 'completed') return 'green'
  if (status === 'cancelled') return 'red'
  return 'orange'
}
</script>

<template>
  <AppCard>
    <div class="flex items-center justify-between">
      <p class="font-semibold">Order #{{ order.id }}</p>
      <AppBadge :tone="tone(order.status)">{{ order.status }}</AppBadge>
    </div>
    <p class="mt-2 text-sm text-slate-500">{{ order.items.length }} item(s)</p>
    <p class="mt-1 text-base font-semibold text-slate-800">${{ order.total.toFixed(2) }}</p>
  </AppCard>
</template>
