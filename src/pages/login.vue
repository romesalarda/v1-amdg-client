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
          The digital engine behind every Catholic event.
        </h1>
        <p class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80">
          Manage registrations, track ticket activity, and stay connected with your community in one place.
        </p>
      </div>

      <div class="w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div class="text-center">
            <div class="mx-auto mb-4 inline-flex rounded-full border border-white/20 bg-white/10 p-1 text-xs font-semibold">
              <span class="rounded-full bg-white px-4 py-1.5 text-slate-900">Sign in</span>
              <NuxtLink to="/register" class="rounded-full px-4 py-1.5 text-slate-200/80 transition-colors hover:text-white">
                Create account
              </NuxtLink>
            </div>

            <h2 class="text-3xl font-serif text-white">Sign in to AMDG</h2>
            <p class="mt-2 text-sm text-slate-200/80">
              Access your dashboard and continue your workflow.
              <NuxtLink to="/register" class="ml-1 font-semibold text-white transition-colors hover:text-slate-100">Need an account?</NuxtLink>
            </p>
          </div>

          <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
            <div class="space-y-4">
              <UInput
                v-model="email"
                type="email"
                placeholder="Email address"
                size="lg"
                autofocus
              />
              <UInput
                v-model="password"
                type="password"
                placeholder="Password"
                size="lg"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm">
                <a href="#" class="font-medium text-slate-100 transition-colors hover:text-white">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div class="space-y-4">
              <UButton
                type="submit"
                color="black"
                block
                size="lg"
                :loading="loading"
                class="shadow-lg"
              >
                Sign in
              </UButton>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/25"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-3 text-slate-200 bg-transparent">Or continue with</span>
                </div>
              </div>

              <UButton
                type="button"
                color="white"
                block
                size="lg"
                icon="i-logos-google-icon"
                :loading="loading"
                @click="handleGoogleLogin"
              >
                Sign in with Google
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Login - AMDG Portal',
  meta: [
    { name: 'description', content: 'Sign in to the AMDG Portal to manage your Catholic events, track registrations, and stay connected with your community.' },
    { name: 'keywords', content: 'AMDG Portal, login, sign in, Catholic events, event management, registrations' },
    { name: 'author', content: 'AMDG Team' },
  ],
})

const randomPallete = Math.floor(Math.random() * 4)

const route = useRoute()
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const loading = computed(() => auth.loading)

const handleLogin = async () => {
    try {
        await auth.login({ email: email.value, password: password.value })
        // Only navigate if login was successful (auth.isAuthenticated will be true)
        if (auth.isAuthenticated) {
            // Redirect to the original page or my-dashboard
            const redirectTo = (route.query.redirect as string) || '/my-dashboard'
            navigateTo(redirectTo)
        }
    } catch (e) {
        // Show error notification to user
        const toast = useToast()
        toast.add({
            title: 'Login Failed',
            description: 'Invalid email or password. Please try again.',
            color: 'red'
        })
    }
}

const handleGoogleLogin = async () => {
    try {
        await auth.loginWithGoogle()
    } catch (e) {
        // Handle error
    }
}
</script>
