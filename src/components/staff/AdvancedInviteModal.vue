<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

      <div class="relative w-full max-w-2xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">

        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-[#e6e9ed] flex-shrink-0">
          <span class="material-symbols-outlined text-primary">mail</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Send Staff Invite</h3>
            <p class="text-xs text-[#607a96] mt-0.5">Step {{ currentStep }} of {{ totalSteps }} — {{ stepTitles[currentStep - 1] }}</p>
          </div>
          <button
            @click="close"
            class="p-1.5 text-[#607a96] hover:text-[#1a2f4d] hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="px-6 pt-4 flex-shrink-0">
          <div class="flex gap-1.5">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="flex-1 h-1.5 rounded-full transition-colors duration-300"
              :class="step <= currentStep ? 'bg-primary' : 'bg-[#e6e9ed]'"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">

          <!-- Step 1: User Selection -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-black text-primary uppercase tracking-wider">
                Select User <span class="text-red-500">*</span>
              </label>

              <!-- Selected user display -->
              <div v-if="selectedUser" class="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div>
                  <p class="text-sm font-semibold text-[#071427]">{{ selectedUser.email }}</p>
                  <p v-if="selectedUser.first_name || selectedUser.last_name" class="text-xs text-[#607a96]">
                    {{ selectedUser.first_name }} {{ selectedUser.last_name }}
                  </p>
                </div>
                <button
                  @click="selectedUser = null; userSearch = ''"
                  class="p-1 text-[#607a96] hover:text-red-500 transition-colors"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <!-- Search input + results -->
              <div v-else class="space-y-2">
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-[#607a96]">search</span>
                  <input
                    v-model="userSearch"
                    type="text"
                    placeholder="Search by email or name..."
                    class="w-full pl-9 pr-4 py-3 bg-white border border-[#bcc8d8] focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-[#071427] placeholder:text-[#8fa4bb] transition-all shadow-sm"
                    autofocus
                  />
                </div>

                <!-- Results list rendered inline (avoids overflow-hidden clipping) -->
                <div
                  v-if="userSearch.length > 0"
                  class="rounded-xl border border-[#e6e9ed] bg-white shadow-sm overflow-hidden"
                >
                  <template v-if="filteredUsers.length">
                    <button
                      v-for="user in filteredUsers"
                      :key="user.id"
                      type="button"
                      @click="selectedUser = user; userSearch = ''"
                      class="w-full text-left px-4 py-3 hover:bg-mist-blue transition-colors border-b border-[#e6e9ed] last:border-0 flex items-center gap-3 bg-white"
                    >
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-black text-primary">
                          {{ user.email?.substring(0, 2).toUpperCase() }}
                        </span>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-[#071427] truncate">{{ user.email }}</p>
                        <p v-if="user.first_name || user.last_name" class="text-xs text-[#607a96]">
                          {{ user.first_name }} {{ user.last_name }}
                        </p>
                      </div>
                    </button>
                  </template>
                  <div v-else class="px-4 py-4 text-sm text-[#607a96] text-center">
                    <span class="material-symbols-outlined text-2xl text-[#bcc8d8] block mb-1">person_search</span>
                    No users found for "{{ userSearch }}"
                  </div>
                </div>

                <p v-if="!userSearch" class="text-xs text-[#607a96] px-1">Start typing to search users in your organisation</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Role Assignment -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-black text-primary uppercase tracking-wider">Assign Role (Optional)</label>
              <p class="text-xs text-[#607a96]">Roles provide pre-configured permission sets</p>
              <select
                :value="selectedRole ?? ''"
                @change="selectedRole = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null"
                class="w-full px-4 py-3 bg-white border border-[#bcc8d8] focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-[#071427] transition-all appearance-none"
              >
                <option value="">No role (custom permissions)</option>
                <option v-for="role in rolesList" :key="role.id" :value="role.id">
                  {{ role.name }}<template v-if="role.description"> — {{ role.description }}</template>
                </option>
              </select>
            </div>

            <div class="p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-[#1a2f4d] flex gap-2">
              <span class="material-symbols-outlined text-base text-primary flex-shrink-0 mt-0.5">info</span>
              <span>You can customize permissions in the next step, or skip role assignment to define custom permissions from scratch.</span>
            </div>
          </div>

          <!-- Step 3: Permissions -->
          <div v-if="currentStep === 3" class="space-y-4">
            <PermissionPresetSelector
              v-model="selectedTemplate"
              @template-selected="handleTemplateSelect"
            />

            <div class="rounded-xl border border-[#e6e9ed] overflow-hidden max-h-96 overflow-y-auto">
              <div v-for="category in categories" :key="category" class="border-b border-[#e6e9ed] last:border-0">
                <div class="px-4 py-2.5 bg-mist-blue sticky top-0">
                  <p class="text-xs font-black text-primary uppercase tracking-widest">{{ categoryLabels[category] }}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-white">
                  <label
                    v-for="action in actions"
                    :key="`${category}-${action}`"
                    class="flex items-center gap-2 text-sm cursor-pointer hover:bg-mist-blue p-2.5 rounded-lg border border-[#e6e9ed] bg-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="isActionEnabled(category, action)"
                      @change="toggleAction(category, action, ($event.target as HTMLInputElement).checked)"
                      class="h-4 w-4 rounded border-[#bcc8d8] text-primary focus:ring-primary focus:ring-offset-0 flex-shrink-0"
                    />
                    <span class="capitalize font-medium text-[#1a2f4d]">{{ action }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Review & Invite Details -->
          <div v-if="currentStep === 4" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-black text-primary uppercase tracking-wider">Expiry Date (Optional)</label>
              <p class="text-xs text-[#607a96]">Leave empty for no expiration</p>
              <input
                v-model="expiryDate"
                type="date"
                :min="minDate"
                class="w-full px-4 py-3 bg-white border border-[#bcc8d8] focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-[#071427] transition-all"
              />
            </div>

            <!-- Summary -->
            <div class="rounded-xl border-2 border-primary/20 overflow-hidden">
              <div class="px-4 py-3 bg-primary/5 border-b border-primary/20">
                <p class="text-xs font-black text-primary uppercase tracking-widest">Summary</p>
              </div>
              <div class="p-4 space-y-2">
                <div class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">User</span>
                  <span class="text-sm font-bold text-[#071427]">{{ selectedUser?.email }}</span>
                </div>
                <div v-if="selectedRole" class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">Role</span>
                  <span class="text-sm font-bold text-[#071427]">{{ getRoleName(selectedRole) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">Permissions</span>
                  <span class="text-sm font-bold text-primary">{{ permissionCount }} permission(s)</span>
                </div>
                <div v-if="expiryDate" class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">Expires</span>
                  <span class="text-sm font-bold text-[#071427]">{{ formatDate(expiryDate) }}</span>
                </div>
              </div>
            </div>

            <div v-if="permissionCount === 0" class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-sm text-amber-800">
              <span class="material-symbols-outlined text-base flex-shrink-0 mt-0.5">warning</span>
              <span>No permissions selected. This user will have very limited access.</span>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-[#e6e9ed] bg-white flex-shrink-0">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            :disabled="loading"
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#294160] hover:text-[#071427] hover:bg-mist-blue rounded-xl transition-colors disabled:opacity-40"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>
          <div v-else />

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="close"
              :disabled="loading"
              class="px-4 py-2 text-sm font-semibold text-[#294160] hover:text-[#071427] hover:bg-mist-blue rounded-xl transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              v-if="currentStep < totalSteps"
              type="button"
              @click="nextStep"
              :disabled="!canProceed"
              class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Next
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button
              v-else
              type="button"
              @click="sendInvite"
              :disabled="!canSendInvite || loading"
              class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <span v-if="loading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span class="material-symbols-outlined text-base" v-else>send</span>
              Send Invite
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
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

const filteredUsers = computed(() => {
  if (!userSearch.value) return []
  const q = userSearch.value.toLowerCase()
  return props.usersList.filter(u =>
    u.email?.toLowerCase().includes(q) ||
    `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase().includes(q)
  )
})

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
  'PAYMENT_MANAGEMENT',
  'BOOKING_MANAGEMENT',
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
