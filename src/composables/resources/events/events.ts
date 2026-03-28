import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListList,
  eventListRetrieve,
  eventListCreate,
  eventListUpdate,
  eventListPartialUpdate,
  eventListDestroy,
  eventListUpcomingList,
  eventListOngoingList,
} from '~/api/sdk.gen'
import type {
  EventListListData,
  EventListCreateData,
  EventListUpdateData,
  EventListPartialUpdateData,
  EventListDestroyData,
  EventListUpcomingListData,
  EventListOngoingListData,
} from '~/api/types.gen'

const QUERY_KEY = ['events'] as const

/**
 * List all events
 */
export function useEvents(params?: MaybeRefOrGetter<EventListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * List upcoming events
 */
export function useUpcomingEvents(params?: MaybeRefOrGetter<EventListUpcomingListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'upcoming', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventListUpcomingList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * List ongoing events
 */
export function useOngoingEvents(params?: MaybeRefOrGetter<EventListOngoingListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ongoing', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventListOngoingList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * List past events (events that have ended)
 */
export function usePastEvents(params?: MaybeRefOrGetter<EventListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'past', params] as const,
    queryFn: async () => {
      const queryParams = toValue(params)
      // Note: The backend doesn't have a dedicated past events endpoint,
      // so we use the general events list. The filtering by end_datetime
      // should ideally be done on the backend, but we'll handle it on the frontend
      const response = await eventListList(queryParams ? { query: queryParams } : undefined)
      
      // Filter to only include past events (ended before now)
      if (response.data?.results) {
        const now = new Date().toISOString()
        const pastEvents = response.data.results.filter((event: any) => {
          return event.end_datetime && event.end_datetime < now
        })
        
        return {
          ...response,
          data: {
            ...response.data,
            results: pastEvents,
            count: pastEvents.length
          }
        }
      }
      
      return response
    },
  })
}

/**
 * Retrieve a single event by ID
 */
export function useEvent(eventId: MaybeRefOrGetter<String>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', eventId] as const,
    queryFn: () => {
      const id = toValue(eventId)
      return eventListRetrieve({ path: { url_safe_title: String(id) } , throwOnError: true})
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventListCreateData['body']) => eventListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event (full update)
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: EventListUpdateData['body'] }) =>
      eventListUpdate({ path: { url_safe_title: eventId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId],
      })
    },
  })
}

/**
 * Partially update an existing event
 */
export function usePartialUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body?: EventListPartialUpdateData['body'] }) =>
      eventListPartialUpdate({ path: { url_safe_title: eventId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId],
      })
    },
  })
}

/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventListDestroy({ path: { url_safe_title: eventId } }),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', eventId],
      })
    },
  })
}
