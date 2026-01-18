import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsMethodsList,
  paymentsMethodsRetrieve,
  paymentsMethodsCreate,
  paymentsMethodsUpdate,
  paymentsMethodsPartialUpdate,
  paymentsMethodsDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsMethodsListData,
  PaymentsMethodsCreateData,
  PaymentsMethodsUpdateData,
  PaymentsMethodsPartialUpdateData,
  PaymentsMethodsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentMethods'] as const

/**
 * List all payment methods
 */
export function usePaymentMethods(params?: MaybeRefOrGetter<PaymentsMethodsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsMethodsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single payment method by ID
 */
export function usePaymentMethod(methodId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', methodId] as const,
    queryFn: () => {
      const id = toValue(methodId)
      return paymentsMethodsRetrieve({ path: { method_id: String(id) } })
    },
    enabled: () => !!toValue(methodId),
  })
}

/**
 * Create a new payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsMethodsCreateData['body']) => paymentsMethodsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a payment method (full update)
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ methodId, body }: { methodId: number; body: PaymentsMethodsUpdateData['body'] }) =>
      paymentsMethodsUpdate({ path: { method_id: String(methodId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.methodId],
      })
    },
  })
}

/**
 * Partially update a payment method
 */
export function usePartialUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ methodId, body }: { methodId: number; body?: PaymentsMethodsPartialUpdateData['body'] }) =>
      paymentsMethodsPartialUpdate({ path: { method_id: String(methodId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.methodId],
      })
    },
  })
}

/**
 * Delete a payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (methodId: number) => paymentsMethodsDestroy({ path: { method_id: String(methodId) } }),
    onSuccess: (_, methodId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', methodId],
      })
    },
  })
}
