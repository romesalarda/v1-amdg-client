<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 z-0">
      <FlowingBackground :speed="3" :soft="8" :palette="4" position="absolute" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/45 to-slate-950/70" />
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10">
      <div class="hidden w-1/2 pr-12 lg:block">
        <p class="mb-4 text-xs uppercase tracking-[0.4em] text-slate-200/80">AMDG Portal</p>
        <h1 class="max-w-md text-5xl font-serif leading-tight text-white">
          Launch your account and serve with clarity.
        </h1>
        <p class="mt-6 max-w-md text-base leading-relaxed text-slate-200/80">
          Set up your portal access and start managing registrations, outreach, and parish coordination from one place.
        </p>
      </div>

      <div class="w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div class="text-center">
            <div class="mx-auto mb-4 inline-flex rounded-full border border-white/20 bg-white/10 p-1 text-xs font-semibold">
              <NuxtLink to="/login" class="rounded-full px-4 py-1.5 text-slate-200/80 transition-colors hover:text-white">
                Sign in
              </NuxtLink>
              <span class="rounded-full bg-white px-4 py-1.5 text-slate-900">Create account</span>
            </div>

            <h2 class="text-3xl font-serif text-white">Create your AMDG account</h2>
            <p class="mt-2 text-sm text-slate-200/80">Already have an account? <NuxtLink to="/login" class="font-semibold text-white transition-colors hover:text-slate-100">Sign in</NuxtLink></p>
          </div>

          <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
            <div class="space-y-4">
              <div>
                <label for="email" class="mb-1 block text-sm font-medium text-slate-100">
                  Email address <span class="text-rose-300">*</span>
                </label>
                <UInput
                  v-model="email"
                  type="email"
                  placeholder="your.email@example.com"
                  size="lg"
                  autocomplete="email"
                  :class="{ 'border-red-500': emailError }"
                />
                <p v-if="emailError" class="mt-1 text-sm text-rose-200">{{ emailError }}</p>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="first_name" class="mb-1 block text-sm font-medium text-slate-100">
                    First name <span class="text-rose-300">*</span>
                  </label>
                  <UInput
                    v-model="firstName"
                    type="text"
                    placeholder="John"
                    size="lg"
                    autocomplete="given-name"
                    :class="{ 'border-red-500': firstNameError }"
                  />
                  <p v-if="firstNameError" class="mt-1 text-sm text-rose-200">{{ firstNameError }}</p>
                </div>

                <div>
                  <label for="last_name" class="mb-1 block text-sm font-medium text-slate-100">
                    Last name <span class="text-rose-300">*</span>
                  </label>
                  <UInput
                    v-model="lastName"
                    type="text"
                    placeholder="Doe"
                    size="lg"
                    autocomplete="family-name"
                    :class="{ 'border-red-500': lastNameError }"
                  />
                  <p v-if="lastNameError" class="mt-1 text-sm text-rose-200">{{ lastNameError }}</p>
                </div>
              </div>

              <div>
                <label for="username" class="mb-1 block text-sm font-medium text-slate-100">
                  Username
                </label>
                <UInput
                  v-model="username"
                  type="text"
                  placeholder="johndoe"
                  size="lg"
                  autocomplete="username"
                  :class="{ 'border-red-500': usernameError }"
                />
                <p v-if="usernameError" class="mt-1 text-sm text-rose-200">{{ usernameError }}</p>
                <p class="mt-1 text-xs text-slate-300/80">Optional. Letters, numbers, underscores and hyphens only.</p>
              </div>

              <div>
                <label for="password" class="mb-1 block text-sm font-medium text-slate-100">
                  Password <span class="text-rose-300">*</span>
                </label>
                <UInput
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  autocomplete="new-password"
                  :class="{ 'border-red-500': passwordError }"
                />
                <p v-if="passwordError" class="mt-1 text-sm text-rose-200">{{ passwordError }}</p>
                <p class="mt-1 text-xs text-slate-300/80">Minimum 8 characters with uppercase, lowercase, number and special character.</p>
              </div>

              <div>
                <label for="password_confirm" class="mb-1 block text-sm font-medium text-slate-100">
                  Confirm password <span class="text-rose-300">*</span>
                </label>
                <UInput
                  v-model="passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  autocomplete="new-password"
                  :class="{ 'border-red-500': passwordConfirmError }"
                />
                <p v-if="passwordConfirmError" class="mt-1 text-sm text-rose-200">{{ passwordConfirmError }}</p>
              </div>
            </div>

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
                  <a href="#" class="font-semibold text-white transition-colors hover:text-slate-100">Terms of Service</a>
                  and
                  <a href="#" class="font-semibold text-white transition-colors hover:text-slate-100">Privacy Policy</a>
                </label>
              </div>
            </div>

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
                <div class="flex-1 border-t border-white/25"></div>
                <span class="text-sm text-slate-200 whitespace-nowrap">
                  Or continue with
                </span>
                <div class="flex-1 border-t border-white/25"></div>
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
    { name: 'description', content: 'Create your AMDG Portal account to organize Catholic events, manage registrations, and coordinate your community.' },
  ],
})

const { mutateAsync: createUserAsync } = useCreateUser()
const auth = useAuthStore()
const toast = useToast()

const loading = ref(false)
const agreedToTerms = ref(false)

// Setup vee-validate with Zod schema
const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(UserRegistrationSchema),
})

// Define form fields with vee-validate
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: firstName, errorMessage: firstNameError } = useField<string>('first_name')
const { value: lastName, errorMessage: lastNameError } = useField<string>('last_name')
const { value: username, errorMessage: usernameError } = useField<string>('username')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: passwordConfirm, errorMessage: passwordConfirmError } = useField<string>('password_confirm')

const handleRegister = handleSubmit(async (values) => {
  if (!agreedToTerms.value) {
    toast.add({
      title: 'Terms Required',
      description: 'Please agree to the Terms of Service and Privacy Policy',
      color: 'amber',
    })
    return
  }

  loading.value = true
  
  try {
    // Create the user account
    const userData = {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      username: values.username || undefined,
      password: values.password,
      password_confirm: values.password_confirm,
    }
    
    await createUserAsync(userData)
    
    // Show success message
    toast.add({
      title: 'Account Created',
      description: 'Your account has been created successfully. Signing you in...',
      color: 'green',
    })
    
    // Auto-login after successful registration
    try {
      await auth.login({ 
        email: values.email, 
        password: values.password 
      })
      
      if (auth.isAuthenticated) {
        navigateTo('/my-dashboard')
      }
    } catch (loginError) {
      // If auto-login fails, redirect to login page
      toast.add({
        title: 'Please Sign In',
        description: 'Account created successfully. Please sign in.',
        color: 'blue',
      })
      navigateTo('/login')
    }
  } catch (error: any) {
    // Handle registration errors
    let errorMessage = 'Unable to create account. Please try again.'
    
    if (error.response?.data) {
      const errors = error.response.data
      
      // Handle specific field errors
      if (errors.email) {
        errorMessage = Array.isArray(errors.email) 
          ? errors.email[0] 
          : 'This email is already registered'
      } else if (errors.username) {
        errorMessage = Array.isArray(errors.username) 
          ? errors.username[0] 
          : 'This username is already taken'
      } else if (errors.password) {
        errorMessage = Array.isArray(errors.password) 
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
})

const handleGoogleSignup = async () => {
  if (!agreedToTerms.value) {
    toast.add({
      title: 'Terms Required',
      description: 'Please agree to the Terms of Service and Privacy Policy',
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
      description: 'Unable to sign up with Google. Please try again.',
      color: 'red',
    })
  } finally {
    loading.value = false
  }
}
</script>
