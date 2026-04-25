<script setup lang="ts">
definePageMeta({ layout: 'onboarding' })
const onboarding = useOnboardingStore()
const loading = ref(true)
const error = ref('')

try {
  await onboarding.fetchStatus()
} catch {
  error.value = 'Failed to load onboarding progress.'
} finally {
  loading.value = false
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title capitalize">Onboarding</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <div v-else-if="loading" class="py-8 text-center"><AppSpinner /></div>
    <template v-else>
      <OnboardingProgress
        v-if="onboarding.session"
        :current="onboarding.session.current_step"
        :steps="onboarding.session.completed_steps"
      />
      <OnboardingStepCard>Step form coming soon.</OnboardingStepCard>
    </template>
  </section>
</template>
