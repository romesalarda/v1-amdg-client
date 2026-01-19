<template>
  <div>
    <Navbar />
    <main class="min-h-[calc(100vh-64px)] py-8 bg-gray-50">
      <div class="max-w-4xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p class="text-gray-600">Manage your account information and preferences</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white rounded-lg shadow-sm p-8">
          <div class="space-y-4">
            <div class="h-24 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-semibold text-red-900">Error loading profile</h3>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <form v-else-if="userData && profileData" @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm">
          <!-- Profile Picture Section -->
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            <div class="flex items-center gap-6">
              <div class="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
                <img
                  v-else-if="profileData.data?.profile_picture_url"
                  :src="resolveImageUrl(profileData.data.profile_picture_url)"
                  :alt="userData.data?.display_name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl">
                  {{ getInitials(userData.data?.display_name) }}
                </div>
              </div>
              <div class="flex-1">
                <label class="block">
                  <span class="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    @change="handleFileChange"
                  />
                </label>
                <p class="mt-2 text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                <p v-if="profilePicture" class="mt-1 text-xs text-green-600 font-medium">✓ New image selected: {{ profilePicture.name }}</p>
              </div>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  v-model="first_name"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.first_name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="Enter first name"
                />
                <p v-if="errors.first_name" class="mt-1 text-sm text-red-600">{{ errors.first_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  v-model="last_name"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.last_name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="Enter last name"
                />
                <p v-if="errors.last_name" class="mt-1 text-sm text-red-600">{{ errors.last_name }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
                <input
                  v-model="preferred_name"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.preferred_name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="How would you like to be called?"
                />
                <p v-if="errors.preferred_name" class="mt-1 text-sm text-red-600">{{ errors.preferred_name }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  :value="userData.data?.email"
                  type="email"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  v-model="contact_phone"
                  type="tel"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.contact_phone ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="+44 1234 567890"
                />
                <p v-if="errors.contact_phone" class="mt-1 text-sm text-red-600">{{ errors.contact_phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                <input
                  v-model="preferred_language"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.preferred_language ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="English"
                />
                <p v-if="errors.preferred_language" class="mt-1 text-sm text-red-600">{{ errors.preferred_language }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  v-model="timezone"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg outline-none transition',
                    errors.timezone ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  ]"
                  placeholder="Europe/London"
                />
                <p v-if="errors.timezone" class="mt-1 text-sm text-red-600">{{ errors.timezone }}</p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="p-6 bg-gray-50 flex items-center justify-between rounded-b-lg">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              :disabled="isSaving"
            >
              Reset
            </button>
            <button
              type="submit"
              class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
            >
              <span v-if="isSaving" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div v-if="showSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-sm font-medium text-green-900">Profile updated successfully!</p>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useMe, useUpdateMe } from '~/composables/resources/user/users'
import { useMyProfile, usePartialUpdateProfile } from '~/composables/resources/user/profiles'
import type { ProfileRequest } from '~/api/types.gen'
import Navbar from '~/components/common/Navbar.vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ProfileSchema } from '~/schemas/profile.schema'
import { validateImageFile, createImagePreview, resolveImageUrl } from '~/utils/image'

const { $notyf } = useNuxtApp()

// Fetch user and profile data
const { data: userData, isLoading: isUserLoading, error: userError } = useMe()
const { data: profileData, isLoading: isProfileLoading, error: profileError } = useMyProfile()

// Mutations
const { mutate: updateUser, isPending: isUpdatingUser, mutateAsync: updateUserAsync } = useUpdateMe()
const { mutate: updateProfile, isPending: isUpdatingProfile, mutateAsync: updateProfileAsync } = usePartialUpdateProfile()

// Setup vee-validate form with zod schema
const { handleSubmit: handleFormSubmit, errors, resetForm: veeResetForm, setValues } = useForm({
  validationSchema: toTypedSchema(ProfileSchema),
  initialValues: {
    first_name: '',
    last_name: '',
    preferred_name: '',
    contact_phone: '',
    preferred_language: '',
    timezone: 'Europe/London',
  },
})

// Define form fields with vee-validate
const { value: first_name } = useField<string>('first_name')
const { value: last_name } = useField<string>('last_name')
const { value: preferred_name } = useField<string>('preferred_name')
const { value: contact_phone } = useField<string>('contact_phone')
const { value: preferred_language } = useField<string>('preferred_language')
const { value: timezone } = useField<string>('timezone')

const profilePicture = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const showSuccess = ref(false)

// Computed states
const isLoading = computed(() => isUserLoading.value || isProfileLoading.value)
const isSaving = computed(() => isUpdatingUser.value || isUpdatingProfile.value)
const error = computed(() => userError.value || profileError.value)

// Cleanup image preview on unmount
onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})

// Initialize form data when profile loads
watch([userData, profileData], () => {
  if (userData.value?.data && profileData.value?.data) {
    setValues({
      first_name: userData.value.data.first_name || '',
      last_name: userData.value.data.last_name || '',
      preferred_name: profileData.value.data.preferred_name || '',
      contact_phone: profileData.value.data.contact_phone || '',
      preferred_language: profileData.value.data.preferred_language || '',
      timezone: profileData.value.data.timezone || 'Europe/London',
    })
  }
}, { immediate: true })

// Handle file change with validation and preview
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      // Validate image file
      validateImageFile(file, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
      })
      
      // Clean up old preview
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value)
      }
      
      // Set new file and create preview
      profilePicture.value = file
      imagePreview.value = createImagePreview(file)
      
      $notyf.success('Image selected successfully')
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid file'
      $notyf.error(errorMessage)
      target.value = ''
      profilePicture.value = null
      imagePreview.value = null
    }
  }
}

// Reset form to initial values
const resetForm = () => {
  if (userData.value?.data && profileData.value?.data) {
    setValues({
      first_name: userData.value.data.first_name || '',
      last_name: userData.value.data.last_name || '',
      preferred_name: profileData.value.data.preferred_name || '',
      contact_phone: profileData.value.data.contact_phone || '',
      preferred_language: profileData.value.data.preferred_language || '',
      timezone: profileData.value.data.timezone || 'Europe/London',
    })
  }
  
  // Cleanup preview and file
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
  profilePicture.value = null
  
  // Clear file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

// Handle form submission with vee-validate
const handleSubmit = handleFormSubmit(async (values) => {
  if (!userData.value?.data || !profileData.value?.data) return

  const profileId = profileData.value.data.url.split('/').filter(Boolean).pop()
  if (!profileId) return

  try {
    // Update user data if changed
    if (values.first_name !== userData.value.data.first_name || values.last_name !== userData.value.data.last_name) {
      await updateUserAsync({
        first_name: values.first_name,
        last_name: values.last_name,
      })
    }

    // Update profile - composable handles both JSON and FormData
    if (profilePicture.value) {
      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('profile_picture', profilePicture.value)
      formData.append('preferred_name', values.preferred_name || '')
      formData.append('contact_phone', values.contact_phone || '')
      formData.append('preferred_language', values.preferred_language || '')
      formData.append('timezone', values.timezone)
      
      // Composable detects FormData and uses uploadMultipart internally
      await updateProfileAsync({
        profileId: Number(profileId),
        body: formData as any,
      })
    }
    else {
      // Update profile without image - composable uses SDK
      const profileUpdateData: Partial<ProfileRequest> = {
        preferred_name: values.preferred_name || '',
        contact_phone: values.contact_phone || '',
        preferred_language: values.preferred_language || '',
        timezone: values.timezone,
      }
      
      await updateProfileAsync({
        profileId: Number(profileId),
        body: profileUpdateData,
      })
    }

    // Show success message
    showSuccess.value = true
    $notyf.success('Profile updated successfully!')
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    // Cleanup
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
      imagePreview.value = null
    }
    profilePicture.value = null
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }
  catch (err) {
    console.error('Error updating profile:', err)
    $notyf.error('Error updating profile' + (err instanceof Error ? `: ${err.message}` : ''))
  }
})

definePageMeta({
  layout: false, // Full screen layout for admin
  middleware: 'auth'
})
</script>