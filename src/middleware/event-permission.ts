/**
 * Event Permission Middleware
 * 
 * Enforces event-based permissions using route meta configuration.
 * Blocks navigation until permissions are verified.
 * 
 * Usage in pages:
 * ```ts
 * definePageMeta({
 *   middleware: ['auth', 'event-permission'],
 *   eventPermission: {
 *     category: 'REGISTRATION',
 *     action: 'create'
 *   }
 * })
 * 
 * // Multiple permissions (any)
 * definePageMeta({
 *   middleware: 'event-permission',
 *   eventPermission: {
 *     anyOf: [
 *       { category: 'REGISTRATION', action: 'read' },
 *       { category: 'STAFF_MANAGEMENT', action: 'read' }
 *     ]
 *   }
 * })
 * 
 * // Multiple permissions (all required)
 * definePageMeta({
 *   middleware: 'event-permission',
 *   eventPermission: {
 *     allOf: [
 *       { category: 'REGISTRATION', action: 'read' },
 *       { category: 'PRODUCT_MANAGEMENT', action: 'read' }
 *     ]
 *   }
 * })
 * ```
 */

import { eventListRetrieve } from '~/api/sdk.gen'
import { hasPermission, checkMultiplePermissions } from '~/composables/permissions'
import type { PermissionCategory, CRUDAction, UserEventPermissions } from '~/types/permissions'
import type { QueryClient } from '@tanstack/vue-query'

interface PermissionRequirement {
  category: PermissionCategory
  action?: CRUDAction
}

interface EventPermissionMeta {
  // Single permission check
  category?: PermissionCategory
  action?: CRUDAction
  
  // Multiple permission checks
  anyOf?: PermissionRequirement[]
  allOf?: PermissionRequirement[]
  
  // Custom error message
  deniedMessage?: string
  
  // Custom redirect on denial
  deniedRedirect?: string
}

export default defineNuxtRouteMiddleware(async (to) => {
  // Get event permission configuration from route meta
  const permissionMeta = to.meta.eventPermission as EventPermissionMeta | undefined

  if (!permissionMeta) {
    // No permission check configured for this route
    return
  }

  // Extract event ID from route params
  const eventId = to.params.id as string | undefined

  if (!eventId) {
    console.error('[event-permission] No event ID found in route params')
    return navigateTo('/403')
  }

  try {
    // Use TanStack Query cache if available, otherwise fetch
    const { $queryClient } = useNuxtApp()
    const queryKey = ['events', 'detail', eventId]
    
    // Try to get from cache first
    let eventData = ($queryClient as QueryClient | undefined)?.getQueryData(queryKey) as any

    if (!eventData) {
      // Fetch from API if not in cache
      const response = await eventListRetrieve({
        path: { event_id: eventId },
      })
      eventData = response.data

      // Cache it for future use
      if ($queryClient) {
        ($queryClient as QueryClient).setQueryData(queryKey, eventData)
      }
    }

    const permissions = eventData?.user_permissions as UserEventPermissions | undefined

    if (!permissions) {
      console.error('[event-permission] No user_permissions found in event data')
      return navigateTo('/403')
    }

    // Check permissions based on configuration
    const hasAccess = checkPermissionRequirement(permissions, permissionMeta)

    if (!hasAccess) {
      // Permission denied - redirect to event dashboard with error
      const defaultMessage = getPermissionDeniedMessage(permissionMeta)
      const errorMessage = permissionMeta.deniedMessage || defaultMessage

      // Custom redirect or default to event dashboard
      if (permissionMeta.deniedRedirect) {
        return navigateTo({
          path: permissionMeta.deniedRedirect,
          query: { error: 'permission_denied', message: errorMessage },
        })
      }

      // Default: redirect to event page with error
      return navigateTo({
        path: `/events/${eventId}`,
        query: { 
          error: 'permission_denied',
          message: errorMessage,
        },
      })
    }

    // Permission granted - allow navigation
  } catch (error) {
    console.error('[event-permission] Error checking permissions:', error)
    
    // On error, redirect to 403
    return navigateTo('/403')
  }
})

/**
 * Check if user meets the permission requirement
 */
function checkPermissionRequirement(
  permissions: UserEventPermissions,
  meta: EventPermissionMeta
): boolean {
  // Single permission check
  if (meta.category) {
    const result = hasPermission(
      permissions,
      meta.category,
      meta.action || 'read'
    )
    return result.allowed
  }

  // Multiple permissions (any of)
  if (meta.anyOf && meta.anyOf.length > 0) {
    return meta.anyOf.some(req => {
      const result = hasPermission(
        permissions,
        req.category,
        req.action || 'read'
      )
      return result.allowed
    })
  }

  // Multiple permissions (all of)
  if (meta.allOf && meta.allOf.length > 0) {
    const checks = meta.allOf.map(req => ({
      category: req.category,
      action: req.action || 'read' as CRUDAction,
    }))
    return checkMultiplePermissions(permissions, checks)
  }

  // No valid configuration
  return false
}

/**
 * Generate a user-friendly error message based on the permission requirement
 */
function getPermissionDeniedMessage(meta: EventPermissionMeta): string {
  if (meta.category) {
    const action = meta.action || 'access'
    const category = formatCategory(meta.category)
    return `You don't have permission to ${action} ${category}.`
  }

  if (meta.anyOf && meta.anyOf.length > 0) {
    const categories = meta.anyOf.map(r => formatCategory(r.category)).join(' or ')
    return `You don't have permission to access ${categories}.`
  }

  if (meta.allOf && meta.allOf.length > 0) {
    return 'You don\'t have the required permissions to access this page.'
  }

  return 'You don\'t have permission to access this page.'
}

/**
 * Format category name for display
 */
function formatCategory(category: PermissionCategory): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
