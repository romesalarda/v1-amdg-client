import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesDietaryRequirementsList,
  attendeesDietaryRequirementsRetrieve,
  attendeesDietaryRequirementsCreate,
  attendeesDietaryRequirementsUpdate,
  attendeesDietaryRequirementsPartialUpdate,
  attendeesDietaryRequirementsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesDietaryRequirementsListData,
  AttendeesDietaryRequirementsCreateData,
  AttendeesDietaryRequirementsUpdateData,
  AttendeesDietaryRequirementsPartialUpdateData,
  AttendeesDietaryRequirementsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeDietaryRequirements'] as const

/**
 * List all dietary requirements for an attendee
 */
export function useAttendeeDietaryRequirements(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesDietaryRequirementsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single dietary requirement assignment by ID
 */
export function useAttendeeDietaryRequirement(attendeeId: MaybeRefOrGetter<string>, requirementId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, requirementId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const rId = toValue(requirementId)
      return attendeesDietaryRequirementsRetrieve({ path: { attendee_id: aId, id: rId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(requirementId),
  })
}

/**
 * Create a new dietary requirement assignment for an attendee
 */
export function useCreateAttendeeDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesDietaryRequirementsCreateData['body'] }) =>
      attendeesDietaryRequirementsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Update an existing dietary requirement assignment (full update)
 */
export function useUpdateAttendeeDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId, body }: { attendeeId: string; requirementId: number; body: AttendeesDietaryRequirementsUpdateData['body'] }) =>
      attendeesDietaryRequirementsUpdate({ path: { attendee_id: attendeeId, id: requirementId }, body }),
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
 * Partially update an existing dietary requirement assignment
 */
export function usePartialUpdateAttendeeDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId, body }: { attendeeId: string; requirementId: number; body?: AttendeesDietaryRequirementsPartialUpdateData['body'] }) =>
      attendeesDietaryRequirementsPartialUpdate({ path: { attendee_id: attendeeId, id: requirementId }, body }),
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
 * Delete a dietary requirement assignment
 */
export function useDeleteAttendeeDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, requirementId }: { attendeeId: string; requirementId: number }) =>
      attendeesDietaryRequirementsDestroy({ path: { attendee_id: attendeeId, id: requirementId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.requirementId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
