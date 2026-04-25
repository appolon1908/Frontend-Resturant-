import { defineStore } from 'pinia'
import type { DashboardSummary } from '~/types/api'
import { apiClient } from '~/api/client'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    dashboard: null as DashboardSummary | null,
  }),
  actions: {
    async fetchDashboard() {
      this.dashboard = await apiClient<DashboardSummary>('/restaurant/dashboard/')
    },
  },
})
