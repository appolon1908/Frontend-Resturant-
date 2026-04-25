import { notificationsApi } from '~/api/notifications'

export function useNotifications() {
  const notifications = ref([])
  const fetchNotifications = async () => {
    notifications.value = await notificationsApi.list()
  }
  return { notifications, fetchNotifications }
}
