<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">

        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-mist-blue/60 rounded-xl border border-deep-navy/10">
          <button
            @click="activeTab = 'staff'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'staff' ? 'bg-white text-primary shadow-sm' : 'text-navy-500 hover:text-navy-800'"
          >
            <span class="material-symbols-outlined text-sm">group</span>
            Staff Members
            <span
              class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black"
              :class="activeTab === 'staff' ? 'bg-primary/10 text-primary' : 'bg-navy-100 text-navy-500'"
            >{{ staffTotal }}</span>
          </button>
          <button
            @click="activeTab = 'invites'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'invites' ? 'bg-white text-primary shadow-sm' : 'text-navy-500 hover:text-navy-800'"
          >
            <span class="material-symbols-outlined text-sm">mail</span>
            Invites
            <span
              v-if="inviteTotal > 0"
              class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black"
              :class="activeTab === 'invites' ? 'bg-primary/10 text-primary' : 'bg-navy-100 text-navy-500'"
            >{{ inviteTotal }}</span>
          </button>
        </div>

        <!-- Staff List -->
        <section v-if="activeTab === 'staff'" class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
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

          <!-- Search bar -->
          <div class="mb-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-navy-400">search</span>
              <input
                v-model="staffSearch"
                type="text"
                placeholder="Search staff by name or email…"
                class="w-full pl-9 pr-9 py-2.5 bg-mist-blue/40 border border-deep-navy/10 focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 placeholder:text-navy-400 transition-all"
              />
              <button
                v-if="staffSearch"
                @click="staffSearch = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
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
              :event-created-by="event?.data?.created_by"
              :event-url-safe-title="id"
              :canUpdateStaff="canUpdateStaff"
              :canDeleteStaff="canDeleteStaff"
              @remove="removeStaff(staff)"
              @update-permissions="handleUpdatePermissions(staff, $event)"
              @role-updated="refetchStaff"
              @availability-updated="refetchStaff"
            />
          </div>

          <!-- No search results -->
          <div v-else-if="staffSearchDebounced && !staffList.length" class="text-center py-8 text-navy-500">
            <span class="material-symbols-outlined text-4xl text-navy-200 mb-3 block">search_off</span>
            <p class="text-sm">No staff found for <strong>"{{ staffSearchDebounced }}"</strong></p>
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

          <!-- Pagination -->
          <div v-if="staffTotalPages > 1" class="mt-4 flex items-center justify-between gap-2">
            <p class="text-xs text-navy-400">
              Showing {{ (staffPage - 1) * staffPageSize + 1 }}–{{ Math.min(staffPage * staffPageSize, staffTotal) }} of {{ staffTotal }}
            </p>
            <div class="flex items-center gap-1">
              <button
                @click="staffPage--"
                :disabled="staffPage === 1"
                class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-mist-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <span class="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                v-for="p in staffTotalPages"
                :key="p"
                @click="staffPage = p"
                class="min-w-[28px] h-7 rounded-lg text-xs font-bold transition-colors"
                :class="p === staffPage ? 'bg-primary text-white' : 'text-navy-500 hover:bg-mist-blue'"
              >
                {{ p }}
              </button>
              <button
                @click="staffPage++"
                :disabled="staffPage === staffTotalPages"
                class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-mist-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <span class="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Invites List -->
        <section v-if="activeTab === 'invites'" class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">mail</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Staff Invites</h2>
              <p class="text-xs text-navy-400 mt-0.5">All invitations sent out for this event</p>
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

          <!-- Search bar -->
          <div class="mb-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-navy-400">search</span>
              <input
                v-model="inviteSearch"
                type="text"
                placeholder="Search by name, email or username…"
                class="w-full pl-9 pr-9 py-2.5 bg-mist-blue/40 border border-deep-navy/10 focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 placeholder:text-navy-400 transition-all"
              />
              <button
                v-if="inviteSearch"
                @click="inviteSearch = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          <div v-if="inviteLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="inviteList.length" class="space-y-3">
            <StaffInviteCard
              v-for="invite in inviteList"
              :key="invite.id"
              :invite="invite"
              :can-revoke="canUpdateStaff"
              @revoke="revokeInvite(invite)"
            />
          </div>

          <!-- No search results -->
          <div v-else-if="inviteSearchDebounced && !inviteList.length" class="text-center py-8 text-navy-500">
            <span class="material-symbols-outlined text-4xl text-navy-200 mb-3 block">search_off</span>
            <p class="text-sm">No invites found for <strong>"{{ inviteSearchDebounced }}"</strong></p>
          </div>

          <div v-else class="text-center py-12 text-navy-500">
            <span class="material-symbols-outlined text-5xl text-navy-200 mb-4 block">mark_email_unread</span>
            <p class="text-sm mb-4">No invites sent yet</p>
            <button
              v-if="canUpdateStaff"
              @click="showInviteModal = true"
              class="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">mail</span>
              Send First Invite
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="inviteTotalPages > 1" class="mt-4 flex items-center justify-between gap-2">
            <p class="text-xs text-navy-400">
              Showing {{ (invitePage - 1) * invitePageSize + 1 }}–{{ Math.min(invitePage * invitePageSize, inviteTotal) }} of {{ inviteTotal }}
            </p>
            <div class="flex items-center gap-1">
              <button
                @click="invitePage--"
                :disabled="invitePage === 1"
                class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-mist-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <span class="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                v-for="p in inviteTotalPages"
                :key="p"
                @click="invitePage = p"
                class="min-w-[28px] h-7 rounded-lg text-xs font-bold transition-colors"
                :class="p === invitePage ? 'bg-primary text-white' : 'text-navy-500 hover:bg-mist-blue'"
              >
                {{ p }}
              </button>
              <button
                @click="invitePage++"
                :disabled="invitePage === inviteTotalPages"
                class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-mist-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <span class="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Stats Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">bar_chart</span>
              Staff Overview
            </h3>
          </div>
          <div class="p-6 grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-3xl font-black text-navy-900">{{ staffTotal }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Total Staff</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-primary">{{ rolesList.length }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Roles</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-amber-600">{{ inviteTotal }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Invites</div>
            </div>
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Staff Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p>
              <strong class="text-navy-800">Send Invites</strong> to add staff members. They'll receive an email with a link to accept.
            </p>
            <p>
              Start with <strong class="text-navy-800">Role assignment</strong> for fast setup, then use custom permissions only when needed.
            </p>
            <p>
              The <strong class="text-navy-800">event creator is immutable</strong> and always has locked admin access.
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
      :staff-list="staffList"
      :existing-invites="existingInvites"
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
import { useCreateEventStaffInvite, useEventStaffInvites, useDeleteEventStaffInvite } from '~/composables/resources/events/eventStaffInvites'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useUsers } from '~/composables/resources/user/users'
import { useCurrentUserEventPermissions } from '~/composables/permissions'

import EventsManagementLayout from "~/components/events/EventManagementLayout.vue"
import UserStaffCard from '~/components/staff/UserStaffCard.vue'
import StaffInviteCard from '~/components/staff/StaffInviteCard.vue'
import AdvancedInviteModal from '~/components/staff/AdvancedInviteModal.vue'
import type { EventPermissionAssignment } from '~/api/types.gen'
import type { CRUDAction } from '~/types/permissions'


definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'STAFF_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Active tab
const activeTab = ref<'staff' | 'invites'>('staff')

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
const staffSearch = ref('')
const staffSearchDebounced = ref('')
let staffSearchTimer: ReturnType<typeof setTimeout> | null = null
const staffPage = ref(1)
const staffPageSize = 10

watch(staffSearch, (val) => {
  if (staffSearchTimer) clearTimeout(staffSearchTimer)
  staffSearchTimer = setTimeout(() => {
    staffSearchDebounced.value = val
    staffPage.value = 1
  }, 300)
})

const staffParams = computed(() => ({
  event: route.params.id as string,
  search: staffSearchDebounced.value || undefined,
  page: staffPage.value,
  page_size: staffPageSize,
}))

const { data: staffData, isLoading: staffLoading, refetch: refetchStaff } = useEventStaff(staffParams)
const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useEventRoles()

const staffList = computed(() => staffData.value?.data?.results || [])
const staffTotal = computed(() => staffData.value?.data?.count ?? 0)
const staffTotalPages = computed(() => Math.ceil(staffTotal.value / staffPageSize))
const rolesList = computed(() => rolesData.value?.data?.results || [])

// Invites tab state
const inviteSearch = ref('')
const inviteSearchDebounced = ref('')
let inviteSearchTimer: ReturnType<typeof setTimeout> | null = null
const invitePage = ref(1)
const invitePageSize = 10

watch(inviteSearch, (val) => {
  if (inviteSearchTimer) clearTimeout(inviteSearchTimer)
  inviteSearchTimer = setTimeout(() => {
    inviteSearchDebounced.value = val
    invitePage.value = 1
  }, 300)
})

const inviteParams = computed(() => ({
  search: inviteSearchDebounced.value || undefined,
  page: invitePage.value,
  page_size: invitePageSize,
}))

const { data: inviteData, isLoading: inviteLoading, refetch: refetchInvites } = useEventStaffInvites(id, inviteParams)
const inviteList = computed(() => inviteData.value?.data?.results || [])
const inviteTotal = computed(() => inviteData.value?.data?.count ?? 0)
const inviteTotalPages = computed(() => Math.ceil(inviteTotal.value / invitePageSize))

// Fetch permissions
const { data: permissionsData } = useEventPermissions()
const permissionsList = computed(() => permissionsData.value?.data?.results || [])

// Fetch permission assignments
const permissionsFilter = computed(() => ({ event: id.value }))
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

// Existing invites for invite modal filtering (reuse the invite tab data)
const existingInvites = computed(() => inviteList.value)

// Modals
const showInviteModal = ref(false)
const showAddRoleModal = ref(false)

// Get permissions for a specific staff member
const getStaffPermissions = (userId: number): EventPermissionAssignment[] => {
  return permissionAssignments.value.filter(p => p.user === userId)
}

const isCreatorStaffMember = (staff: { user?: number | null }) => {
  const creatorId = event.value?.data?.created_by
  return creatorId != null && staff.user === creatorId
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
        permission_template: inviteData.permissionTemplate ?? undefined,
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
    refetchInvites()
  } catch (error) {
    toast.add({
      title: 'Failed to send invite',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Revoke invite
const deleteInviteMutation = useDeleteEventStaffInvite()

const revokeInvite = async (invite: { id: string }) => {
  if (!confirm('Revoke this invite? The user will no longer be able to accept it.')) return

  try {
    await deleteInviteMutation.mutateAsync({ eventId: id.value, inviteId: invite.id })

    toast.add({
      title: 'Invite revoked',
      color: 'green',
    })

    refetchInvites()
  } catch (error) {
    toast.add({
      title: 'Failed to revoke invite',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Handle permission updates
const createPermissionMutation = useCreateEventPermissionAssignment()
const deletePermissionMutation = useDeleteEventPermissionAssignment()

const handleUpdatePermissions = async (staff: any, permissions: Record<string, CRUDAction[]>) => {
  if (isCreatorStaffMember(staff)) {
    toast.add({
      title: 'Creator permissions are locked',
      description: 'Event creator permissions cannot be edited manually.',
      color: 'orange',
    })
    return
  }

  try {
    const currentPermissions = getStaffPermissions(staff.user!)
    const eventPk = event.value?.data.id

    if (!eventPk) {
      throw new Error('Event is not ready. Please refresh and try again.')
    }

    const deleteResults = await Promise.allSettled(
      currentPermissions.map(perm => deletePermissionMutation.mutateAsync(perm.id))
    )
    const deleteFailures = deleteResults.filter(result => result.status === 'rejected')
    if (deleteFailures.length > 0) {
      throw new Error('Could not clear previous permissions. Please retry.')
    }

    const createPayloads: Array<{
      event: string
      user: number
      permission: number
      read_only: boolean
      allow_create: boolean
      allow_update: boolean
      allow_delete: boolean
    }> = []

    for (const [category, actions] of Object.entries(permissions)) {
      const permission = permissionsList.value.find(p => p.category === category)
      if (!permission) continue
      if (!event.value?.data.event_id) {
        throw new Error('Event context mismatch. Please refresh and try again.')
      }
      
      createPayloads.push({
        event: event.value?.data.event_id,
        user: staff.user!,
        permission: permission.id,
        read_only: actions.includes('read') && actions.length === 1,
        allow_create: actions.includes('create'),
        allow_update: actions.includes('update'),
        allow_delete: actions.includes('delete'),
      })
    }

    const createResults = await Promise.allSettled(
      createPayloads.map(payload => createPermissionMutation.mutateAsync(payload))
    )
    const createFailures = createResults.filter(result => result.status === 'rejected')
    if (createFailures.length > 0) {
      throw new Error('Some permissions failed to apply. Please review and retry.')
    }

    toast.add({
      title: 'Permissions updated',
      color: 'green',
    })

    await refetchPermissions()
  } catch (error) {
    await refetchPermissions()

    toast.add({
      title: 'Failed to update permissions',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove staff
const removeStaffMutation = useDeleteEventStaff()

const removeStaff = async (staff: { staff_id: string; user?: number | null }) => {
  if (isCreatorStaffMember(staff)) {
    toast.add({
      title: 'Creator cannot be removed',
      description: 'Event creator has immutable admin access.',
      color: 'orange',
    })
    return
  }

  if (!confirm('Remove this staff member? This will also remove all their permissions.')) return

  try {
    await removeStaffMutation.mutateAsync(staff.staff_id)

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
