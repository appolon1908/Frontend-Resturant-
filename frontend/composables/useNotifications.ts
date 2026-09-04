import type { Notification } from '~/types/api'
import { notificationsApi } from '~/api/notifications'

export function useNotifications() {
  const notifications = ref<Notification[]>([])

  const fetchNotifications = async () => {
    notifications.value = await notificationsApi.list()
  }

  return { notifications, fetchNotifications }
}
