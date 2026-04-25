<script setup lang="ts">
const route = useRoute()
const { auth } = useAuth()

const links = [
  { to: '/restaurant/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/restaurant/reservations', label: 'Reservations', icon: '📅' },
  { to: '/restaurant/orders', label: 'Orders', icon: '🧾' },
  { to: '/restaurant/kitchen', label: 'Kitchen', icon: '🍽️' },
  { to: '/restaurant/payments', label: 'Payments', icon: '💳' },
  { to: '/restaurant/customers', label: 'Customers', icon: '👥' },
  { to: '/restaurant/menu', label: 'Menu', icon: '📖' },
  { to: '/restaurant/settings', label: 'Settings', icon: '⚙️' },
]

const currentLabel = computed(() => links.find((link) => route.path.startsWith(link.to))?.label || 'Admin Console')

if (import.meta.client) {
  watchEffect(() => {
    if (!auth.isAuthenticated) {
      navigateTo('/auth/login')
      return
    }

    if (auth.user?.role === 'customer') {
      navigateTo('/customer/home')
    }
  })
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-slate-50 md:grid md:grid-cols-[270px_1fr]">
    <aside class="hidden border-r border-slate-200 bg-white px-4 py-6 md:flex md:flex-col">
      <p class="mb-1 text-xs uppercase tracking-wide text-slate-400">Restaurant Booking</p>
      <p class="mb-6 text-lg font-bold text-brand-700">Admin Console</p>
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
        active-class="bg-brand-50 text-brand-700 font-semibold shadow-soft"
      >
        <span>{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </NuxtLink>
    </aside>

    <main>
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div class="page-shell flex items-center justify-between py-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Restaurant Booking</p>
            <p class="font-bold text-brand-700">{{ currentLabel }}</p>
          </div>
          <NuxtLink to="/restaurant/dashboard" class="text-sm font-medium text-brand-700">Dashboard</NuxtLink>
        </div>
      </header>

      <div class="page-shell py-4 md:py-7">
        <slot />
      </div>
    </main>
  </div>
</template>
