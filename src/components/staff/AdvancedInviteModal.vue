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
                    No eligible users found for "{{ userSearch }}"
                  </div>
                </div>

                <p v-if="!userSearch" class="text-xs text-[#607a96] px-1">Start typing to search users in your organisation</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Permission Template -->
          <div v-if="currentStep === 2" class="space-y-4">
            <PermissionPresetSelector
              v-model="selectedTemplate"
              @template-selected="handleTemplateSelect"
            />

            <div class="p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-[#1a2f4d] flex gap-2">
              <span class="material-symbols-outlined text-base text-primary flex-shrink-0 mt-0.5">info</span>
              <span>Selecting a template applies a predefined permission set when the invite is accepted. You can customise permissions further from the staff card after acceptance.</span>
            </div>
          </div>

          <!-- Step 3: Review & Send -->
          <div v-if="currentStep === 3" class="space-y-4">
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
                <div class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">Template</span>
                  <span class="text-sm font-bold text-primary">{{ selectedTemplate ?? 'None (no permissions)' }}</span>
                </div>
                <div v-if="expiryDate" class="flex justify-between items-center py-2 px-3 bg-mist-blue rounded-lg">
                  <span class="text-xs font-semibold text-[#294160] uppercase tracking-wide">Expires</span>
                  <span class="text-sm font-bold text-[#071427]">{{ formatDate(expiryDate) }}</span>
                </div>
              </div>
            </div>

            <div v-if="!selectedTemplate" class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-sm text-amber-800">
              <span class="material-symbols-outlined text-base flex-shrink-0 mt-0.5">warning</span>
              <span>No permission template selected. This user will have very limited access until permissions are assigned manually after acceptance.</span>
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
import PermissionPresetSelector from './PermissionPresetSelector.vue'

interface Props {
  modelValue: boolean
  eventId: number
  usersList: any[]
  staffList: any[]
  existingInvites?: any[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'invite-sent', data: InviteData): void
}

interface InviteData {
  userId: number
  permissionTemplate: string | null
  expiryDate: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentStep = ref(1)
const totalSteps = 3
const loading = ref(false)

const stepTitles = [
  'Select User',
  'Permission Template',
  'Review & Send',
]

// Step 1 data
const userSearch = ref('')
const selectedUser = ref<any>(null)

const existingStaffUserIds = computed(() =>
  new Set((props.staffList || []).map((s: any) => s.user).filter(Boolean))
)

const pendingInviteUserIds = computed(() =>
  new Set(
    (props.existingInvites || [])
      .filter((i: any) => i.is_valid)
      .map((i: any) => i.target_user)
      .filter(Boolean)
  )
)

const filteredUsers = computed(() => {
  if (!userSearch.value) return []
  const q = userSearch.value.toLowerCase()
  return props.usersList.filter(u => {
    if (existingStaffUserIds.value.has(u.id)) return false
    if (pendingInviteUserIds.value.has(u.id)) return false
    return (
      u.email?.toLowerCase().includes(q) ||
      `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase().includes(q)
    )
  })
})

// Step 2 data
const selectedTemplate = ref<string | null>(null)

const handleTemplateSelect = (_permissions: Record<string, any>) => {
  // Template selection is stored by key via v-model; no extra handling needed
}

// Step 3 data
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

// Invite submission
const sendInvite = async () => {
  if (!selectedUser.value) return

  loading.value = true

  try {
    const inviteData: InviteData = {
      userId: selectedUser.value.id,
      permissionTemplate: selectedTemplate.value,
      expiryDate: expiryDate.value || null,
    }

    emit('invite-sent', inviteData)
    close()
  } finally {
    loading.value = false
  }
}

// Utility
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
  selectedTemplate.value = null
  expiryDate.value = ''
  userSearch.value = ''
}

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>


