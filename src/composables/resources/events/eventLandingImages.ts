import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListAddLandingImageCreate,
  eventListLandingImagesList,
} from '~/api/sdk.gen'
import type {
  EventListAddLandingImageCreateData,
  EventListLandingImagesListData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventLandingImages'] as const

/**
 * List all landing images for an event
 * Includes both main and secondary landing images
 */
export function useEventLandingImages(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventListLandingImagesListData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventId, params],
    queryFn: () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)
      return eventListLandingImagesList({
        path: { url_safe_title: id },
        query: queryParams,
      })
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Add a new landing image to an event
 * Can be set as main or secondary landing image
 * If set as main, existing main image is automatically demoted to secondary
 */
export function useAddEventLandingImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      eventId: string
      body: EventListAddLandingImageCreateData['body']
    }) => {
      return eventListAddLandingImageCreate({
        path: { url_safe_title: data.eventId },
        body: data.body,
      })
    },
    onSuccess: (_data, variables) => {
      // Invalidate the landing images list for this event
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'list', variables.eventId],
      })
      // Also invalidate event details since main landing image might have changed
      queryClient.invalidateQueries({
        queryKey: ['events', 'detail', variables.eventId],
      })
    },
  })
}
