<script setup lang="ts">
import type { Reservation } from '~/types/api'
defineProps<{ reservation: Reservation }>()

function toneForStatus(status: string) {
  if (status === 'confirmed' || status === 'completed') return 'green'
  if (status === 'cancelled') return 'red'
  return 'orange'
}
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="font-semibold">{{ reservation.restaurant_name || 'Restaurant' }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ reservation.reservation_time }}</p>
        <p class="mt-1 text-xs text-slate-500">Party size: {{ reservation.party_size }}</p>
      </div>
      <AppBadge :tone="toneForStatus(reservation.status)">{{ reservation.status }}</AppBadge>
    </div>
  </AppCard>
</template>
