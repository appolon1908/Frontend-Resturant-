import { restaurantApi } from '~/api/restaurant'
import type { Table, WaitlistEntry } from '~/types/api'

export function useRestaurantDashboard() {
  const summary = ref<unknown>(null)
  const tables = ref<Table[]>([])
  const waitlist = ref<WaitlistEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { handleApiError } = useAuth()
  let pending = 0

  async function request<T>(action: () => Promise<T>): Promise<T> {
    pending++
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (cause) {
      error.value = handleApiError(cause, 'Restaurant request failed.')
      throw cause
    } finally {
      pending--
      loading.value = pending > 0
    }
  }

  const fetchSummary = () => request(async () => {
    summary.value = await restaurantApi.dashboardSummary()
    return summary.value
  })
  const fetchTables = (params?: Parameters<typeof restaurantApi.dashboardTables>[0]) => request(async () => {
    const result = await restaurantApi.dashboardTables(params)
    tables.value = result.results
    return result
  })
  const fetchWaitlist = (params?: Parameters<typeof restaurantApi.waitlist>[0]) => request(async () => {
    const result = await restaurantApi.waitlist(params)
    waitlist.value = result.results
    return result
  })

  return {
    summary, tables, waitlist, loading, error, fetchSummary, fetchTables, fetchWaitlist,
    blockTable: (id: number) => request(() => restaurantApi.blockTable(id)),
    unblockTable: (id: number) => request(() => restaurantApi.unblockTable(id)),
    markClean: (id: number) => request(() => restaurantApi.markTableClean(id)),
    markDirty: (id: number) => request(() => restaurantApi.markTableDirty(id)),
    assignWaiter: (id: number, staffUserId: number) => request(() => restaurantApi.assignWaiter(id, staffUserId)),
    notifyWaitlist: (id: number) => request(() => restaurantApi.notifyWaitlist(id)),
    callWaitlist: (id: number) => request(() => restaurantApi.callWaitlist(id)),
    fetchFloorBoard: () => request(() => restaurantApi.floorBoard()),
  }
}
