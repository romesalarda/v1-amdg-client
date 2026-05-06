import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListRemoveResourceDestroy,
  eventListResourcesList,
  eventListUpdateResourcePartialUpdate,
  eventListPromoteLandingImageCreate,
  eventListDemoteLandingImageCreate,
} from '~/api/sdk.gen'
import { uploadMultipart } from '~/utils/upload'
import type {
  EventListAddResourceCreateData,
  EventListAddResourceCreateResponse,
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
        path: { url_safe_title: id },
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
      const formData = new FormData()
      const body = data.body

      if (body?.name) formData.append('name', body.name)
      if (body?.description) formData.append('description', body.description)
      if (body?.tag) formData.append('tag', body.tag)
      if (body?.resource_type) formData.append('resource_type', body.resource_type)
      if (typeof body?.public === 'boolean') formData.append('public', String(body.public))
      if (body?.file) formData.append('file', body.file)
      if (body?.image) formData.append('image', body.image)
      if (body?.link) formData.append('link', body.link)

      return uploadMultipart<EventListAddResourceCreateResponse>(
        `/api/event/list/${data.eventId}/add-resource/`,
        formData,
        { method: 'POST' }
      )
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
        path: { url_safe_title: data.eventId },
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
        path: { url_safe_title: data.eventId },
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
        path: { url_safe_title: data.eventId },
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
        path: { url_safe_title: data.eventId },
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
