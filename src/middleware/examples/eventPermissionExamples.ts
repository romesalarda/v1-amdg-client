/**
 * Event Permission Middleware - Usage Examples
 * 
 * Comprehensive examples of how to use the event permission middleware
 * in your page components.
 */

// ============================================================================
// Example 1: Basic Single Permission Check
// ============================================================================

/**
 * Require read access to registration
 * 
 * File: pages/events/[id]/registration/index.vue
 */
export const example1 = `
<template>
  <div>
    <h1>Event Attendees</h1>
    <!-- Page content -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read'
  }
})
</script>
`

// ============================================================================
// Example 2: Create Permission Check
// ============================================================================

/**
 * Require create access to add attendees
 * 
 * File: pages/events/[id]/registration/create.vue
 */
export const example2 = `
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'create'
  }
})
</script>
`

// ============================================================================
// Example 3: Using Permission Presets
// ============================================================================

/**
 * Use pre-configured permission checks
 * 
 * File: pages/events/[id]/products/edit.vue
 */
export const example3 = `
<script setup lang="ts">
import { EventPermissionPresets } from '~/middleware/helpers/eventPermissionHelpers'

definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: EventPermissionPresets.editProduct
})
</script>
`

// ============================================================================
// Example 4: Multiple Permissions (Any Of)
// ============================================================================

/**
 * Require access to EITHER registration OR staff management
 * User only needs ONE of these permissions
 * 
 * File: pages/events/[id]/dashboard.vue
 */
export const example4 = `
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    anyOf: [
      { category: 'REGISTRATION', action: 'read' },
      { category: 'STAFF_MANAGEMENT', action: 'read' }
    ]
  }
})
</script>
`

// ============================================================================
// Example 5: Multiple Permissions (All Of)
// ============================================================================

/**
 * Require BOTH registration AND product management access
 * User must have ALL of these permissions
 * 
 * File: pages/events/[id]/admin/settings.vue
 */
export const example5 = `
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    allOf: [
      { category: 'REGISTRATION', action: 'update' },
      { category: 'PRODUCT_MANAGEMENT', action: 'update' },
      { category: 'STAFF_MANAGEMENT', action: 'read' }
    ]
  }
})
</script>
`

// ============================================================================
// Example 6: Custom Error Message
// ============================================================================

/**
 * Provide a custom error message when permission is denied
 * 
 * File: pages/events/[id]/reports/financial.vue
 */
export const example6 = `
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REPORTING',
    action: 'read',
    deniedMessage: 'Financial reports are only available to event administrators and treasurers.'
  }
})
</script>
`

// ============================================================================
// Example 7: Custom Redirect on Denial
// ============================================================================

/**
 * Redirect to a custom page instead of event dashboard
 * 
 * File: pages/events/[id]/admin/danger-zone.vue
 */
export const example7 = `
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'STAFF_MANAGEMENT',
    action: 'delete',
    deniedMessage: 'Only event creators can access the danger zone.',
    deniedRedirect: '/403'
  }
})
</script>
`

// ============================================================================
// Example 8: Using Helper Functions
// ============================================================================

/**
 * Use helper functions for cleaner syntax
 * 
 * File: pages/events/[id]/content/upload.vue
 */
export const example8 = `
<script setup lang="ts">
import { canCreate, requireAll, canUpdate } from '~/middleware/helpers/eventPermissionHelpers'

definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: requireAll(
    canCreate('CONTENT_MANAGEMENT'),
    canUpdate('CONTENT_MANAGEMENT')
  )
})
</script>
`

// ============================================================================
// Example 9: Nested Routes with Different Permissions
// ============================================================================

/**
 * Parent layout with read permission
 * Child pages with more specific permissions
 */
export const example9 = {
  layout: `
// File: pages/events/[id]/products.vue (layout)
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'read'
  }
})
</script>
  `,
  
  createPage: `
// File: pages/events/[id]/products/create.vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'create'
  }
})
</script>
  `,
  
  editPage: `
// File: pages/events/[id]/products/[productId]/edit.vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'update'
  }
})
</script>
  `
}

// ============================================================================
// Example 10: Combining with Other Middleware
// ============================================================================

/**
 * Use event permissions alongside other middleware
 * 
 * File: pages/events/[id]/organisation/settings.vue
 */
export const example10 = `
<script setup lang="ts">
definePageMeta({
  // Auth runs first, then organisation-controller, then event-permission
  middleware: ['auth', 'organisation-controller', 'event-permission'],
  eventPermission: {
    anyOf: [
      { category: 'GENERAL', action: 'update' },
      { category: 'STAFF_MANAGEMENT', action: 'update' }
    ]
  }
})
</script>
`

// ============================================================================
// Example 11: Programmatic Permission Checking in Components
// ============================================================================

/**
 * Sometimes you need to check permissions programmatically
 * instead of just blocking routes
 */
export const example11 = `
<template>
  <div>
    <h1>Event Registration</h1>
    
    <!-- Show create button only if user has permission -->
    <button v-if="canCreateAttendees.allowed" @click="openCreateModal">
      Add Attendee
    </button>
    
    <!-- Show edit/delete actions conditionally -->
    <div v-for="attendee in attendees" :key="attendee.id">
      <span>{{ attendee.name }}</span>
      <button v-if="canUpdateAttendees.allowed" @click="editAttendee(attendee)">
        Edit
      </button>
      <button v-if="canDeleteAttendees.allowed" @click="deleteAttendee(attendee)">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentUserEventPermissions } from '~/composables/permissions'

const route = useRoute()
const eventId = computed(() => route.params.id as string)

// Get permissions for this event
const { can } = useCurrentUserEventPermissions(eventId)

// Check specific permissions
const canCreateAttendees = can('REGISTRATION', 'create')
const canUpdateAttendees = can('REGISTRATION', 'update')
const canDeleteAttendees = can('REGISTRATION', 'delete')

// Middleware still enforces read access to view this page
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read'
  }
})
</script>
`

// ============================================================================
// Example 12: Global Middleware Configuration
// ============================================================================

/**
 * Apply middleware to all routes in a directory
 * 
 * File: pages/events/[id]/registration/index.ts (middleware config)
 */
export const example12 = `
// This is a concept - Nuxt doesn't support this directly
// You would need to add middleware to each page individually
// or use a layout component

// Alternative: Create a layout that includes the middleware
// File: pages/events/[id]/registration.vue (layout)
<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read'
  }
})
</script>

// Then all child pages inherit this middleware
// File: pages/events/[id]/registration/list.vue
<template>
  <div>List view</div>
</template>
// No middleware needed - inherited from layout
`
