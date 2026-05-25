<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @mousedown.self="closeIfNotSubmitting"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="modelValue"
            class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-deep-navy/10 overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-primary px-6 py-4 flex items-center justify-between">
              <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-white">lock_reset</span>
                Change Password
              </h2>
              <button
                type="button"
                :disabled="isPending"
                class="text-white/60 hover:text-white transition-colors disabled:opacity-40"
                aria-label="Close"
                @click="emit('update:modelValue', false)"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <!-- Body -->
            <form class="p-6 space-y-5" novalidate @submit.prevent="handleSubmit">
              <!-- Current password -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Current Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="oldPassword"
                    :type="showOld ? 'text' : 'password'"
                    autocomplete="current-password"
                    :class="[
                      'w-full px-4 py-3 pr-12 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                      fieldErrors.old_password ? 'border border-red-400 bg-red-50' : 'border border-transparent',
                    ]"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-primary transition-colors"
                    @click="showOld = !showOld"
                  >
                    <span class="material-symbols-outlined text-base">{{ showOld ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <p v-if="fieldErrors.old_password" class="text-xs text-red-500 font-medium">{{ fieldErrors.old_password }}</p>
              </div>

              <!-- New password -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  New Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="newPassword"
                    :type="showNew ? 'text' : 'password'"
                    autocomplete="new-password"
                    :class="[
                      'w-full px-4 py-3 pr-12 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                      fieldErrors.new_password ? 'border border-red-400 bg-red-50' : 'border border-transparent',
                    ]"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-primary transition-colors"
                    @click="showNew = !showNew"
                  >
                    <span class="material-symbols-outlined text-base">{{ showNew ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <p v-if="fieldErrors.new_password" class="text-xs text-red-500 font-medium">{{ fieldErrors.new_password }}</p>
              </div>

              <!-- Confirm new password -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Confirm New Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="confirmPassword"
                    :type="showConfirm ? 'text' : 'password'"
                    autocomplete="new-password"
                    :class="[
                      'w-full px-4 py-3 pr-12 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                      fieldErrors.new_password_confirm ? 'border border-red-400 bg-red-50' : 'border border-transparent',
                    ]"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-primary transition-colors"
                    @click="showConfirm = !showConfirm"
                  >
                    <span class="material-symbols-outlined text-base">{{ showConfirm ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <p v-if="fieldErrors.new_password_confirm" class="text-xs text-red-500 font-medium">{{ fieldErrors.new_password_confirm }}</p>
              </div>

              <!-- Strength hint -->
              <p v-if="strengthMessage" :class="['text-xs font-medium', strengthColor]">{{ strengthMessage }}</p>

              <!-- General error (e.g. wrong old password from API) -->
              <div v-if="serverError" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
                {{ serverError }}
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  :disabled="isPending"
                  class="flex-1 py-3 bg-white border border-primary text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="emit('update:modelValue', false)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isPending"
                  class="flex-1 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-navy-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {{ isPending ? 'Saving…' : 'Update' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useChangePassword } from '~/composables/resources/user/users'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { $notyf } = useNuxtApp()
const { mutateAsync, isPending } = useChangePassword()

// Field state
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Visibility toggles
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// Error state
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')

// Reset state when modal opens/closes
watch(() => props.modelValue, (open) => {
  if (!open) {
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showOld.value = false
    showNew.value = false
    showConfirm.value = false
    fieldErrors.value = {}
    serverError.value = ''
  }
})

// Client-side password strength hint
const strengthMessage = computed(() => {
  const p = newPassword.value
  if (!p) return ''
  if (p.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(p)) return 'Add an uppercase letter for a stronger password.'
  if (!/[0-9]/.test(p)) return 'Add a number for a stronger password.'
  return ''
})

const strengthColor = computed(() =>
  strengthMessage.value ? 'text-amber-600' : '',
)

function closeIfNotSubmitting() {
  if (!isPending.value) emit('update:modelValue', false)
}

function validateLocally(): boolean {
  const errors: Record<string, string> = {}

  if (!oldPassword.value) {
    errors.old_password = 'Current password is required.'
  }
  if (!newPassword.value) {
    errors.new_password = 'New password is required.'
  }
  else if (newPassword.value.length < 8) {
    errors.new_password = 'Password must be at least 8 characters.'
  }
  if (!confirmPassword.value) {
    errors.new_password_confirm = 'Please confirm your new password.'
  }
  else if (newPassword.value !== confirmPassword.value) {
    errors.new_password_confirm = 'Passwords do not match.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  serverError.value = ''
  fieldErrors.value = {}

  if (!validateLocally()) return

  try {
    await mutateAsync({
      old_password: oldPassword.value,
      new_password: newPassword.value,
      new_password_confirm: confirmPassword.value,
    })
    $notyf.success('Password updated successfully.')
    emit('success')
    emit('update:modelValue', false)
  }
  catch (err: unknown) {
    const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
    if (data && typeof data === 'object') {
      const mapped: Record<string, string> = {}
      for (const [key, val] of Object.entries(data)) {
        if (key === 'detail' || key === 'non_field_errors') {
          serverError.value = Array.isArray(val) ? val[0] : String(val)
        }
        else {
          mapped[key] = Array.isArray(val) ? val[0] : String(val)
        }
      }
      fieldErrors.value = mapped
    }
    else {
      serverError.value = 'An unexpected error occurred. Please try again.'
    }
  }
}
</script>
