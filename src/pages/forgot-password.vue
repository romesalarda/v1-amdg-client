<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 z-0">
      <FlowingBackground :speed="3" :soft="8" :palette="4" position="absolute" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/45 to-slate-950/70" />
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-10">
      <div class="hidden w-1/2 pr-12 lg:block">
        <p class="mb-4 text-xs uppercase tracking-[0.4em] text-slate-200/80">AMDG Portal</p>
        <h1 class="max-w-md text-5xl font-serif leading-tight text-white">
          Recover access to your account.
        </h1>
        <p class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
      </div>

      <div class="w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

          <!-- Success state -->
          <div v-if="submitted" class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20">
              <UIcon name="i-heroicons-envelope-open" class="h-8 w-8 text-emerald-300" />
            </div>
            <h2 class="text-2xl font-serif text-white">Check your inbox</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-200/80">
              If an account exists for <strong class="text-white">{{ submittedEmail }}</strong>, you'll receive a password reset link shortly.
            </p>
            <p class="mt-2 text-sm text-slate-200/60">
              Didn't receive anything? Check your spam folder or try again in a few minutes.
            </p>
            <UButton
              to="/login"
              color="white"
              variant="ghost"
              class="mt-8"
              size="lg"
            >
              Back to sign in
            </UButton>
          </div>

          <!-- Request form -->
          <div v-else>
            <div class="text-center">
              <h2 class="text-3xl font-serif text-white">Forgot password?</h2>
              <p class="mt-2 text-sm text-slate-200/80">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-100">
                  Email address
                </label>
                <UInput
                  v-model="email"
                  type="email"
                  placeholder="your.email@example.com"
                  size="lg"
                  autofocus
                  :disabled="loading"
                />
                <p v-if="fieldError" class="mt-1 text-sm text-rose-300">{{ fieldError }}</p>
              </div>

              <UButton
                type="submit"
                color="black"
                block
                size="lg"
                :loading="loading"
              >
                Send reset link
              </UButton>
            </form>

            <p class="mt-6 text-center text-sm text-slate-200/60">
              Remembered your password?
              <NuxtLink to="/login" class="ml-1 font-semibold text-white transition-colors hover:text-slate-100">
                Sign in
              </NuxtLink>
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'
import { useForgotPassword } from '~/composables/resources/user/auth'

definePageMeta({ layout: false })

useHead({
  title: 'Forgot Password — AMDG Portal',
  meta: [{ name: 'description', content: 'Reset your AMDG Portal password.' }],
})

const email = ref('')
const fieldError = ref('')
const submitted = ref(false)
const submittedEmail = ref('')

const { mutateAsync, isPending: loading } = useForgotPassword()

async function handleSubmit() {
  fieldError.value = ''

  if (!email.value) {
    fieldError.value = 'Please enter your email address.'
    return
  }

  try {
    await mutateAsync({ email: email.value })
    submittedEmail.value = email.value
    submitted.value = true
  } catch {
    // API always returns 200 for this endpoint; any exception is a network error
    fieldError.value = 'Something went wrong. Please try again.'
  }
}
</script>
