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

export interface PermissionRefreshOptions {
  /**
   * Time in milliseconds before data is considered stale
   * @default 300000 (5 minutes)
   */
  staleTime?: number

  /**
   * Automatically refetch when window regains focus
   * @default true
   */
  refetchOnWindowFocus?: boolean

  /**
   * Automatically refetch at a regular interval (in milliseconds)
   * Set to false or 0 to disable
   * @default false
   */
  refetchInterval?: number | false

  /**
   * Continue refetching in background even when window is not focused
   * @default false
   */
  refetchIntervalInBackground?: boolean
}

/**
 * Get current user's permissions for an event with helper methods
 * 
 * This composable provides reactive permission checking based on the
 * user_permissions field from EventDetail. It includes helper methods
 * for common permission checks.
 * 
 * @param eventId - The event ID to check permissions for
 * @param options - Configuration options for caching and auto-refresh behavior
 * 
 * @example
 * ```vue
 * <script setup>
 * const eventId = ref('event-123')
 * 
 * // Basic usage with defaults
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
 *   refresh,
 * } = useCurrentUserEventPermissions(eventId)
 * 
 * // With auto-refresh options
 * const permissions = useCurrentUserEventPermissions(eventId, {
 *   refetchOnWindowFocus: true,  // Refresh when tab gains focus
 *   refetchInterval: 60000,      // Refresh every minute
 *   staleTime: 30000,            // Consider stale after 30 seconds
 * })
 * 
 * // Manual refresh
 * await refresh()
 * 
 * // Use in template
 * if (can('REGISTRATION', 'create').allowed) {
 *   // Show create button
 * }
 * </script>
 * ```
 */
export function useCurrentUserEventPermissions(
  eventId: MaybeRefOrGetter<string>,
  options: PermissionRefreshOptions = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus = true,
    refetchInterval = false,
    refetchIntervalInBackground = false,
  } = options

  // Fetch event detail to get user_permissions
  // Use dedicated query key to avoid cache conflicts with useEvent composable
  const {
    data: eventData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['eventPermissions', 'userPermissions', eventId] as const,
    queryFn: async () => {
      const id = toValue(eventId)
      const response = await eventListRetrieve({
        path: { url_safe_title: id },
      })
      
      // CRITICAL: Validate that user_permissions exists
      // If it's missing, throw error to trigger retry and prevent bad data from replacing good cache
      if (!response.data?.user_permissions) {
        console.error('[Permissions] API response missing user_permissions - triggering retry:', response.data)
        throw new Error('API response missing user_permissions field')
      }
      
      console.log('[Permissions] Successfully loaded permissions:', response.data.user_permissions)
      return response.data
    },
    enabled: () => !!toValue(eventId),
    staleTime,
    refetchOnWindowFocus,
    refetchInterval,
    refetchIntervalInBackground,
    // Keep previous data while refetching to avoid "No permissions available"
    placeholderData: (previousData) => previousData,
    // Retry on failure (including when user_permissions is missing)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
  

  // Extract user_permissions from event data
  const permissions = computed<UserEventPermissions | null>(() => {
    if (!eventData.value?.user_permissions) {
      console.warn('[Permissions] No permissions in eventData:', {
        hasEventData: !!eventData.value,
        hasUserPermissions: !!eventData.value?.user_permissions,
        isLoading: isLoading.value,
        hasError: !!error.value,
      })
      console.log(eventData.value);
      
      return null
    }
    
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

  /**
   * Manually refresh permissions from the server
   * Useful when you know permissions have changed and need immediate update
   */
  const refresh = async () => {
    return await refetch()
  }

  return {
    // Raw data
    permissions,
    isLoading,
    error,
    refetch,
    refresh,

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
