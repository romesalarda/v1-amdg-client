import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsRefundsList,
  paymentsRefundsRetrieve,
  paymentsRefundsCreate,
  paymentsRefundsUpdate,
  paymentsRefundsPartialUpdate,
  paymentsRefundsDestroy,
  paymentsRefundsProcessCreate,
  paymentsRefundsRejectCreate,
  paymentsRefundsVerifyCreate,
} from '~/api/sdk.gen'
import type {
  PaymentsRefundsListData,
  PaymentsRefundsCreateData,
  PaymentsRefundsUpdateData,
  PaymentsRefundsPartialUpdateData,
  PaymentsRefundsDestroyData,
  PaymentsRefundsProcessCreateData,
  PaymentsRefundsRejectCreateData,
  PaymentsRefundsVerifyCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentRefunds'] as const

/**
 * List all refund requests
 */
export function usePaymentRefunds(params?: MaybeRefOrGetter<PaymentsRefundsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsRefundsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single refund request by ID
 */
export function usePaymentRefund(refundId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', refundId] as const,
    queryFn: () => {
      const id = toValue(refundId)
      return paymentsRefundsRetrieve({ path: { refund_id: String(id) } })
    },
    enabled: () => !!toValue(refundId),
  })
}

/**
 * Create a refund request
 */
export function useCreatePaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsRefundsCreateData['body']) => paymentsRefundsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a refund request (full update)
 */
export function useUpdatePaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, body }: { refundId: number; body: PaymentsRefundsUpdateData['body'] }) =>
      paymentsRefundsUpdate({ path: { refund_id: String(refundId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.refundId],
      })
    },
  })
}

/**
 * Partially update a refund request
 */
export function usePartialUpdatePaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, body }: { refundId: number; body?: PaymentsRefundsPartialUpdateData['body'] }) =>
      paymentsRefundsPartialUpdate({ path: { refund_id: String(refundId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.refundId],
      })
    },
  })
}

/**
 * Delete a refund request
 */
export function useDeletePaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (refundId: number) => paymentsRefundsDestroy({ path: { refund_id: String(refundId) } }),
    onSuccess: (_, refundId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', refundId],
      })
    },
  })
}

/**
 * Mark refund request as processed
 */
export function useProcessPaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, body }: { refundId: number; body: PaymentsRefundsProcessCreateData['body'] }) =>
      paymentsRefundsProcessCreate({ path: { refund_id: String(refundId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.refundId],
      })
    },
  })
}

/**
 * Reject a refund request
 */
export function useRejectPaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, body }: { refundId: number; body: PaymentsRefundsRejectCreateData['body'] }) =>
      paymentsRefundsRejectCreate({ path: { refund_id: String(refundId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.refundId],
      })
    },
  })
}

/**
 * Verify a refund request
 */
export function useVerifyPaymentRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, body }: { refundId: number; body: PaymentsRefundsVerifyCreateData['body'] }) =>
      paymentsRefundsVerifyCreate({ path: { refund_id: String(refundId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.refundId],
      })
    },
  })
}
