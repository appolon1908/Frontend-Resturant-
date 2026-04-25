<script setup lang="ts">
import type { Restaurant } from '~/types/api'
defineProps<{ restaurant: Restaurant }>()
</script>

<template>
  <NuxtLink :to="`/customer/restaurants/${restaurant.slug}`" class="block transition hover:-translate-y-0.5">
    <AppCard>
      <div class="mb-3 h-40 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50" />
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-semibold">{{ restaurant.name }}</h3>
          <p class="mt-0.5 text-sm text-slate-500">{{ restaurant.cuisine || 'Restaurant' }}</p>
        </div>
        <AppBadge tone="orange">{{ restaurant.rating ? `${restaurant.rating}★` : 'New' }}</AppBadge>
      </div>
    </AppCard>
  </NuxtLink>
</template>
