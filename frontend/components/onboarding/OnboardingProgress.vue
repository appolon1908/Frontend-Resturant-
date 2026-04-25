<script setup lang="ts">
const props = defineProps<{ current: string; steps: string[] }>()

const allSteps = ['restaurant', 'location', 'staff', 'menu', 'tables', 'billing', 'complete']
const currentIndex = computed(() => Math.max(allSteps.indexOf(props.current), 0))
const progress = computed(() => Math.round(((currentIndex.value + 1) / allSteps.length) * 100))
</script>

<template>
  <AppCard>
    <div class="mb-3 flex items-center justify-between">
      <p class="text-sm font-medium">Current: <span class="capitalize">{{ current }}</span></p>
      <AppBadge tone="orange">{{ progress }}%</AppBadge>
    </div>
    <div class="h-2 w-full rounded-full bg-slate-100">
      <div class="h-2 rounded-full bg-brand-500 transition-all" :style="{ width: `${progress}%` }" />
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      <AppBadge v-for="step in steps" :key="step" tone="green">{{ step }}</AppBadge>
    </div>
  </AppCard>
</template>
