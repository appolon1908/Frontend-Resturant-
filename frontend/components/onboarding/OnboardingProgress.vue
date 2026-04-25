<script setup lang="ts">defineProps<{ current: string; steps: string[] }>()</script>
<template><AppCard><p class="text-sm">Current step: <strong>{{ current }}</strong></p><div class="mt-2 flex flex-wrap gap-2"><AppBadge v-for="step in steps" :key="step" tone="slate">{{ step }}</AppBadge></div></AppCard></template>
