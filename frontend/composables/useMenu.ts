import { menuApi } from '~/api/menu'
import type { MenuCategory, RestaurantMenuCategory, RestaurantMenuItem } from '~/types/api'

export function useMenu() {
  const publicMenu = ref<MenuCategory[]>([])
  const categories = ref<RestaurantMenuCategory[]>([])
  const items = ref<RestaurantMenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { handleApiError } = useAuth()
  let pending = 0

  async function request<T>(action: () => Promise<T>): Promise<T> {
    pending++
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (cause) {
      error.value = handleApiError(cause, 'Menu request failed.')
      throw cause
    } finally {
      pending--
      loading.value = pending > 0
    }
  }

  return {
    publicMenu, categories, items, loading, error,
    fetchPublicMenu: (params?: Parameters<typeof menuApi.publicMenu>[0]) => request(async () => {
      publicMenu.value = await menuApi.publicMenu(params)
      return publicMenu.value
    }),
    fetchCategories: (params?: Parameters<typeof menuApi.categories>[0]) => request(async () => {
      const result = await menuApi.categories(params)
      categories.value = result.results
      return result
    }),
    fetchItems: (params?: Parameters<typeof menuApi.items>[0]) => request(async () => {
      const result = await menuApi.items(params)
      items.value = result.results
      return result
    }),
    createCategory: (...args: Parameters<typeof menuApi.createCategory>) => request(() => menuApi.createCategory(...args)),
    updateCategory: (...args: Parameters<typeof menuApi.updateCategory>) => request(() => menuApi.updateCategory(...args)),
    deleteCategory: (...args: Parameters<typeof menuApi.deleteCategory>) => request(() => menuApi.deleteCategory(...args)),
    createItem: (...args: Parameters<typeof menuApi.createItem>) => request(() => menuApi.createItem(...args)),
    updateItem: (...args: Parameters<typeof menuApi.updateItem>) => request(() => menuApi.updateItem(...args)),
    deleteItem: (...args: Parameters<typeof menuApi.deleteItem>) => request(() => menuApi.deleteItem(...args)),
  }
}
