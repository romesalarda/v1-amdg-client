import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsListList,
  organisationsListRetrieve,
  organisationsListCreate,
  organisationsListUpdate,
  organisationsListPartialUpdate,
  organisationsListDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsListListData,
  OrganisationsListCreateData,
  OrganisationsListUpdateData,
  OrganisationsListPartialUpdateData,
  OrganisationsListDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisations'] as const

/**
 * List all organisations
 */
export function useOrganisations(params?: MaybeRefOrGetter<OrganisationsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single organisation by ID
 */
export function useOrganisation(organisationId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', organisationId] as const,
    queryFn: () => {
      const id = toValue(organisationId)
      return organisationsListRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(organisationId),
  })
}

/**
 * Create a new organisation
 */
export function useCreateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsListCreateData['body']) => organisationsListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing organisation (full update)
 */
export function useUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organisationId, body }: { organisationId: number; body: OrganisationsListUpdateData['body'] }) =>
      organisationsListUpdate({ path: { id: organisationId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.organisationId],
      })
    },
  })
}

/**
 * Partially update an existing organisation
 */
export function usePartialUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organisationId, body }: { organisationId: number; body?: OrganisationsListPartialUpdateData['body'] }) =>
      organisationsListPartialUpdate({ path: { id: organisationId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.organisationId],
      })
    },
  })
}

/**
 * Delete an organisation
 */
export function useDeleteOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (organisationId: number) => organisationsListDestroy({ path: { id: organisationId } }),
    onSuccess: (_, organisationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', organisationId],
      })
    },
  })
}
