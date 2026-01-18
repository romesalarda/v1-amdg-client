import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsDiscountRulesList,
  paymentsDiscountRulesRetrieve,
  paymentsDiscountRulesCreate,
  paymentsDiscountRulesUpdate,
  paymentsDiscountRulesPartialUpdate,
  paymentsDiscountRulesDestroy,
} from '~/api/sdk.gen'
import type {
  PaymentsDiscountRulesListData,
  PaymentsDiscountRulesCreateData,
  PaymentsDiscountRulesUpdateData,
  PaymentsDiscountRulesPartialUpdateData,
  PaymentsDiscountRulesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentDiscountRules'] as const

/**
 * List all discount rules
 */
export function usePaymentDiscountRules(params?: MaybeRefOrGetter<PaymentsDiscountRulesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsDiscountRulesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single discount rule by ID
 */
export function usePaymentDiscountRule(ruleId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', ruleId] as const,
    queryFn: () => {
      const id = toValue(ruleId)
      return paymentsDiscountRulesRetrieve({ path: { rule_id: String(id) } })
    },
    enabled: () => !!toValue(ruleId),
  })
}

/**
 * Create a new discount rule
 */
export function useCreatePaymentDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsDiscountRulesCreateData['body']) => paymentsDiscountRulesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a discount rule (full update)
 */
export function useUpdatePaymentDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, body }: { ruleId: number; body: PaymentsDiscountRulesUpdateData['body'] }) =>
      paymentsDiscountRulesUpdate({ path: { rule_id: String(ruleId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.ruleId],
      })
    },
  })
}

/**
 * Partially update a discount rule
 */
export function usePartialUpdatePaymentDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, body }: { ruleId: number; body?: PaymentsDiscountRulesPartialUpdateData['body'] }) =>
      paymentsDiscountRulesPartialUpdate({ path: { rule_id: String(ruleId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.ruleId],
      })
    },
  })
}

/**
 * Delete a discount rule
 */
export function useDeletePaymentDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: number) => paymentsDiscountRulesDestroy({ path: { rule_id: String(ruleId) } }),
    onSuccess: (_, ruleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', String(ruleId)],
      })
    },
  })
}
