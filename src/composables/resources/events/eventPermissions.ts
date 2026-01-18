import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventPermissionsList,
  eventPermissionsRetrieve,
  eventPermissionsCreate,
  eventPermissionsUpdate,
  eventPermissionsPartialUpdate,
  eventPermissionsDestroy,
} from '~/api/sdk.gen'
import type {
  EventPermissionsListData,
  EventPermissionsCreateData,
  EventPermissionsUpdateData,
  EventPermissionsPartialUpdateData,
  EventPermissionsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventPermissions'] as const

/**
 * List all event permissions
 */
export function useEventPermissions(params?: MaybeRefOrGetter<EventPermissionsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventPermissionsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event permission by ID
 */
export function useEventPermission(permissionId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', permissionId] as const,
    queryFn: () => {
      const id = toValue(permissionId)
      return eventPermissionsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(permissionId),
  })
}

/**
 * Create a new event permission
 */
export function useCreateEventPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventPermissionsCreateData['body']) => eventPermissionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event permission (full update)
 */
export function useUpdateEventPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ permissionId, body }: { permissionId: number; body: EventPermissionsUpdateData['body'] }) =>
      eventPermissionsUpdate({ path: { id: permissionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.permissionId],
      })
    },
  })
}

/**
 * Partially update an existing event permission
 */
export function usePartialUpdateEventPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ permissionId, body }: { permissionId: number; body?: EventPermissionsPartialUpdateData['body'] }) =>
      eventPermissionsPartialUpdate({ path: { id: permissionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.permissionId],
      })
    },
  })
}

/**
 * Delete an event permission
 */
export function useDeleteEventPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (permissionId: number) => eventPermissionsDestroy({ path: { id: permissionId } }),
    onSuccess: (_, permissionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', permissionId],
      })
    },
  })
}
