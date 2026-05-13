import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsDebitsCreate,
  paymentsDebitsList,
  paymentsDebitsRetrieve,
  paymentsDebitsPartialUpdate,
  paymentsDebitsDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsDebitsListData,
  PaymentsDebitsCreateData,
  PaymentsDebitsPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['debit-expenses'] as const

/**
 * List debit expenses with optional filters.
 */
export function useDebitExpenses(params?: MaybeRefOrGetter<PaymentsDebitsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsDebitsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single debit expense by debit_id.
 */
export function useDebitExpense(debitId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', debitId] as const,
    queryFn: () => paymentsDebitsRetrieve({ path: { debit_id: toValue(debitId) } }),
    enabled: () => !!toValue(debitId),
  })
}

/**
 * Create a new debit expense.
 */
export function useCreateDebitExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PaymentsDebitsCreateData['body']) => paymentsDebitsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Partially update a debit expense.
 */
export function usePartialUpdateDebitExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ debitId, body }: { debitId: string; body: PaymentsDebitsPartialUpdateData['body'] }) =>
      paymentsDebitsPartialUpdate({ path: { debit_id: debitId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.debitId] })
    },
  })
}

/**
 * Delete a debit expense.
 */
export function useDeleteDebitExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (debitId: string) => paymentsDebitsDestroy({ path: { debit_id: debitId } }),
    onSuccess: (_, debitId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', debitId] })
    },
  })
}
