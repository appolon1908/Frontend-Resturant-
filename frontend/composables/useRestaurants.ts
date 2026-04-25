export function useRestaurants() {
  const customer = useCustomerStore()
  return {
    restaurants: computed(() => customer.restaurants),
    selectedRestaurant: computed(() => customer.selectedRestaurant),
    fetchRestaurants: customer.fetchRestaurants,
    fetchRestaurant: customer.fetchRestaurant,
  }
}
