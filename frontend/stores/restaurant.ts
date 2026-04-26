import { defineStore } from 'pinia'
import { get } from '~/api/client'
import type { DashboardSummary, Restaurant } from '~/types/api'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    activeRestaurant: null as Restaurant | null,
    dashboard: null as DashboardSummary | null,
  }),
  getters: {
    activeRestaurantId: (state) => state.activeRestaurant?.id ?? null,
  },
  actions: {
    setActiveRestaurant(restaurant: Restaurant | null) {
      this.activeRestaurant = restaurant
    },
    async fetchDashboard() {
      this.dashboard = await get<DashboardSummary>('/restaurant/dashboard/')
    },
  },
})
