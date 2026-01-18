import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesMedicalConditionsList,
  attendeesMedicalConditionsRetrieve,
  attendeesMedicalConditionsCreate,
  attendeesMedicalConditionsUpdate,
  attendeesMedicalConditionsPartialUpdate,
  attendeesMedicalConditionsDestroy,
} from '~/api/sdk.gen'
import type {
  AttendeesMedicalConditionsListData,
  AttendeesMedicalConditionsCreateData,
  AttendeesMedicalConditionsUpdateData,
  AttendeesMedicalConditionsPartialUpdateData,
  AttendeesMedicalConditionsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeMedicalConditions'] as const

/**
 * List all medical conditions for an attendee
 */
export function useAttendeeMedicalConditions(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesMedicalConditionsList({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Get a single medical condition assignment by ID
 */
export function useAttendeeMedicalCondition(attendeeId: MaybeRefOrGetter<string>, conditionId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId, conditionId] as const,
    queryFn: () => {
      const aId = toValue(attendeeId)
      const cId = toValue(conditionId)
      return attendeesMedicalConditionsRetrieve({ path: { attendee_id: aId, id: cId } })
    },
    enabled: () => !!toValue(attendeeId) && !!toValue(conditionId),
  })
}

/**
 * Create a new medical condition assignment for an attendee
 */
export function useCreateAttendeeMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesMedicalConditionsCreateData['body'] }) =>
      attendeesMedicalConditionsCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Update an existing medical condition assignment (full update)
 */
export function useUpdateAttendeeMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, conditionId, body }: { attendeeId: string; conditionId: number; body: AttendeesMedicalConditionsUpdateData['body'] }) =>
      attendeesMedicalConditionsUpdate({ path: { attendee_id: attendeeId, id: conditionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.conditionId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Partially update an existing medical condition assignment
 */
export function usePartialUpdateAttendeeMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, conditionId, body }: { attendeeId: string; conditionId: number; body?: AttendeesMedicalConditionsPartialUpdateData['body'] }) =>
      attendeesMedicalConditionsPartialUpdate({ path: { attendee_id: attendeeId, id: conditionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.conditionId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}

/**
 * Delete a medical condition assignment
 */
export function useDeleteAttendeeMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, conditionId }: { attendeeId: string; conditionId: number }) =>
      attendeesMedicalConditionsDestroy({ path: { attendee_id: attendeeId, id: conditionId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId, variables.conditionId],
      })
      queryClient.invalidateQueries({ queryKey: ['attendees', 'detail', variables.attendeeId] })
    },
  })
}
