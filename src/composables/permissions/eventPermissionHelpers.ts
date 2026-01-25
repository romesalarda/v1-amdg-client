/**
 * Event Permission Helper Utilities
 * 
 * Pure functions for checking and validating event permissions.
 * These helpers implement the permission logic defined in the backend:
 * - ADMINISTRATIVE role bypasses all checks
 * - Event creators have full access
 * - read_only flag takes precedence over other CRUD flags
 * - Most permissive wins: if role OR permission grants access, allow it
 */

import type {
  PermissionCategory,
  CRUDAction,
  UserEventPermissions,
  PermissionWithAccess,
  PermissionCheckResult,
} from '~/types/permissions'

/**
 * Check if user has a specific permission for a category and action
 * 
 * @param permissions - User's event permissions
 * @param category - Permission category to check
 * @param action - CRUD action to check (defaults to 'read')
 * @returns Permission check result with reason
 */
export function hasPermission(
  permissions: UserEventPermissions | null | undefined,
  category: PermissionCategory,
  action: CRUDAction = 'read',
): PermissionCheckResult {
  if (!permissions) {
    return { allowed: false, reason: 'denied', details: 'No permissions available' }
  }

  // Admin bypass
  if (permissions.is_admin) {
    return { allowed: true, reason: 'admin', details: 'Django staff/superuser' }
  }

  // Creator bypass
  if (permissions.is_creator) {
    return { allowed: true, reason: 'creator', details: 'Event creator' }
  }

  // Check if user has ADMINISTRATIVE role
  const hasAdminRole = permissions.assigned_roles?.some(
    role => role.toLowerCase().includes('admin')
  )
  if (hasAdminRole) {
    return { allowed: true, reason: 'role', details: 'Administrative role' }
  }

  // Check explicit permission assignments for this category
  const categoryPermissions = permissions.assigned_permissions?.filter(
    p => p.permission_category === category
  ) || []

  if (categoryPermissions.length === 0) {
    return { allowed: false, reason: 'denied', details: `No ${category} permissions assigned` }
  }

  // Check if ANY permission grants the required action (most permissive wins)
  for (const perm of categoryPermissions) {
    if (permissionGrantsAction(perm, action)) {
      return {
        allowed: true,
        reason: 'permission',
        details: `Permission: ${perm.permission_name}`,
      }
    }
  }

  return {
    allowed: false,
    reason: 'denied',
    details: `${category} permission exists but doesn't grant ${action} access`,
  }
}

/**
 * Check if a specific permission assignment grants access for an action
 * 
 * Logic:
 * - If read_only=true, only 'read' action is allowed
 * - Otherwise, check specific CRUD flags
 * - Any write permission (create/update/delete) implies read permission
 */
export function permissionGrantsAction(
  permission: PermissionWithAccess,
  action: CRUDAction,
): boolean {
  // If read_only is true, only allow read
  if (permission.read_only) {
    return action === 'read'
  }

  // Check specific action flags
  switch (action) {
    case 'create':
      return permission.allow_create
    case 'update':
      return permission.allow_update
    case 'delete':
      return permission.allow_delete
    case 'read':
      // Can read if has any write permission
      return permission.allow_create || permission.allow_update || permission.allow_delete
    default:
      return false
  }
}

/**
 * Check if user can perform any action for a category
 */
export function hasAnyPermission(
  permissions: UserEventPermissions | null | undefined,
  category: PermissionCategory,
): boolean {
  return hasPermission(permissions, category, 'read').allowed
}

/**
 * Check if user has full CRUD access for a category
 */
export function hasFullAccess(
  permissions: UserEventPermissions | null | undefined,
  category: PermissionCategory,
): boolean {
  if (!permissions) return false

  // Admins and creators always have full access
  if (permissions.is_admin || permissions.is_creator) return true

  // Check if any permission for this category has full access
  const categoryPermissions = permissions.assigned_permissions?.filter(
    p => p.permission_category === category
  ) || []

  return categoryPermissions.some(p => p.has_full_access)
}

/**
 * Get all categories user has access to
 */
export function getAccessibleCategories(
  permissions: UserEventPermissions | null | undefined,
): PermissionCategory[] {
  if (!permissions) return []

  // Admins and creators have access to all categories
  if (permissions.is_admin || permissions.is_creator) {
    return [
      'GENERAL',
      'REGISTRATION',
      'PRODUCT_MANAGEMENT',
      'CONTENT_MANAGEMENT',
      'STAFF_MANAGEMENT',
      'REPORTING',
    ]
  }

  // Get unique categories from assigned permissions
  const categories = new Set<PermissionCategory>()
  permissions.assigned_permissions?.forEach(p => {
    if (p.permission_category) {
      categories.add(p.permission_category as PermissionCategory)
    }
  })

  return Array.from(categories)
}

/**
 * Check multiple permissions at once
 */
export function checkMultiplePermissions(
  permissions: UserEventPermissions | null | undefined,
  checks: Array<{ category: PermissionCategory; action?: CRUDAction }>,
): boolean {
  return checks.every(check =>
    hasPermission(permissions, check.category, check.action || 'read').allowed
  )
}

/**
 * Get permission summary for a category
 */
export function getPermissionSummary(
  permissions: UserEventPermissions | null | undefined,
  category: PermissionCategory,
): {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  isReadOnly: boolean
  hasFullAccess: boolean
} {
  if (!permissions) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      isReadOnly: false,
      hasFullAccess: false,
    }
  }

  // Admins and creators have full access
  if (permissions.is_admin || permissions.is_creator) {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      isReadOnly: false,
      hasFullAccess: true,
    }
  }

  const canCreate = hasPermission(permissions, category, 'create').allowed
  const canRead = hasPermission(permissions, category, 'read').allowed
  const canUpdate = hasPermission(permissions, category, 'update').allowed
  const canDelete = hasPermission(permissions, category, 'delete').allowed

  const categoryPerms = permissions.assigned_permissions?.filter(
    p => p.permission_category === category
  ) || []

  const isReadOnly = categoryPerms.every(p => p.read_only)
  const hasFull = hasFullAccess(permissions, category)

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isReadOnly,
    hasFullAccess: hasFull,
  }
}

/**
 * Validate permission assignment values
 */
export function validatePermissionFlags(flags: {
  read_only?: boolean
  allow_create?: boolean
  allow_update?: boolean
  allow_delete?: boolean
}): { valid: boolean; warning?: string } {
  // If read_only is true and other flags are also true, warn about it
  if (flags.read_only && (flags.allow_create || flags.allow_update || flags.allow_delete)) {
    return {
      valid: true,
      warning: 'read_only flag will take precedence over other permissions',
    }
  }

  // If all flags are false (including read_only), it's valid but grants no access
  if (!flags.read_only && !flags.allow_create && !flags.allow_update && !flags.allow_delete) {
    return {
      valid: true,
      warning: 'This assignment grants no access - consider if this is intentional',
    }
  }

  return { valid: true }
}
