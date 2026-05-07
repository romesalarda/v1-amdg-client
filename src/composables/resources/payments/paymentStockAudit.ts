import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsStockAuditList,
  paymentsStockAuditRetrieve,
} from '~/api/sdk.gen'
import type {
  PaymentsStockAuditListData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentStockAudit'] as const

/**
 * List stock audit logs linked to payments and order stock mutations.
 */
export function usePaymentStockAudit(
  params?: MaybeRefOrGetter<PaymentsStockAuditListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStockAuditList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => toValue(options?.enabled ?? true),
  })
}

/**
 * Get a specific stock audit record by UUID.
 */
export function usePaymentStockAuditRecord(
  stockAuditId: MaybeRefOrGetter<string | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', stockAuditId] as const,
    queryFn: () => {
      const id = toValue(stockAuditId)
      return paymentsStockAuditRetrieve({ path: { id: String(id) } })
    },
    enabled: () => !!toValue(stockAuditId) && toValue(options?.enabled ?? true),
  })
}
