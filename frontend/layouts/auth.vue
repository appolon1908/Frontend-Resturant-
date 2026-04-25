<script setup lang="ts">
const { auth } = useAuth()

if (import.meta.client) {
  watchEffect(() => {
    if (!auth.isAuthenticated) return
    if (auth.user?.role === 'customer') navigateTo('/customer/home')
    else navigateTo('/restaurant/dashboard')
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-brand-50 to-white">
    <div class="page-shell flex min-h-screen items-center justify-center py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
