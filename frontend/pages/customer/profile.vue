<script setup lang="ts">
definePageMeta({ layout: 'customer' })

import { authApi } from '~/api/auth'
import type { AuthUser } from '~/types/api'

const loading = ref(true)
const error = ref('')
const profile = ref<AuthUser | null>(null)

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    profile.value = (await authApi.me()) as AuthUser
  } catch (err: any) {
    error.value = err?.detail ?? err?.message ?? 'Unable to load profile.'
  } finally {
    loading.value = false
  }
}

await loadProfile()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title">Profile</h1>
      <AppButton variant="secondary" :disabled="loading" @click="loadProfile">Refresh</AppButton>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <AppCard v-else-if="loading">
      <AppSkeleton :lines="3" />
    </AppCard>

    <AppCard v-else-if="profile" class="space-y-2">
      <p><span class="text-slate-500">Username:</span> {{ profile.username }}</p>
      <p><span class="text-slate-500">Email:</span> {{ profile.email ?? '—' }}</p>
      <p><span class="text-slate-500">Role:</span> {{ profile.role }}</p>
      <p><span class="text-slate-500">ID:</span> {{ profile.id }}</p>
    </AppCard>

    <AppEmptyState v-else>Profile is not available.</AppEmptyState>
  </section>
</template>
