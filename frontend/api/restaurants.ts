import type { Restaurant } from '~/types/api'
import { get } from '~/api/client'

export const restaurantsApi = {
  list: () => get<Restaurant[]>('/restaurants/'),
  detail: (slug: string) => get<Restaurant>(`/restaurants/${slug}/`),
}
