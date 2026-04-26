import type { OnboardingSession, Paginated } from '~/types/api'
import { get, post } from '~/api/client'

export const onboardingApi = {
  /** GET /public/onboarding/steps/ */
  steps() {
    return get<Paginated<{ key: string; title: string; description?: string; sort_order?: number }>>('/public/onboarding/steps/')
  },

  /** Onboarding is driven by restaurant/restaurants/me/ + settings endpoints.
   *  These stubs keep backward compat with the existing store. */
  start() {
    return get<OnboardingSession>('/public/onboarding/steps/').then(() => ({
      id: 1,
      status: 'in_progress' as const,
      current_step: 'restaurant',
      completed_steps: [],
    }))
  },

  status() {
    return get<OnboardingSession>('/public/onboarding/steps/').then(() => ({
      id: 1,
      status: 'in_progress' as const,
      current_step: 'restaurant',
      completed_steps: [],
    }))
  },

  updateStep(step: string, payload: Record<string, unknown>) {
    return post<OnboardingSession>('/restaurant/restaurants/me/', payload).then(() => ({
      id: 1,
      status: 'in_progress' as const,
      current_step: step,
      completed_steps: [],
    }))
  },
}
