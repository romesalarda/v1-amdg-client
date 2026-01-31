<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between gap-4">
      <!-- Avatar & User Info -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span class="text-lg font-semibold text-primary-600">
            {{ userInitials }}
          </span>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-900 truncate">
            {{ staff.user_email }}
          </div>
          <div class="text-sm text-gray-600">
            Staff ID: {{ staff.staff_id }}
          </div>
          <AuditTrailDisplay
            :assigned-by="staff.assigned_by_email"
            :assigned-at="staff.assigned_at"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <UButton
          :icon="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          variant="ghost"
          size="sm"
          @click="toggleExpand"
          v-if="canUpdateStaff"
          :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        />
        <UButton
          icon="i-heroicons-trash"
          color="red"
          variant="ghost"
          size="sm"
          @click="$emit('remove')"
          v-if="canDeleteStaff"
          aria-label="Remove staff member"
        />
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
      <UBadge
        v-if="permissions.length > maxVisiblePermissions"
        color="gray"
        variant="soft"
        size="sm"
      >
        +{{ permissions.length - maxVisiblePermissions }} more
      </UBadge>
    </div>

    <div v-else-if="!isExpanded && permissions.length === 0" class="mt-3 text-sm text-gray-500">
      No permissions assigned
    </div>

    <!-- Expanded View: Permission Editor -->
    <div v-if="isExpanded" class="mt-4 border-t border-gray-200 pt-4">
      <InlinePermissionEditor
        :staff-id="staff.staff_id"
        :event-id="staff.event"
        :user-id="staff.user!"
        :current-permissions="permissions"
        @save="handleSavePermissions"
        @cancel="isExpanded = false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EventStaff, EventPermissionAssignment } from '~/api/types.gen'
import type { PermissionCategory, CRUDAction } from '~/types/permissions'
import PermissionBadge from './PermissionBadge.vue'
import AuditTrailDisplay from './AuditTrailDisplay.vue'
import InlinePermissionEditor from './InlinePermissionEditor.vue'

interface Props {
  staff: EventStaff
  permissions: EventPermissionAssignment[]
  canUpdateStaff?: boolean
  canDeleteStaff?: boolean
}

interface Emits {
  (e: 'remove'): void
  (e: 'update-permissions', permissions: Record<string, CRUDAction[]>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isExpanded = ref(false)
const maxVisiblePermissions = 5

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
