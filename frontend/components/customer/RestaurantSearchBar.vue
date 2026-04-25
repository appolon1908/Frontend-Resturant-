<script setup lang="ts">const modelValue = defineModel<string>({ default: '' })</script>
<template><input v-model="modelValue" placeholder="Search restaurants" class="w-full rounded-xl border px-3 py-2" /></template>
