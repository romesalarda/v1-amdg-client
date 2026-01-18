import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsControlsList,
  organisationsControlsRetrieve,
  organisationsControlsCreate,
  organisationsControlsDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsControlsListData,
  OrganisationsControlsCreateData,
  OrganisationsControlsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationControls'] as const

/**
 * List all organisation control assignments
 */
export function useOrganisationControls(params?: MaybeRefOrGetter<OrganisationsControlsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsControlsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single control assignment by ID
 */
export function useOrganisationControl(controlId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', controlId] as const,
    queryFn: () => {
      const id = toValue(controlId)
      return organisationsControlsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(controlId),
  })
}

/**
 * Assign control of an organisation to a user
 */
export function useCreateOrganisationControl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsControlsCreateData['body']) => organisationsControlsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Remove control assignment from a user
 */
export function useDeleteOrganisationControl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (controlId: number) => organisationsControlsDestroy({ path: { id: controlId } }),
    onSuccess: (_, controlId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', controlId],
      })
    },
  })
}
