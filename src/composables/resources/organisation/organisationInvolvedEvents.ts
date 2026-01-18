import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsInvolvedEventsList,
  organisationsInvolvedEventsRetrieve,
  organisationsInvolvedEventsCreate,
  organisationsInvolvedEventsUpdate,
  organisationsInvolvedEventsPartialUpdate,
  organisationsInvolvedEventsDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsInvolvedEventsListData,
  OrganisationsInvolvedEventsCreateData,
  OrganisationsInvolvedEventsUpdateData,
  OrganisationsInvolvedEventsPartialUpdateData,
  OrganisationsInvolvedEventsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationInvolvedEvents'] as const

/**
 * List all organisation event involvements
 */
export function useOrganisationInvolvedEvents(params?: MaybeRefOrGetter<OrganisationsInvolvedEventsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsInvolvedEventsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single involvement by ID
 */
export function useOrganisationInvolvedEvent(involvementId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', involvementId] as const,
    queryFn: () => {
      const id = toValue(involvementId)
      return organisationsInvolvedEventsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(involvementId),
  })
}

/**
 * Add an organisation to an event
 */
export function useCreateOrganisationInvolvedEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsInvolvedEventsCreateData['body']) => organisationsInvolvedEventsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an organisation involvement (full update)
 */
export function useUpdateOrganisationInvolvedEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ involvementId, body }: { involvementId: number; body: OrganisationsInvolvedEventsUpdateData['body'] }) =>
      organisationsInvolvedEventsUpdate({ path: { id: involvementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.involvementId],
      })
    },
  })
}

/**
 * Partially update an organisation involvement
 */
export function usePartialUpdateOrganisationInvolvedEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ involvementId, body }: { involvementId: number; body?: OrganisationsInvolvedEventsPartialUpdateData['body'] }) =>
      organisationsInvolvedEventsPartialUpdate({ path: { id: involvementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.involvementId],
      })
    },
  })
}

/**
 * Remove an organisation's involvement in an event
 */
export function useDeleteOrganisationInvolvedEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (involvementId: number) => organisationsInvolvedEventsDestroy({ path: { id: involvementId } }),
    onSuccess: (_, involvementId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', involvementId],
      })
    },
  })
}
