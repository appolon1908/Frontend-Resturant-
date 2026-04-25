<script setup lang="ts">
const links = [
  { to: '/restaurant/dashboard', label: 'Dashboard' },
  { to: '/restaurant/reservations', label: 'Reservations' },
  { to: '/restaurant/orders', label: 'Orders' },
  { to: '/restaurant/kitchen', label: 'Kitchen' },
  { to: '/restaurant/menu', label: 'Menu' },
  { to: '/restaurant/settings', label: 'Settings' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 md:grid md:grid-cols-[240px_1fr]">
    <aside class="hidden md:flex md:flex-col border-r border-slate-200 bg-white px-4 py-6">
      <p class="mb-6 text-lg font-bold text-brand-700">Restaurant Admin</p>
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="mb-1 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
        active-class="bg-brand-50 text-brand-700 font-semibold"
      >
        {{ link.label }}
      </NuxtLink>
    </aside>

    <main>
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div class="page-shell flex items-center justify-between py-3">
          <p class="font-bold text-brand-700">Restaurant Admin</p>
          <NuxtLink to="/restaurant/dashboard" class="text-sm font-medium text-brand-700">Dashboard</NuxtLink>
        </div>
      </header>
      <div class="page-shell py-4 md:py-7">
        <slot />
      </div>
    </main>
  </div>
</template>
