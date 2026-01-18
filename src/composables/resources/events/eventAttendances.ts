import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventAttendancesList,
  eventAttendancesRetrieve,
  eventAttendancesCreate,
  eventAttendancesUpdate,
  eventAttendancesPartialUpdate,
  eventAttendancesDestroy,
} from '~/api/sdk.gen'
import type {
  EventAttendancesListData,
  EventAttendancesCreateData,
  EventAttendancesUpdateData,
  EventAttendancesPartialUpdateData,
  EventAttendancesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventAttendances'] as const

/**
 * List all event attendances
 */
export function useEventAttendances(params?: MaybeRefOrGetter<EventAttendancesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventAttendancesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event attendance by ID
 */
export function useEventAttendance(attendanceId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendanceId] as const,
    queryFn: () => {
      const id = toValue(attendanceId)
      return eventAttendancesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(attendanceId),
  })
}

/**
 * Create a new event attendance record
 */
export function useCreateEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventAttendancesCreateData['body']) => eventAttendancesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event attendance (full update)
 */
export function useUpdateEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendanceId, body }: { attendanceId: number; body: EventAttendancesUpdateData['body'] }) =>
      eventAttendancesUpdate({ path: { id: attendanceId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendanceId],
      })
    },
  })
}

/**
 * Partially update an existing event attendance
 */
export function usePartialUpdateEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendanceId, body }: { attendanceId: number; body?: EventAttendancesPartialUpdateData['body'] }) =>
      eventAttendancesPartialUpdate({ path: { id: attendanceId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendanceId],
      })
    },
  })
}

/**
 * Delete an event attendance record
 */
export function useDeleteEventAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendanceId: number) => eventAttendancesDestroy({ path: { id: attendanceId } }),
    onSuccess: (_, attendanceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', attendanceId],
      })
    },
  })
}
