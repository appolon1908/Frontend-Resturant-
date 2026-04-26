export function useMenu() {
  const publicMenu = ref<unknown[]>([])
  const categories = ref<unknown[]>([])
  const items = ref<unknown[]>([])
  const loading = ref(false)

  const fetchPublicMenu = async () => {
    loading.value = true
    try {
      publicMenu.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => ({ results: categories.value })
  const fetchItems = async () => ({ results: items.value })

  const createCategory = async () => null
  const updateCategory = async () => null
  const deleteCategory = async () => null
  const createItem = async () => null
  const updateItem = async () => null
  const deleteItem = async () => null

  return {
    publicMenu,
    categories,
    items,
    loading,
    fetchPublicMenu,
    fetchCategories,
    fetchItems,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
  }
}
