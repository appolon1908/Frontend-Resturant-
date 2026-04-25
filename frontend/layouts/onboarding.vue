<script setup lang="ts">
const { auth } = useAuth()

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
  <div class="min-h-screen overflow-x-hidden bg-slate-100 py-6 md:py-10">
    <main class="page-shell max-w-2xl">
      <slot />
    </main>
  </div>
</template>
