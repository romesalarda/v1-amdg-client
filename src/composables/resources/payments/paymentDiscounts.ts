import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsDiscountsList,
  paymentsDiscountsRetrieve,
  paymentsDiscountsCreate,
  paymentsDiscountsUpdate,
  paymentsDiscountsPartialUpdate,
  paymentsDiscountsDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsDiscountsListData,
  PaymentsDiscountsCreateData,
  PaymentsDiscountsUpdateData,
  PaymentsDiscountsPartialUpdateData,
  PaymentsDiscountsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentDiscounts'] as const

/**
 * List all discounts
 */
export function usePaymentDiscounts(params?: MaybeRefOrGetter<PaymentsDiscountsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsDiscountsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single discount by ID
 */
export function usePaymentDiscount(discountId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', discountId] as const,
    queryFn: () => {
      const id = toValue(discountId)
      return paymentsDiscountsRetrieve({ path: { discount_id: String(id) } })
    },
    enabled: () => !!toValue(discountId),
  })
}

/**
 * Create a new discount
 */
export function useCreatePaymentDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsDiscountsCreateData['body']) => paymentsDiscountsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a discount (full update)
 */
export function useUpdatePaymentDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ discountId, body }: { discountId: number; body: PaymentsDiscountsUpdateData['body'] }) =>
      paymentsDiscountsUpdate({ path: { discount_id: String(discountId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', String(variables.discountId)],
      })
    },
  })
}

/**
 * Partially update a discount
 */
export function usePartialUpdatePaymentDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ discountId, body }: { discountId: number; body?: PaymentsDiscountsPartialUpdateData['body'] }) =>
      paymentsDiscountsPartialUpdate({ path: { discount_id: String(discountId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', String(variables.discountId)],
      })
    },
  })
}

/**
 * Delete a discount
 */
export function useDeletePaymentDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (discountId: string) => paymentsDiscountsDestroy({ path: { discount_id: String(discountId) } }),
    onSuccess: (_, discountId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', String(discountId)],
      })
    },
  })
}
