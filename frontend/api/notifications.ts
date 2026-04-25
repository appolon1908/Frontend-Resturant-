import type { Notification } from '~/types/api'
import { get, post } from '~/api/client'

export const notificationsApi = {
  list: () => get<Notification[]>('/customer/notifications/'),
  markRead: (id: number) => post<void>(`/customer/notifications/${id}/read/`),
}
