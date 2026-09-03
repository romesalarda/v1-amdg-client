```vue
<template>
  <div
    ref="page"
    class="relative min-h-screen overflow-hidden bg-slate-950 text-white"
    @mousemove="handleMouseMove"
  >
    <!-- Animated background -->
    <div class="absolute inset-0 z-0">
      <FlowingBackground
        :speed="flowSpeed"
        :soft="3"
        :palette="randomPalette"
        position="absolute"
      />

      <div
        class="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/45 to-slate-950/70"
      />

      <!-- Cursor glow -->
      <div
        class="pointer-events-none absolute z-10 h-72 w-72 rounded-full opacity-20 blur-3xl transition-opacity duration-500"
        :style="cursorGlowStyle"
      />
    </div>

    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-10"
    >
      <!-- Hero -->
      <div class="hidden w-1/2 pr-12 lg:block">
        <p
          class="mb-4 text-xs uppercase tracking-[0.4em] text-slate-200/80"
        >
          AMDG Portal
        </p>

        <!-- Interactive heading -->
        <div
          class="hero-heading"
          :style="heroStyle"
        >
          <h1 class="max-w-md text-5xl leading-tight text-white font-barbara">
            <span
              v-for="(word, index) in headingWords"
              :key="word"
              class="hero-word"
              :style="{
                '--word-index': index,
              }"
            >
              {{ word }}
            </span>
          </h1>
        </div>

        <p
          class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80"
        >
          Manage registrations, track ticket activity, and stay connected
          with your community or parish in one place.
        </p>

      </div>

      <!-- Login -->
      <div class="w-full lg:w-1/2">
        <div
          class="login-card mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
          :style="cardStyle"
        >
          <div class="text-center">
            <div
              class="mx-auto mb-4 inline-flex rounded-full border border-white/20 bg-white/10 p-1 text-xs font-semibold"
            >
              <span
                class="rounded-full bg-white px-4 py-1.5 text-slate-900"
              >
                Sign in
              </span>

              <NuxtLink
                :to="
                  route.query.redirect
                    ? `/register?redirect=${encodeURIComponent(
                        route.query.redirect as string
                      )}`
                    : '/register'
                "
                class="rounded-full px-4 py-1.5 text-slate-200/80 transition-colors hover:text-white"
              >
                Create account
              </NuxtLink>
            </div>

            <h2 class="text-3xl font-serif text-white">
              Sign in to AMDG
            </h2>

            <p class="mt-2 text-sm text-slate-200/80">
              Don't have an account?

              <NuxtLink
                :to="
                  route.query.redirect
                    ? `/register?redirect=${encodeURIComponent(
                        route.query.redirect as string
                      )}`
                    : '/register'
                "
                class="ml-1 font-semibold text-white transition-colors hover:text-slate-100"
              >
                Create one
              </NuxtLink>
            </p>
          </div>

          <form
            class="mt-8 space-y-6"
            @submit.prevent="handleLogin"
          >
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
                <NuxtLink
                  to="/forgot-password"
                  class="font-medium text-slate-100 transition-colors hover:text-white"
                >
                  Forgot your password?
                </NuxtLink>
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

              <div class="flex items-center gap-4">
                <div class="flex-1 border-t border-white/25" />

                <span
                  class="whitespace-nowrap text-sm text-slate-200"
                >
                  Or continue with
                </span>

                <div class="flex-1 border-t border-white/25" />
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
    {
      name: 'description',
      content:
        'Sign in to the AMDG Portal to manage your Catholic events, track registrations, and stay connected with your community.',
    },
    {
      name: 'keywords',
      content:
        'AMDG Portal, login, sign in, Catholic events, event management, registrations',
    },
    {
      name: 'author',
      content: 'AMDG Team',
    },
  ],
})

const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

const loading = computed(() => auth.loading)

/**
 * Random palette on every page load.
 *
 * If FlowingBackground supports palettes 0-3,
 * this gives us a different atmosphere each time.
 */
const randomPalette = ref(
  Math.floor(Math.random() * 4)
)

/**
 * Cursor state
 */
const mouseX = ref(0.5)
const mouseY = ref(0.5)

const targetX = ref(0.5)
const targetY = ref(0.5)

/**
 * Background speed.
 *
 * The centre of the screen is deliberately slower.
 * Moving toward an edge increases the flow speed.
 */
const flowSpeed = computed(() => {
  const distanceFromCentre = Math.sqrt(
    Math.pow(mouseX.value - 0.5, 2) +
      Math.pow(mouseY.value - 0.5, 2)
  )

  return Number(
    (0.7 + distanceFromCentre * 2.8).toFixed(2)
  )
})

const handleMouseMove = (event: MouseEvent) => {
  targetX.value = event.clientX / window.innerWidth
  targetY.value = event.clientY / window.innerHeight
}

/**
 * Smooth cursor interpolation.
 *
 * Rather than directly binding mouse coordinates,
 * we ease toward them so everything feels organic.
 */
let animationFrame: number

const animateCursor = () => {
  mouseX.value +=
    (targetX.value - mouseX.value) * 0.08

  mouseY.value +=
    (targetY.value - mouseY.value) * 0.08

  animationFrame = requestAnimationFrame(animateCursor)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(animateCursor)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
})

/**
 * Hero interaction
 */
const headingWords = [
  'Events',
  'Management',
  'for',
  'Catholic',
  'Communities',
]

const heroStyle = computed(() => {
  const rotateX = (mouseY.value - 0.5) * -4
  const rotateY = (mouseX.value - 0.5) * 5

  return {
    transform: `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `,
  }
})

/**
 * Card has a much subtler movement than the hero.
 */
const cardStyle = computed(() => {
  const rotateX = (mouseY.value - 0.5) * -1.2
  const rotateY = (mouseX.value - 0.5) * 1.5

  return {
    transform: `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `,
  }
})

/**
 * Cursor glow follows the mouse.
 */
const cursorGlowStyle = computed(() => ({
  left: `${mouseX.value * 100}%`,
  top: `${mouseY.value * 100}%`,
  transform: 'translate(-50%, -50%)',
}))

const handleLogin = async () => {
  try {
    await auth.login({
      email: email.value,
      password: password.value,
    })

    if (auth.isAuthenticated) {
      const redirectTo =
        (route.query.redirect as string) ||
        '/my-dashboard'

      navigateTo(redirectTo)
    }
  } catch (e) {
    const toast = useToast()

    toast.add({
      title: 'Login Failed',
      description:
        'Invalid email or password. Please try again.',
      color: 'red',
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

<style scoped>
.hero-heading {
  transform-style: preserve-3d;
  transition: transform 120ms ease-out;
  will-change: transform;
}

.hero-word {
  display: inline-block;
  margin-right: 0.28em;
  transition:
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 300ms ease;
  animation: wordReveal 700ms both;
  animation-delay: calc(var(--word-index) * 90ms);
}

.hero-word:hover {
  transform: translateY(-7px) scale(1.04);
}

.login-card {
  transition: transform 180ms ease-out;
  will-change: transform;
}

@keyframes wordReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-heading,
  .login-card,
  .hero-word {
    animation: none;
    transition: none;
  }
}
</style>
```
