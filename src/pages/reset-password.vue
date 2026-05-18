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
          Set a new password.
        </h1>
        <p class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80">
          Choose a strong password to secure your account.
        </p>
      </div>

      <div class="w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

          <!-- Invalid / missing token state -->
          <div v-if="linkInvalid" class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/20">
              <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-rose-300" />
            </div>
            <h2 class="text-2xl font-serif text-white">Link invalid or expired</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-200/80">
              This password reset link has expired or has already been used. Reset links are valid for 1 hour.
            </p>
            <UButton
              to="/forgot-password"
              color="black"
              class="mt-8"
              size="lg"
              block
            >
              Request a new link
            </UButton>
          </div>

          <!-- Form -->
          <div v-else>
            <div class="text-center">
              <h2 class="text-3xl font-serif text-white">Choose a new password</h2>
              <p class="mt-2 text-sm text-slate-200/80">
                Must be at least 8 characters with uppercase, lowercase, number and special character.
              </p>
            </div>

            <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-100">
                  New password
                </label>
                <UInput
                  v-model="newPassword"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  autofocus
                  :disabled="loading"
                />
                <p v-if="errors.new_password" class="mt-1 text-sm text-rose-300">{{ errors.new_password }}</p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-100">
                  Confirm new password
                </label>
                <UInput
                  v-model="newPasswordConfirm"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  :disabled="loading"
                />
                <p v-if="errors.new_password_confirm" class="mt-1 text-sm text-rose-300">{{ errors.new_password_confirm }}</p>
              </div>

              <p v-if="errors.general" class="text-sm text-rose-300">{{ errors.general }}</p>

              <UButton
                type="submit"
                color="black"
                block
                size="lg"
                :loading="loading"
              >
                Reset password
              </UButton>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'
import { useResetPassword } from '~/composables/resources/user/auth'

definePageMeta({ layout: false })

useHead({
  title: 'Reset Password — AMDG Portal',
  meta: [{ name: 'description', content: 'Set a new password for your AMDG Portal account.' }],
})

const route = useRoute()
const toast = useToast()

const uid = computed(() => route.query.uid as string | undefined)
const token = computed(() => route.query.token as string | undefined)
const linkInvalid = computed(() => !uid.value || !token.value)

const newPassword = ref('')
const newPasswordConfirm = ref('')
const errors = ref<Record<string, string>>({})

const { mutateAsync, isPending: loading } = useResetPassword()

async function handleSubmit() {
  errors.value = {}

  if (newPassword.value !== newPasswordConfirm.value) {
    errors.value.new_password_confirm = 'Passwords do not match.'
    return
  }

  try {
    await mutateAsync({
      uid: uid.value!,
      token: token.value!,
      new_password: newPassword.value,
      new_password_confirm: newPasswordConfirm.value,
    })

    toast.add({
      title: 'Password reset',
      description: 'Your password has been updated. Please sign in.',
      color: 'green',
    })
    navigateTo('/login')
  } catch (err: any) {
    const data = err?.response?.data || err?.data

    if (data?.new_password) {
      errors.value.new_password = Array.isArray(data.new_password)
        ? data.new_password[0]
        : data.new_password
    } else if (data?.detail) {
      // Token expired / invalid — show the broken-link state
      errors.value.general = data.detail
    } else {
      errors.value.general = 'Something went wrong. Please try again.'
    }
  }
}
</script>
