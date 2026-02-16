<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Staff List -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Event Staff</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Manage staff members and their permissions for this event
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  v-if="canUpdateStaff"
                  icon="i-heroicons-envelope"
                  label="Send Invite"
                  @click="showInviteModal = true"
                />
              </div>
            </div>
          </template>

          <div v-if="staffLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-20" />
          </div>

          <div v-else-if="staffList.length" class="space-y-3">
            <UserStaffCard
              v-for="staff in staffList"
              :key="staff.staff_id"
              :staff="staff"
              :permissions="getStaffPermissions(staff.user!)"
              :canUpdateStaff="canUpdateStaff"
              :canDeleteStaff="canDeleteStaff"
              @remove="removeStaff(staff.staff_id)"
              @update-permissions="handleUpdatePermissions(staff, $event)"
              
            />
          </div>

          <div v-else class="text-center py-12">
            <div class="text-gray-600 mb-4">
              <UIcon name="i-heroicons-users" class="text-5xl" />
            </div>
            <p class="text-gray-600 mb-4">No staff members yet</p>
            <UButton
              label="Send First Invite"
              @click="showInviteModal = true"
            />
          </div>
        </UCard>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="space-y-6">
        <!-- Stats Card -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Staff Overview</h3>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-bold">{{ staffList.length }}</div>
              <div class="text-sm text-gray-600">Total Staff</div>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ rolesList.length }}</div>
              <div class="text-sm text-gray-600">Defined Roles</div>
            </div>
          </div>
        </UCard>

        <!-- Quick Actions -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Quick Actions</h3>
          </template>
          <div class="space-y-2">
            <UButton
              block
              variant="soft"
              label="Email All Staff"
              icon="i-heroicons-envelope"
            />
            <UButton
              block
              variant="soft"
              label="Export Staff List"
              icon="i-heroicons-arrow-down-tray"
            />
          </div>
        </UCard>
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
