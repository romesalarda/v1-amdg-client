<template>
  <div class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors">
    <div class="flex items-start justify-between gap-4">
      <!-- Avatar & User Info -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-black text-primary">
            {{ userInitials }}
          </span>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-navy-900 truncate">
            {{ staff.user_email }}
          </div>
          <div class="flex items-center gap-2 text-xs text-navy-400">
            <span>Staff ID: {{ staff.staff_id }}</span>
            <span v-if="currentRole" class="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
              {{ currentRole.role_name }}
            </span>
          </div>
          <AuditTrailDisplay
            :assigned-by="staff.assigned_by_email"
            :assigned-at="staff.assigned_at"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button
          v-if="canUpdateStaff"
          @click="toggleExpand"
          :aria-label="isExpanded ? 'Collapse' : 'Expand'"
          class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-white rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">
            {{ isExpanded ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        <button
          v-if="canDeleteStaff"
          @click="$emit('remove')"
          aria-label="Remove staff member"
          class="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>

    <!-- Permission Badges (collapsed view) -->
    <div v-if="!isExpanded && permissions.length > 0" class="mt-3 flex flex-wrap gap-2">
      <PermissionBadge
        v-for="perm in displayPermissions"
        :key="perm.id"
        :category="perm.permission_category as PermissionCategory"
        :actions="getPermissionActions(perm)"
        :is-custom="false"
        :permission-name="perm.permission_name"
      />
      <span
        v-if="permissions.length > maxVisiblePermissions"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-500"
      >
        +{{ permissions.length - maxVisiblePermissions }} more
      </span>
    </div>

    <div v-else-if="!isExpanded && permissions.length === 0" class="mt-3 text-xs text-navy-400 italic">
      No permissions assigned
    </div>

    <!-- Expanded View: Role & Permission Editor -->
    <div v-if="isExpanded" class="mt-4 border-t border-deep-navy/10 pt-4 space-y-4">
      <!-- Role Assignment Section -->
      <div class="space-y-2">
        <label class="block text-xs font-black text-primary uppercase tracking-wider">
          Assigned Role
        </label>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedRoleId"
            @change="handleRoleChange"
            :disabled="!canUpdateStaff || roleUpdateLoading"
            class="flex-1 px-4 py-2 bg-white border border-[#bcc8d8] focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-[#071427] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option :value="null">No role assigned</option>
            <option v-for="role in rolesList" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <span v-if="roleUpdateLoading" class="material-symbols-outlined text-primary animate-spin">
            progress_activity
          </span>
        </div>
        <p class="text-xs text-navy-500">
          Roles provide pre-configured permission sets that can be customized below
        </p>
      </div>

      <!-- Permission Editor Section -->
      <div class="border-t border-deep-navy/10 pt-4">
        <InlinePermissionEditor
          :staff-id="staff.staff_id"
          :event-id="staff.event"
          :user-id="staff.user!"
          :current-permissions="permissions"
          @save="handleSavePermissions"
          @cancel="isExpanded = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventStaff, EventPermissionAssignment, EventRoleAssignment } from '~/api/types.gen'
import type { PermissionCategory, CRUDAction } from '~/types/permissions'
import { 
  useEventRoleAssignments, 
  useCreateEventRoleAssignment, 
  usePartialUpdateEventRoleAssignment,
  useDeleteEventRoleAssignment 
} from '~/composables/resources/events/eventRoleAssignments'
import PermissionBadge from './PermissionBadge.vue'
import AuditTrailDisplay from './AuditTrailDisplay.vue'
import InlinePermissionEditor from './InlinePermissionEditor.vue'

interface Props {
  staff: EventStaff
  permissions: EventPermissionAssignment[]
  rolesList: any[]
  canUpdateStaff?: boolean
  canDeleteStaff?: boolean
}

interface Emits {
  (e: 'remove'): void
  (e: 'update-permissions', permissions: Record<string, CRUDAction[]>): void
  (e: 'role-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const toast = useToast()

const isExpanded = ref(false)
const maxVisiblePermissions = 5
const selectedRoleId = ref<number | null>(null)
const roleUpdateLoading = ref(false)

// Fetch role assignments for this user/event
const roleAssignmentsFilter = computed(() => {
  const filter: any = {
    event: props.staff.event,
  }
  if (props.staff.user !== null) {
    filter.user = props.staff.user
  }
  return filter
})

const { data: roleAssignmentsData, refetch: refetchRoleAssignments } = useEventRoleAssignments(roleAssignmentsFilter)

const currentRole = computed<EventRoleAssignment | null>(() => {
  const assignments = roleAssignmentsData.value?.data?.results || []
  return assignments.length > 0 ? assignments[0] : null
})

// Mutations for role assignment
const createRoleAssignmentMutation = useCreateEventRoleAssignment()
const updateRoleAssignmentMutation = usePartialUpdateEventRoleAssignment()
const deleteRoleAssignmentMutation = useDeleteEventRoleAssignment()

// Initialize selected role when current role changes
watch(currentRole, (newRole) => {
  selectedRoleId.value = newRole?.role || null
}, { immediate: true })

const handleRoleChange = async () => {
  if (!props.staff.user) {
    toast.add({
      title: 'Cannot assign role',
      description: 'Staff member must be linked to a user',
      color: 'orange',
    })
    return
  }

  roleUpdateLoading.value = true

  try {
    if (selectedRoleId.value === null) {
      // Remove role assignment
      if (currentRole.value) {
        await deleteRoleAssignmentMutation.mutateAsync(currentRole.value.id)
        toast.add({
          title: 'Role removed',
          color: 'green',
        })
      }
    } else if (currentRole.value) {
      // Update existing role assignment
      await updateRoleAssignmentMutation.mutateAsync({
        assignmentId: currentRole.value.id,
        body: { role: selectedRoleId.value },
      })
      toast.add({
        title: 'Role updated',
        color: 'green',
      })
    } else {
      // Create new role assignment
      await createRoleAssignmentMutation.mutateAsync({
        event: props.staff.event,
        user: props.staff.user,
        role: selectedRoleId.value,
      })
      toast.add({
        title: 'Role assigned',
        color: 'green',
      })
    }

    await refetchRoleAssignments()
    emit('role-updated')
  } catch (error) {
    toast.add({
      title: 'Failed to update role',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
    // Revert to current role
    selectedRoleId.value = currentRole.value?.role || null
  } finally {
    roleUpdateLoading.value = false
  }
}

// const isExpanded = ref(false)
// const maxVisiblePermissions = 5

const userInitials = computed(() => {
  const email = props.staff.user_email
  if (!email) return '?'
  
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
})

const displayPermissions = computed(() => {
  return props.permissions.slice(0, maxVisiblePermissions)
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const getPermissionActions = (permission: EventPermissionAssignment): CRUDAction[] => {
  const actions: CRUDAction[] = []
  
  if (permission.allow_create) actions.push('create')
  if (permission.read_only || permission.allow_create || permission.allow_update || permission.allow_delete) {
    actions.push('read')
  }
  if (permission.allow_update) actions.push('update')
  if (permission.allow_delete) actions.push('delete')
  
  return actions
}

const handleSavePermissions = (permissions: Record<string, CRUDAction[]>) => {
  emit('update-permissions', permissions)
  isExpanded.value = false
}
</script>
