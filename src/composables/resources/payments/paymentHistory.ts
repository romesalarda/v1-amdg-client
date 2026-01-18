import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsHistoryList,
  paymentsHistoryRetrieve,
} from '~/api/sdk.gen'
import type {
  PaymentsHistoryListData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentHistory'] as const

/**
 * List payment history records
 */
export function usePaymentHistory(params?: MaybeRefOrGetter<PaymentsHistoryListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsHistoryList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a specific payment history record by ID
 */
export function usePaymentHistoryRecord(historyId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', historyId] as const,
    queryFn: () => {
      const id = toValue(historyId)
      return paymentsHistoryRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(historyId),
  })
}
