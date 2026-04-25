import type { OnboardingSession } from '~/types/api'
import { get, post } from '~/api/client'

export const onboardingApi = {
  start: () => post<OnboardingSession>('/restaurant/onboarding/start/'),
  status: () => get<OnboardingSession>('/restaurant/onboarding/status/'),
  updateStep: (step: string, payload: Record<string, unknown>) => post<OnboardingSession>(`/restaurant/onboarding/${step}/`, payload),
}
