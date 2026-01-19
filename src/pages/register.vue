<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-serif text-gray-900">Create your AMDG account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-gray-900 hover:text-gray-700">
            Sign in
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address <span class="text-red-500">*</span>
            </label>
            <UInput 
              v-model="email" 
              type="email" 
              placeholder="your.email@example.com"
              size="lg"
              autocomplete="email"
              :class="{ 'border-red-500': emailError }"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">
                First name <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="firstName" 
                type="text" 
                placeholder="John"
                size="lg"
                autocomplete="given-name"
                :class="{ 'border-red-500': firstNameError }"
              />
              <p v-if="firstNameError" class="mt-1 text-sm text-red-600">{{ firstNameError }}</p>
            </div>

            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">
                Last name <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="lastName" 
                type="text" 
                placeholder="Doe"
                size="lg"
                autocomplete="family-name"
                :class="{ 'border-red-500': lastNameError }"
              />
              <p v-if="lastNameError" class="mt-1 text-sm text-red-600">{{ lastNameError }}</p>
            </div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
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
            <p v-if="usernameError" class="mt-1 text-sm text-red-600">{{ usernameError }}</p>
            <p class="mt-1 text-xs text-gray-500">Optional. Letters, numbers, underscores and hyphens only</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password <span class="text-red-500">*</span>
            </label>
            <UInput 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              size="lg"
              autocomplete="new-password"
              :class="{ 'border-red-500': passwordError }"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
            <p class="mt-1 text-xs text-gray-500">Minimum 8 characters with uppercase, lowercase, number and special character</p>
          </div>

          <div>
            <label for="password_confirm" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm password <span class="text-red-500">*</span>
            </label>
            <UInput 
              v-model="passwordConfirm" 
              type="password" 
              placeholder="••••••••"
              size="lg"
              autocomplete="new-password"
              :class="{ 'border-red-500': passwordConfirmError }"
            />
            <p v-if="passwordConfirmError" class="mt-1 text-sm text-red-600">{{ passwordConfirmError }}</p>
          </div>
        </div>

        <div class="flex items-start">
          <div class="flex items-center h-5">
            <UCheckbox 
              v-model="agreedToTerms" 
              :disabled="loading"
            />
          </div>
          <div class="ml-3 text-sm">
            <label class="text-gray-600">
              I agree to the 
              <a href="#" class="font-medium text-gray-900 hover:text-gray-700">Terms of Service</a>
              and 
              <a href="#" class="font-medium text-gray-900 hover:text-gray-700">Privacy Policy</a>
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
          >
            Create account
          </UButton>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
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
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { UserRegistrationSchema } from '~/schemas/user.schema'
import { useCreateUser } from '~/composables/resources/user/users'

definePageMeta({
  layout: false,
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
        // Navigate to dashboard or onboarding
        navigateTo('/admin/dashboard')
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
