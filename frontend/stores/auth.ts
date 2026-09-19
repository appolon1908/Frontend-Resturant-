import { defineStore } from 'pinia'
import type { AuthUser } from '~/types/api'
import { authApi } from '~/api/auth'
import { restaurantApi } from '~/api/restaurant'
import { setAccessToken } from '~/api/client'

const STORAGE_KEY = 'restaurant_booking_auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as AuthUser | null,
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async syncRestaurantContext() {
      const restaurantStore = useRestaurantStore()
      const token = this.token
      restaurantStore.setActiveRestaurantId(null)
      restaurantStore.contextError = ''
      if (!token || this.user?.role !== 'restaurant') return
      try {
        const restaurant = await restaurantApi.me()
        if (this.token !== token) return
        if (!Number.isInteger(restaurant.id) || restaurant.id <= 0) {
          throw new Error('Restaurant profile has no valid identity.')
        }
        restaurantStore.setActiveRestaurantId(restaurant.id)
      } catch (cause) {
        if (this.token === token) {
          restaurantStore.contextError = this.handleApiError(cause, 'Unable to load restaurant context.')
        }
      }
    },

    hydrate() {
      if (this.initialized || !import.meta.client) return
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser }
          this.token = parsed.token || ''
          this.user = parsed.user || null
          setAccessToken(this.token || null)
          this.syncRestaurantContext()
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      this.initialized = true
    },

    persist() {
      if (!import.meta.client) return
      if (!this.token) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: this.token, user: this.user }))
      }
      setAccessToken(this.token || null)
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const data = await authApi.login({ email, password })
        this.token = data.token || data.access || ''
        this.user = data.user || null
        this.persist()
        this.syncRestaurantContext()
      } finally {
        this.loading = false
      }
    },

    async register(full_name: string, email: string, password: string) {
      this.loading = true
      try {
        const data = await authApi.register({ full_name, email, password, role: 'customer' })
        this.token = data.token || data.access || ''
        this.user = data.user || null
        this.persist()
        this.syncRestaurantContext()
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } finally {
        this.$reset()
        this.initialized = true
        this.persist()
        this.syncRestaurantContext()
      }
    },

    handleApiError(error: unknown, fallback = 'Request failed') {
      const status = Number((error as any)?.status || (error as any)?.statusCode || 0)
      const message =
        (error as any)?.message ||
        (error as any)?.detail ||
        (error as any)?.data?.message ||
        (error as any)?.data?.detail ||
        fallback

      if (status === 401) {
        this.$reset()
        this.initialized = true
        this.persist()
        this.syncRestaurantContext()
        if (import.meta.client) navigateTo('/auth/login')
        return 'Your session expired. Please log in again.'
      }

      return String(message)
    },
  },
})
