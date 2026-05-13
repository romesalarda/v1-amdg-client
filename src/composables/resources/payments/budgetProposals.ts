import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsBudgetProposalsList,
  paymentsBudgetProposalsCreate,
  paymentsBudgetProposalsRetrieve,
  paymentsBudgetProposalsPartialUpdate,
  paymentsBudgetProposalsDestroy,
  paymentsBudgetProposalsAddCreditCreate,
  paymentsBudgetProposalsRemoveCreditCreate,
  paymentsBudgetProposalsAddDebitCreate,
  paymentsBudgetProposalsRemoveDebitCreate,
  paymentsBudgetProposalsStatisticsRetrieve,
  paymentsBudgetProposalsEventStatisticsRetrieve,
} from '~/api/sdk.gen'
import type {
  PaymentsBudgetProposalsListData,
  PaymentsBudgetProposalsCreateData,
  PaymentsBudgetProposalsPartialUpdateData,
  PaymentsBudgetProposalsEventStatisticsRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['budget-proposals'] as const

/**
 * List budget proposals with optional filters.
 */
export function useBudgetProposals(params?: MaybeRefOrGetter<PaymentsBudgetProposalsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsBudgetProposalsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single budget proposal by proposal_id.
 */
export function useBudgetProposal(proposalId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', proposalId] as const,
    queryFn: () => paymentsBudgetProposalsRetrieve({ path: { proposal_id: toValue(proposalId) } }),
    enabled: () => !!toValue(proposalId),
  })
}

/**
 * Create a new budget proposal.
 */
export function useCreateBudgetProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PaymentsBudgetProposalsCreateData['body']) => paymentsBudgetProposalsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Partially update a budget proposal.
 */
export function usePartialUpdateBudgetProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      proposalId,
      body,
    }: {
      proposalId: string
      body: PaymentsBudgetProposalsPartialUpdateData['body']
    }) => paymentsBudgetProposalsPartialUpdate({ path: { proposal_id: proposalId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.proposalId] })
    },
  })
}

/**
 * Delete a budget proposal.
 */
export function useDeleteBudgetProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (proposalId: string) =>
      paymentsBudgetProposalsDestroy({ path: { proposal_id: proposalId } }),
    onSuccess: (_, proposalId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', proposalId] })
    },
  })
}

/**
 * Link a credit expense to a budget proposal.
 */
export function useAddCreditToProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, creditId }: { proposalId: string; creditId: string }) =>
      paymentsBudgetProposalsAddCreditCreate({
        path: { proposal_id: proposalId },
        body: { credit_id: creditId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.proposalId] })
    },
  })
}

/**
 * Unlink a credit expense from a budget proposal.
 */
export function useRemoveCreditFromProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, creditId }: { proposalId: string; creditId: string }) =>
      paymentsBudgetProposalsRemoveCreditCreate({
        path: { proposal_id: proposalId },
        body: { credit_id: creditId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.proposalId] })
    },
  })
}

/**
 * Link a debit expense to a budget proposal.
 */
export function useAddDebitToProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, debitId }: { proposalId: string; debitId: string }) =>
      paymentsBudgetProposalsAddDebitCreate({
        path: { proposal_id: proposalId },
        body: { debit_id: debitId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.proposalId] })
    },
  })
}

/**
 * Unlink a debit expense from a budget proposal.
 */
export function useRemoveDebitFromProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, debitId }: { proposalId: string; debitId: string }) =>
      paymentsBudgetProposalsRemoveDebitCreate({
        path: { proposal_id: proposalId },
        body: { debit_id: debitId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.proposalId] })
    },
  })
}

/**
 * Get per-proposal budget statistics.
 */
export function useBudgetProposalStatistics(proposalId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'statistics', proposalId] as const,
    queryFn: () =>
      paymentsBudgetProposalsStatisticsRetrieve({ path: { proposal_id: toValue(proposalId) } }),
    enabled: () => !!toValue(proposalId),
  })
}

/**
 * Get event-level budget statistics (aggregate across all proposals).
 */
export function useEventBudgetStatistics(
  params?: MaybeRefOrGetter<PaymentsBudgetProposalsEventStatisticsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'event-statistics', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      if (!queryParams?.event_id) {
        throw new Error('event_id query parameter is required for event budget statistics')
      }
      return paymentsBudgetProposalsEventStatisticsRetrieve({ query: queryParams })
    },
  })
}
