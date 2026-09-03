<template>
  <div
    class="relative min-h-screen overflow-hidden bg-slate-950 text-white"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- =========================================================
         BACKGROUND
         ========================================================= -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <FlowingBackground
        :speed="flowSpeed"
        :soft="8"
        :palette="randomPalette"
        position="absolute"
      />

      <div
        class="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/45 to-slate-950/70"
      />

      <!-- Cursor atmosphere -->
      <div
        class="cursor-glow absolute h-[28rem] w-[28rem] rounded-full blur-3xl"
        :style="cursorGlowStyle"
      />
    </div>

    <!-- =========================================================
         CONTENT
         ========================================================= -->
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10"
    >
      <!-- =======================================================
           HERO
           ======================================================= -->
      <div class="hidden w-1/2 pr-12 lg:block">
        <p
          class="mb-4 text-xs uppercase tracking-[0.4em] text-slate-200/80"
        >
          AMDG Portal
        </p>

        <div
          class="hero-heading"
          :style="heroContainerStyle"
        >
          <h1
            class="max-w-xl text-5xl leading-[1.08] text-white font-barbara"
          >
            <span
              v-for="(word, index) in headingWords"
              :key="`${word}-${index}`"
              class="hero-word"
              :class="{
                'hero-word-active': hoveredWordIndex === index,
              }"
              :style="getWordStyle(index)"
              @mouseenter="hoveredWordIndex = index"
              @mouseleave="hoveredWordIndex = null"
            >
              {{ word }}
            </span>
          </h1>
        </div>

        <p
          class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80"
        >
          {{
            isCommunityInvite
              ? "You've been invited to join a community on AMDG. Create a free account first, and you'll be taken straight there."
              : 'Set up your portal access and start managing registrations, outreach, and parish coordination from one place.'
          }}
        </p>

      </div>

      <!-- =======================================================
           REGISTER CARD
           ======================================================= -->
      <div class="w-full lg:w-1/2">
        <div
          class="register-card mx-auto w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
          :style="cardStyle"
        >
          <!-- Header -->
          <div class="text-center">
            <div
              class="mx-auto mb-4 inline-flex rounded-full border border-white/20 bg-white/10 p-1 text-xs font-semibold"
            >
              <NuxtLink
                :to="
                  redirectTo
                    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                    : '/login'
                "
                class="rounded-full px-4 py-1.5 text-slate-200/80 transition-colors hover:text-white"
              >
                Sign in
              </NuxtLink>

              <span
                class="rounded-full bg-white px-4 py-1.5 text-slate-900"
              >
                Create account
              </span>
            </div>

            <h2 class="text-3xl font-serif text-white">
              Create your account
            </h2>

            <p class="mt-2 text-sm text-slate-200/80">
              Already have an account?

              <NuxtLink
                :to="
                  redirectTo
                    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                    : '/login'
                "
                class="font-semibold text-white transition-colors hover:text-slate-100"
              >
                Sign in
              </NuxtLink>
            </p>
          </div>

          <!-- Form -->
          <form
            class="mt-8 space-y-6"
            @submit.prevent="handleRegister"
          >
            <div class="space-y-4">
              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="mb-1 block text-sm font-medium text-slate-100"
                >
                  Email address
                  <span class="text-rose-300">*</span>
                </label>

                <UInput
                  v-model="email"
                  type="email"
                  placeholder="your.email@example.com"
                  size="lg"
                  autocomplete="email"
                  :class="{ 'border-red-500': emailError }"
                />

                <p
                  v-if="emailError"
                  class="mt-1 text-sm text-rose-200"
                >
                  {{ emailError }}
                </p>
              </div>

              <!-- Names -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- First name -->
                <div>
                  <label
                    for="first_name"
                    class="mb-1 block text-sm font-medium text-slate-100"
                  >
                    First name
                    <span class="text-rose-300">*</span>
                  </label>

                  <UInput
                    v-model="firstName"
                    type="text"
                    placeholder="John"
                    size="lg"
                    autocomplete="given-name"
                    :class="{ 'border-red-500': firstNameError }"
                  />

                  <p
                    v-if="firstNameError"
                    class="mt-1 text-sm text-rose-200"
                  >
                    {{ firstNameError }}
                  </p>
                </div>

                <!-- Last name -->
                <div>
                  <label
                    for="last_name"
                    class="mb-1 block text-sm font-medium text-slate-100"
                  >
                    Last name
                    <span class="text-rose-300">*</span>
                  </label>

                  <UInput
                    v-model="lastName"
                    type="text"
                    placeholder="Doe"
                    size="lg"
                    autocomplete="family-name"
                    :class="{ 'border-red-500': lastNameError }"
                  />

                  <p
                    v-if="lastNameError"
                    class="mt-1 text-sm text-rose-200"
                  >
                    {{ lastNameError }}
                  </p>
                </div>
              </div>

              <!-- =================================================
                   GENERATED USERNAME
                   ================================================= -->
              <div>
                <label
                  class="mb-1 block text-sm font-medium text-slate-100"
                >
                  Your username
                </label>

                <div
                  class="username-preview group relative overflow-hidden rounded-lg border border-white/15 bg-black/20 px-4 py-3"
                >
                  <!-- Animated shimmer -->
                  <div
                    class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                  />

                  <div
                    class="relative flex items-center justify-between gap-4"
                  >
                    <div class="min-w-0">
                      <div
                        class="truncate font-mono text-base font-medium text-white"
                      >
                        {{
                          generatedUsername ||
                          'your-username'
                        }}
                      </div>

                      <p class="mt-0.5 text-xs text-slate-300/60">
                        Automatically generated from your name
                      </p>
                    </div>

                    <!-- Lock icon -->
                    <div
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300/70 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white"
                      title="Username is generated automatically"
                    >
                      <UIcon
                        name="i-lucide-lock"
                        class="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <p class="mt-1 text-xs text-slate-300/60">
                  Lowercase, URL-safe and generated automatically.
                </p>

                <p
                  v-if="usernameError"
                  class="mt-1 text-sm text-rose-200"
                >
                  {{ usernameError }}
                </p>
              </div>

              <!-- Password -->
              <div>
                <label
                  for="password"
                  class="mb-1 block text-sm font-medium text-slate-100"
                >
                  Password
                  <span class="text-rose-300">*</span>
                </label>

                <UInput
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  autocomplete="new-password"
                  :class="{ 'border-red-500': passwordError }"
                />

                <p
                  v-if="passwordError"
                  class="mt-1 text-sm text-rose-200"
                >
                  {{ passwordError }}
                </p>

                <p class="mt-1 text-xs text-slate-300/80">
                  Minimum 8 characters with uppercase, lowercase, number
                  and special character.
                </p>
              </div>

              <!-- Confirm password -->
              <div>
                <label
                  for="password_confirm"
                  class="mb-1 block text-sm font-medium text-slate-100"
                >
                  Confirm password
                  <span class="text-rose-300">*</span>
                </label>

                <UInput
                  v-model="passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  autocomplete="new-password"
                  :class="{ 'border-red-500': passwordConfirmError }"
                />

                <p
                  v-if="passwordConfirmError"
                  class="mt-1 text-sm text-rose-200"
                >
                  {{ passwordConfirmError }}
                </p>
              </div>
            </div>

            <!-- Terms -->
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <UCheckbox
                  v-model="agreedToTerms"
                  :disabled="loading"
                />
              </div>

              <div class="ml-3 text-sm text-slate-200/90">
                <label>
                  I agree to the

                  <a
                    href="#"
                    class="font-semibold text-white transition-colors hover:text-slate-100"
                  >
                    Terms of Service
                  </a>

                  and

                  <a
                    href="#"
                    class="font-semibold text-white transition-colors hover:text-slate-100"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
              <UButton
                type="submit"
                color="black"
                block
                size="lg"
                :loading="loading"
                :disabled="!agreedToTerms"
                class="shadow-lg"
              >
                Create account
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
                @click="handleGoogleSignup"
              >
                Sign up with Google
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
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { UserRegistrationSchema } from '~/schemas/user.schema'
import { useCreateUser } from '~/composables/resources/user/users'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Create Account - AMDG Portal',
  meta: [
    {
      name: 'description',
      content:
        'Create your AMDG Portal account to organize Catholic events, manage registrations, and coordinate your community.',
    },
  ],
})

const { mutateAsync: createUserAsync } = useCreateUser()

const auth = useAuthStore()
const toast = useToast()
const route = useRoute()

const loading = ref(false)
const agreedToTerms = ref(false)

/**
 * Random background palette on every page load.
 *
 * FlowingBackground currently uses the palette prop directly.
 */
const randomPalette = ref(
  Math.floor(Math.random() * 5)
)

/**
 * Redirect handling
 */
const redirectTo = computed(
  () => route.query.redirect as string | undefined
)

/**
 * True when the user arrived via a shareable community invite link.
 */
const isCommunityInvite = computed(() => {
  const r = redirectTo.value || ''

  return (
    r.includes('/communities/') &&
    r.includes('/invite')
  )
})

/**
 * ================================================================
 * FORM
 * ================================================================
 */

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    UserRegistrationSchema
  ),
})

const {
  value: email,
  errorMessage: emailError,
} = useField<string>('email')

const {
  value: firstName,
  errorMessage: firstNameError,
} = useField<string>('first_name')

const {
  value: lastName,
  errorMessage: lastNameError,
} = useField<string>('last_name')

const {
  value: username,
  errorMessage: usernameError,
} = useField<string>('username')

const {
  value: password,
  errorMessage: passwordError,
} = useField<string>('password')

const {
  value: passwordConfirm,
  errorMessage: passwordConfirmError,
} = useField<string>('password_confirm')

/**
 * ================================================================
 * USERNAME GENERATION
 * ================================================================
 *
 * Generates a stable, URL-safe username from first + last name.
 *
 * Examples:
 *
 *   John Doe          -> john-doe
 *   José O'Connor     -> jose-oconnor
 *   Mary Jane Smith   -> mary-jane-smith
 *   François Müller   -> francois-muller
 *
 * The final username is:
 *
 *   - lowercase
 *   - Unicode normalised
 *   - accents removed
 *   - non-alphanumeric characters converted to -
 *   - repeated hyphens collapsed
 *   - leading/trailing hyphens removed
 */
const slugifyName = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/**
 * Computed username used by both the UI and submission.
 */
const generatedUsername = computed(() => {
  const first = slugifyName(firstName.value || '')
  const last = slugifyName(lastName.value || '')

  return [first, last]
    .filter(Boolean)
    .join('-')
})

/**
 * Keep vee-validate's username field synchronised with
 * the generated value.
 *
 * The user never edits this field directly.
 */
watch(
  generatedUsername,
  (value) => {
    username.value = value
  },
  {
    immediate: true,
  }
)

/**
 * ================================================================
 * CURSOR INTERACTION
 * ================================================================
 */

const mouseX = ref(0.5)
const mouseY = ref(0.5)

const targetMouseX = ref(0.5)
const targetMouseY = ref(0.5)

const isPointerActive = ref(false)

const hoveredWordIndex = ref<number | null>(null)

/**
 * Heading words.
 */
const headingWords = computed(() =>
  isCommunityInvite.value
    ? [
        'Create',
        'your',
        'account',
        'and',
        'join',
        'this',
        'community.',
      ]
    : [
        'We',
        'are',
        'ready',
        'when',
        'you',
        'are!'
      ]
)

/**
 * Mouse movement is converted into a 0-1 coordinate.
 */
const handleMouseMove = (event: MouseEvent) => {
  targetMouseX.value =
    event.clientX / window.innerWidth

  targetMouseY.value =
    event.clientY / window.innerHeight

  isPointerActive.value = true
}

const handleMouseLeave = () => {
  isPointerActive.value = false

  targetMouseX.value = 0.5
  targetMouseY.value = 0.5
}

/**
 * Smooth the mouse coordinates.
 *
 * This prevents the animation from feeling twitchy.
 */
let animationFrame = 0

const animateCursor = () => {
  mouseX.value +=
    (targetMouseX.value - mouseX.value) * 0.075

  mouseY.value +=
    (targetMouseY.value - mouseY.value) * 0.075

  animationFrame =
    requestAnimationFrame(animateCursor)
}

onMounted(() => {
  animationFrame =
    requestAnimationFrame(animateCursor)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
})

/**
 * ================================================================
 * BACKGROUND SPEED
 * ================================================================
 *
 * Centre = calm.
 * Edges = fast.
 *
 * This produces:
 *
 *   centre -> ~0.7
 *   edges  -> ~2.2
 */
const flowSpeed = computed(() => {
  const distanceFromCentre =
    Math.sqrt(
      Math.pow(mouseX.value - 0.5, 2) +
        Math.pow(mouseY.value - 0.5, 2)
    )

  return Number(
    (
      0.7 +
      distanceFromCentre * 2.2
    ).toFixed(2)
  )
})

/**
 * ================================================================
 * HERO PARALLAX
 * ================================================================
 */

const heroContainerStyle = computed(() => {
  const rotateX =
    (mouseY.value - 0.5) * -4

  const rotateY =
    (mouseX.value - 0.5) * 6

  const translateX =
    (mouseX.value - 0.5) * 8

  const translateY =
    (mouseY.value - 0.5) * 6

  return {
    transform: `
      perspective(1000px)
      translate3d(
        ${translateX}px,
        ${translateY}px,
        0
      )
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `,
  }
})

/**
 * Individual word interaction.
 *
 * Every word has its own position.
 *
 * The word closest to the cursor gets:
 *
 *   - much stronger translation
 *   - scale
 *   - rotation
 *   - brightness
 *
 * Neighbouring words get a weaker response.
 */
const getWordStyle = (index: number) => {
  const count = headingWords.value.length

  /*
   * Spread the words across the heading.
   *
   * This isn't actual screen position, but gives us
   * a deterministic "field" across the heading.
   */
  const wordX =
    count <= 1
      ? 0.5
      : index / (count - 1)

  /*
   * The heading sits roughly around the middle-left
   * of the desktop viewport.
   */
  const dx = mouseX.value - wordX
  const dy = mouseY.value - 0.45

  const distance =
    Math.sqrt(
      Math.pow(dx, 2) +
        Math.pow(dy, 2)
    )

  /*
   * 0 = far away
   * 1 = directly nearby
   */
  const influence = Math.max(
    0,
    1 - distance * 2.4
  )

  const lift =
    -influence * 18

  const scale =
    1 + influence * 0.12

  const rotate =
    (mouseX.value - wordX) *
    -12 *
    influence

  const x =
    (mouseX.value - wordX) *
    -28 *
    influence

  const y =
    (mouseY.value - 0.45) *
    -16 *
    influence

  return {
    transform: `
      translate3d(
        ${x}px,
        ${y + lift}px,
        ${influence * 30}px
      )
      rotate(${rotate}deg)
      scale(${scale})
    `,
    opacity:
      0.78 + influence * 0.22,
    filter: `
      brightness(${1 + influence * 0.25})
      drop-shadow(
        0 ${influence * 12}px
        ${influence * 20}px
        rgba(255,255,255,${influence * 0.12})
      )
    `,
    '--word-delay': `${index * 80}ms`,
  }
}

/**
 * ================================================================
 * LOGIN CARD PARALLAX
 * ================================================================
 */

const cardStyle = computed(() => {
  const rotateX =
    (mouseY.value - 0.5) * -1.5

  const rotateY =
    (mouseX.value - 0.5) * 2

  const translateX =
    (mouseX.value - 0.5) * -5

  const translateY =
    (mouseY.value - 0.5) * -4

  return {
    transform: `
      perspective(1400px)
      translate3d(
        ${translateX}px,
        ${translateY}px,
        0
      )
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `,
  }
})

/**
 * ================================================================
 * CURSOR GLOW
 * ================================================================
 */

const cursorGlowStyle = computed(() => ({
  left: `${mouseX.value * 100}%`,
  top: `${mouseY.value * 100}%`,
  opacity: isPointerActive.value ? 0.18 : 0,
  transform: 'translate(-50%, -50%)',
}))

/**
 * ================================================================
 * REGISTRATION
 * ================================================================
 */

const handleRegister = handleSubmit(
  async (values) => {
    if (!agreedToTerms.value) {
      toast.add({
        title: 'Terms Required',
        description:
          'Please agree to the Terms of Service and Privacy Policy',
        color: 'amber',
      })

      return
    }

    loading.value = true

    try {
      /*
       * Always regenerate the username at submission time.
       *
       * This means the submitted value cannot accidentally
       * become stale if first/last name changed.
       */
      const finalUsername =
        slugifyName(
          `${values.first_name} ${values.last_name}`
        )

      const userData = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        username: finalUsername,
        password: values.password,
        password_confirm:
          values.password_confirm,
      }

      await createUserAsync(userData)

      toast.add({
        title: 'Account Created',
        description:
          'Your account has been created successfully. Signing you in...',
        color: 'green',
      })

      /*
       * Auto-login after successful registration.
       */
      try {
        await auth.login({
          email: values.email,
          password: values.password,
        })

        if (auth.isAuthenticated) {
          navigateTo(
            redirectTo.value ||
              '/my-dashboard'
          )
        }
      } catch (loginError) {
        toast.add({
          title: 'Please Sign In',
          description:
            'Account created successfully. Please sign in.',
          color: 'blue',
        })

        const loginPath =
          redirectTo.value
            ? `/login?redirect=${encodeURIComponent(
                redirectTo.value
              )}`
            : '/login'

        navigateTo(loginPath)
      }
    } catch (error: any) {
      let errorMessage =
        'Unable to create account. Please try again.'

      if (error.response?.data) {
        const errors =
          error.response.data

        if (errors.email) {
          errorMessage =
            Array.isArray(errors.email)
              ? errors.email[0]
              : 'This email is already registered'
        } else if (errors.username) {
          errorMessage =
            Array.isArray(errors.username)
              ? errors.username[0]
              : 'This generated username is already taken. Please try a slightly different name.'
        } else if (errors.password) {
          errorMessage =
            Array.isArray(errors.password)
              ? errors.password[0]
              : 'Password does not meet requirements'
        } else if (typeof errors === 'string') {
          errorMessage = errors
        }
      }

      toast.add({
        title: 'Registration Failed',
        description: errorMessage,
        color: 'red',
      })
    } finally {
      loading.value = false
    }
  }
)

/**
 * ================================================================
 * GOOGLE SIGNUP
 * ================================================================
 */

const handleGoogleSignup = async () => {
  if (!agreedToTerms.value) {
    toast.add({
      title: 'Terms Required',
      description:
        'Please agree to the Terms of Service and Privacy Policy',
      color: 'amber',
    })

    return
  }

  loading.value = true

  try {
    await auth.loginWithGoogle()
  } catch (error) {
    toast.add({
      title: 'Sign Up Failed',
      description:
        'Unable to sign up with Google. Please try again.',
      color: 'red',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/*
 * ================================================================
 * HERO
 * ================================================================
 */

.hero-heading {
  transform-style: preserve-3d;
  will-change: transform;
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-word {
  display: inline-block;
  margin-right: 0.24em;
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform, filter, opacity;

  /*
   * This transition is deliberately fast.
   * The cursor should feel attached to the words.
   */
  transition:
    transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 120ms ease,
    opacity 120ms ease;

  animation:
    heroWordIn 700ms
      cubic-bezier(0.22, 1, 0.36, 1)
      both;

  animation-delay: var(--word-delay);
}

.hero-word:hover,
.hero-word-active {
  text-shadow:
    0 0 25px rgba(255, 255, 255, 0.22),
    0 0 60px rgba(255, 255, 255, 0.08);
}

@keyframes heroWordIn {
  from {
    opacity: 0;
    transform:
      translate3d(0, 25px, 0)
      rotateX(-20deg);
  }

  to {
    opacity: 1;
    transform:
      translate3d(0, 0, 0)
      rotateX(0);
  }
}

/*
 * ================================================================
 * CARD
 * ================================================================
 */

.register-card {
  transform-style: preserve-3d;
  will-change: transform;

  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 300ms ease;
}

.register-card:hover {
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.35);
}

/*
 * ================================================================
 * USERNAME
 * ================================================================
 */

.username-preview {
  transition:
    border-color 250ms ease,
    background-color 250ms ease,
    box-shadow 250ms ease;
}

.username-preview:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background-color: rgba(255, 255, 255, 0.07);
  box-shadow:
    0 0 30px rgba(255, 255, 255, 0.04);
}

/*
 * ================================================================
 * CURSOR GLOW
 * ================================================================
 */


/*
 * ================================================================
 * REDUCED MOTION
 * ================================================================
 */

@media (prefers-reduced-motion: reduce) {
  .hero-heading,
  .hero-word,
  .register-card,
  .username-preview,
  .cursor-glow {
    animation: none !important;
    transition: none !important;
  }
}
</style>
