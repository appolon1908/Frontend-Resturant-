<template>
  <div class="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true">
    <div class="w-full max-w-lg rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <slot />
    </div>
  </div>
</template>
