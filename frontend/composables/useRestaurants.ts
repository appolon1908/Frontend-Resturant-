import { restaurantsApi } from '~/api/restaurants'
import type { Restaurant } from '~/types/api'

export function useRestaurants() {
  const customer = useCustomerStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const menu = ref<unknown[]>([])

  async function fetchRestaurants() {
    loading.value = true
    error.value = null
    try {
      await customer.fetchRestaurants()
    } catch (e: any) {
      error.value = e?.detail ?? e?.message ?? 'Failed to load restaurants'
    } finally {
      loading.value = false
    }
  }

  async function fetchRestaurant(slug: string) {
    loading.value = true
    error.value = null
    try {
      await customer.fetchRestaurant(slug)
    } catch (e: any) {
      error.value = e?.detail ?? e?.message ?? 'Failed to load restaurant'
    } finally {
      loading.value = false
    }
  }

  async function fetchMenu() {
    const api = restaurantsApi as any
    if (typeof api.publicMenu === 'function') {
      menu.value = await api.publicMenu()
    } else {
      menu.value = []
    }
  }

  async function checkAvailability(slug: string, date?: string) {
    const api = restaurantsApi as any
    if (typeof api.availability === 'function') {
      return api.availability(slug, date)
    }
    return { available: true }
  }

  return {
    restaurants: computed(() => customer.restaurants as Restaurant[]),
    selectedRestaurant: computed(() => customer.selectedRestaurant as Restaurant | null),
    loading,
    error,
    menu,
    fetchRestaurants,
    fetchRestaurant,
    fetchMenu,
    checkAvailability,
  }
}
