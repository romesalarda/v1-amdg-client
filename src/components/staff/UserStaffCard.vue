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
          <div class="text-xs text-navy-400">
            Staff ID: {{ staff.staff_id }}
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

    <!-- Expanded View: Permission Editor -->
    <div v-if="isExpanded" class="mt-4 border-t border-deep-navy/10 pt-4">
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
