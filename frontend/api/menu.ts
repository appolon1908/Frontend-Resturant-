import type { MenuCategory, Paginated, RestaurantMenuCategory, RestaurantMenuItem } from '~/types/api'
import { del, get, patch, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const menuApi = {
  // ── Public ───────────────────────────────────────────────────
  publicMenu(params?: { search?: string; ordering?: string }) {
    return get<MenuCategory[]>('/public/menu/', params as Record<string, QV>)
  },

  // ── Restaurant categories ────────────────────────────────────
  categories(params?: { page?: number; page_size?: number; search?: string }) {
    return get<Paginated<RestaurantMenuCategory>>('/restaurant/menu/categories/', params as Record<string, QV>)
  },

  createCategory(payload: Partial<RestaurantMenuCategory>) {
    return post<RestaurantMenuCategory>('/restaurant/menu/categories/', payload)
  },

  updateCategory(id: number, payload: Partial<RestaurantMenuCategory>) {
    return patch<RestaurantMenuCategory>(`/restaurant/menu/categories/${id}/`, payload)
  },

  deleteCategory(id: number) {
    return del<void>(`/restaurant/menu/categories/${id}/`)
  },

  // ── Restaurant items ─────────────────────────────────────────
  items(params?: { page?: number; page_size?: number; search?: string }) {
    return get<Paginated<RestaurantMenuItem>>('/restaurant/menu/items/', params as Record<string, QV>)
  },

  item(id: number) {
    return get<RestaurantMenuItem>(`/restaurant/menu/items/${id}/`)
  },

  createItem(payload: Partial<RestaurantMenuItem> & { category_id: number }) {
    return post<RestaurantMenuItem>('/restaurant/menu/items/', payload)
  },

  updateItem(id: number, payload: Partial<RestaurantMenuItem>) {
    return patch<RestaurantMenuItem>(`/restaurant/menu/items/${id}/`, payload)
  },

  deleteItem(id: number) {
    return del<void>(`/restaurant/menu/items/${id}/`)
  },
}
