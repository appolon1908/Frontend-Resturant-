import { notificationsApi } from '~/api/notifications'
import type { Notification, StaffAlert } from '~/types/api'

export function useNotifications() {
  const notifications = ref<Notification[]>([])
  const staffAlerts = ref<StaffAlert[]>([])
  const unreadCount = computed(() => notifications.value.filter((notification) => !notification.is_read).length)
  const loading = ref(false)

  async function fetchNotifications(params?: Parameters<typeof notificationsApi.list>[0]) {
    loading.value = true
    try {
      const result = await notificationsApi.list(params)
      notifications.value = Array.isArray(result) ? result : result.results
    } finally {
      loading.value = false
    }
  }

  async function markRead(id: number) {
    await notificationsApi.markRead(id)
    const notification = notifications.value.find((item) => item.id === id)
    if (notification) notification.is_read = true
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    notifications.value.forEach((notification) => { notification.is_read = true })
  }

  async function fetchStaffAlerts(params?: Parameters<typeof notificationsApi.staffAlerts>[0]) {
    const result = await notificationsApi.staffAlerts(params)
    staffAlerts.value = result.results
    return result
  }

  return { notifications, staffAlerts, unreadCount, loading, fetchNotifications, markRead, markAllRead, fetchStaffAlerts }
}
