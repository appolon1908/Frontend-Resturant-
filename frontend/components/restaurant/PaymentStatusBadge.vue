<script setup lang="ts">defineProps<{ status: string }>()</script>
<template><AppBadge :tone="status==='paid'?'green':'orange'">{{ status }}</AppBadge></template>
