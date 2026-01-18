import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesEmergencyContactsList,
  attendeesEmergencyContactsRetrieve,
  attendeesEmergencyContactsCreate,
  attendeesEmergencyContactsUpdate,
  attendeesEmergencyContactsPartialUpdate,
  attendeesEmergencyContactsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesEmergencyContactsListData,
  AttendeesEmergencyContactsCreateData,
  AttendeesEmergencyContactsUpdateData,
  AttendeesEmergencyContactsPartialUpdateData,
  AttendeesEmergencyContactsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeEmergencyContacts'] as const

/**
 * List all emergency contacts for an attendee
 */
export function useAttendeeEmergencyContacts(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesEmergencyContactsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single emergency contact by ID
 */
export function useAttendeeEmergencyContact(attendeeId: MaybeRefOrGetter<string>, contactId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, contactId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const cId = toValue(contactId)
      return attendeesEmergencyContactsRetrieve({ path: { attendee_id: aId, id: cId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(contactId),
  })
}

/**
 * Create a new emergency contact for an attendee
 */
export function useCreateAttendeeEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesEmergencyContactsCreateData['body'] }) =>
      attendeesEmergencyContactsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Update an existing emergency contact (full update)
 */
export function useUpdateAttendeeEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, contactId, body }: { attendeeId: string; contactId: number; body: AttendeesEmergencyContactsUpdateData['body'] }) =>
      attendeesEmergencyContactsUpdate({ path: { attendee_id: attendeeId, id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.contactId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Partially update an existing emergency contact
 */
export function usePartialUpdateAttendeeEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, contactId, body }: { attendeeId: string; contactId: number; body?: AttendeesEmergencyContactsPartialUpdateData['body'] }) =>
      attendeesEmergencyContactsPartialUpdate({ path: { attendee_id: attendeeId, id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.contactId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Delete an emergency contact
 */
export function useDeleteAttendeeEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, contactId }: { attendeeId: string; contactId: number }) =>
      attendeesEmergencyContactsDestroy({ path: { attendee_id: attendeeId, id: contactId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.contactId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
