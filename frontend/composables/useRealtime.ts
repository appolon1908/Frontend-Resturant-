import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRealtimeStore } from '~/stores/realtime'
import type {
  RealtimeChannel,
  RealtimeEvent,
  RealtimeInboundMessage,
  RealtimeToast,
} from '~/types/realtime'
import { isRealtimeEvent } from '~/types/realtime'

export interface UseRealtimeOptions {
  channel: RealtimeChannel
  restaurantId?: number | string | null
  customerId?: number | string | null
  autoConnect?: boolean
  token?: string | null
  debug?: boolean
}

function toWsBase(apiBase: string): string {
  const normalized = apiBase.replace(/\/+$/, '')
  const withoutApi = normalized.replace(/\/api(\/v\d+)?$/, '')
  return withoutApi.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://')
}

function buildRealtimeUrl(
  baseUrl: string,
  options: UseRealtimeOptions,
  token?: string | null,
): string | null {
  const wsBase = toWsBase(baseUrl)

  if (options.channel === 'restaurant') {
    if (!options.restaurantId) return null
    const url = new URL(`${wsBase}/ws/restaurant/${options.restaurantId}/ops/`)
    if (token) url.searchParams.set('token', token)
    return url.toString()
  }

  if (!options.customerId) return null
  const url = new URL(`${wsBase}/ws/customer/${options.customerId}/updates/`)
  if (token) url.searchParams.set('token', token)
  return url.toString()
}

export function useRealtime(options: UseRealtimeOptions) {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const realtime = useRealtimeStore()
  const { token, user } = storeToRefs(auth)

  const socket = ref<WebSocket | null>(null)
  const connecting = ref(false)
  const connected = ref(false)
  const reconnectAttempts = ref(0)
  const lastEventAt = ref<string | null>(null)
  const lastError = ref<string | null>(null)
  const manuallyClosed = ref(false)
  const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  const resolvedToken = computed(() => options.token ?? token.value ?? null)

  const enabled = computed(() => {
    if (options.channel === 'restaurant') return Boolean(options.restaurantId)
    return Boolean(options.customerId ?? user.value?.id)
  })

  const status = computed(() => {
    if (connected.value) return 'connected'
    if (connecting.value) return 'connecting'
    return 'disconnected'
  })

  function clearReconnectTimer() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  function pushToast(toast: RealtimeToast) {
    realtime.pushToast(toast)
  }

  function markConnected(value: boolean) {
    connected.value = value
    realtime.setConnected(value)
  }

  function markConnecting(value: boolean) {
    connecting.value = value
    realtime.setConnecting(value)
  }

  function markAttempts(value: number) {
    reconnectAttempts.value = value
    realtime.setReconnectAttempts(value)
  }

  function dispatchEvent(event: RealtimeEvent) {
    lastEventAt.value = new Date().toISOString()
    realtime.applyEvent(event)

    switch (event.type) {
      case 'reservation.created':
        pushToast({
          id: `reservation-created-${event.payload.reservation_id}`,
          title: 'New reservation',
          message: `Reservation #${event.payload.reservation_id} created`,
          level: 'success',
        })
        break

      case 'reservation.updated':
        pushToast({
          id: `reservation-updated-${event.payload.reservation_id}-${event.payload.status}`,
          title: 'Reservation updated',
          message: `Reservation #${event.payload.reservation_id} is now ${event.payload.status}`,
          level: 'info',
        })
        break

      case 'order.created':
        pushToast({
          id: `order-created-${event.payload.order_id}`,
          title: 'New order',
          message: `Order #${event.payload.order_id} created`,
          level: 'success',
        })
        break

      case 'order.status_changed':
        pushToast({
          id: `order-status-${event.payload.order_id}-${event.payload.status}`,
          title: 'Order updated',
          message: `Order #${event.payload.order_id} is now ${event.payload.status}`,
          level: 'info',
        })
        break

      case 'kitchen.ticket_created':
        pushToast({
          id: `ticket-created-${event.payload.ticket_id}`,
          title: 'Kitchen ticket created',
          message: `Ticket #${event.payload.ticket_id} added to queue`,
          level: 'warning',
        })
        break

      case 'kitchen.ticket_ready':
        pushToast({
          id: `ticket-ready-${event.payload.ticket_id}`,
          title: 'Kitchen ticket ready',
          message: `Ticket #${event.payload.ticket_id} is ready`,
          level: 'success',
        })
        break

      case 'table.status_changed':
        pushToast({
          id: `table-status-${event.payload.table_id}-${event.payload.status}`,
          title: 'Table updated',
          message: `Table #${event.payload.table_id} is now ${event.payload.status}`,
          level: 'info',
        })
        break

      case 'payment.succeeded':
        pushToast({
          id: `payment-succeeded-${event.payload.payment_id}`,
          title: 'Payment succeeded',
          message: `Payment #${event.payload.payment_id} completed`,
          level: 'success',
        })
        break

      case 'waitlist.called':
        pushToast({
          id: `waitlist-called-${event.payload.waitlist_entry_id}`,
          title: 'Waitlist called',
          message: event.payload.guest_name
            ? `${event.payload.guest_name} has been called`
            : `Waitlist entry #${event.payload.waitlist_entry_id} called`,
          level: 'warning',
        })
        break

      case 'staff.alert_created':
        pushToast({
          id: `staff-alert-${event.payload.alert_id}`,
          title: event.payload.title,
          message: event.payload.message,
          level:
            event.payload.level === 'critical'
              ? 'error'
              : event.payload.level === 'warning'
                ? 'warning'
                : 'info',
        })
        break
    }
  }

  function handleMessage(raw: MessageEvent) {
    try {
      const message = JSON.parse(String(raw.data)) as RealtimeInboundMessage

      if (message.type === 'connection.ready') {
        if (options.debug) {
          console.info('[realtime] connected', message)
        }
        return
      }

      if (message.type === 'error') {
        lastError.value = message.message
        pushToast({
          id: `rt-error-${Date.now()}`,
          title: 'Realtime error',
          message: message.message,
          level: 'error',
        })
        return
      }

      if (isRealtimeEvent(message)) {
        dispatchEvent(message)
      }
    } catch (error) {
      lastError.value =
        error instanceof Error ? error.message : 'Failed to parse realtime message.'
      if (options.debug) {
        console.error('[realtime] parse error', error)
      }
    }
  }

  function scheduleReconnect() {
    if (manuallyClosed.value || !enabled.value) return

    const nextAttempt = reconnectAttempts.value + 1
    markAttempts(nextAttempt)

    const delay = Math.min(1000 * 2 ** (nextAttempt - 1), 15000)

    clearReconnectTimer()
    reconnectTimer.value = setTimeout(() => {
      connect()
    }, delay)
  }

  function disconnect() {
    manuallyClosed.value = true
    clearReconnectTimer()

    if (socket.value) {
      socket.value.onopen = null
      socket.value.onmessage = null
      socket.value.onerror = null
      socket.value.onclose = null
      socket.value.close()
      socket.value = null
    }

    markConnecting(false)
    markConnected(false)
  }

  function connect() {
    if (import.meta.server || typeof WebSocket === 'undefined') return
    if (!enabled.value) return
    if (socket.value && socket.value.readyState === WebSocket.OPEN) return

    manuallyClosed.value = false
    markConnecting(true)
    lastError.value = null

    const apiBase =
      String(config.public.apiBaseUrl || '') ||
      String((config.public as Record<string, unknown>).NUXT_PUBLIC_API_BASE_URL || '') ||
      'http://localhost:8000/api/v1'

    const url = buildRealtimeUrl(
      apiBase,
      {
        ...options,
        customerId: options.customerId ?? user.value?.id ?? null,
      },
      resolvedToken.value,
    )

    if (!url) {
      markConnecting(false)
      return
    }

    try {
      socket.value = new WebSocket(url)

      socket.value.onopen = () => {
        markConnecting(false)
        markConnected(true)
        markAttempts(0)
        clearReconnectTimer()
      }

      socket.value.onmessage = handleMessage

      socket.value.onerror = () => {
        lastError.value = 'Realtime connection error.'
      }

      socket.value.onclose = () => {
        markConnecting(false)
        markConnected(false)
        socket.value = null
        scheduleReconnect()
      }
    } catch (error) {
      markConnecting(false)
      markConnected(false)
      lastError.value =
        error instanceof Error ? error.message : 'Realtime connection failed.'
      scheduleReconnect()
    }
  }

  function reconnect() {
    disconnect()
    manuallyClosed.value = false
    connect()
  }

  onMounted(() => {
    if (options.autoConnect !== false) {
      connect()
    }
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  watch(
    () => [resolvedToken.value, options.restaurantId, options.customerId, user.value?.id],
    () => {
      if (!enabled.value) return
      reconnect()
    },
  )

  return {
    socket,
    status,
    connected,
    connecting,
    reconnectAttempts,
    lastEventAt,
    lastError,
    connect,
    disconnect,
    reconnect,
    // compatibility aliases
    connectRealtime: connect,
    disconnectRealtime: disconnect,
    realtime,
  }
}
