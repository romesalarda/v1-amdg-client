import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventTypesList,
  eventTypesRetrieve,
  eventTypesCreate,
  eventTypesUpdate,
  eventTypesPartialUpdate,
  eventTypesDestroy,
} from '~/api/sdk.gen'
import type {
  EventTypesListData,
  EventTypesCreateData,
  EventTypesUpdateData,
  EventTypesPartialUpdateData,
  EventTypesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventTypes'] as const

/**
 * List all event types
 */
export function useEventTypes(params?: MaybeRefOrGetter<EventTypesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventTypesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event type by ID
 */
export function useEventType(typeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', typeId] as const,
    queryFn: () => {
      const id = toValue(typeId)
      return eventTypesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(typeId),
  })
}

/**
 * Create a new event type
 */
export function useCreateEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventTypesCreateData['body']) => eventTypesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an event type (full update)
 */
export function useUpdateEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ typeId, body }: { typeId: number; body: EventTypesUpdateData['body'] }) =>
      eventTypesUpdate({ path: { id: typeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.typeId],
      })
    },
  })
}

/**
 * Partially update an event type
 */
export function usePartialUpdateEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ typeId, body }: { typeId: number; body?: EventTypesPartialUpdateData['body'] }) =>
      eventTypesPartialUpdate({ path: { id: typeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.typeId],
      })
    },
  })
}

/**
 * Delete an event type
 */
export function useDeleteEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (typeId: number) => eventTypesDestroy({ path: { id: typeId } }),
    onSuccess: (_, typeId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', typeId],
      })
    },
  })
}
