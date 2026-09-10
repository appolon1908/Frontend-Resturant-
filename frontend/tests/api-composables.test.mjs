import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { ref } from 'vue'

function load(name, clients, globals = {}) {
  const source = readFileSync(new URL(`../composables/${name}.ts`, import.meta.url), 'utf8')
    .replaceAll('import.meta.client', 'true')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    ...globals, exports, ref,
    useAuth: () => ({ handleApiError: (error) => error.message }),
    require: (name) => {
      assert.ok(name in clients, `Unexpected import: ${name}`)
      return clients[name]
    },
  })
  return exports[name]()
}

test('payment failures remain visible and reject the operation', async () => {
  const failure = new Error('Payment service unavailable')
  const api = load('usePayments', {
    '~/api/payments': { paymentsApi: { getStatus: async () => { throw failure } } },
  })
  await assert.rejects(api.fetchPaymentStatus(12), (error) => error === failure)
  assert.equal(api.error.value, failure.message)
  assert.equal(api.latestStatusPayment.value, null)
  assert.equal(api.loading.value, false)
})

test('payment loading stays active until concurrent requests finish', async () => {
  const finish = []
  const api = load('usePayments', {
    '~/api/payments': { paymentsApi: { getStatus: () => new Promise((resolve) => finish.push(resolve)) } },
  })
  const first = api.fetchPaymentStatus(1)
  const second = api.fetchPaymentStatus(2)
  finish[0]({ id: 1 })
  await first
  assert.equal(api.loading.value, true)
  finish[1]({ id: 2 })
  await second
  assert.equal(api.loading.value, false)
})

test('order queue exposes paginated results and total count', async () => {
  const result = { results: [{ id: 12 }], count: 42, next: '/next', previous: null }
  const api = load('useOrders', {
    '~/api/orders': { ordersApi: { restaurantQueue: async () => result } },
  })
  assert.equal(await api.fetchRestaurantQueue(), result)
  assert.equal(api.orders.value[0].id, 12)
  assert.equal(api.count.value, 42)
})

test('dashboard actions call the API and preserve rejected mutations', async () => {
  const calls = []
  const failure = new Error('Table no longer available')
  const api = load('useRestaurantDashboard', {
    '~/api/restaurant': { restaurantApi: {
      blockTable: async (id) => { calls.push(id); throw failure },
      dashboardTables: async () => ({ results: [{ id: 7 }], count: 1 }),
    } },
  })
  await api.fetchTables()
  assert.equal(api.tables.value[0].id, 7)
  await assert.rejects(api.blockTable(7), (error) => error === failure)
  assert.deepEqual(calls, [7])
  assert.equal(api.error.value, failure.message)
  assert.equal(api.loading.value, false)
})

test('menu updates preserve payloads and reject unsuccessful writes', async () => {
  const payload = { name: 'Soup', category_id: 4 }
  const failure = new Error('Category was removed')
  const api = load('useMenu', {
    '~/api/menu': { menuApi: { createItem: async (input) => {
      assert.equal(input, payload)
      throw failure
    } } },
  })
  await assert.rejects(api.createItem(payload), (error) => error === failure)
  assert.equal(api.error.value, failure.message)
})

test('billing checkout returns the service response rather than an empty success', async () => {
  const payload = { plan_id: 2 }
  const response = { url: 'https://checkout.example.test/session' }
  const api = load('useBilling', {
    '~/api/billing': { billingApi: { createCheckoutSession: async (input) => {
      assert.equal(input, payload)
      return response
    } } },
  })
  assert.equal(await api.createCheckoutSession(payload), response)
})

async function authContext(getRestaurant) {
  const pinia = await import('pinia')
  const source = readFileSync(new URL('../stores/auth.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.client', 'false')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const restaurant = {
    activeRestaurantId: null, contextError: '',
    setActiveRestaurantId(id) { this.activeRestaurantId = id },
  }
  const modules = {
    pinia,
    '~/api/auth': { authApi: {} },
    '~/api/restaurant': { restaurantApi: { me: getRestaurant } },
    '~/api/client': { setAccessToken() {} },
  }
  const exports = {}
  vm.runInNewContext(outputText, {
    exports,
    useRestaurantStore: () => restaurant,
    require: (name) => { assert.ok(name in modules); return modules[name] },
  })
  const auth = exports.useAuthStore(pinia.createPinia())
  auth.token = 'test-session'
  auth.user = { id: 12, role: 'restaurant' }
  return { auth, restaurant }
}

test('restaurant context uses the backend restaurant ID, independently of user ID', async () => {
  const { auth, restaurant } = await authContext(async () => ({ id: 57 }))
  await auth.syncRestaurantContext()
  assert.equal(restaurant.activeRestaurantId, 57)
  assert.equal(restaurant.contextError, '')
})

test('an outdated restaurant profile response cannot restore a cleared session context', async () => {
  let finish
  const { auth, restaurant } = await authContext(() => new Promise((resolve) => { finish = resolve }))
  const pending = auth.syncRestaurantContext()
  auth.token = ''
  auth.user = null
  await auth.syncRestaurantContext()
  finish({ id: 57 })
  await pending
  assert.equal(restaurant.activeRestaurantId, null)
})

test('realtime reconnects close the previous socket and cancel timers on teardown', () => {
  const sockets = []
  const timers = new Map()
  let timerId = 0
  class Socket {
    constructor() { sockets.push(this); this.closed = false }
    close() { this.closed = true }
  }
  const realtime = {
    reconnectAttempt: 0,
    setConnected() {}, setConnecting() {},
  }
  const api = load('useRealtime', {}, {
    WebSocket: Socket,
    useAuthStore: () => ({ token: 'test-session' }),
    useRealtimeStore: () => realtime,
    useRuntimeConfig: () => ({ public: { apiBaseUrl: 'https://api.example.test/api/v1' } }),
    useState: (_, init) => ref(init()),
    setTimeout: (callback) => { timers.set(++timerId, callback); return timerId },
    clearTimeout: (id) => timers.delete(id),
  })
  api.connect({ restaurantId: 57 })
  api.connect({ restaurantId: 57 })
  assert.equal(sockets[0].closed, true)
  sockets[1].onclose()
  assert.equal(timers.size, 1)
  api.disconnect()
  assert.equal(timers.size, 0)
})
