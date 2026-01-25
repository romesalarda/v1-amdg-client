/**
 * Current User Event Permissions Composable
 * 
 * Provides reactive access to the current user's permissions for an event.
 * Uses cached event data when available, with option to force API check.
 */

import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { eventListRetrieve } from '~/api/sdk.gen'
import type {
  UserEventPermissions,
  PermissionCategory,
  CRUDAction,
  PermissionCheckResult,
} from '~/types/permissions'
import {
  hasPermission,
  hasAnyPermission,
  hasFullAccess,
  getAccessibleCategories,
  getPermissionSummary,
} from './eventPermissionHelpers'

/**
 * Get current user's permissions for an event with helper methods
 * 
 * This composable provides reactive permission checking based on the
 * user_permissions field from EventDetail. It includes helper methods
 * for common permission checks.
 * 
 * @param eventId - The event ID to check permissions for
 * 
 * @example
 * ```vue
 * <script setup>
 * const eventId = ref('event-123')
 * const {
 *   permissions,
 *   isLoading,
 *   can,
 *   canAny,
 *   canFull,
 *   summary,
 *   accessibleCategories,
 *   isAdmin,
 *   isCreator,
 *   isStaffMember,
 * } = useCurrentUserEventPermissions(eventId)
 * 
 * // Use in template
 * if (can('REGISTRATION', 'create').allowed) {
 *   // Show create button
 * }
 * </script>
 * ```
 */
export function useCurrentUserEventPermissions(eventId: MaybeRefOrGetter<string>) {
  // Fetch event detail to get user_permissions
  const {
    data: eventData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', 'detail', eventId] as const,
    queryFn: async () => {
      const id = toValue(eventId)
      const response = await eventListRetrieve({
        path: { event_id: id },
      })
      return response.data
    },
    enabled: () => !!toValue(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Extract user_permissions from event data
  const permissions = computed<UserEventPermissions | null>(() => {
    if (!eventData.value?.user_permissions) return null
    
    // Transform to match our UserEventPermissions interface
    return {
      is_creator: eventData.value.user_permissions.is_creator,
      is_staff_member: eventData.value.user_permissions.is_staff_member,
      is_admin: eventData.value.user_permissions.is_admin,
      can_manage_event: eventData.value.user_permissions.can_manage_event,
      can_manage_staff: eventData.value.user_permissions.can_manage_staff,
      can_manage_invites: eventData.value.user_permissions.can_manage_invites,
      can_manage_resources: eventData.value.user_permissions.can_manage_resources,
      can_delete_event: eventData.value.user_permissions.can_delete_event,
      assigned_permissions: eventData.value.user_permissions.assigned_permissions as any || [],
      assigned_roles: eventData.value.user_permissions.assigned_roles || [],
    }
  })

  // Helper computed properties
  const isAdmin = computed(() => permissions.value?.is_admin ?? false)
  const isCreator = computed(() => permissions.value?.is_creator ?? false)
  const isStaffMember = computed(() => permissions.value?.is_staff_member ?? false)
  const canManageEvent = computed(() => permissions.value?.can_manage_event ?? false)
  const canManageStaff = computed(() => permissions.value?.can_manage_staff ?? false)
  const canManageInvites = computed(() => permissions.value?.can_manage_invites ?? false)
  const canManageResources = computed(() => permissions.value?.can_manage_resources ?? false)
  const canDeleteEvent = computed(() => permissions.value?.can_delete_event ?? false)

  /**
   * Check if user can perform a specific action on a category
   */
  const can = (
    category: PermissionCategory,
    action: CRUDAction = 'read'
  ): ComputedRef<PermissionCheckResult> => {
    return computed(() => hasPermission(permissions.value, category, action))
  }

  /**
   * Check if user has any access to a category
   */
  const canAny = (category: PermissionCategory): ComputedRef<boolean> => {
    return computed(() => hasAnyPermission(permissions.value, category))
  }

  /**
   * Check if user has full CRUD access to a category
   */
  const canFull = (category: PermissionCategory): ComputedRef<boolean> => {
    return computed(() => hasFullAccess(permissions.value, category))
  }

  /**
   * Get permission summary for a category
   */
  const summary = (category: PermissionCategory) => {
    return computed(() => getPermissionSummary(permissions.value, category))
  }

  /**
   * Get all categories the user has access to
   */
  const accessibleCategories = computed(() =>
    getAccessibleCategories(permissions.value)
  )

  /**
   * Check if user has specific high-level permissions
   */
  const hasManagementAccess = computed(() => {
    if (!permissions.value) return false
    return (
      permissions.value.is_admin ||
      permissions.value.is_creator ||
      permissions.value.is_staff_member
    )
  })

  return {
    // Raw data
    permissions,
    isLoading,
    error,
    refetch,

    // Quick access properties
    isAdmin,
    isCreator,
    isStaffMember,
    canManageEvent,
    canManageStaff,
    canManageInvites,
    canManageResources,
    canDeleteEvent,
    hasManagementAccess,
    accessibleCategories,

    // Helper functions
    can,
    canAny,
    canFull,
    summary,
  }
}

/**
 * Lightweight permission checker that only checks specific categories
 * 
 * Use this when you only need to check a few specific permissions
 * and don't want to load the entire event detail.
 * 
 * @example
 * ```ts
 * const { canCreate, canUpdate } = usePermissionChecker(
 *   permissions,
 *   'REGISTRATION'
 * )
 * ```
 */
export function usePermissionChecker(
  permissions: MaybeRefOrGetter<UserEventPermissions | null | undefined>,
  category: PermissionCategory
) {
  const perms = computed(() => toValue(permissions))

  const canCreate = computed(() =>
    hasPermission(perms.value, category, 'create').allowed
  )

  const canRead = computed(() =>
    hasPermission(perms.value, category, 'read').allowed
  )

  const canUpdate = computed(() =>
    hasPermission(perms.value, category, 'update').allowed
  )

  const canDelete = computed(() =>
    hasPermission(perms.value, category, 'delete').allowed
  )

  const hasAnyAccess = computed(() =>
    hasAnyPermission(perms.value, category)
  )

  const hasFullCategoryAccess = computed(() =>
    hasFullAccess(perms.value, category)
  )

  const permissionSummary = computed(() =>
    getPermissionSummary(perms.value, category)
  )

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasAnyAccess,
    hasFullAccess: hasFullCategoryAccess,
    summary: permissionSummary,
  }
}
