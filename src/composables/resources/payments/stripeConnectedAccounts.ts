import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  stripeConnectAccountsList,
  stripeConnectAccountsRetrieve,
  stripeConnectAccountsCreate,
  stripeConnectAccountsPartialUpdate,
  stripeConnectAccountsSetPrimaryCreate,
  stripeConnectAccountsDestroy,
} from '~/api/sdk.gen'
import type {
  StripeConnectAccountsListData,
  StripeConnectAccountsRetrieveData,
  StripeConnectAccountsCreateData,
  StripeConnectAccountsPartialUpdateData,
  StripeConnectAccountsSetPrimaryCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['stripeConnectedAccounts'] as const

/**
 * List all connected Stripe accounts for the authenticated user
 */
export function useStripeConnectedAccounts(
  params?: MaybeRefOrGetter<StripeConnectAccountsListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return stripeConnectAccountsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single Stripe connected account by stripe_account_id
 */
export function useStripeConnectedAccount(
  stripeAccountId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<StripeConnectAccountsRetrieveData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', stripeAccountId, params] as const,
    queryFn: () => {
      const id = toValue(stripeAccountId)
      if (!id) throw new Error('stripe_account_id is required')
      const queryParams = toValue(params)
      return stripeConnectAccountsRetrieve({
        path: { stripe_account_id: id },
        ...(queryParams ? { query: queryParams } : {}),
      })
    },
    enabled: () => !!toValue(stripeAccountId),
  })
}

/**
 * Retrieve multiple Stripe connected accounts by id.
 * Missing / unauthorized accounts are skipped.
 */
export function useStripeConnectedAccountsByIds(
  stripeAccountIds: MaybeRefOrGetter<string[]>,
  params?: MaybeRefOrGetter<StripeConnectAccountsRetrieveData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail-batch', stripeAccountIds, params] as const,
    queryFn: async () => {
      const ids = Array.from(new Set((toValue(stripeAccountIds) || []).filter(Boolean)))
      const queryParams = toValue(params)

      const settled = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await stripeConnectAccountsRetrieve({
              path: { stripe_account_id: id },
              ...(queryParams ? { query: queryParams } : {}),
            })
            return response.data
          } catch {
            return null
          }
        }),
      )

      return settled.filter(Boolean)
    },
    enabled: () => (toValue(stripeAccountIds) || []).length > 0,
  })
}

/**
 * Create a new Stripe connected account post-onboarding
 */
export function useCreateStripeConnectedAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: StripeConnectAccountsCreateData['body']) =>
      stripeConnectAccountsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update Stripe account details (display_name, is_active, is_primary)
 */
export function useUpdateStripeConnectedAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      stripeAccountId,
      body,
    }: {
      stripeAccountId: string
      body?: StripeConnectAccountsPartialUpdateData['body']
    }) => stripeConnectAccountsPartialUpdate({ path: { stripe_account_id: stripeAccountId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.stripeAccountId],
      })
    },
  })
}

/**
 * Set a Stripe account as primary for the user
 */
export function useSetPrimaryStripeAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stripeAccountId: string) =>
      stripeConnectAccountsSetPrimaryCreate({ path: { stripe_account_id: stripeAccountId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Delete a Stripe connected account permanently
 */
export function useDeleteStripeConnectedAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stripeAccountId: string) =>
      stripeConnectAccountsDestroy({ path: { stripe_account_id: stripeAccountId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
