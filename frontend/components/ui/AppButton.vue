<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    type?: 'button' | 'submit'
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    loading: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:translate-y-px': variant === 'primary',
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50': variant === 'secondary',
      'bg-transparent text-slate-600 hover:bg-slate-100': variant === 'ghost',
    }"
  >
    <AppSpinner v-if="loading" />
    <slot>{{ label }}</slot>
  </button>
</template>
