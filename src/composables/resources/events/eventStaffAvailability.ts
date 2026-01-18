import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventStaffAvailabilityList,
  eventStaffAvailabilityRetrieve,
  eventStaffAvailabilityCreate,
  eventStaffAvailabilityUpdate,
  eventStaffAvailabilityPartialUpdate,
  eventStaffAvailabilityDestroy,
} from '~/api/sdk.gen'
import type {
  EventStaffAvailabilityListData,
  EventStaffAvailabilityCreateData,
  EventStaffAvailabilityUpdateData,
  EventStaffAvailabilityPartialUpdateData,
  EventStaffAvailabilityDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventStaffAvailability'] as const

/**
 * List all event staff availability records
 */
export function useEventStaffAvailabilities(params?: MaybeRefOrGetter<EventStaffAvailabilityListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStaffAvailabilityList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single staff availability record by ID
 */
export function useEventStaffAvailability(availabilityId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', availabilityId] as const,
    queryFn: () => {
      const id = toValue(availabilityId)
      return eventStaffAvailabilityRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(availabilityId),
  })
}

/**
 * Create a new staff availability record
 */
export function useCreateEventStaffAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventStaffAvailabilityCreateData['body']) => eventStaffAvailabilityCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a staff availability record (full update)
 */
export function useUpdateEventStaffAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ availabilityId, body }: { availabilityId: number; body: EventStaffAvailabilityUpdateData['body'] }) =>
      eventStaffAvailabilityUpdate({ path: { id: availabilityId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.availabilityId],
      })
    },
  })
}

/**
 * Partially update a staff availability record
 */
export function usePartialUpdateEventStaffAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ availabilityId, body }: { availabilityId: number; body?: EventStaffAvailabilityPartialUpdateData['body'] }) =>
      eventStaffAvailabilityPartialUpdate({ path: { id: availabilityId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.availabilityId],
      })
    },
  })
}

/**
 * Delete a staff availability record
 */
export function useDeleteEventStaffAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (availabilityId: number) => eventStaffAvailabilityDestroy({ path: { id: availabilityId } }),
    onSuccess: (_, availabilityId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', availabilityId],
      })
    },
  })
}
