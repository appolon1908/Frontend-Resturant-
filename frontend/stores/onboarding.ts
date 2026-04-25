import { defineStore } from 'pinia'
import type { OnboardingSession } from '~/types/api'
import { onboardingApi } from '~/api/onboarding'

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    session: null as OnboardingSession | null,
  }),
  actions: {
    async start() {
      this.session = await onboardingApi.start()
    },
    async fetchStatus() {
      this.session = await onboardingApi.status()
    },
  },
})
