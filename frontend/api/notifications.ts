import type { Notification, Paginated, StaffAlert } from '~/types/api'
import { get, patch, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const notificationsApi = {
  // ── Customer outbox ──────────────────────────────────────────
  list(params?: { page?: number; page_size?: number }) {
    return get<Notification[] | Paginated<Notification>>('/notifications/outbox/', params as Record<string, QV>)
  },

  markRead(notificationId: number) {
    return post<void>(`/notifications/outbox/${notificationId}/mark-read/`)
  },

  markAllRead() {
    return patch<{ ok: boolean; updated: number }>('/notifications/read-all/')
  },

  // ── Restaurant staff alerts ──────────────────────────────────
  restaurantList(params?: { page?: number; page_size?: number }) {
    return get<Paginated<StaffAlert>>('/restaurant/notifications/', params as Record<string, QV>)
  },

  staffAlerts(params?: { page?: number; page_size?: number }) {
    return get<Paginated<StaffAlert>>('/restaurant/staff/me/alerts/', params as Record<string, QV>)
  },

  preferences() {
    return get<unknown>('/notifications/preferences/')
  },

  restaurantPreferences() {
    return get<unknown>('/restaurant/notifications/preferences/')
  },
}
