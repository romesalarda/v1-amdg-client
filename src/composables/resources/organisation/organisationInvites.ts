import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsInvitesList,
  organisationsInvitesRetrieve,
  organisationsInvitesCreate,
  organisationsInvitesUpdate,
  organisationsInvitesPartialUpdate,
  organisationsInvitesDestroy,
  organisationsInvitesAcceptCreate,
} from '~/api/sdk.gen'
import type {
  OrganisationsInvitesListData,
  OrganisationsInvitesCreateData,
  OrganisationsInvitesUpdateData,
  OrganisationsInvitesPartialUpdateData,
  OrganisationsInvitesDestroyData,
  OrganisationsInvitesAcceptCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationInvites'] as const

/**
 * List all organisation invites
 */
export function useOrganisationInvites(params?: MaybeRefOrGetter<OrganisationsInvitesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsInvitesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single organisation invite by ID
 */
export function useOrganisationInvite(inviteId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', inviteId] as const,
    queryFn: () => {
      const id = toValue(inviteId)
      return organisationsInvitesRetrieve({ path: { id: String(id) } })
    },
    enabled: () => !!toValue(inviteId),
  })
}

/**
 * Create a new organisation invite
 */
export function useCreateOrganisationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsInvitesCreateData['body']) => organisationsInvitesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an organisation invite (full update)
 */
export function useUpdateOrganisationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inviteId, body }: { inviteId: number; body: OrganisationsInvitesUpdateData['body'] }) =>
      organisationsInvitesUpdate({ path: { id: String(inviteId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.inviteId],
      })
    },
  })
}

/**
 * Partially update an organisation invite
 */
export function usePartialUpdateOrganisationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inviteId, body }: { inviteId: number; body?: OrganisationsInvitesPartialUpdateData['body'] }) =>
      organisationsInvitesPartialUpdate({ path: { id: String(inviteId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.inviteId],
      })
    },
  })
}

/**
 * Delete an organisation invite
 */
export function useDeleteOrganisationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => organisationsInvitesDestroy({ path: { id: String(inviteId) } }),
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', inviteId],
      })
    },
  })
}

/**
 * Accept an organisation invite
 */
export function useAcceptOrganisationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => organisationsInvitesAcceptCreate({ path: { id: String(inviteId) } }),
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', inviteId],
      })
    },
  })
}
