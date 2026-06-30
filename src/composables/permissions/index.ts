/**
 * Event Permissions Module
 * 
 * Centralized exports for all permission-related functionality.
 * 
 * @example
 * ```ts
 * import {
 *   useCurrentUserEventPermissions,
 *   useAssignEventPermission,
 *   hasPermission,
 *   type PermissionCategory,
 * } from '~/composables/permissions'
 * ```
 */

// Composables
export {
  useCurrentUserEventPermissions,
  usePermissionChecker,
} from './useCurrentUserPermissions'

export {
  useCurrentLeaderPermissions,
} from './useCurrentLeaderPermissions'

export type {
  LeaderPermissionCode,
  LeaderPermissionCRUDAction,
  CurrentLeaderPermission,
} from './useCurrentLeaderPermissions'

export {
  useAssignEventPermission,
  useRevokeEventPermission,
  useCheckEventPermissions,
  useBulkAssignEventPermissions,
} from './useEventPermissionManagement'

// Helper utilities
export {
  hasPermission,
  permissionGrantsAction,
  hasAnyPermission,
  hasFullAccess,
  getAccessibleCategories,
  checkMultiplePermissions,
  getPermissionSummary,
  validatePermissionFlags,
} from './eventPermissionHelpers'

// Types
export type {
  PermissionCategory,
  CRUDAction,
  PermissionWithAccess,
  UserEventPermissions,
  PermissionCheck,
  PermissionCheckResult,
  AssignPermissionRequest,
  RevokePermissionRequest,
  PermissionInfo,
} from '~/types/permissions'
