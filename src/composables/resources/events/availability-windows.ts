import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListAvailabilityWindowsList,
  eventListAddAvailabilityWindowCreate,
  eventListUpdateAvailabilityWindowPartialUpdate,
  eventListRemoveAvailabilityWindowDestroy,
} from '~/api/sdk.gen'
import type {
  EventListAvailabilityWindowsListData,
  EventListAddAvailabilityWindowCreateData,
  EventListUpdateAvailabilityWindowPartialUpdateData,
  EventListRemoveAvailabilityWindowDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['events', 'availabilityWindows'] as const

/**
 * List all availability windows for an event
 */
export function useAvailabilityWindows(eventId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventId] as const,
    queryFn: () => {
      const id = toValue(eventId)
      if (!id) throw new Error('Event ID is required')
      return eventListAvailabilityWindowsList({ 
        path: { event_id: id },
      })
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Create a new availability window for an event
 */
export function useCreateAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      eventId, 
      body 
    }: { 
      eventId: string
      body: EventListAddAvailabilityWindowCreateData['body']
    }) =>
      eventListAddAvailabilityWindowCreate({
        path: { event_id: eventId },
        body,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the list query for this event
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      // Also invalidate the event detail query
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', variables.eventId] })
    },
  })
}

/**
 * Update an existing availability window
 */
export function useUpdateAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      eventId, 
      windowId,
      body 
    }: { 
      eventId: string
      windowId: string
      body: EventListUpdateAvailabilityWindowPartialUpdateData['body']
    }) =>
      eventListUpdateAvailabilityWindowPartialUpdate({
        path: { event_id: eventId },
        query: { window_id: windowId },
        body,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the list query for this event
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      // Also invalidate the event detail query
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', variables.eventId] })
    },
  })
}

/**
 * Delete an availability window
 */
export function useDeleteAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      eventId, 
      windowId 
    }: { 
      eventId: string
      windowId: string
    }) =>
      eventListRemoveAvailabilityWindowDestroy({
        path: { event_id: eventId },
        query: { window_id: windowId },
      }),
    onSuccess: (_, variables) => {
      // Invalidate the list query for this event
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      // Also invalidate the event detail query
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', variables.eventId] })
    },
  })
}
