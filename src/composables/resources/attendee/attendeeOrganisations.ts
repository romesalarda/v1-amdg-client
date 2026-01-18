import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesOrganisationsList,
  attendeesOrganisationsRetrieve,
  attendeesOrganisationsCreate,
  attendeesOrganisationsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesOrganisationsListData,
  AttendeesOrganisationsCreateData,
  AttendeesOrganisationsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeOrganisations'] as const

/**
 * List all organisation assignments for an attendee
 */
export function useAttendeeOrganisations(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesOrganisationsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single organisation assignment by ID
 */
export function useAttendeeOrganisation(attendeeId: MaybeRefOrGetter<string>, organisationId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, organisationId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const oId = toValue(organisationId)
      return attendeesOrganisationsRetrieve({ path: { attendee_id: aId, id: oId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(organisationId),
  })
}

/**
 * Create a new organisation assignment for an attendee
 */
export function useCreateAttendeeOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesOrganisationsCreateData['body'] }) =>
      attendeesOrganisationsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Delete an organisation assignment
 */
export function useDeleteAttendeeOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, organisationId }: { attendeeId: string; organisationId: number }) =>
      attendeesOrganisationsDestroy({ path: { attendee_id: attendeeId, id: organisationId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.organisationId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
