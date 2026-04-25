<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const auth = useAuthStore()
const fullName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await auth.register(fullName.value, email.value, password.value)
    await navigateTo('/customer/home')
  } catch {
    error.value = 'Unable to register at this time.'
  }
}
</script>

<template>
  <AppCard>
    <p class="mb-1 text-sm font-medium text-brand-700">Get started</p>
    <h1 class="mb-5 text-2xl font-bold">Create account</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <AppInput v-model="fullName" label="Full name" placeholder="Jane Doe" />
      <AppInput v-model="email" type="email" label="Email" placeholder="you@example.com" />
      <AppInput v-model="password" type="password" label="Password" placeholder="At least 8 characters" />
      <p v-if="error" class="error-banner">{{ error }}</p>
      <AppButton :loading="auth.loading" :disabled="!fullName || !email || !password" type="submit">Register</AppButton>
    </form>
    <NuxtLink to="/auth/login" class="mt-4 block text-center text-sm font-medium text-brand-700">Back to login</NuxtLink>
  </AppCard>
</template>
