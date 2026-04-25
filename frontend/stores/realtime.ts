import { defineStore } from 'pinia'
import type { RealtimeEvent, RealtimeEventType, RealtimeToast } from '~/types/realtime'

interface RealtimeState {
  connected: boolean
  connecting: boolean
  reconnectAttempts: number
  lastEventAt: string | null
  lastEventType: RealtimeEventType | ''

  reservationRefreshKey: number
  ordersRefreshKey: number
  dashboardRefreshKey: number
  kitchenRefreshKey: number
  checkoutRefreshKey: number

  tableStatusById: Record<string, string>
  unreadAlertsCount: number
  toasts: RealtimeToast[]

  // compatibility for existing pages/components
  kitchenTickets: Array<{ id: number; title: string; subtitle?: string; status?: string }>
}

export const useRealtimeStore = defineStore('realtime', {
  state: (): RealtimeState => ({
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
    lastEventAt: null,
    lastEventType: '',

    reservationRefreshKey: 0,
    ordersRefreshKey: 0,
    dashboardRefreshKey: 0,
    kitchenRefreshKey: 0,
    checkoutRefreshKey: 0,

    tableStatusById: {},
    unreadAlertsCount: 0,
    toasts: [],

    kitchenTickets: [],
  }),

  actions: {
    setConnected(value: boolean) {
      this.connected = value
    },

    setConnecting(value: boolean) {
      this.connecting = value
    },

    setReconnectAttempts(value: number) {
      this.reconnectAttempts = value
    },

    pushToast(toast: RealtimeToast) {
      const ttlMs = toast.ttlMs ?? 4000
      const existing = this.toasts.find((t) => t.id === toast.id)
      if (existing) return

      this.toasts.push(toast)

      if (process.client) {
        window.setTimeout(() => {
          this.removeToast(toast.id)
        }, ttlMs)
      }
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    clearToasts() {
      this.toasts = []
    },

    applyEvent(event: RealtimeEvent) {
      this.lastEventAt = new Date().toISOString()
      this.lastEventType = event.type

      switch (event.type) {
        case 'reservation.created':
        case 'reservation.updated':
          this.reservationRefreshKey += 1
          this.dashboardRefreshKey += 1
          break

        case 'order.created':
        case 'order.status_changed':
          this.ordersRefreshKey += 1
          this.dashboardRefreshKey += 1
          break

        case 'kitchen.ticket_created':
          this.kitchenRefreshKey += 1
          this.dashboardRefreshKey += 1
          this.kitchenTickets.unshift({
            id: event.payload.ticket_id,
            title: `Ticket #${event.payload.ticket_id}`,
            subtitle: `Order #${event.payload.order_id}`,
            status: event.payload.status,
          })
          break

        case 'kitchen.ticket_ready':
          this.kitchenRefreshKey += 1
          this.dashboardRefreshKey += 1
          this.kitchenTickets = this.kitchenTickets.map((ticket) =>
            ticket.id === event.payload.ticket_id ? { ...ticket, status: event.payload.status } : ticket,
          )
          break

        case 'table.status_changed':
          this.tableStatusById[String(event.payload.table_id)] = event.payload.status
          this.dashboardRefreshKey += 1
          break

        case 'payment.succeeded':
          this.checkoutRefreshKey += 1
          this.ordersRefreshKey += 1
          this.dashboardRefreshKey += 1
          break

        case 'waitlist.called':
          this.reservationRefreshKey += 1
          break

        case 'staff.alert_created':
          this.unreadAlertsCount += 1
          break
      }
    },

    handleEvent(event: RealtimeEvent) {
      this.applyEvent(event)
    },
  },
})
