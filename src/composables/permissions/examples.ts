/**
 * Event Permission System - Usage Examples
 * 
 * This file contains comprehensive examples of how to use the permission system
 * in your Vue components and composables.
 */

import { ref, computed } from 'vue'
import {
  useCurrentUserEventPermissions,
  useAssignEventPermission,
  useRevokeEventPermission,
  useCheckEventPermissions,
  useBulkAssignEventPermissions,
  hasPermission,
  getPermissionSummary,
  type PermissionCategory,
} from '~/composables/permissions'

// ============================================================================
// Example 1: Basic Permission Checking in a Component
// ============================================================================

export function exampleBasicUsage() {
  const eventId = ref('event-123')

  // Get current user's permissions for the event
  const {
    permissions,
    isLoading,
    can,
    isAdmin,
    isCreator,
  } = useCurrentUserEventPermissions(eventId)

  // Check specific permissions
  const canCreateAttendees = can('REGISTRATION', 'create')
  const canUpdateProducts = can('PRODUCT_MANAGEMENT', 'update')
  const canViewReports = can('REPORTING', 'read')

  // Use in template
  const showCreateButton = computed(() => canCreateAttendees.value.allowed)
  const showEditButton = computed(() => canUpdateProducts.value.allowed)

  return {
    isLoading,
    showCreateButton,
    showEditButton,
    isAdmin,
    isCreator,
  }
}

// ============================================================================
// Example 2: Conditional Rendering Based on Permissions
// ============================================================================

/**
 * Vue component with permission-based UI
 * 
 * ```vue
 * <template>
 *   <div>
 *     <h1>Event Management</h1>
 *     
 *     <!-- Show registration section if user has any registration access -->
 *     <section v-if="canAccessRegistration.allowed">
 *       <h2>Registration</h2>
 *       
 *       <!-- Show create button only if user can create -->
 *       <button v-if="canCreateAttendees.allowed">
 *         Add Attendee
 *       </button>
 *       
 *       <!-- Read-only view if user only has read permission -->
 *       <div v-if="registrationSummary.isReadOnly">
 *         <em>You have read-only access to registration</em>
 *       </div>
 *     </section>
 *     
 *     <!-- Admin/Creator only section -->
 *     <section v-if="isAdmin || isCreator">
 *       <h2>Administrative Controls</h2>
 *       <button @click="openPermissionManager">
 *         Manage Permissions
 *       </button>
 *     </section>
 *   </div>
 * </template>
 * 
 * <script setup>
 * const props = defineProps<{ eventId: string }>()
 * 
 * const {
 *   can,
 *   summary,
 *   isAdmin,
 *   isCreator,
 * } = useCurrentUserEventPermissions(() => props.eventId)
 * 
 * const canAccessRegistration = can('REGISTRATION', 'read')
 * const canCreateAttendees = can('REGISTRATION', 'create')
 * const registrationSummary = summary('REGISTRATION')
 * </script>
 * ```
 */

// ============================================================================
// Example 3: Assigning Permissions
// ============================================================================

export function exampleAssignPermissions() {
  const eventId = ref('event-123')
  const selectedUserId = ref(456)

  const { mutate: assignPermission, isPending } = useAssignEventPermission(eventId)

  // Assign read-only registration access
  const grantReadOnlyRegistration = () => {
    assignPermission({
      user_id: selectedUserId.value,
      permission_id: 1, // REGISTRATION permission
      read_only: true,
      allow_create: false,
      allow_update: false,
      allow_delete: false,
    })
  }

  // Grant full product management access
  const grantFullProductAccess = () => {
    assignPermission({
      user_id: selectedUserId.value,
      permission_id: 2, // PRODUCT_MANAGEMENT permission
      read_only: false,
      allow_create: true,
      allow_update: true,
      allow_delete: true,
    })
  }

  // Grant create and update only (no delete)
  const grantLimitedStaffAccess = () => {
    assignPermission({
      user_id: selectedUserId.value,
      permission_id: 3, // STAFF_MANAGEMENT permission
      read_only: false,
      allow_create: true,
      allow_update: true,
      allow_delete: false, // Can't remove staff
    })
  }

  return {
    grantReadOnlyRegistration,
    grantFullProductAccess,
    grantLimitedStaffAccess,
    isPending,
  }
}

// ============================================================================
// Example 4: Revoking Permissions
// ============================================================================

export function exampleRevokePermissions() {
  const eventId = ref('event-123')

  const { mutate: revokePermission } = useRevokeEventPermission(eventId)

  const removePermission = (assignmentId: number) => {
    revokePermission(
      { assignment_id: assignmentId },
      {
        onSuccess: () => {
          console.log('Permission revoked successfully')
        },
        onError: (error) => {
          console.error('Failed to revoke permission:', error)
        },
      }
    )
  }

  return { removePermission }
}

// ============================================================================
// Example 5: Checking Other Users' Permissions (Admin/Creator only)
// ============================================================================

export function exampleCheckOtherUserPermissions() {
  const eventId = ref('event-123')
  const targetUserId = ref(789)

  // Check permissions for another user
  const { data: userPermissions, isLoading } = useCheckEventPermissions(
    eventId,
    targetUserId
  )

  // Use the fetched permissions with helpers
  const canUserCreateAttendees = computed(() => {
    if (!userPermissions.value) return false
    return hasPermission(
      userPermissions.value as any,
      'REGISTRATION',
      'create'
    ).allowed
  })

  const userRegistrationSummary = computed(() => {
    if (!userPermissions.value) return null
    return getPermissionSummary(
      userPermissions.value as any,
      'REGISTRATION'
    )
  })

  return {
    userPermissions,
    isLoading,
    canUserCreateAttendees,
    userRegistrationSummary,
  }
}

// ============================================================================
// Example 6: Permission-Based Navigation Guards
// ============================================================================

/**
 * Route middleware to check permissions before navigation
 * 
 * ```ts
 * // In your router or middleware
 * import { eventListRetrieve } from '~/api/sdk.gen'
 * import { hasPermission } from '~/composables/permissions'
 * 
 * export async function requireRegistrationAccess(to, from, next) {
 *   const eventId = to.params.eventId
 *   
 *   const response = await eventListRetrieve({
 *     path: { event_id: eventId }
 *   })
 *   
 *   const permissions = response.data.user_permissions
 *   const canAccess = hasPermission(permissions, 'REGISTRATION', 'read')
 *   
 *   if (canAccess.allowed) {
 *     next()
 *   } else {
 *     next({ name: 'unauthorized' })
 *   }
 * }
 * ```
 */

// ============================================================================
// Example 7: Bulk Permission Assignment
// ============================================================================

export function exampleBulkAssignPermissions() {
  const eventId = ref('event-123')

  const { mutate: bulkAssign } = useBulkAssignEventPermissions(eventId)

  // Grant a volunteer read access to multiple categories
  const setupVolunteerPermissions = (userId: number) => {
    bulkAssign({
      user_id: userId,
      permissions: [
        {
          permission_id: 1, // REGISTRATION
          read_only: true,
        },
        {
          permission_id: 2, // PRODUCT_MANAGEMENT
          read_only: false,
          allow_create: true,
          allow_update: true,
          allow_delete: false,
        },
        {
          permission_id: 4, // CONTENT_MANAGEMENT
          read_only: true,
        },
      ],
    })
  }

  return { setupVolunteerPermissions }
}

// ============================================================================
// Example 8: Reactive Permission Summary Display
// ============================================================================

/**
 * Component to display permission summary for a category
 * 
 * ```vue
 * <template>
 *   <div class="permission-summary">
 *     <h3>{{ category }} Permissions</h3>
 *     
 *     <div v-if="summary">
 *       <div class="permission-badge" :class="{ granted: summary.canRead }">
 *         Read: {{ summary.canRead ? '✓' : '✗' }}
 *       </div>
 *       <div class="permission-badge" :class="{ granted: summary.canCreate }">
 *         Create: {{ summary.canCreate ? '✓' : '✗' }}
 *       </div>
 *       <div class="permission-badge" :class="{ granted: summary.canUpdate }">
 *         Update: {{ summary.canUpdate ? '✓' : '✗' }}
 *       </div>
 *       <div class="permission-badge" :class="{ granted: summary.canDelete }">
 *         Delete: {{ summary.canDelete ? '✓' : '✗' }}
 *       </div>
 *       
 *       <div v-if="summary.isReadOnly" class="warning">
 *         <em>Read-Only Access</em>
 *       </div>
 *       
 *       <div v-if="summary.hasFullAccess" class="success">
 *         <strong>Full Access Granted</strong>
 *       </div>
 *     </div>
 *   </div>
 * </template>
 * 
 * <script setup>
 * const props = defineProps<{
 *   eventId: string
 *   category: PermissionCategory
 * }>()
 * 
 * const { summary } = useCurrentUserEventPermissions(() => props.eventId)
 * const permissionSummary = summary(() => props.category)
 * </script>
 * ```
 */

// ============================================================================
// Example 9: Form Validation with Permissions
// ============================================================================

export function examplePermissionValidation() {
  const eventId = ref('event-123')

  const { can } = useCurrentUserEventPermissions(eventId)

  // Validate before form submission
  const validateAndSubmit = async (formData: any) => {
    const canCreate = can('REGISTRATION', 'create')

    if (!canCreate.value.allowed) {
      throw new Error(
        `Permission denied: ${canCreate.value.details || 'Cannot create attendees'}`
      )
    }

    // Proceed with submission
    // await submitForm(formData)
  }

  return { validateAndSubmit }
}

// ============================================================================
// Example 10: Accessible Categories List
// ============================================================================

/**
 * Get all categories user has access to for navigation menu
 * 
 * ```vue
 * <template>
 *   <nav>
 *     <ul>
 *       <li v-for="category in accessibleCategories" :key="category">
 *         <router-link :to="`/event/${eventId}/${category.toLowerCase()}`">
 *           {{ formatCategoryName(category) }}
 *         </router-link>
 *       </li>
 *     </ul>
 *   </nav>
 * </template>
 * 
 * <script setup>
 * const { eventId } = defineProps<{ eventId: string }>()
 * 
 * const { accessibleCategories } = useCurrentUserEventPermissions(eventId)
 * 
 * const formatCategoryName = (category: string) => {
 *   return category.split('_').map(word => 
 *     word.charAt(0) + word.slice(1).toLowerCase()
 *   ).join(' ')
 * }
 * </script>
 * ```
 */
