<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'green' | 'orange' | 'slate' | 'red' }>(), { tone: 'slate' })
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
    :class="{
      'bg-emerald-100 text-emerald-700': tone === 'green',
      'bg-orange-100 text-orange-700': tone === 'orange',
      'bg-red-100 text-red-700': tone === 'red',
      'bg-slate-100 text-slate-700': tone === 'slate',
    }"
  >
    <slot />
  </span>
</template>
