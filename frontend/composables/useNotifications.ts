import { notificationsApi } from '~/api/notifications'
import type { Notification } from '~/types/api'

export function useNotifications() {
  const notifications = ref<Notification[]>([])
  const staffAlerts = ref<Array<{ id: string; message: string; created_at: string }>>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const fetchNotifications = async (params?: { page?: number; page_size?: number }) => {
    loading.value = true
    try {
      const result = await (notificationsApi as any).list(params)
      notifications.value = Array.isArray(result) ? result : result.results || []
      unreadCount.value = notifications.value.filter((n) => !n.is_read).length
    } finally {
      loading.value = false
    }
  }

  const markRead = async (id: number) => {
    await notificationsApi.markRead(id)
    const n = notifications.value.find((x) => x.id === id)
    if (n) n.is_read = true
    unreadCount.value = notifications.value.filter((x) => !x.is_read).length
  }

  const markAllRead = async () => {
    const api = notificationsApi as any
    if (typeof api.markAllRead === 'function') {
      await api.markAllRead()
    }
    notifications.value.forEach((n) => (n.is_read = true))
    unreadCount.value = 0
  }

  const fetchStaffAlerts = async (params?: { page?: number }) => {
    const api = notificationsApi as any
    if (typeof api.staffAlerts !== 'function') return { results: [] as typeof staffAlerts.value }
    const result = await api.staffAlerts(params)
    staffAlerts.value = result.results || []
    return result
  }

  return {
    notifications,
    staffAlerts,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    fetchStaffAlerts,
  }
}
