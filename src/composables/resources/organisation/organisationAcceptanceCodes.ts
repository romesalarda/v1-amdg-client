import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsAcceptanceCodesList,
  organisationsAcceptanceCodesRetrieve,
  organisationsAcceptanceCodesCreate,
  organisationsAcceptanceCodesUpdate,
  organisationsAcceptanceCodesPartialUpdate,
  organisationsAcceptanceCodesDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsAcceptanceCodesListData,
  OrganisationsAcceptanceCodesCreateData,
  OrganisationsAcceptanceCodesUpdateData,
  OrganisationsAcceptanceCodesPartialUpdateData,
  OrganisationsAcceptanceCodesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationAcceptanceCodes'] as const

/**
 * List all organisation acceptance codes
 */
export function useOrganisationAcceptanceCodes(params?: MaybeRefOrGetter<OrganisationsAcceptanceCodesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsAcceptanceCodesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single acceptance code by ID
 */
export function useOrganisationAcceptanceCode(codeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', codeId] as const,
    queryFn: () => {
      const id = toValue(codeId)
      return organisationsAcceptanceCodesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(codeId),
  })
}

/**
 * Create a new acceptance code
 */
export function useCreateOrganisationAcceptanceCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsAcceptanceCodesCreateData['body']) => organisationsAcceptanceCodesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an acceptance code (full update)
 */
export function useUpdateOrganisationAcceptanceCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ codeId, body }: { codeId: number; body: OrganisationsAcceptanceCodesUpdateData['body'] }) =>
      organisationsAcceptanceCodesUpdate({ path: { id: codeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.codeId],
      })
    },
  })
}

/**
 * Partially update an acceptance code
 */
export function usePartialUpdateOrganisationAcceptanceCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ codeId, body }: { codeId: number; body?: OrganisationsAcceptanceCodesPartialUpdateData['body'] }) =>
      organisationsAcceptanceCodesPartialUpdate({ path: { id: codeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.codeId],
      })
    },
  })
}

/**
 * Delete an acceptance code
 */
export function useDeleteOrganisationAcceptanceCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (codeId: number) => organisationsAcceptanceCodesDestroy({ path: { id: codeId } }),
    onSuccess: (_, codeId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', codeId],
      })
    },
  })
}
