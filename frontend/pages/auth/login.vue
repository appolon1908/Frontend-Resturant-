<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    await navigateTo('/customer/home')
  } catch {
    error.value = 'Unable to login. Please check your credentials and try again.'
  }
}
</script>

<template>
  <AppCard>
    <p class="mb-1 text-sm font-medium text-brand-700">Restaurant Booking</p>
    <h1 class="mb-5 text-2xl font-bold">Welcome back</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <AppInput v-model="email" type="email" label="Email" placeholder="you@example.com" />
      <AppInput v-model="password" type="password" label="Password" placeholder="••••••••" />
      <p v-if="error" class="error-banner">{{ error }}</p>
      <AppButton :loading="auth.loading" :disabled="!email || !password" type="submit">Login</AppButton>
    </form>
    <NuxtLink to="/auth/register" class="mt-4 block text-center text-sm font-medium text-brand-700">Create an account</NuxtLink>
  </AppCard>
</template>
