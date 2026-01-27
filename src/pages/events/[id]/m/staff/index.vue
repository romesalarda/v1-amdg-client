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
                  Manage staff members and their roles for this event
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Staff"
                @click="showAddModal = true"
              />
            </div>
          </template>

          <div v-if="staffLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-16" />
          </div>

          <div v-else-if="staffList.length" class="space-y-3">
            <div
              v-for="staff in staffList"
              :key="staff.staff_id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
                >
                  <span class="text-sm font-semibold text-primary-600">
                    {{ staff.user_email?.[0]?.toUpperCase() || '?' }}
                  </span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">
                    {{ staff.user_email }}
                  </div>
                  <div class="text-sm text-gray-600">
                    Staff ID: {{ staff.staff_id }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="removeStaff(staff.staff_id)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="text-gray-600 mb-4">
              <UIcon name="i-heroicons-users" class="text-5xl" />
            </div>
            <p class="text-gray-600 mb-4">No staff members yet</p>
            <UButton
              label="Add First Staff Member"
              @click="showAddModal = true"
            />
          </div>
        </UCard>

        <!-- Roles List -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold">Staff Roles</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Define roles that can be assigned to staff members
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Role"
                @click="showAddRoleModal = true"
              />
            </div>
          </template>

          <div v-if="rolesLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-12" />
          </div>

          <div v-else-if="rolesList.length" class="space-y-3">
            <div
              v-for="role in rolesList"
              :key="role.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <div class="font-semibold">{{ role.name }}</div>
                <div v-if="role.description" class="text-sm text-gray-600">
                  {{ role.description }}
                </div>
              </div>
              <UButton
                icon="i-heroicons-trash"
                color="red"
                variant="ghost"
                size="sm"
                @click="removeRole(role.id)"
              />
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            No roles defined
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

    <!-- Add Staff Modal -->
    <UModal v-model="showAddModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Staff Member</h3>
        </template>

        <form @submit="onAddStaff" class="space-y-4">
          <UFormGroup label="User" name="user" required>
            <USelectMenu
              v-model="selectedUser"
              :options="usersList"
              searchable
              :search-attributes="['email', 'first_name', 'last_name']"
              placeholder="Search for a user..."
              value-attribute="id"
              @update:query="userSearch = $event"
            >
              <template #label>
                <span v-if="selectedUser" class="truncate">
                  {{ selectedUser.email }}
                  <span v-if="selectedUser.first_name || selectedUser.last_name" class="text-gray-500">
                    ({{ selectedUser.first_name }} {{ selectedUser.last_name }})
                  </span>
                </span>
              </template>
              <template #option="{ option }">
                <div class="flex flex-col">
                  <span class="font-medium">{{ option.email }}</span>
                  <span v-if="option.first_name || option.last_name" class="text-sm text-gray-500">
                    {{ option.first_name }} {{ option.last_name }}
                  </span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>

          <UFormGroup label="Role" name="role">
            <USelectMenu
              v-model="addStaffForm.role as any"
              :options="rolesList"
              option-attribute="name"
              value-attribute="id"
              placeholder="Select a role (optional)"
              nullable
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showAddModal = false"
            />
            <UButton
              label="Add Staff"
              type="submit"
              :loading="addStaffMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Add Role Modal -->
    <UModal v-model="showAddRoleModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Staff Role</h3>
        </template>

        <form @submit="onAddRole" class="space-y-4">
          <UFormGroup label="Role Name" name="name" required>
            <UInput
              v-model="addRoleForm.name"
              placeholder="e.g. Coordinator, Volunteer"
            />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea
              v-model="addRoleForm.description"
              placeholder="Role responsibilities..."
              :rows="3"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showAddRoleModal = false"
            />
            <UButton
              label="Create Role"
              type="submit"
              :loading="addRoleMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventStaff, useCreateEventStaff, useDeleteEventStaff } from '~/composables/resources/events/eventStaff'
import { useEventRoles, useCreateEventRole, useDeleteEventRole } from '~/composables/resources/events/eventRoles'
import { useUsers } from '~/composables/resources/user/users'
import EventsManagementLayout from "~/components/events/EventManagementLayout.vue"
import { useCurrentUserEventPermissions } from '~/composables/permissions'


definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'STAFF',
    action: 'read'
  }
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Fetch staff and roles
const eventIdFilter = { event__event_id: route.params.id as string }
const { data: staffData, isLoading: staffLoading, refetch: refetchStaff } = useEventStaff(eventIdFilter)
const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useEventRoles()

const staffList = computed(() => staffData.value?.data?.results || [])
const rolesList = computed(() => rolesData.value?.data?.results || [])

// User search for adding staff
const userSearch = ref('')
const usersParams = computed(() => ({
  search: userSearch.value || undefined,
}))
const { data: usersData } = useUsers(usersParams)
const usersList = computed(() => usersData.value?.data?.results || [])
const selectedUser = ref<any>(null)

// Modals
const showAddModal = ref(false)
const showAddRoleModal = ref(false)

// Add staff form
const addStaffForm = reactive({
  role: null as number | null,
})

const addStaffMutation = useCreateEventStaff()

const onAddStaff = async (e: Event) => {
  e.preventDefault()

  if (!selectedUser.value) {
    toast.add({
      title: 'Please select a user',
      color: 'red',
    })
    return
  }

  try {
    await addStaffMutation.mutateAsync({
      user: selectedUser.value.id,
      event: Number(route.params.id),
    })

    toast.add({
      title: 'Staff member added',
      color: 'green',
    })

    showAddModal.value = false
    selectedUser.value = null
    addStaffForm.role = null
    refetchStaff()
  } catch (error) {
    toast.add({
      title: 'Failed to add staff member',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove staff
const removeStaffMutation = useDeleteEventStaff()

const removeStaff = async (staffId: string) => {
  if (!confirm('Remove this staff member?')) return

  try {
    // Convert string staff_id to number for mutation
    await removeStaffMutation.mutateAsync(parseInt(staffId))

    toast.add({
      title: 'Staff member removed',
      color: 'green',
    })

    refetchStaff()
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
