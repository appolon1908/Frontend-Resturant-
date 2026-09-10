import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { ref } from 'vue'

function load(name, clients) {
  const source = readFileSync(new URL(`../composables/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports, ref,
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
