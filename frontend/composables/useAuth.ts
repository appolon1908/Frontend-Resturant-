export function useAuth() {
  const auth = useAuthStore()
  auth.hydrate()
  return {
    auth,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    handleApiError: auth.handleApiError,
    isAuthenticated: computed(() => auth.isAuthenticated),
    user: computed(() => auth.user),
  }
}
