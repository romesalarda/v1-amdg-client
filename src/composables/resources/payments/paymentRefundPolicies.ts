import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsRefundPoliciesList,
  paymentsRefundPoliciesRetrieve,
  paymentsRefundPoliciesCreate,
  paymentsRefundPoliciesUpdate,
  paymentsRefundPoliciesPartialUpdate,
  paymentsRefundPoliciesDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsRefundPoliciesListData,
  PaymentsRefundPoliciesCreateData,
  PaymentsRefundPoliciesUpdateData,
  PaymentsRefundPoliciesPartialUpdateData,
  PaymentsRefundPoliciesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentRefundPolicies'] as const

/**
 * List all refund policies
 */
export function usePaymentRefundPolicies(params?: MaybeRefOrGetter<PaymentsRefundPoliciesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsRefundPoliciesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single refund policy by ID
 */
export function usePaymentRefundPolicy(policyId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', policyId] as const,
    queryFn: () => {
      const id = toValue(policyId)
      return paymentsRefundPoliciesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(policyId),
  })
}

/**
 * Create a new refund policy
 */
export function useCreatePaymentRefundPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsRefundPoliciesCreateData['body']) => paymentsRefundPoliciesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a refund policy (full update)
 */
export function useUpdatePaymentRefundPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, body }: { policyId: number; body: PaymentsRefundPoliciesUpdateData['body'] }) =>
      paymentsRefundPoliciesUpdate({ path: { id: policyId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.policyId],
      })
    },
  })
}

/**
 * Partially update a refund policy
 */
export function usePartialUpdatePaymentRefundPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, body }: { policyId: number; body?: PaymentsRefundPoliciesPartialUpdateData['body'] }) =>
      paymentsRefundPoliciesPartialUpdate({ path: { id: policyId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.policyId],
      })
    },
  })
}

/**
 * Delete a refund policy
 */
export function useDeletePaymentRefundPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (policyId: number) => paymentsRefundPoliciesDestroy({ path: { id: policyId } }),
    onSuccess: (_, policyId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', policyId],
      })
    },
  })
}
