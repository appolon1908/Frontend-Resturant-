import type { OnboardingSession, Paginated } from '~/types/api'
import { get, post } from '~/api/client'

export const onboardingApi = {
  steps() {
    return get<Paginated<{ key: string; title: string; description?: string; sort_order?: number }>>('/public/onboarding/steps/')
  },
  start: () => post<OnboardingSession>('/restaurant/onboarding/start/'),
  status: () => get<OnboardingSession>('/restaurant/onboarding/status/'),
  updateStep: (step: string, payload: Record<string, unknown>) =>
    post<OnboardingSession>(`/restaurant/onboarding/${encodeURIComponent(step)}/`, payload),
}
