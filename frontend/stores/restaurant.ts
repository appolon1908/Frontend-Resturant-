import { defineStore } from 'pinia'
import type { DashboardSummary } from '~/types/api'
import { get } from '~/api/client'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    dashboard: null as DashboardSummary | null,
    activeRestaurantId: null as number | null,
  }),
  actions: {
    async fetchDashboard() {
      this.dashboard = await get<DashboardSummary>('/restaurant/dashboard/summary/')
    },
    setActiveRestaurantId(id: number | null) {
      this.activeRestaurantId = id
    },
  },
})
