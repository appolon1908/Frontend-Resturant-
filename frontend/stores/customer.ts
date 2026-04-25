import { defineStore } from 'pinia'
import type { Restaurant } from '~/types/api'
import { restaurantsApi } from '~/api/restaurants'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    restaurants: [] as Restaurant[],
    selectedRestaurant: null as Restaurant | null,
  }),
  actions: {
    async fetchRestaurants() {
      this.restaurants = await restaurantsApi.list()
    },
    async fetchRestaurant(slug: string) {
      this.selectedRestaurant = await restaurantsApi.detail(slug)
    },
  },
})
