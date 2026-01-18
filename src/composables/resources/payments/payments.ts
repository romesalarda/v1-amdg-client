import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsListList,
  paymentsListRetrieve,
  paymentsListCreate,
  paymentsListUpdate,
  paymentsListPartialUpdate,
  paymentsListDestroy,
  paymentsHistoryList,
  paymentsHistoryRetrieve,
} from '~/api/sdk.gen'
import type {
  PaymentsListListData,
  PaymentsListCreateData,
  PaymentsListUpdateData,
  PaymentsListPartialUpdateData,
  PaymentsListDestroyData,
  PaymentsHistoryListData,
} from '~/api/types.gen'

const QUERY_KEY = ['payments'] as const

/**
 * List all payments
 */
export function usePayments(params?: MaybeRefOrGetter<PaymentsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * List payment history
 */
export function usePaymentHistory(params?: MaybeRefOrGetter<PaymentsHistoryListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'history', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsHistoryList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single payment by ID
 */
export function usePayment(paymentId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', paymentId] as const,
    queryFn: () => {
      const id = toValue(paymentId)
      return paymentsListRetrieve({ path: { payment_id: String(id) } })
    },
    enabled: () => !!toValue(paymentId),
  })
}

/**
 * Retrieve a single payment history item by ID
 */
export function usePaymentHistoryItem(historyId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'history', 'detail', historyId] as const,
    queryFn: () => {
      const id = toValue(historyId)
      return paymentsHistoryRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(historyId),
  })
}

/**
 * Create a new payment
 */
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsListCreateData['body']) => paymentsListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing payment (full update)
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, body }: { paymentId: string; body: PaymentsListUpdateData['body'] }) =>
      paymentsListUpdate({ path: { payment_id: paymentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.paymentId],
      })
    },
  })
}

/**
 * Partially update an existing payment
 */
export function usePartialUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, body }: { paymentId: string; body?: PaymentsListPartialUpdateData['body'] }) =>
      paymentsListPartialUpdate({ path: { payment_id: paymentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.paymentId],
      })
    },
  })
}

/**
 * Delete a payment
 */
export function useDeletePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) => paymentsListDestroy({ path: { payment_id: paymentId } }),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', paymentId],
      })
    },
  })
}
