import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesAccessibilityRequirementsList,
  attendeesAccessibilityRequirementsRetrieve,
  attendeesAccessibilityRequirementsCreate,
  attendeesAccessibilityRequirementsUpdate,
  attendeesAccessibilityRequirementsPartialUpdate,
  attendeesAccessibilityRequirementsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesAccessibilityRequirementsListData,
  AttendeesAccessibilityRequirementsCreateData,
  AttendeesAccessibilityRequirementsUpdateData,
  AttendeesAccessibilityRequirementsPartialUpdateData,
  AttendeesAccessibilityRequirementsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeAccessibilityRequirements'] as const

/**
 * List all accessibility requirements for an attendee
 */
export function useAttendeeAccessibilityRequirements(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesAccessibilityRequirementsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single accessibility requirement assignment by ID
 */
export function useAttendeeAccessibilityRequirement(attendeeId: MaybeRefOrGetter<string>, requirementId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, requirementId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const rId = toValue(requirementId)
      return attendeesAccessibilityRequirementsRetrieve({ path: { attendee_id: aId, id: rId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(requirementId),
  })
}

/**
 * Create a new accessibility requirement assignment for an attendee
 */
export function useCreateAttendeeAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesAccessibilityRequirementsCreateData['body'] }) =>
      attendeesAccessibilityRequirementsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Update an existing accessibility requirement assignment (full update)
 */
export function useUpdateAttendeeAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId, body }: { attendeeId: string; requirementId: number; body: AttendeesAccessibilityRequirementsUpdateData['body'] }) =>
      attendeesAccessibilityRequirementsUpdate({ path: { attendee_id: attendeeId, id: requirementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.requirementId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Partially update an existing accessibility requirement assignment
 */
export function usePartialUpdateAttendeeAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId, body }: { attendeeId: string; requirementId: number; body?: AttendeesAccessibilityRequirementsPartialUpdateData['body'] }) =>
      attendeesAccessibilityRequirementsPartialUpdate({ path: { attendee_id: attendeeId, id: requirementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.requirementId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Delete an accessibility requirement assignment
 */
export function useDeleteAttendeeAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId }: { attendeeId: string; requirementId: number }) =>
      attendeesAccessibilityRequirementsDestroy({ path: { attendee_id: attendeeId, id: requirementId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.requirementId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
