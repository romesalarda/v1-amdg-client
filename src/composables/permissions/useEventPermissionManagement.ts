/**
 * Event Permission Management Composable
 * 
 * Handles assigning, revoking, and checking user permissions for events.
 * Uses the custom event actions: assign-permission, revoke-permission, check-permissions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListAssignPermissionCreate,
  eventListRevokePermissionDestroy,
  eventListCheckPermissionsRetrieve,
} from '~/api/sdk.gen'
import type { AssignPermissionRequest, RevokePermissionRequest, PermissionWithAccess } from '~/types/permissions'

const PERMISSION_MANAGEMENT_KEY = ['eventPermissionManagement'] as const

/**
 * Assign a permission to a user for an event
 * 
 * @example
 * ```ts
 * const { mutate: assignPermission } = useAssignEventPermission(eventId)
 * 
 * assignPermission({
 *   user_id: 123,
 *   permission_id: 456,
 *   read_only: false,
 *   allow_create: true,
 *   allow_update: true,
 *   allow_delete: false,
 * })
 * ```
 */
export function useAssignEventPermission(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: AssignPermissionRequest) => {
      const id = toValue(eventId)
      
      return eventListAssignPermissionCreate({
        path: { url_safe_title: id },
        body: {
          user_id: request.user_id,
          permission_id: request.permission_id,
          read_only: request.read_only ?? false,
          allow_create: request.allow_create ?? false,
          allow_update: request.allow_update ?? false,
          allow_delete: request.allow_delete ?? false,
        },
      })
    },
    onSuccess: (data, variables) => {
      const id = toValue(eventId)
      
      // Invalidate permission-related queries
      queryClient.invalidateQueries({
        queryKey: ['eventPermissionAssignments'],
      })
      
      // Invalidate the check-permissions query for this event
      queryClient.invalidateQueries({
        queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id],
      })
      
      // Invalidate event detail to update user_permissions
      queryClient.invalidateQueries({
        queryKey: ['events', 'detail', id],
      })
      
      // Optionally invalidate for specific user
      if (variables.user_id) {
        queryClient.invalidateQueries({
          queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id, variables.user_id],
        })
      }
    },
  })
}

/**
 * Revoke a permission from a user for an event
 * 
 * @example
 * ```ts
 * const { mutate: revokePermission } = useRevokeEventPermission(eventId)
 * 
 * revokePermission({ assignment_id: 789 })
 * ```
 */
export function useRevokeEventPermission(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: RevokePermissionRequest) => {
      const id = toValue(eventId)
      
      return eventListRevokePermissionDestroy({
        path: { url_safe_title: id },
        query: { assignment_id: request.assignment_id },
      })
    },
    // Optimistic update: immediately remove from cache
    onMutate: async (request) => {
      const id = toValue(eventId)
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id],
      })
      
      // Snapshot the previous value
      const previousPermissions = queryClient.getQueryData([
        ...PERMISSION_MANAGEMENT_KEY,
        'check',
        id,
      ])
      
      // Optimistically update to remove the permission
      queryClient.setQueryData(
        [...PERMISSION_MANAGEMENT_KEY, 'check', id],
        (old: any) => {
          if (!old?.assigned_permissions) return old
          
          return {
            ...old,
            assigned_permissions: old.assigned_permissions.filter(
              (p: any) => p.id !== request.assignment_id
            ),
          }
        }
      )
      
      return { previousPermissions }
    },
    onError: (err, request, context) => {
      // Rollback on error
      if (context?.previousPermissions) {
        const id = toValue(eventId)
        queryClient.setQueryData(
          [...PERMISSION_MANAGEMENT_KEY, 'check', id],
          context.previousPermissions
        )
      }
    },
    onSuccess: () => {
      const id = toValue(eventId)
      
      // Invalidate all permission-related queries
      queryClient.invalidateQueries({
        queryKey: ['eventPermissionAssignments'],
      })
      
      queryClient.invalidateQueries({
        queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id],
      })
      
      queryClient.invalidateQueries({
        queryKey: ['events', 'detail', id],
      })
    },
  })
}

/**
 * Check permissions for a user on an event
 * 
 * This fetches the comprehensive permission details from the API.
 * For the current user, this is also included in the event detail,
 * but this endpoint allows checking permissions for other users.
 * 
 * @param eventId - The event ID
 * @param userId - Optional user ID to check (defaults to current user)
 * 
 * @example
 * ```ts
 * // Check current user's permissions
 * const { data: myPermissions } = useCheckEventPermissions(eventId)
 * 
 * // Check another user's permissions (requires admin/creator)
 * const { data: userPermissions } = useCheckEventPermissions(eventId, userId)
 * ```
 */
export function useCheckEventPermissions(
  eventId: MaybeRefOrGetter<string>,
  userId?: MaybeRefOrGetter<number | undefined>
) {
  return useQuery({
    queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', eventId, userId] as const,
    queryFn: async () => {
      const id = toValue(eventId)
      const user = toValue(userId)
      
      const response = await eventListCheckPermissionsRetrieve({
        path: { url_safe_title: id },
        query: user ? { user_id: user } : undefined,
      })
      
      return response.data
    },
    enabled: () => !!toValue(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
  })
}

/**
 * Bulk assign permissions to a user
 * 
 * Assigns multiple permissions in sequence. Use this when you need to
 * grant a user access to multiple categories at once.
 * 
 * @example
 * ```ts
 * const { mutate: bulkAssign } = useBulkAssignEventPermissions(eventId)
 * 
 * bulkAssign({
 *   user_id: 123,
 *   permissions: [
 *     { permission_id: 1, read_only: true },
 *     { permission_id: 2, allow_create: true, allow_update: true },
 *   ]
 * })
 * ```
 */
export function useBulkAssignEventPermissions(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: {
      user_id: number
      permissions: Array<Omit<AssignPermissionRequest, 'user_id'>>
    }) => {
      const id = toValue(eventId)
      
      // Assign permissions sequentially
      const results = []
      for (const perm of request.permissions) {
        const result = await eventListAssignPermissionCreate({
          path: { url_safe_title: id },
          body: {
            user_id: request.user_id,
            permission_id: perm.permission_id,
            read_only: perm.read_only ?? false,
            allow_create: perm.allow_create ?? false,
            allow_update: perm.allow_update ?? false,
            allow_delete: perm.allow_delete ?? false,
          },
        })
        results.push(result)
      }
      
      return results
    },
    onSuccess: (data, variables) => {
      const id = toValue(eventId)
      
      // Invalidate all permission queries
      queryClient.invalidateQueries({
        queryKey: ['eventPermissionAssignments'],
      })
      
      queryClient.invalidateQueries({
        queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id],
      })
      
      queryClient.invalidateQueries({
        queryKey: ['events', 'detail', id],
      })
      
      if (variables.user_id) {
        queryClient.invalidateQueries({
          queryKey: [...PERMISSION_MANAGEMENT_KEY, 'check', id, variables.user_id],
        })
      }
    },
  })
}
