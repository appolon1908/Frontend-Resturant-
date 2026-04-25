<script setup lang="ts">
const realtime = useRealtimeStore()
</script>

<template>
  <div class="fixed right-3 top-3 z-[60] space-y-2">
    <div
      v-for="toast in realtime.toasts"
      :key="toast.id"
      class="w-72 rounded-2xl border bg-white p-3 shadow-card"
      :class="{
        'border-emerald-200': toast.tone === 'success',
        'border-orange-200': toast.tone === 'warning',
        'border-slate-200': toast.tone === 'info',
      }"
    >
      <p class="text-sm font-semibold">{{ toast.title }}</p>
      <p class="mt-1 text-xs text-slate-600">{{ toast.body }}</p>
    </div>
  </div>
</template>
