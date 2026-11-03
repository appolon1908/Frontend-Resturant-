import { restaurantsApi } from '~/api/restaurants'
import type { MenuCategory, Restaurant } from '~/types/api'

export function useRestaurants() {
  const customer = useCustomerStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const menu = ref<MenuCategory[]>([])
  const { handleApiError } = useAuth()

  async function fetchRestaurants() {
    loading.value = true
    error.value = null
    try {
      await customer.fetchRestaurants()
    } catch (e) {
      error.value = handleApiError(e, 'Failed to load restaurants')
    } finally {
      loading.value = false
    }
  }

  async function fetchRestaurant(slug: string) {
    loading.value = true
    error.value = null
    try {
      await customer.fetchRestaurant(slug)
    } catch (e) {
      error.value = handleApiError(e, 'Failed to load restaurant')
    } finally {
      loading.value = false
    }
  }

  async function fetchMenu() {
    menu.value = await restaurantsApi.publicMenu()
    return menu.value
  }

  function checkAvailability(slug: string, date?: string) {
    return restaurantsApi.availability(slug, date)
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
