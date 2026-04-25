import { defineStore } from 'pinia'
import { ordersApi } from '~/api/orders'

interface CartItem {
  menu_item_id: number
  name: string
  quantity: number
  price: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    restaurantId: 0,
  }),
  getters: {
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
  },
  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find((x) => x.menu_item_id === item.menu_item_id)
      if (existing) existing.quantity += item.quantity
      else this.items.push(item)
    },
    clear() {
      this.items = []
    },
    async checkout(payment_method: string) {
      const order = await ordersApi.checkout({
        restaurant: this.restaurantId,
        payment_method,
        items: this.items.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity })),
      })
      this.clear()
      return order
    },
  },
})
