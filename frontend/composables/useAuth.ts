export function useAuth() {
  const auth = useAuthStore()
  return {
    auth,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
  }
}
