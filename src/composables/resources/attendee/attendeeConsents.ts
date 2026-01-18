import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  consentsList,
  consentsRetrieve,
  consentsCreate,
  consentsUpdate,
  consentsDestroy,
} from '~/api/sdk.gen'
import type {
  ConsentsListData,
  ConsentsCreateData,
  ConsentsUpdateData,
  ConsentsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['consents'] as const

/**
 * List all consents
 */
export function useConsents(params?: MaybeRefOrGetter<ConsentsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return consentsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single consent by ID
 */
export function useConsent(consentId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', consentId] as const,
    queryFn: () => {
      const id = toValue(consentId)
      return consentsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(consentId),
  })
}

/**
 * Create a new consent
 */
export function useCreateConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ConsentsCreateData['body']) => consentsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing consent
 */
export function useUpdateConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ consentId, body }: { consentId: number; body: ConsentsUpdateData['body'] }) =>
      consentsUpdate({ path: { id: consentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.consentId],
      })
    },
  })
}

/**
 * Delete a consent
 */
export function useDeleteConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (consentId: number) => consentsDestroy({ path: { id: consentId } }),
    onSuccess: (_, consentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', consentId],
      })
    },
  })
}
