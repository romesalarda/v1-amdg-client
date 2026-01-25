/**
 * Pre-configured Event Permission Middleware Helpers
 * 
 * These are convenience functions that create common permission configurations.
 * Use these in your route meta or create custom ones using the base middleware.
 */

import type { PermissionCategory, CRUDAction } from '~/types/permissions'

/**
 * Create a simple permission requirement
 */
export function requirePermission(category: PermissionCategory, action: CRUDAction = 'read') {
  return {
    category,
    action,
  }
}

/**
 * Require read access to a category
 */
export function canRead(category: PermissionCategory) {
  return requirePermission(category, 'read')
}

/**
 * Require create access to a category
 */
export function canCreate(category: PermissionCategory) {
  return requirePermission(category, 'create')
}

/**
 * Require update access to a category
 */
export function canUpdate(category: PermissionCategory) {
  return requirePermission(category, 'update')
}

/**
 * Require delete access to a category
 */
export function canDelete(category: PermissionCategory) {
  return requirePermission(category, 'delete')
}

/**
 * Require access to ANY of the specified permissions
 */
export function requireAny(...requirements: Array<{ category: PermissionCategory; action?: CRUDAction }>) {
  return {
    anyOf: requirements,
  }
}

/**
 * Require access to ALL of the specified permissions
 */
export function requireAll(...requirements: Array<{ category: PermissionCategory; action?: CRUDAction }>) {
  return {
    allOf: requirements,
  }
}

/**
 * Common permission configurations
 */
export const EventPermissionPresets = {
  // Registration permissions
  viewRegistration: canRead('REGISTRATION'),
  createAttendee: canCreate('REGISTRATION'),
  editAttendee: canUpdate('REGISTRATION'),
  deleteAttendee: canDelete('REGISTRATION'),
  
  // Product permissions
  viewProducts: canRead('PRODUCT_MANAGEMENT'),
  createProduct: canCreate('PRODUCT_MANAGEMENT'),
  editProduct: canUpdate('PRODUCT_MANAGEMENT'),
  deleteProduct: canDelete('PRODUCT_MANAGEMENT'),
  
  // Staff permissions
  viewStaff: canRead('STAFF_MANAGEMENT'),
  addStaff: canCreate('STAFF_MANAGEMENT'),
  editStaff: canUpdate('STAFF_MANAGEMENT'),
  removeStaff: canDelete('STAFF_MANAGEMENT'),
  
  // Content permissions
  viewContent: canRead('CONTENT_MANAGEMENT'),
  createContent: canCreate('CONTENT_MANAGEMENT'),
  editContent: canUpdate('CONTENT_MANAGEMENT'),
  deleteContent: canDelete('CONTENT_MANAGEMENT'),
  
  // Reporting permissions
  viewReports: canRead('REPORTING'),
  
  // Combined permissions
  manageRegistration: requireAll(
    canRead('REGISTRATION'),
    canCreate('REGISTRATION'),
    canUpdate('REGISTRATION')
  ),
  
  manageProducts: requireAll(
    canRead('PRODUCT_MANAGEMENT'),
    canCreate('PRODUCT_MANAGEMENT'),
    canUpdate('PRODUCT_MANAGEMENT')
  ),
  
  // Access to registration OR staff management
  registrationOrStaff: requireAny(
    canRead('REGISTRATION'),
    canRead('STAFF_MANAGEMENT')
  ),
}
