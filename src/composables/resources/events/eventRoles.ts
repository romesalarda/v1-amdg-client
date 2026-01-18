import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventRolesList,
  eventRolesRetrieve,
  eventRolesCreate,
  eventRolesUpdate,
  eventRolesPartialUpdate,
  eventRolesDestroy,
} from '~/api/sdk.gen'
import type {
  EventRolesListData,
  EventRolesCreateData,
  EventRolesUpdateData,
  EventRolesPartialUpdateData,
  EventRolesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventRoles'] as const

/**
 * List all event roles
 */
export function useEventRoles(params?: MaybeRefOrGetter<EventRolesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventRolesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event role by ID
 */
export function useEventRole(roleId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', roleId] as const,
    queryFn: () => {
      const id = toValue(roleId)
      return eventRolesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(roleId),
  })
}

/**
 * Create a new event role
 */
export function useCreateEventRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventRolesCreateData['body']) => eventRolesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event role (full update)
 */
export function useUpdateEventRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: number; body: EventRolesUpdateData['body'] }) =>
      eventRolesUpdate({ path: { id: roleId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.roleId],
      })
    },
  })
}

/**
 * Partially update an existing event role
 */
export function usePartialUpdateEventRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: number; body?: EventRolesPartialUpdateData['body'] }) =>
      eventRolesPartialUpdate({ path: { id: roleId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.roleId],
      })
    },
  })
}

/**
 * Delete an event role
 */
export function useDeleteEventRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: number) => eventRolesDestroy({ path: { id: roleId } }),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', roleId],
      })
    },
  })
}
