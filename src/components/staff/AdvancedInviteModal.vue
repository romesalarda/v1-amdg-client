<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }">
    <UCard :ui="{ body: { base: 'bg-gray-50' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">Send Staff Invite</h3>
            <p class="text-sm text-gray-600 mt-1">
              Step {{ currentStep }} of {{ totalSteps }}
            </p>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            @click="close"
            aria-label="Close"
          />
        </div>
      </template>

      <!-- Progress Indicator -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="flex-1 h-2 rounded-full mx-1 transition-colors"
            :class="step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'"
          />
        </div>
        <div class="text-sm text-gray-600 text-center">
          {{ stepTitles[currentStep - 1] }}
        </div>
      </div>

      <!-- Step 1: User Selection -->
      <div v-if="currentStep === 1" class="space-y-4">
        <UFormGroup label="Select User" required>
          <USelectMenu
            v-model="selectedUser"
            :options="usersList"
            searchable
            :search-attributes="['email', 'first_name', 'last_name']"
            placeholder="Search for a user..."
            @update:query="userSearch = $event"
            :ui="{ base: 'bg-white' }"
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

        <div v-if="selectedUser" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2 text-sm text-blue-800">
            <UIcon name="i-heroicons-information-circle" class="h-5 w-5" />
            <span>Selected: <strong>{{ selectedUser.email }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Step 2: Role Assignment (Optional) -->
      <div v-if="currentStep === 2" class="space-y-4">
        <UFormGroup label="Assign Role (Optional)" description="Roles provide pre-configured permission sets">
          <USelectMenu
            :model-value="selectedRole ?? undefined"
            @update:model-value="(val: any) => selectedRole = val"
            :options="rolesList"
            option-attribute="name"
            value-attribute="id"
            placeholder="Select a role..."
            nullable
            :ui="{ base: 'bg-white' }"
          >
            <template #option="{ option }">
              <div class="flex flex-col">
                <span class="font-medium">{{ option.name }}</span>
                <span v-if="option.description" class="text-sm text-gray-500">
                  {{ option.description }}
                </span>
              </div>
            </template>
          </USelectMenu>
        </UFormGroup>

        <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div class="flex items-start gap-2 text-sm text-indigo-900">
            <UIcon name="i-heroicons-information-circle" class="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Note:</strong> You can customize permissions in the next step, or skip role assignment to define custom permissions from scratch.
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Custom Permissions -->
      <div v-if="currentStep === 3" class="space-y-4">
        <div class="p-3 bg-white rounded-lg border border-gray-300">
          <div class="text-sm text-gray-800 font-medium">
            {{ selectedRole ? 'Customize permissions or use a template:' : 'Select a permission template or customize:' }}
          </div>
        </div>

        <PermissionPresetSelector
          v-model="selectedTemplate"
          @template-selected="handleTemplateSelect"
        />

        <div class="bg-white rounded-lg border-2 border-gray-300 p-4 max-h-96 overflow-y-auto shadow-sm">
          <div v-for="category in categories" :key="category" class="mb-5 last:mb-0">
            <div class="font-semibold text-sm text-gray-900 mb-3 pb-2 border-b-2 border-gray-200 sticky top-0 bg-white">
              {{ categoryLabels[category] }}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label
                v-for="action in actions"
                :key="`${category}-${action}`"
                class="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary-50 p-2.5 rounded-md border border-gray-200 bg-gray-50 transition-colors"
              >
                <UCheckbox
                  :model-value="isActionEnabled(category, action)"
                  @update:model-value="toggleAction(category, action, $event)"
                />
                <span class="capitalize font-medium text-gray-700">{{ action }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Invite Details -->
      <div v-if="currentStep === 4" class="space-y-4">
        <UFormGroup label="Expiry Date (Optional)" description="Leave empty for no expiration">
          <UInput
            v-model="expiryDate"
            type="date"
            :min="minDate"
            :ui="{ base: 'bg-white' }"
          />
        </UFormGroup>

        <div class="p-4 bg-white rounded-lg border-2 border-primary-200 shadow-sm">
          <div class="font-semibold text-base text-gray-900 mb-4 pb-2 border-b border-gray-200">Summary</div>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-700 font-medium">User:</span>
              <span class="font-semibold text-gray-900">{{ selectedUser?.email }}</span>
            </div>
            
            <div v-if="selectedRole" class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-700 font-medium">Role:</span>
              <span class="font-semibold text-gray-900">{{ getRoleName(selectedRole) }}</span>
            </div>
            
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-700 font-medium">Permissions:</span>
              <span class="font-semibold text-primary-600">{{ permissionCount }} permission(s)</span>
            </div>
            
            <div v-if="expiryDate" class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-700 font-medium">Expires:</span>
              <span class="font-semibold text-gray-900">{{ formatDate(expiryDate) }}</span>
            </div>
          </div>
        </div>

        <div v-if="permissionCount === 0" class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div class="flex items-center gap-2 text-sm text-yellow-800">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5" />
            <span>Warning: No permissions selected. User will have limited access.</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            v-if="currentStep > 1"
            label="Back"
            variant="ghost"
            @click="previousStep"
            :disabled="loading"
          />
          <div v-else />
          
          <div class="flex gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="close"
              :disabled="loading"
            />
            <UButton
              v-if="currentStep < totalSteps"
              label="Next"
              @click="nextStep"
              :disabled="!canProceed"
            />
            <UButton
              v-else
              label="Send Invite"
              @click="sendInvite"
              :loading="loading"
              :disabled="!canSendInvite"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { PermissionCategory, CRUDAction } from '~/types/permissions'
import PermissionPresetSelector from './PermissionPresetSelector.vue'

interface Props {
  modelValue: boolean
  eventId: number
  usersList: any[]
  rolesList: any[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'invite-sent', data: InviteData): void
}

interface InviteData {
  userId: number
  roleId?: number | null
  permissions: Record<string, CRUDAction[]>
  expiryDate?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentStep = ref(1)
const totalSteps = 4
const loading = ref(false)

const stepTitles = [
  'Select User',
  'Assign Role',
  'Set Permissions',
  'Review & Send',
]

// Step 1 data
const userSearch = ref('')
const selectedUser = ref<any>(null)

// Step 2 data
const selectedRole = ref<number | null>(null)

// Step 3 data
const selectedTemplate = ref<string | null>(null)
const permissions = ref<Record<string, Set<CRUDAction>>>({})

const categories: PermissionCategory[] = [
  'GENERAL',
  'REGISTRATION',
  'PRODUCT_MANAGEMENT',
  'CONTENT_MANAGEMENT',
  'STAFF_MANAGEMENT',
  'REPORTING',
]

const categoryLabels: Record<PermissionCategory, string> = {
  GENERAL: 'General Permissions',
  REGISTRATION: 'Registration Management',
  PRODUCT_MANAGEMENT: 'Product Management',
  CONTENT_MANAGEMENT: 'Content Management',
  STAFF_MANAGEMENT: 'Staff Management',
  REPORTING: 'Reporting & Analytics',
}

const actions: CRUDAction[] = ['create', 'read', 'update', 'delete']

// Step 4 data
const expiryDate = ref('')
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Navigation logic
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return selectedUser.value !== null
  }
  return true
})

const canSendInvite = computed(() => {
  return selectedUser.value !== null
})

const permissionCount = computed(() => {
  return Object.values(permissions.value).reduce((sum, set) => sum + set.size, 0)
})

const nextStep = () => {
  if (currentStep.value < totalSteps && canProceed.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Permission management
const isActionEnabled = (category: PermissionCategory, action: CRUDAction): boolean => {
  return permissions.value[category]?.has(action) || false
}

const toggleAction = (category: PermissionCategory, action: CRUDAction, enabled: boolean) => {
  if (!permissions.value[category]) {
    permissions.value[category] = new Set()
  }
  
  if (enabled) {
    permissions.value[category].add(action)
    if (action !== 'read') {
      permissions.value[category].add('read')
    }
  } else {
    permissions.value[category].delete(action)
    if (action === 'read') {
      permissions.value[category].clear()
    }
  }
  
  selectedTemplate.value = null
}

const handleTemplateSelect = (templatePermissions: Record<string, CRUDAction[]>) => {
  const newPerms: Record<string, Set<CRUDAction>> = {}
  
  Object.entries(templatePermissions).forEach(([category, actions]) => {
    newPerms[category] = new Set(actions)
  })
  
  permissions.value = newPerms
}

// Invite submission
const sendInvite = async () => {
  if (!selectedUser.value) return
  
  loading.value = true
  
  try {
    const permissionsToSend: Record<string, CRUDAction[]> = {}
    Object.entries(permissions.value).forEach(([category, actions]) => {
      if (actions.size > 0) {
        permissionsToSend[category] = Array.from(actions)
      }
    })
    
    const inviteData: InviteData = {
      userId: selectedUser.value.id,
      roleId: selectedRole.value,
      permissions: permissionsToSend,
      expiryDate: expiryDate.value || null,
    }
    
    emit('invite-sent', inviteData)
    close()
  } finally {
    loading.value = false
  }
}

// Utility functions
const getRoleName = (roleId: number): string => {
  const role = props.rolesList.find(r => r.id === roleId)
  return role?.name || 'Unknown'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const close = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  selectedUser.value = null
  selectedRole.value = null
  selectedTemplate.value = null
  permissions.value = {}
  expiryDate.value = ''
  userSearch.value = ''
}

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>
