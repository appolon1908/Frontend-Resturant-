<script setup lang="ts">
const modelValue = defineModel<string | number>({ default: '' })
withDefaults(defineProps<{ label: string; type?: string; placeholder?: string; hint?: string; disabled?: boolean }>(), {
  type: 'text',
  placeholder: '',
  hint: '',
  disabled: false,
})
</script>

<template>
  <label class="block space-y-1.5">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <input
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100"
    />
    <span v-if="hint" class="text-xs text-slate-500">{{ hint }}</span>
  </label>
</template>
