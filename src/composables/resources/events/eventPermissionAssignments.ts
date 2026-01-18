import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventPermissionAssignmentsList,
  eventPermissionAssignmentsRetrieve,
  eventPermissionAssignmentsCreate,
  eventPermissionAssignmentsUpdate,
  eventPermissionAssignmentsPartialUpdate,
  eventPermissionAssignmentsDestroy,
} from '~/api/sdk.gen'
import type {
  EventPermissionAssignmentsListData,
  EventPermissionAssignmentsCreateData,
  EventPermissionAssignmentsUpdateData,
  EventPermissionAssignmentsPartialUpdateData,
  EventPermissionAssignmentsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventPermissionAssignments'] as const

/**
 * List all event permission assignments
 */
export function useEventPermissionAssignments(params?: MaybeRefOrGetter<EventPermissionAssignmentsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventPermissionAssignmentsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event permission assignment by ID
 */
export function useEventPermissionAssignment(assignmentId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', assignmentId] as const,
    queryFn: () => {
      const id = toValue(assignmentId)
      return eventPermissionAssignmentsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(assignmentId),
  })
}

/**
 * Create a new event permission assignment
 */
export function useCreateEventPermissionAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventPermissionAssignmentsCreateData['body']) => eventPermissionAssignmentsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event permission assignment (full update)
 */
export function useUpdateEventPermissionAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: number; body: EventPermissionAssignmentsUpdateData['body'] }) =>
      eventPermissionAssignmentsUpdate({ path: { id: assignmentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.assignmentId],
      })
    },
  })
}

/**
 * Partially update an existing event permission assignment
 */
export function usePartialUpdateEventPermissionAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, body }: { assignmentId: number; body?: EventPermissionAssignmentsPartialUpdateData['body'] }) =>
      eventPermissionAssignmentsPartialUpdate({ path: { id: assignmentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.assignmentId],
      })
    },
  })
}

/**
 * Delete an event permission assignment
 */
export function useDeleteEventPermissionAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: number) => eventPermissionAssignmentsDestroy({ path: { id: assignmentId } }),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', assignmentId],
      })
    },
  })
}
