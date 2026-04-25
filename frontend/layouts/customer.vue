<script setup lang="ts">
const { auth } = useAuth()

const links = [
  { to: '/customer/home', label: 'Home', icon: '🏠' },
  { to: '/customer/reservations', label: 'Bookings', icon: '📅' },
  { to: '/customer/orders', label: 'Orders', icon: '🧾' },
  { to: '/customer/notifications', label: 'Alerts', icon: '🔔' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' },
]

if (import.meta.client) {
  watchEffect(() => {
    if (!auth.isAuthenticated) {
      navigateTo('/auth/login')
      return
    }

    if (auth.user?.role === 'restaurant' || auth.user?.role === 'admin') {
      navigateTo('/restaurant/dashboard')
    }
  })
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-slate-50 pb-[calc(82px+env(safe-area-inset-bottom))]">
    <main class="page-shell py-4 md:py-6">
      <slot />
    </main>

    <nav class="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur md:hidden" style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="grid grid-cols-5 gap-1 px-2 py-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center rounded-xl px-1 py-2 text-xs font-medium text-slate-500 transition"
          active-class="bg-brand-50 text-brand-700 shadow-soft"
        >
          <span class="text-base">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
