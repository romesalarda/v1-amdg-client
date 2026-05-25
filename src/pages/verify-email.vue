<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 z-0">
      <FlowingBackground :speed="3" :soft="8" :palette="4" position="absolute" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/45 to-slate-950/70" />
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-10">
      <!-- Left panel (desktop) -->
      <div class="hidden w-1/2 pr-12 lg:block">
        <p class="mb-4 text-xs uppercase tracking-[0.4em] text-slate-200/80">AMDG Portal</p>
        <h1 class="max-w-md text-5xl font-serif leading-tight text-white">
          Confirming your email.
        </h1>
        <p class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80">
          We just need to make sure this email address belongs to you.
        </p>
      </div>

      <!-- Card -->
      <div class="w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

          <!-- Missing / malformed params -->
          <div v-if="linkInvalid" class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/20">
              <span class="material-symbols-outlined text-3xl text-rose-300">link_off</span>
            </div>
            <h2 class="text-2xl font-serif text-white">Invalid link</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-200/80">
              This verification link is missing required parameters. Please use the link from your verification email.
            </p>
            <NuxtLink
              to="/login"
              class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Back to login
            </NuxtLink>
          </div>

          <!-- Verifying in progress -->
          <div v-else-if="state === 'pending'" class="flex flex-col items-center gap-4 py-4 text-center">
            <span class="material-symbols-outlined text-5xl text-white/60 animate-spin">progress_activity</span>
            <p class="text-sm text-slate-200/80">Verifying your email address…</p>
          </div>

          <!-- Success -->
          <div v-else-if="state === 'success'" class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-400/30 bg-green-500/20">
              <span class="material-symbols-outlined text-3xl text-green-300">verified</span>
            </div>
            <h2 class="text-2xl font-serif text-white">Email verified!</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-200/80">
              Your email address has been confirmed. You're all set.
            </p>
            <NuxtLink
              to="/my-dashboard"
              class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              <span class="material-symbols-outlined text-base">dashboard</span>
              Go to dashboard
            </NuxtLink>
          </div>

          <!-- Error -->
          <div v-else-if="state === 'error'" class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/20">
              <span class="material-symbols-outlined text-3xl text-rose-300">error</span>
            </div>
            <h2 class="text-2xl font-serif text-white">Verification failed</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-200/80">
              {{ errorMessage }}
            </p>
            <div class="mt-8 flex flex-col gap-3">
              <button
                type="button"
                :disabled="resendPending || !!cooldownLeft"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                @click="handleResend"
              >
                <span v-if="!resendPending" class="material-symbols-outlined text-base">forward_to_inbox</span>
                <span v-else class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span v-if="cooldownLeft">Resend in {{ cooldownLeft }}s</span>
                <span v-else>{{ resendPending ? 'Sending…' : 'Resend verification email' }}</span>
              </button>
              <div v-if="resendSuccess" class="rounded-xl bg-green-500/20 border border-green-400/30 px-4 py-3 text-xs text-green-300 font-medium">
                Verification email sent! Check your inbox.
              </div>
              <NuxtLink
                to="/login"
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow transition hover:bg-white/20"
              >
                Back to login
              </NuxtLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'
import { useVerifyEmail, useResendVerification } from '~/composables/resources/user/users'

definePageMeta({ layout: false })

useHead({
  title: 'Verify Email — AMDG Portal',
  meta: [{ name: 'description', content: 'Confirm your AMDG Portal email address.' }],
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const uid = route.query.uid as string | undefined
const token = route.query.token as string | undefined
const linkInvalid = !uid || !token

const state = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('This verification link is invalid or has expired. Please request a new one.')

// Resend state (only shown on error)
const { mutateAsync: resendMutate, isPending: resendPending } = useResendVerification()
const { mutateAsync: verifyMutate } = useVerifyEmail()

const resendSuccess = ref(false)
const cooldownLeft = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

function startCooldown(seconds = 60) {
  cooldownLeft.value = seconds
  cooldownTimer = setInterval(() => {
    cooldownLeft.value -= 1
    if (cooldownLeft.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleResend() {
  resendSuccess.value = false
  try {
    await resendMutate()
    resendSuccess.value = true
    startCooldown(60)
    $notyf.success('Verification email sent!')
  }
  catch {
    $notyf.error('Could not send verification email. Please try again.')
  }
}

// Auto-verify on page load
if (!linkInvalid) {
  verifyMutate({ uid: uid!, token: token! })
    .then(() => {
      state.value = 'success'
    })
    .catch((err: unknown) => {
      state.value = 'error'
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const detail = data?.detail ?? data?.non_field_errors
      errorMessage.value = Array.isArray(detail)
        ? detail[0]
        : detail
          ? String(detail)
          : 'This verification link is invalid or has expired. Please request a new one.'
    })
}
</script>
