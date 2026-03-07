import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesConsentsList,
  attendeesConsentsRetrieve,
  attendeesConsentsCreate,
  attendeesConsentsUpdate,
  attendeesConsentsPartialUpdate,
  attendeesConsentsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesConsentsListData,
  AttendeesConsentsCreateData,
  AttendeesConsentsUpdateData,
  AttendeesConsentsPartialUpdateData,
  AttendeesConsentsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeConsentsRelationship'] as const

/**
 * List all consent records for an attendee
 */
export function useAttendeeConsents(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesConsentsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single consent record by ID
 */
export function useAttendeeConsent(attendeeId: MaybeRefOrGetter<string>, consentId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, consentId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const cId = toValue(consentId)
      return attendeesConsentsRetrieve({ path: { attendee_id: aId, id: cId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(consentId),
  })
}

/**
 * Create a new consent record for an attendee
 */
export function useCreateAttendeeConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesConsentsCreateData['body'] }) =>
      attendeesConsentsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Update an existing consent record (full update)
 */
export function useUpdateAttendeeConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, consentId, body }: { attendeeId: string; consentId: number; body: AttendeesConsentsUpdateData['body'] }) =>
      attendeesConsentsUpdate({ path: { attendee_id: attendeeId, id: consentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.consentId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Partially update an existing consent record
 */
export function usePartialUpdateAttendeeConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, consentId, body }: { attendeeId: string; consentId: number; body?: AttendeesConsentsPartialUpdateData['body'] }) =>
      attendeesConsentsPartialUpdate({ path: { attendee_id: attendeeId, id: consentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.consentId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Delete a consent record
 */
export function useDeleteAttendeeConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, consentId }: { attendeeId: string; consentId: number }) =>
      attendeesConsentsDestroy({ path: { attendee_id: attendeeId, id: consentId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.consentId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
