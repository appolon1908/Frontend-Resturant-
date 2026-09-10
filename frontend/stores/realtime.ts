import { defineStore } from 'pinia'
import type { RealtimeEventEnvelope, RealtimeEventType } from '~/types/api'

interface ToastMessage {
  id: string
  title: string
  body: string
  tone: 'info' | 'success' | 'warning'
}

interface KitchenTicket {
  id: number
  title: string
  subtitle?: string
  status?: string
}

function toKitchenTicket(value: unknown): KitchenTicket | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const id = Number(record.id)
  const title = typeof record.title === 'string' ? record.title.trim() : ''

  if (!Number.isInteger(id) || id <= 0 || !title) return null

  return {
    id,
    title,
    ...(typeof record.subtitle === 'string' ? { subtitle: record.subtitle } : {}),
    ...(typeof record.status === 'string' ? { status: record.status } : {}),
  }
}

export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    connected: false,
    connecting: false,
    reconnectAttempt: 0,
    lastEventType: '' as RealtimeEventType | '',
    lastEventAt: '' as string,
    kitchenTickets: [] as KitchenTicket[],
    tableStatuses: {} as Record<string, string>,
    staffAlerts: [] as Array<{ id: string; message: string; created_at: string }>,
    toasts: [] as ToastMessage[],
  }),
  actions: {
    setConnected(value: boolean) {
      this.connected = value
      this.connecting = false
      if (value) this.reconnectAttempt = 0
    },
    setConnecting(value: boolean) {
      this.connecting = value
    },
    pushToast(message: Omit<ToastMessage, 'id'>) {
      const toast = { ...message, id: crypto.randomUUID() }
      this.toasts.unshift(toast)
      setTimeout(() => this.removeToast(toast.id), 5000)
    },
    removeToast(id: string) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    handleEvent(event: RealtimeEventEnvelope) {
      this.lastEventType = event.type
      this.lastEventAt = new Date().toISOString()

      switch (event.type) {
        case 'reservation.created':
          this.pushToast({ title: 'New reservation', body: 'A new reservation was created.', tone: 'success' })
          break
        case 'order.created':
          this.pushToast({ title: 'New order', body: 'A new order entered the queue.', tone: 'success' })
          break
        case 'order.status_changed':
          this.pushToast({ title: 'Order update', body: 'An order status changed.', tone: 'info' })
          break
        case 'kitchen.ticket_created': {
          const ticket = toKitchenTicket(event.payload.ticket)
          if (ticket) {
            this.kitchenTickets.unshift(ticket)
          }
          this.pushToast({ title: 'Kitchen ticket', body: 'New kitchen ticket created.', tone: 'success' })
          break
        }
        case 'kitchen.ticket_ready':
          this.pushToast({ title: 'Ticket ready', body: 'A kitchen ticket is ready.', tone: 'info' })
          break
        case 'table.status_changed':
          if (event.payload.table_id && event.payload.status) {
            this.tableStatuses[String(event.payload.table_id)] = String(event.payload.status)
          }
          break
        case 'payment.succeeded':
          this.pushToast({ title: 'Payment complete', body: 'A payment was completed.', tone: 'success' })
          break
        case 'waitlist.called':
          this.pushToast({ title: 'Waitlist called', body: 'A waitlist customer was called.', tone: 'warning' })
          break
        case 'staff.alert_created':
          this.staffAlerts.unshift({
            id: String(event.payload.id || crypto.randomUUID()),
            message: String(event.payload.message || 'New staff alert.'),
            created_at: new Date().toISOString(),
          })
          this.pushToast({ title: 'Staff alert', body: 'New staff alert received.', tone: 'warning' })
          break
      }
    },
  },
})
