import type {
  LocationPaymentPolicy,
  OpeningHourManage,
  Paginated,
  RestaurantCustomer,
  RestaurantCustomerDetail,
  RestaurantLocation,
  RestaurantLocationSettings,
  RestaurantManage,
  RiskScore,
  SendHighFive,
  StaffBooking,
  StaffDiningCheck,
  StaffHelpRequestInput,
  Table,
  TableWrite,
  WaitlistEntry,
  WalkInCreate,
} from '~/types/api'
import { get, patch, post } from '~/api/client'

type QV = string | number | boolean | null | undefined

export const restaurantApi = {
  // ── Profile ──────────────────────────────────────────────────
  me() {
    return get<RestaurantManage>('/restaurant/restaurants/me/')
  },
  updateMe(payload: Partial<RestaurantManage>) {
    return patch<RestaurantManage>('/restaurant/restaurants/me/', payload)
  },

  settings() {
    return get<RestaurantLocationSettings>('/restaurant/restaurants/me/settings/')
  },
  updateSettings(payload: Partial<RestaurantLocationSettings>) {
    return patch<RestaurantLocationSettings>('/restaurant/restaurants/me/settings/', payload)
  },

  hours(params?: { page?: number }) {
    return get<Paginated<OpeningHourManage>>('/restaurant/restaurants/me/hours/', params as Record<string, QV>)
  },
  createHour(payload: Partial<OpeningHourManage>) {
    return post<OpeningHourManage>('/restaurant/restaurants/me/hours/', payload)
  },

  // ── Dashboard ─────────────────────────────────────────────────
  dashboardSummary() {
    return get<unknown>('/restaurant/dashboard/summary/')
  },
  dashboardTables(params?: { page?: number }) {
    return get<Paginated<Table>>('/restaurant/dashboard/tables/', params as Record<string, QV>)
  },

  // ── Tables ────────────────────────────────────────────────────
  tables(params?: { page?: number; page_size?: number }) {
    return get<Paginated<Table>>('/restaurant/restaurants/me/tables/', params as Record<string, QV>)
  },
  createTable(payload: TableWrite) {
    return post<Table>('/restaurant/restaurants/me/tables/', payload)
  },
  updateTable(id: number, payload: Partial<TableWrite>) {
    return patch<TableWrite>(`/restaurant/tables/${id}/`, payload)
  },
  tableCurrentState(id: number) {
    return get<unknown>(`/restaurant/tables/${id}/current-state/`)
  },
  blockTable(id: number) {
    return post<void>(`/restaurant/tables/${id}/block/`)
  },
  unblockTable(id: number) {
    return post<void>(`/restaurant/tables/${id}/unblock/`)
  },
  markTableClean(id: number) {
    return post<void>(`/restaurant/tables/${id}/mark-clean/`)
  },
  markTableDirty(id: number) {
    return post<void>(`/restaurant/tables/${id}/mark-dirty/`)
  },
  assignWaiter(id: number, staff_user_id: number) {
    return post<unknown>(`/restaurant/tables/${id}/assign-waiter/`, { staff_user_id })
  },
  floorBoard() {
    return get<unknown>('/restaurant/tables/floor-board/')
  },

  // ── Customers ─────────────────────────────────────────────────
  customers(params?: { page?: number; page_size?: number; search?: string; ordering?: string }) {
    return get<Paginated<RestaurantCustomer>>('/restaurant/customers/', params as Record<string, QV>)
  },
  customer(id: number) {
    return get<RestaurantCustomerDetail>(`/restaurant/customers/${id}/`)
  },
  updateCustomer(id: number, payload: Partial<RestaurantCustomerDetail>) {
    return patch<unknown>(`/restaurant/customers/${id}/`, payload)
  },
  markVip(id: number) {
    return post<void>(`/restaurant/customers/${id}/mark-vip/`)
  },
  clearNoShowRisk(id: number) {
    return post<void>(`/restaurant/customers/${id}/clear-no-show-risk/`)
  },
  customerTimeline(id: number) {
    return get<unknown>(`/restaurant/customers/${id}/timeline/`)
  },

  // ── Waitlist ──────────────────────────────────────────────────
  waitlist(params?: { page?: number; page_size?: number }) {
    return get<Paginated<WaitlistEntry>>('/restaurant/waitlist/', params as Record<string, QV>)
  },
  notifyWaitlist(id: number) {
    return post<void>(`/restaurant/waitlist/${id}/notify/`)
  },
  callWaitlist(id: number) {
    return post<void>(`/restaurant/waitlist/${id}/call/`)
  },
  createWalkIn(payload: WalkInCreate) {
    return post<WalkInCreate>('/restaurant/walk-ins/', payload)
  },

  // ── Staff (self) ──────────────────────────────────────────────
  staffMe() {
    return get<unknown>('/restaurant/me/')
  },
  staffDashboard() {
    return get<unknown>('/restaurant/staff/me/dashboard/')
  },
  staffBookings(params?: { page?: number }) {
    return get<Paginated<StaffBooking>>('/restaurant/staff/me/bookings/', params as Record<string, QV>)
  },
  staffChecks(params?: { page?: number }) {
    return get<Paginated<StaffDiningCheck>>('/restaurant/staff/me/checks/', params as Record<string, QV>)
  },
  startShift() {
    return post<void>('/restaurant/staff/me/start-shift/')
  },
  endShift() {
    return post<void>('/restaurant/staff/me/end-shift/')
  },
  requestHelp(payload: StaffHelpRequestInput) {
    return post<StaffHelpRequestInput>('/restaurant/staff/me/request-help/', payload)
  },
  sendHighFive(payload: SendHighFive) {
    return post<SendHighFive>('/restaurant/staff/high-five/', payload)
  },
  staffLeaderboard() {
    return get<unknown>('/restaurant/staff/leaderboard/')
  },

  // ── Locations ─────────────────────────────────────────────────
  locations() {
    return get<RestaurantLocation>('/restaurant/locations/')
  },
  currentLocation() {
    return get<RestaurantLocation>('/restaurant/locations/current/')
  },

  // ── Floor plans ───────────────────────────────────────────────
  createFloorPlan(payload: { name: string; width?: number; height?: number }) {
    return post<{ name: string; width?: number; height?: number }>('/restaurant/floor-plans/', payload)
  },
  addPlacement(floorPlanId: number, payload: { table_id: number; x: number; y: number; rotation?: number }) {
    return post<{ table_id: number; x: number; y: number; rotation?: number }>(`/restaurant/floor-plans/${floorPlanId}/placements/`, payload)
  },

  // ── Payment policy ────────────────────────────────────────────
  paymentPolicy() {
    return get<LocationPaymentPolicy>('/restaurant/location-payment-settings/')
  },
  updatePaymentPolicy(payload: Partial<LocationPaymentPolicy>) {
    return patch<LocationPaymentPolicy>('/restaurant/location-payment-settings/', payload)
  },

  // ── Reports ───────────────────────────────────────────────────
  reportsSummary() {
    return get<unknown>('/restaurant/reports/summary/')
  },

  // ── AI risk ───────────────────────────────────────────────────
  riskScores(params?: { page?: number }) {
    return get<Paginated<RiskScore>>('/ai-ops/risk-scores/', params as Record<string, QV>)
  },

  // ── Accounting ────────────────────────────────────────────────
  accountingToday() {
    return get<unknown>('/restaurant/accounting/dashboard/today/')
  },
  accountingPayouts() {
    return get<unknown>('/restaurant/accounting/dashboard/payouts/')
  },
  accountingExport() {
    return get<unknown>('/restaurant/accounting/export/')
  },
}
