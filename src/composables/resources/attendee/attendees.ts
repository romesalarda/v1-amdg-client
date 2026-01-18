import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesList,
  attendeesRetrieve,
  attendeesCreate,
  attendeesUpdate,
  attendeesDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesListData,
  AttendeesCreateData,
  AttendeesUpdateData,
  AttendeesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendees'] as const

/**
 * List all attendees
 */
export function useAttendees(params?: MaybeRefOrGetter<AttendeesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single attendee by ID
 */
export function useAttendee(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesRetrieve({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Create a new attendee
 */
export function useCreateAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AttendeesCreateData['body']) => attendeesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing attendee
 */
export function useUpdateAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesUpdateData['body'] }) =>
      attendeesUpdate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId],
      })
    },
  })
}

/**
 * Delete an attendee
 */
export function useDeleteAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendeeId: string) => attendeesDestroy({ path: { attendee_id: attendeeId } }),
    onSuccess: (_, attendeeId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', attendeeId],
      })
    },
  })
}
