export function useOnboarding() {
  const onboarding = useOnboardingStore()
  return {
    session: computed(() => onboarding.session),
    start: onboarding.start,
    fetchStatus: onboarding.fetchStatus,
  }
}
