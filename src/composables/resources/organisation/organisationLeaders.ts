import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsLeadersList,
  organisationsLeadersRetrieve,
  organisationsLeadersCreate,
  organisationsLeadersUpdate,
  organisationsLeadersPartialUpdate,
  organisationsLeadersDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsLeadersListData,
  OrganisationsLeadersCreateData,
  OrganisationsLeadersUpdateData,
  OrganisationsLeadersPartialUpdateData,
  OrganisationsLeadersDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationLeaders'] as const

/**
 * List all organisation leaders
 */
export function useOrganisationLeaders(params?: MaybeRefOrGetter<OrganisationsLeadersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsLeadersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single leader by ID
 */
export function useOrganisationLeader(leaderId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', leaderId] as const,
    queryFn: () => {
      const id = toValue(leaderId)
      return organisationsLeadersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(leaderId),
  })
}

/**
 * Create a new organisation leader
 */
export function useCreateOrganisationLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsLeadersCreateData['body']) => organisationsLeadersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an organisation leader (full update)
 */
export function useUpdateOrganisationLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leaderId, body }: { leaderId: number; body: OrganisationsLeadersUpdateData['body'] }) =>
      organisationsLeadersUpdate({ path: { id: leaderId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.leaderId],
      })
    },
  })
}

/**
 * Partially update an organisation leader
 */
export function usePartialUpdateOrganisationLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leaderId, body }: { leaderId: number; body?: OrganisationsLeadersPartialUpdateData['body'] }) =>
      organisationsLeadersPartialUpdate({ path: { id: leaderId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.leaderId],
      })
    },
  })
}

/**
 * Delete an organisation leader
 */
export function useDeleteOrganisationLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leaderId: number) => organisationsLeadersDestroy({ path: { id: leaderId } }),
    onSuccess: (_, leaderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', leaderId],
      })
    },
  })
}
