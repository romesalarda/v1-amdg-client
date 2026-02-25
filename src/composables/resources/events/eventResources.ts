import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListAddResourceCreate,
  eventListRemoveResourceDestroy,
  eventListResourcesList,
  eventListUpdateResourcePartialUpdate,
  eventListPromoteLandingImageCreate,
  eventListDemoteLandingImageCreate,
} from '~/api/sdk.gen'
import type {
  EventListAddResourceCreateData,
  EventListRemoveResourceDestroyData,
  EventListResourcesListData,
  EventListUpdateResourcePartialUpdateData,
  EventListPromoteLandingImageCreateData,
  EventListDemoteLandingImageCreateData,
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
      // Also invalidate landing images since they might be affected
      queryClient.invalidateQueries({
        queryKey: ['eventLandingImages', 'list', variables.eventId],
      })
    },
  })
}

/**
 * Update resource metadata (name, description, tag, public)
 * Updates resource information without requiring file re-upload
 */
export function useUpdateEventResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      query: EventListUpdateResourcePartialUpdateData['query']
      body: EventListUpdateResourcePartialUpdateData['body']
    }) => {
      return eventListUpdateResourcePartialUpdate({
        path: { event_id: data.eventId },
        query: data.query,
        body: data.body,
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate the resources list for this event
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
      // Also invalidate landing images if tag was updated
      queryClient.invalidateQueries({
        queryKey: ['eventLandingImages', 'list', variables.eventId],
      })
    },
  })
}

/**
 * Promote a secondary landing image to main
 * Automatically demotes the current main image to secondary
 */
export function usePromoteLandingImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      query: EventListPromoteLandingImageCreateData['query']
    }) => {
      return eventListPromoteLandingImageCreate({
        path: { event_id: data.eventId },
        query: data.query,
        body: {} as any, // Empty body - API doesn't require body data
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate landing images list
      queryClient.invalidateQueries({
        queryKey: ['eventLandingImages', 'list', variables.eventId],
      })
      // Also invalidate general resources list
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
    },
  })
}

/**
 * Demote the main landing image to secondary
 * Updates the image tag without file re-upload
 */
export function useDemoteLandingImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      query: EventListDemoteLandingImageCreateData['query']
    }) => {
      return eventListDemoteLandingImageCreate({
        path: { event_id: data.eventId },
        query: data.query,
        body: {} as any, // Empty body - API doesn't require body data
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate landing images list
      queryClient.invalidateQueries({
        queryKey: ['eventLandingImages', 'list', variables.eventId],
      })
      // Also invalidate general resources list
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
    },
  })
}
