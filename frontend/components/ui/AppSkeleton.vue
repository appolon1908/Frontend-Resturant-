<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; className?: string }>(), {
  lines: 3,
  className: '',
})
</script>

<template>
  <div class="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-soft" :class="className">
    <div class="mb-3 h-4 w-1/3 rounded bg-slate-200" />
    <div v-for="i in lines" :key="i" class="mb-2 h-3 rounded bg-slate-100" :class="i === lines ? 'w-2/3' : 'w-full'" />
  </div>
</template>
