import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsCreditsCreate,
  paymentsCreditsList,
  paymentsCreditsRetrieve,
  paymentsCreditsPartialUpdate,
  paymentsCreditsDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsCreditsListData,
  PaymentsCreditsCreateData,
  PaymentsCreditsPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['credit-expenses'] as const

/**
 * List credit expenses with optional filters.
 */
export function useCreditExpenses(params?: MaybeRefOrGetter<PaymentsCreditsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsCreditsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single credit expense by credit_id.
 */
export function useCreditExpense(creditId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', creditId] as const,
    queryFn: () => paymentsCreditsRetrieve({ path: { credit_id: toValue(creditId) } }),
    enabled: () => !!toValue(creditId),
  })
}

/**
 * Create a new credit expense.
 */
export function useCreateCreditExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PaymentsCreditsCreateData['body']) => paymentsCreditsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Partially update a credit expense.
 */
export function usePartialUpdateCreditExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ creditId, body }: { creditId: string; body: PaymentsCreditsPartialUpdateData['body'] }) =>
      paymentsCreditsPartialUpdate({ path: { credit_id: creditId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.creditId] })
    },
  })
}

/**
 * Delete a credit expense.
 */
export function useDeleteCreditExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (creditId: string) => paymentsCreditsDestroy({ path: { credit_id: creditId } }),
    onSuccess: (_, creditId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', creditId] })
    },
  })
}
