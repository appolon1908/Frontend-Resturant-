import { defineStore } from 'pinia'
import type { AuthUser } from '~/types/api'
import { authApi } from '~/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as AuthUser | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const data = await authApi.login({ email, password })
        this.token = data.token
        this.user = data.user
      } finally {
        this.loading = false
      }
    },
    async register(full_name: string, email: string, password: string) {
      this.loading = true
      try {
        const data = await authApi.register({ full_name, email, password })
        this.token = data.token
        this.user = data.user
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await authApi.logout()
      this.$reset()
    },
  },
})
