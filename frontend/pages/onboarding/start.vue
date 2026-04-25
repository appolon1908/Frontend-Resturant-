<script setup lang="ts">
definePageMeta({ layout: 'onboarding' })
const onboarding = useOnboardingStore()
const started = ref(false)
const loading = ref(false)
const error = ref('')

async function begin() {
  error.value = ''
  loading.value = true
  try {
    await onboarding.start()
    started.value = true
    await navigateTo('/onboarding/restaurant')
  } catch {
    error.value = 'Unable to start onboarding right now.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Get your restaurant live</h1>
    <OnboardingStepCard>
      <p class="text-slate-600">Set up your restaurant profile, location, staff, menu, tables and billing.</p>
      <AppButton class="mt-4" :loading="loading" @click="begin">Start onboarding</AppButton>
      <p v-if="error" class="error-banner mt-3">{{ error }}</p>
      <p v-if="started" class="success-banner mt-3">Starting...</p>
    </OnboardingStepCard>
  </section>
</template>
