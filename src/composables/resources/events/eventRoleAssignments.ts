import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventRoleAssignmentsList,
  eventRoleAssignmentsRetrieve,
  eventRoleAssignmentsCreate,
  eventRoleAssignmentsUpdate,
  eventRoleAssignmentsPartialUpdate,
  eventRoleAssignmentsDestroy,
} from '~/api/sdk.gen'
import type {
  EventRoleAssignmentsListData,
  EventRoleAssignmentsCreateData,
  EventRoleAssignmentsUpdateData,
  EventRoleAssignmentsPartialUpdateData,
  EventRoleAssignmentsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventRoleAssignments'] as const

/**
 * List all event role assignments
 */
export function useEventRoleAssignments(params?: MaybeRefOrGetter<EventRoleAssignmentsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventRoleAssignmentsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event role assignment by ID
 */
export function useEventRoleAssignment(assignmentId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', assignmentId] as const,
    queryFn: () => {
      const id = toValue(assignmentId)
      return eventRoleAssignmentsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(assignmentId),
  })
}

/**
 * Create a new event role assignment
 */
export function useCreateEventRoleAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventRoleAssignmentsCreateData['body']) => eventRoleAssignmentsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event role assignment (full update)
 */
export function useUpdateEventRoleAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: number; body: EventRoleAssignmentsUpdateData['body'] }) =>
      eventRoleAssignmentsUpdate({ path: { id: assignmentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.assignmentId],
      })
    },
  })
}

/**
 * Partially update an existing event role assignment
 */
export function usePartialUpdateEventRoleAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: number; body?: EventRoleAssignmentsPartialUpdateData['body'] }) =>
      eventRoleAssignmentsPartialUpdate({ path: { id: assignmentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.assignmentId],
      })
    },
  })
}

/**
 * Delete an event role assignment
 */
export function useDeleteEventRoleAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: number) => eventRoleAssignmentsDestroy({ path: { id: assignmentId } }),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', assignmentId],
      })
    },
  })
}
