export function useRestaurantDashboard() {
  const summary = ref<unknown>(null)
  const tables = ref<unknown[]>([])
  const waitlist = ref<unknown[]>([])
  const loading = ref(false)

  const fetchSummary = async () => {
    summary.value = null
  }

  const fetchTables = async () => ({ results: tables.value })
  const fetchWaitlist = async () => ({ results: waitlist.value })
  const blockTable = async () => null
  const unblockTable = async () => null
  const markClean = async () => null
  const markDirty = async () => null
  const assignWaiter = async () => null
  const notifyWaitlist = async () => null
  const callWaitlist = async () => null
  const fetchFloorBoard = async () => null

  return {
    summary,
    tables,
    waitlist,
    loading,
    fetchSummary,
    fetchTables,
    fetchWaitlist,
    blockTable,
    unblockTable,
    markClean,
    markDirty,
    assignWaiter,
    notifyWaitlist,
    callWaitlist,
    fetchFloorBoard,
  }
}
