import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListAddResourceCreate,
  eventListRemoveResourceDestroy,
  eventListResourcesList,
} from '~/api/sdk.gen'
import type {
  EventListAddResourceCreateData,
  EventListRemoveResourceDestroyData,
  EventListResourcesListData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventResources'] as const

/**
 * List all resources for an event
 * Supports filtering by tag, resource_type, and search
 */
export function useEventResources(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventListResourcesListData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventId, params],
    queryFn: () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)
      return eventListResourcesList({
        path: { event_id: id },
        query: queryParams,
      })
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Add a new resource to an event
 * Supports documents, images, videos, audio, links, and other file types
 */
export function useAddEventResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      body: EventListAddResourceCreateData['body']
    }) => {
      return eventListAddResourceCreate({
        path: { event_id: data.eventId },
        body: data.body,
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate the resources list for this event
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
    },
  })
}

/**
 * Remove a resource from an event
 * Permanently deletes the resource including any uploaded files
 */
export function useRemoveEventResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      query: EventListRemoveResourceDestroyData['query']
    }) => {
      return eventListRemoveResourceDestroy({
        path: { event_id: data.eventId },
        query: data.query,
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate the resources list for this event
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
    },
  })
}
