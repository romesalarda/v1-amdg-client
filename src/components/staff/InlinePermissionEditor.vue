<template>
  <div class="space-y-4 p-4 bg-mist-blue/40 rounded-xl border border-deep-navy/10">
    <!-- Template Selector -->
    <PermissionPresetSelector
      v-model="selectedTemplate"
      @template-selected="handleTemplateSelect"
    />

    <!-- Permission Categories Grid -->
    <div class="space-y-3">
      <div v-for="category in categories" :key="category" class="rounded-xl overflow-hidden border border-deep-navy/10">
        <div class="px-3 py-2 bg-white">
          <p class="text-xs font-black text-primary uppercase tracking-wider">{{ categoryLabels[category] }}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-mist-blue/30">
          <label
            v-for="action in actions"
            :key="`${category}-${action}`"
            class="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-lg border border-deep-navy/10 bg-white/60 transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': disabled }"
          >
            <input
              type="checkbox"
              :checked="isActionEnabled(category, action)"
              @change="toggleAction(category, action, ($event.target as HTMLInputElement).checked)"
              :disabled="disabled"
              class="h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0 flex-shrink-0"
            />
            <span class="capitalize font-medium text-navy-700">{{ action }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Validation Messages -->
    <div v-if="validationMessage" class="flex items-center gap-1.5 text-xs" :class="validationClass">
      <span class="material-symbols-outlined" style="font-size: 14px;">
        {{ validationIcon === 'i-heroicons-exclamation-circle' ? 'error' : 'warning' }}
      </span>
      {{ validationMessage }}
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-2 pt-1">
      <button
        type="button"
        @click="$emit('cancel')"
        :disabled="saving"
        class="px-4 py-2 text-sm font-semibold text-navy-600 hover:text-navy-900 hover:bg-white rounded-xl transition-colors disabled:opacity-40"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!hasChanges || saving"
        class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        <span v-if="saving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PermissionCategory, CRUDAction } from '~/types/permissions'
import type { EventPermissionAssignment } from '~/api/types.gen'
import PermissionPresetSelector from './PermissionPresetSelector.vue'

interface Props {
  staffId: string
  eventId: string
  userId: number
  currentPermissions?: EventPermissionAssignment[]
  disabled?: boolean
}

interface Emits {
  (e: 'save', permissions: Record<string, CRUDAction[]>): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  currentPermissions: () => [],
  disabled: false,
})

const emit = defineEmits<Emits>()

const categories: PermissionCategory[] = [
  'GENERAL',
  'REGISTRATION',
  'PRODUCT_MANAGEMENT',
  'CONTENT_MANAGEMENT',
  'STAFF_MANAGEMENT',
  'REPORTING',
  'BOOKING_MANAGEMENT',
  'PAYMENT_MANAGEMENT',
  'RESOURCE_MANAGEMENT',
]

const categoryLabels: Record<PermissionCategory, string> = {
  GENERAL: 'General Permissions',
  REGISTRATION: 'Registration Management',
  PRODUCT_MANAGEMENT: 'Product Management',
  CONTENT_MANAGEMENT: 'Content Management',
  STAFF_MANAGEMENT: 'Staff Management',
  REPORTING: 'Reporting & Analytics',
  PAYMENT_MANAGEMENT: 'Payment Management',
  BOOKING_MANAGEMENT: 'Booking Management',
  RESOURCE_MANAGEMENT: 'Resource Management',
}

const actions: CRUDAction[] = ['create', 'read', 'update', 'delete']

const selectedTemplate = ref<string | null>(null)
const permissions = ref<Record<string, Set<CRUDAction>>>({})
const saving = ref(false)

// Initialize permissions from current assignments
onMounted(() => {
  initializePermissions()
})

const initializePermissions = () => {
  const perms: Record<string, Set<CRUDAction>> = {}
  
  props.currentPermissions.forEach(assignment => {
    const category = assignment.permission_category
    if (!perms[category]) {
      perms[category] = new Set()
    }
    
    if (assignment.allow_create) perms[category].add('create')
    if (assignment.read_only || assignment.allow_create || assignment.allow_update || assignment.allow_delete) {
      perms[category].add('read')
    }
    if (assignment.allow_update) perms[category].add('update')
    if (assignment.allow_delete) perms[category].add('delete')
  })
  
  permissions.value = perms
}

const isActionEnabled = (category: PermissionCategory, action: CRUDAction): boolean => {
  return permissions.value[category]?.has(action) || false
}

const toggleAction = (category: PermissionCategory, action: CRUDAction, enabled: boolean) => {
  if (!permissions.value[category]) {
    permissions.value[category] = new Set()
  }
  
  if (enabled) {
    permissions.value[category].add(action)
    // Always enable read if any other action is enabled
    if (action !== 'read') {
      permissions.value[category].add('read')
    }
  } else {
    permissions.value[category].delete(action)
    // If disabling read, disable all other actions
    if (action === 'read') {
      permissions.value[category].clear()
    }
  }
  
  // Clear template selection since we're customizing
  selectedTemplate.value = null
}

const handleTemplateSelect = (templatePermissions: Record<string, CRUDAction[]>) => {
  const newPerms: Record<string, Set<CRUDAction>> = {}
  
  Object.entries(templatePermissions).forEach(([category, actions]) => {
    newPerms[category] = new Set(actions)
  })
  
  permissions.value = newPerms
}

const hasChanges = computed(() => {
  // Compare current permissions with initial state
  const current = JSON.stringify([...Object.entries(permissions.value).map(([k, v]) => [k, Array.from(v)])])
  
  const initial: Record<string, Set<CRUDAction>> = {}
  props.currentPermissions.forEach(assignment => {
    const category = assignment.permission_category
    if (!initial[category]) {
      initial[category] = new Set()
    }
    if (assignment.allow_create) initial[category].add('create')
    if (assignment.read_only || assignment.allow_create || assignment.allow_update || assignment.allow_delete) {
      initial[category].add('read')
    }
    if (assignment.allow_update) initial[category].add('update')
    if (assignment.allow_delete) initial[category].add('delete')
  })
  
  const initialStr = JSON.stringify([...Object.entries(initial).map(([k, v]) => [k, Array.from(v)])])
  
  return current !== initialStr
})

// Validation
const validationMessage = computed(() => {
  const totalPermissions = Object.values(permissions.value).reduce((sum, set) => sum + set.size, 0)
  
  if (totalPermissions === 0) {
    return 'No permissions selected. User will have no access.'
  }
  
  // Check if user has read access to at least one category
  const hasAnyRead = Object.values(permissions.value).some(set => set.has('read'))
  if (!hasAnyRead) {
    return 'Warning: No read permissions granted.'
  }
  
  return null
})

const validationClass = computed(() => {
  if (!validationMessage.value) return ''
  
  const totalPermissions = Object.values(permissions.value).reduce((sum, set) => sum + set.size, 0)
  if (totalPermissions === 0) {
    return 'text-red-600'
  }
  
  return 'text-yellow-600'
})

const validationIcon = computed(() => {
  if (!validationMessage.value) return ''
  
  const totalPermissions = Object.values(permissions.value).reduce((sum, set) => sum + set.size, 0)
  if (totalPermissions === 0) {
    return 'i-heroicons-exclamation-circle'
  }
  
  return 'i-heroicons-exclamation-triangle'
})

const handleSave = async () => {
  saving.value = true
  
  try {
    // Convert Set to Array for emit
    const permissionsToSave: Record<string, CRUDAction[]> = {}
    Object.entries(permissions.value).forEach(([category, actions]) => {
      if (actions.size > 0) {
        permissionsToSave[category] = Array.from(actions)
      }
    })
    
    emit('save', permissionsToSave)
  } finally {
    saving.value = false
  }
}

// Watch for prop changes to reinitialize
watch(() => props.currentPermissions, () => {
  initializePermissions()
}, { deep: true })
</script>
