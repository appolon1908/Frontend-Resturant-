import { defineStore } from 'pinia'
import type { DashboardSummary } from '~/types/api'
import { get } from '~/api/client'

type ActiveRestaurant = {
  id: number
}

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    dashboard: null as DashboardSummary | null,
    activeRestaurant: null as ActiveRestaurant | null,
  }),

  getters: {
    activeRestaurantId: (state): number | null => state.activeRestaurant?.id ?? null,
  },

  actions: {
    async fetchDashboard() {
      this.dashboard = await get<DashboardSummary>('/restaurant/dashboard/summary/')
    },

    setActiveRestaurantId(id: number | null) {
      this.activeRestaurant = id ? { id } : null
    },
  },
})
