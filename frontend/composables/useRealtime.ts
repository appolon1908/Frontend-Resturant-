import type { RealtimeEventEnvelope } from '~/types/api'

function wsBaseFromApiBase(apiBase: string) {
  const base = apiBase.replace(/\/$/, '')
  const wsProto = base.startsWith('https://') ? 'wss://' : 'ws://'
  const host = base.replace(/^https?:\/\//, '').replace(/\/api\/v\d+$/, '')
  return `${wsProto}${host}`
}

export function useRealtime() {
  const auth = useAuthStore()
  const realtime = useRealtimeStore()
  const config = useRuntimeConfig()
  const socket = useState<WebSocket | null>('realtime-socket', () => null)
  const manualClose = useState('realtime-manual-close', () => false)

  function endpoint(scope: { restaurantId?: number; customerId?: number }) {
    const base = wsBaseFromApiBase(String(config.public.apiBaseUrl || ''))
    if (scope.restaurantId) return `${base}/ws/restaurant/${scope.restaurantId}/ops/`
    if (scope.customerId) return `${base}/ws/customer/${scope.customerId}/updates/`
    return ''
  }

  function cleanup() {
    if (socket.value) {
      socket.value.onopen = null
      socket.value.onclose = null
      socket.value.onerror = null
      socket.value.onmessage = null
      socket.value = null
    }
  }

  function scheduleReconnect(scope: { restaurantId?: number; customerId?: number }) {
    if (manualClose.value) return
    realtime.reconnectAttempt += 1
    const delay = Math.min(1000 * 2 ** (realtime.reconnectAttempt - 1), 30000)
    setTimeout(() => connect(scope), delay)
  }

  function connect(scope: { restaurantId?: number; customerId?: number }) {
    if (!import.meta.client || !auth.token) return
    const url = endpoint(scope)
    if (!url) return

    manualClose.value = false
    realtime.setConnecting(true)

    cleanup()
    socket.value = new WebSocket(`${url}?token=${encodeURIComponent(auth.token)}`)

    socket.value.onopen = () => {
      realtime.setConnected(true)
    }

    socket.value.onclose = () => {
      realtime.setConnected(false)
      cleanup()
      scheduleReconnect(scope)
    }

    socket.value.onerror = () => {
      realtime.setConnected(false)
    }

    socket.value.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEventEnvelope
        realtime.handleEvent(event)
      } catch {
        // ignore malformed payloads
      }
    }
  }

  function disconnect() {
    manualClose.value = true
    if (socket.value) socket.value.close()
    realtime.setConnected(false)
    cleanup()
  }

  return { realtime, connect, disconnect }
}
