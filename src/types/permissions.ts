/**
 * Permission-related types for the event system
 * 
 * These types extend the auto-generated SDK types with additional
 * utility types for permission checking and management.
 */

import type { EventPermission, EventPermissionAssignment } from '~/api/types.gen'

/**
 * Permission categories from EventPermissionCategoryChoices
 */
export type PermissionCategory =
  | 'GENERAL'
  | 'REGISTRATION'
  | 'PRODUCT_MANAGEMENT'
  | 'CONTENT_MANAGEMENT'
  | 'STAFF_MANAGEMENT'
  | 'REPORTING'

/**
 * CRUD action types
 */
export type CRUDAction = 'create' | 'read' | 'update' | 'delete'

/**
 * Extended permission assignment with effective access details
 */
export interface PermissionWithAccess {
  id: number
  permission_code: string
  permission_name: string
  permission_category: PermissionCategory
  read_only: boolean
  allow_create: boolean
  allow_update: boolean
  allow_delete: boolean
  has_full_access: boolean
  effective_access: {
    can_read: boolean
    can_create: boolean
    can_update: boolean
    can_delete: boolean
  }
  assigned_at: string
  assigned_by_email?: string | null
  assigned_by_name?: string | null
}

/**
 * User permissions for an event (from EventDetail)
 */
export interface UserEventPermissions {
  is_creator: boolean
  is_staff_member: boolean
  is_admin: boolean
  can_manage_event: boolean
  can_manage_staff: boolean
  can_manage_invites: boolean
  can_manage_resources: boolean
  can_delete_event: boolean
  assigned_permissions: PermissionWithAccess[]
  assigned_roles: string[]
}

/**
 * Permission check parameters
 */
export interface PermissionCheck {
  category: PermissionCategory
  action?: CRUDAction
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason: 'admin' | 'creator' | 'staff' | 'permission' | 'role' | 'denied'
  details?: string
}

/**
 * Request to assign a permission to a user
 */
export interface AssignPermissionRequest {
  user_id: number
  permission_id: number
  read_only?: boolean
  allow_create?: boolean
  allow_update?: boolean
  allow_delete?: boolean
}

/**
 * Request to revoke a permission from a user
 */
export interface RevokePermissionRequest {
  assignment_id: number
}

/**
 * Simplified permission info for UI display
 */
export interface PermissionInfo {
  code: string
  name: string
  category: PermissionCategory
  description?: string
}
