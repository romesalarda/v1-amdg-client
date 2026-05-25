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
        @mousedown.self="closeModal"
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
                <span class="material-symbols-outlined text-base text-white">verified_user</span>
                Email Verification
              </h2>
              <button
                type="button"
                class="text-white/60 hover:text-white transition-colors"
                aria-label="Close"
                @click="closeModal"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <!-- Already verified -->
              <template v-if="emailVerified">
                <div class="flex flex-col items-center gap-3 py-4 text-center">
                  <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-green-600">verified</span>
                  </div>
                  <h3 class="font-black text-navy-900 uppercase tracking-wide text-sm">Email Verified</h3>
                  <p class="text-sm text-navy-600">
                    Your email address is confirmed and in good standing.
                  </p>
                  <p v-if="verifiedAt" class="text-xs text-navy-400">
                    Verified on {{ formattedVerifiedAt }}
                  </p>
                </div>
              </template>

              <!-- Not yet verified -->
              <template v-else>
                <div class="flex flex-col items-center gap-3 py-4 text-center">
                  <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-amber-600">mark_email_unread</span>
                  </div>
                  <h3 class="font-black text-navy-900 uppercase tracking-wide text-sm">Verify your email</h3>
                  <p class="text-sm text-navy-600 max-w-xs">
                    We sent a verification link to <strong>{{ userEmail }}</strong>. Check your inbox and click the link to confirm your address.
                  </p>
                </div>

                <div v-if="resendSuccess" class="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 font-medium flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">check_circle</span>
                  Verification email sent! Check your inbox.
                </div>

                <div v-if="resendError" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
                  {{ resendError }}
                </div>

                <button
                  type="button"
                  :disabled="resendPending || !!cooldownSecondsLeft"
                  class="w-full py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-navy-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  @click="handleResend"
                >
                  <span v-if="!resendPending" class="material-symbols-outlined text-base">forward_to_inbox</span>
                  <span v-else class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-if="cooldownSecondsLeft">Resend in {{ cooldownSecondsLeft }}s</span>
                  <span v-else>{{ resendPending ? 'Sending…' : 'Resend verification email' }}</span>
                </button>
              </template>

              <!-- Close button -->
              <button
                type="button"
                class="w-full py-3 bg-white border border-primary text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
                @click="closeModal"
              >
                Close
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useResendVerification } from '~/composables/resources/user/users'

const props = defineProps<{
  modelValue: boolean
  emailVerified: boolean
  verifiedAt?: string | null
  userEmail?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { $notyf } = useNuxtApp()

const { mutateAsync: resendMutate, isPending: resendPending } = useResendVerification()

// Resend state
const resendSuccess = ref(false)
const resendError = ref('')
const cooldownSecondsLeft = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const formattedVerifiedAt = computed(() => {
  if (!props.verifiedAt) return ''
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.verifiedAt))
})

function closeModal() {
  emit('update:modelValue', false)
}

function startCooldown(seconds = 60) {
  cooldownSecondsLeft.value = seconds
  cooldownTimer = setInterval(() => {
    cooldownSecondsLeft.value -= 1
    if (cooldownSecondsLeft.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleResend() {
  resendSuccess.value = false
  resendError.value = ''

  try {
    await resendMutate()
    resendSuccess.value = true
    startCooldown(60)
    $notyf.success('Verification email sent!')
  }
  catch (err: unknown) {
    const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
    const detail = data?.detail
    resendError.value = detail ? String(detail) : 'Could not send verification email. Please try again.'
  }
}

// Reset on close
watch(() => props.modelValue, (open) => {
  if (!open) {
    resendSuccess.value = false
    resendError.value = ''
  }
})
</script>
