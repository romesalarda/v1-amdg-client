<!--
  Example Page: Event Registration List
  
  This page demonstrates:
  - Using event permission middleware
  - Checking read access to registration
  - Combining with auth middleware
  - Programmatic permission checks for UI elements
-->

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Event Attendees</h1>
      
      <!-- Only show create button if user has create permission -->
      <NuxtLink
        v-if="canCreateAttendees.allowed"
        :to="`/events/${eventId}/registration/create`"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Attendee
      </NuxtLink>
    </div>

    <!-- Permission info for debugging -->
    <div v-if="isDev" class="mb-4 p-4 bg-gray-100 rounded">
      <h3 class="font-semibold mb-2">Current Permissions:</h3>
      <ul class="text-sm space-y-1">
        <li>Can Read: {{ registrationSummary.canRead ? '✓' : '✗' }}</li>
        <li>Can Create: {{ registrationSummary.canCreate ? '✓' : '✗' }}</li>
        <li>Can Update: {{ registrationSummary.canUpdate ? '✓' : '✗' }}</li>
        <li>Can Delete: {{ registrationSummary.canDelete ? '✓' : '✗' }}</li>
        <li v-if="registrationSummary.isReadOnly" class="text-amber-600">
          ⚠️ Read-Only Access
        </li>
      </ul>
    </div>

    <!-- Attendee list -->
    <div class="space-y-4">
      <!-- Your attendee list content here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentUserEventPermissions } from '~/composables/permissions'

const route = useRoute()
const eventId = computed(() => route.params.id as string)
const isDev = import.meta.env.DEV

// Get permissions for programmatic checks
const { can, summary } = useCurrentUserEventPermissions(eventId)

const canCreateAttendees = can('REGISTRATION', 'create')
const canUpdateAttendees = can('REGISTRATION', 'update')
const canDeleteAttendees = can('REGISTRATION', 'delete')
const registrationSummary = summary('REGISTRATION')

// Middleware enforces read permission to view this page
definePageMeta({
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read'
  }
})
</script>
