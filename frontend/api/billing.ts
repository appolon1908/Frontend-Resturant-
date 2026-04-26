import { get, post } from '~/api/client'
import type { BillingPortalSession, CheckoutSessionCreate, CostBudget, DunningAttempt, Invoice, Paginated, Plan, Subscription, UsageRecord } from '~/types/api'

type QV = string | number | boolean | null | undefined

export const billingApi = {
  // ── Subscription ─────────────────────────────────────────────
  getSubscription() {
    return get<Subscription>('/restaurant/billing/subscription/')
  },

  cancelSubscription() {
    return post<void>('/restaurant/billing/subscription/cancel/')
  },

  // ── Plans ─────────────────────────────────────────────────────
  plans(params?: { page?: number; page_size?: number }) {
    return get<Paginated<Plan>>('/restaurant/billing/plans/', params as Record<string, QV>)
  },

  // ── Checkout ──────────────────────────────────────────────────
  createCheckoutSession(payload: CheckoutSessionCreate) {
    return post<{ url: string }>('/restaurant/billing/checkout-session/', payload)
  },

  createPortalSession(payload: BillingPortalSession) {
    return post<{ url: string }>('/restaurant/billing/portal-session/', payload)
  },

  // ── Invoices ──────────────────────────────────────────────────
  invoices(params?: { page?: number; page_size?: number }) {
    return get<Paginated<Invoice>>('/restaurant/billing/invoices/', params as Record<string, QV>)
  },

  invoice(id: number) {
    return get<Invoice>(`/restaurant/billing/invoices/${id}/`)
  },

  // ── Dunning ───────────────────────────────────────────────────
  dunning(params?: { page?: number; page_size?: number }) {
    return get<Paginated<DunningAttempt>>('/restaurant/billing/dunning/', params as Record<string, QV>)
  },

  // ── Usage ─────────────────────────────────────────────────────
  usage(params?: { page?: number; page_size?: number }) {
    return get<Paginated<UsageRecord>>('/restaurant/billing/usage/', params as Record<string, QV>)
  },

  usageSummary() {
    return get<unknown>('/restaurant/billing/usage/summary/')
  },

  quota() {
    return get<unknown>('/restaurant/billing/quota/')
  },

  costBudgets(params?: { page?: number; page_size?: number }) {
    return get<Paginated<CostBudget>>('/restaurant/billing/cost-budgets/', params as Record<string, QV>)
  },

  // Legacy compat
  summary() {
    return get<{ plan: string; renewal_date: string; balance: number }>('/restaurant/accounting/dashboard/today/')
  },
}
