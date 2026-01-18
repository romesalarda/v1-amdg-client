import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsRefundAssociationsList,
  paymentsRefundAssociationsRetrieve,
  paymentsRefundAssociationsCreate,
  paymentsRefundAssociationsUpdate,
  paymentsRefundAssociationsPartialUpdate,
  paymentsRefundAssociationsDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsRefundAssociationsListData,
  PaymentsRefundAssociationsCreateData,
  PaymentsRefundAssociationsUpdateData,
  PaymentsRefundAssociationsPartialUpdateData,
  PaymentsRefundAssociationsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentRefundAssociations'] as const

/**
 * List all refund associations
 */
export function usePaymentRefundAssociations(params?: MaybeRefOrGetter<PaymentsRefundAssociationsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsRefundAssociationsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single refund association by ID
 */
export function usePaymentRefundAssociation(associationId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', associationId] as const,
    queryFn: () => {
      const id = toValue(associationId)
      return paymentsRefundAssociationsRetrieve({ path: { id: String(id) } })
    },
    enabled: () => !!toValue(associationId),
  })
}

/**
 * Create a new refund association
 */
export function useCreatePaymentRefundAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsRefundAssociationsCreateData['body']) => paymentsRefundAssociationsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a refund association (full update)
 */
export function useUpdatePaymentRefundAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ associationId, body }: { associationId: number; body: PaymentsRefundAssociationsUpdateData['body'] }) =>
      paymentsRefundAssociationsUpdate({ path: { id: String(associationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.associationId],
      })
    },
  })
}

/**
 * Partially update a refund association
 */
export function usePartialUpdatePaymentRefundAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ associationId, body }: { associationId: number; body?: PaymentsRefundAssociationsPartialUpdateData['body'] }) =>
      paymentsRefundAssociationsPartialUpdate({ path: { id: String(associationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.associationId],
      })
    },
  })
}

/**
 * Delete a refund association
 */
export function useDeletePaymentRefundAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (associationId: number) => paymentsRefundAssociationsDestroy({ path: { id: String(associationId) } }),
    onSuccess: (_, associationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', associationId],
      })
    },
  })
}
