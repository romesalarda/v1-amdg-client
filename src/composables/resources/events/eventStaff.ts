import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventStaffList,
  eventStaffRetrieve,
  eventStaffCreate,
  eventStaffUpdate,
  eventStaffPartialUpdate,
  eventStaffDestroy,
} from '~/api/sdk.gen'
import type {
  EventStaffListData,
  EventStaffCreateData,
  EventStaffUpdateData,
  EventStaffPartialUpdateData,
  EventStaffDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventStaff'] as const

/**
 * List all event staff members
 */
export function useEventStaff(params?: MaybeRefOrGetter<EventStaffListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStaffList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event staff member by ID
 */
export function useEventStaffMember(staffId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', staffId] as const,
    queryFn: () => {
      const id = toValue(staffId)
      return eventStaffRetrieve({ path: { staff_id: String(id) } })
    },
    enabled: () => !!toValue(staffId),
  })
}

/**
 * Add a staff member to an event
 */
export function useCreateEventStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventStaffCreateData['body']) => eventStaffCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an event staff member (full update)
 */
export function useUpdateEventStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, body }: { staffId: number; body: EventStaffUpdateData['body'] }) =>
      eventStaffUpdate({ path: { staff_id: String(staffId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.staffId],
      })
    },
  })
}

/**
 * Partially update an event staff member
 */
export function usePartialUpdateEventStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, body }: { staffId: number; body?: EventStaffPartialUpdateData['body'] }) =>
      eventStaffPartialUpdate({ path: { staff_id: String(staffId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.staffId],
      })
    },
  })
}

/**
 * Remove a staff member from an event
 */
export function useDeleteEventStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: number) => eventStaffDestroy({ path: { staff_id: String(staffId) } }),
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', staffId],
      })
    },
  })
}
