import { get } from '~/api/client'

export const billingApi = {
  summary: () => get<{ plan: string; renewal_date: string; balance: number }>('/restaurant/accounting/summary/'),
}
