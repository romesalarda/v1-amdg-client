<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">

        <!-- Staff List -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">group</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Event Staff</h2>
              <p class="text-xs text-navy-400 mt-0.5">Manage staff members and their permissions for this event</p>
            </div>
            <button
              v-if="canUpdateStaff"
              @click="showInviteModal = true"
              class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">mail</span>
              Send Invite
            </button>
          </div>

          <div v-if="staffLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="staffList.length" class="space-y-3">
            <UserStaffCard
              v-for="staff in staffList"
              :key="staff.staff_id"
              :staff="staff"
              :permissions="getStaffPermissions(staff.user!)"
              :roles-list="rolesList"
              :canUpdateStaff="canUpdateStaff"
              :canDeleteStaff="canDeleteStaff"
              @remove="removeStaff(staff.staff_id)"
              @update-permissions="handleUpdatePermissions(staff, $event)"
              @role-updated="refetchStaff"
            />
          </div>

          <div v-else class="text-center py-12 text-navy-500">
            <span class="material-symbols-outlined text-5xl text-navy-200 mb-4 block">groups</span>
            <p class="text-sm mb-4">No staff members yet</p>
            <button
              @click="showInviteModal = true"
              class="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">mail</span>
              Send First Invite
            </button>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Stats Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">bar_chart</span>
              Staff Overview
            </h3>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-3xl font-black text-navy-900">{{ staffList.length }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Total Staff</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-primary">{{ rolesList.length }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Roles</div>
            </div>
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Staff Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p>
              <strong class="text-navy-800">Send Invites</strong> to add staff members. They'll receive an email with a link to accept.
            </p>
            <p>
              <strong class="text-navy-800">Permissions</strong> control what each staff member can view and manage within this event.
            </p>
            <p>
              Use the <strong class="text-navy-800">expand button</strong> on each staff card to edit their permissions inline.
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Advanced Invite Modal -->
    <AdvancedInviteModal
      v-if="event?.data"
      v-model="showInviteModal"
      :event-id="event?.data.id"
      :users-list="usersList"
      :roles-list="rolesList"
      @invite-sent="handleInviteSent"
    />
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventStaff, useDeleteEventStaff } from '~/composables/resources/events/eventStaff'
import { useEventRoles, useCreateEventRole, useDeleteEventRole } from '~/composables/resources/events/eventRoles'
import { useEventPermissions } from '~/composables/resources/events/eventPermissions'
import { useEventPermissionAssignments, useCreateEventPermissionAssignment, useDeleteEventPermissionAssignment } from '~/composables/resources/events/eventPermissionAssignments'
import { useCreateEventStaffInvite } from '~/composables/resources/events/eventStaffInvites'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useUsers } from '~/composables/resources/user/users'
import { useCurrentUserEventPermissions } from '~/composables/permissions'

import EventsManagementLayout from "~/components/events/EventManagementLayout.vue"
import UserStaffCard from '~/components/staff/UserStaffCard.vue'
import AdvancedInviteModal from '~/components/staff/AdvancedInviteModal.vue'
import type { EventPermissionAssignment } from '~/api/types.gen'
import type { CRUDAction } from '~/types/permissions'


definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'STAFF_MANAGEMENT',
    action: 'read'
  }
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

const { can } = useCurrentUserEventPermissions(id, {
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
  staleTime: 15000
})

const canUpdateStaff = computed(() => can('STAFF_MANAGEMENT', 'update').value.allowed)
const canDeleteStaff = computed(() => can('STAFF_MANAGEMENT', 'delete').value.allowed)

// Fetch event data
const { data: event } = useEvent(id)

// Fetch staff and roles
const eventIdFilter = { event__event_id: route.params.id as string }
const { data: staffData, isLoading: staffLoading, refetch: refetchStaff } = useEventStaff(eventIdFilter)
const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useEventRoles()

const staffList = computed(() => staffData.value?.data?.results || [])
const rolesList = computed(() => rolesData.value?.data?.results || [])

// Fetch permissions
const { data: permissionsData } = useEventPermissions()
const permissionsList = computed(() => permissionsData.value?.data?.results || [])

// Fetch permission assignments
const permissionsFilter = computed(() => ({ event: event.value?.data?.id }))
const { data: permissionAssignmentsData, refetch: refetchPermissions } = useEventPermissionAssignments(permissionsFilter)
const permissionAssignments = computed(() => permissionAssignmentsData.value?.data?.results || [])

const { data: organisationData } = useOrganisation(event.value?.data?.organisation || 0 )
// User search for invite modal
const userSearch = ref('')
const usersParams = computed(() => ({
  search: userSearch.value || undefined,
  organisation: organisationData.value?.data?.title,
}))
const { data: usersData } = useUsers(usersParams)
const usersList = computed(() => usersData.value?.data?.results || [])

// Modals
const showInviteModal = ref(false)
const showAddRoleModal = ref(false)

// Get permissions for a specific staff member
const getStaffPermissions = (userId: number): EventPermissionAssignment[] => {
  return permissionAssignments.value.filter(p => p.user === userId)
}

// Handle invite sent
const createInviteMutation = useCreateEventStaffInvite()

const handleInviteSent = async (inviteData: any) => {
  try {
    // Create the invite
    await createInviteMutation.mutateAsync({
      eventId: String(route.params.id),
      body: {
        target_user: inviteData.userId,
        expires_at: inviteData.expiryDate || undefined,
      }
    })

    toast.add({
      title: 'Invite sent',
      description: 'Staff invitation has been sent successfully',
      color: 'green',
    })

    showInviteModal.value = false
    refetchStaff()
  } catch (error) {
    toast.add({
      title: 'Failed to send invite',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Handle permission updates
const createPermissionMutation = useCreateEventPermissionAssignment()
const deletePermissionMutation = useDeleteEventPermissionAssignment()

const handleUpdatePermissions = async (staff: any, permissions: Record<string, CRUDAction[]>) => {
  try {
    // Get current permissions for this user
    const currentPermissions = getStaffPermissions(staff.user!)

    console.log("permissinons to update", permissionAssignments.value);
    
    
    // Delete existing permissions
    for (const perm of currentPermissions) {
      await deletePermissionMutation.mutateAsync(perm.id)
    }
    
    // Create new permissions
    for (const [category, actions] of Object.entries(permissions)) {
      // Find the permission by category
      const permission = permissionsList.value.find(p => p.category === category)
      if (!permission) continue

      const event_pk = event.value?.data.id
      console.log("event pk ", event_pk);
      
      if (!event_pk) continue
      
      // Create permission assignment
      await createPermissionMutation.mutateAsync({
        event: event_pk,
        user: staff.user!,
        permission: permission.id,
        read_only: actions.includes('read') && actions.length === 1,
        allow_create: actions.includes('create'),
        allow_update: actions.includes('update'),
        allow_delete: actions.includes('delete'),
      })
    }

    toast.add({
      title: 'Permissions updated',
      color: 'green',
    })

    refetchPermissions()
  } catch (error) {
    toast.add({
      title: 'Failed to update permissions',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove staff
const removeStaffMutation = useDeleteEventStaff()

const removeStaff = async (staffId: string) => {
  if (!confirm('Remove this staff member? This will also remove all their permissions.')) return

  try {
    await removeStaffMutation.mutateAsync(staffId)

    toast.add({
      title: 'Staff member removed',
      color: 'green',
    })

    refetchStaff()
    refetchPermissions()
  } catch (error) {
    toast.add({
      title: 'Failed to remove staff member',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Add role form
const addRoleForm = reactive({
  name: '',
  description: '',
})

const addRoleMutation = useCreateEventRole()

const onAddRole = async (e: Event) => {
  e.preventDefault()

  try {
    // Generate a code from the name (uppercase, replace spaces with underscores)
    const code = addRoleForm.name.toUpperCase().replace(/\s+/g, '_')
    
    await addRoleMutation.mutateAsync({
      name: addRoleForm.name,
      code: code,
      description: addRoleForm.description || undefined,
    })

    toast.add({
      title: 'Role created',
      color: 'green',
    })

    showAddRoleModal.value = false
    addRoleForm.name = ''
    addRoleForm.description = ''
    refetchRoles()
  } catch (error) {
    toast.add({
      title: 'Failed to create role',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove role
const removeRoleMutation = useDeleteEventRole()

const removeRole = async (roleId: number) => {
  if (!confirm('Remove this role? Staff members with this role will need to be reassigned.')) return

  try {
    await removeRoleMutation.mutateAsync(roleId)

    toast.add({
      title: 'Role removed',
      color: 'green',
    })

    refetchRoles()
    refetchStaff() // Refresh staff to show updated role assignments
  } catch (error) {
    toast.add({
      title: 'Failed to remove role',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}
</script>
