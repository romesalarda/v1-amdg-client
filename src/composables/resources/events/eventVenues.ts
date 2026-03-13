import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventVenuesList,
  eventVenuesRetrieve,
  eventVenuesCreate,
  eventVenuesUpdate,
  eventVenuesPartialUpdate,
  eventVenuesDestroy,
} from '~/api/sdk.gen'
import type {
  EventVenuesListData,
  EventVenuesCreateData,
  EventVenuesUpdateData,
  EventVenuesPartialUpdateData,
  EventVenuesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventVenues'] as const

/**
 * List all event-venue associations
 */
export function useEventVenues(params?: MaybeRefOrGetter<EventVenuesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventVenuesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event venue by ID
 */
export function useEventVenue(eventVenueId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', eventVenueId] as const,
    queryFn: () => {
      const id = toValue(eventVenueId)
      return eventVenuesRetrieve({ path: { event_venue_id: String(id) } })
    },
    enabled: () => !!toValue(eventVenueId),
  })
}

/**
 * Create a new event-venue association
 */
export function useCreateEventVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventVenuesCreateData['body']) => eventVenuesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an event-venue association (full update)
 */
export function useUpdateEventVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventVenueId, body }: { eventVenueId: string; body: EventVenuesUpdateData['body'] }) =>
      eventVenuesUpdate({ path: { event_venue_id: String(eventVenueId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventVenueId],
      })
    },
  })
}

/**
 * Partially update an event-venue association
 */
export function usePartialUpdateEventVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventVenueId, body }: { eventVenueId: string; body?: EventVenuesPartialUpdateData['body'] }) =>
      eventVenuesPartialUpdate({ path: { event_venue_id: String(eventVenueId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventVenueId],
      })
    },
  })
}

/**
 * Delete an event-venue association
 */
export function useDeleteEventVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventVenueId: string) => eventVenuesDestroy({ path: { event_venue_id: String(eventVenueId) } }),
    onSuccess: (_, eventVenueId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', eventVenueId],
      })
    },
  })
}
