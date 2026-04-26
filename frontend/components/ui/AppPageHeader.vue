<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="section-title">{{ title }}</h1>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    </div>
    <div class="w-full sm:w-auto">
      <slot name="actions" />
    </div>
  </div>
</template>
