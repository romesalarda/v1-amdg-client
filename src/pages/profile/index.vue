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
                  v-if="profileData.data?.profile_picture_url"
                  :src="profileData.data.profile_picture_url"
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
                  v-model="formData.first_name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  v-model="formData.last_name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter last name"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
                <input
                  v-model="formData.preferred_name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="How would you like to be called?"
                />
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
                  v-model="formData.contact_phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="+44 1234 567890"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                <input
                  v-model="formData.preferred_language"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="English"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  v-model="formData.timezone"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Europe/London"
                />
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
import { ref, reactive, watch } from 'vue'
import { useMe, useUpdateMe } from '~/composables/resources/user/users'
import { useMyProfile, usePartialUpdateProfile } from '~/composables/resources/user/profiles'
import type { ProfileRequest } from '~/api/types.gen'
import Navbar from '~/components/common/Navbar.vue'

import { useForm } from 'vee-validate'
import { ProfileSchema } from '~/schemas/profile.schema'

const { values, handleSubmit: handleFormSubmit, errors, isSubmitting } = useForm({
  validationSchema: ProfileSchema,
})


const {$notyf} = useNuxtApp()

// Fetch user and profile data
const { data: userData, isLoading: isUserLoading, error: userError } = useMe()
const { data: profileData, isLoading: isProfileLoading, error: profileError } = useMyProfile()

// Mutations
const { mutate: updateUser, isPending: isUpdatingUser, mutateAsync: updateUserAsync } = useUpdateMe()
const { mutate: updateProfile, isPending: isUpdatingProfile, mutateAsync: updateProfileAsync } = usePartialUpdateProfile()

// Form state
const formData = reactive({
  first_name: '',
  last_name: '',
  preferred_name: '',
  contact_phone: '',
  preferred_language: '',
  timezone: '',
})

const profilePicture = ref<File | null>(null)
const showSuccess = ref(false)

// Computed states
const isLoading = computed(() => isUserLoading.value || isProfileLoading.value)
const isSaving = computed(() => isUpdatingUser.value || isUpdatingProfile.value)
const error = computed(() => userError.value || profileError.value)

// Initialize form data when profile loads
watch([userData, profileData], () => {
  if (userData.value?.data && profileData.value?.data) {
    formData.first_name = userData.value.data.first_name || ''
    formData.last_name = userData.value.data.last_name || ''
    formData.preferred_name = profileData.value.data.preferred_name || ''
    formData.contact_phone = profileData.value.data.contact_phone || ''
    formData.preferred_language = profileData.value.data.preferred_language || ''
    formData.timezone = profileData.value.data.timezone || ''
  }
}, { immediate: true })

// Handle file change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      target.value = ''
      return
    }
    profilePicture.value = file
  }
}

// Reset form
const resetForm = () => {
  if (userData.value?.data && profileData.value?.data) {
    formData.first_name = userData.value.data.first_name || ''
    formData.last_name = userData.value.data.last_name || ''
    formData.preferred_name = profileData.value.data.preferred_name || ''
    formData.contact_phone = profileData.value.data.contact_phone || ''
    formData.preferred_language = profileData.value.data.preferred_language || ''
    formData.timezone = profileData.value.data.timezone || ''
  }
  profilePicture.value = null
}

// Handle form submission
const handleSubmit = async () => {
  if (!userData.value?.data || !profileData.value?.data) return

  const profileId = profileData.value.data.url.split('/').filter(Boolean).pop()
  if (!profileId) return

  try {
    // Update user data
    if (formData.first_name !== userData.value.data.first_name || formData.last_name !== userData.value.data.last_name) {
      await new Promise((resolve, reject) => {
        updateUser(
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
          {
            onSuccess: resolve,
            onError: reject,
          },
        )
      })
    }

    // Update profile data
    const profileUpdateData: Partial<ProfileRequest> = {
      preferred_name: formData.preferred_name,
      contact_phone: formData.contact_phone,
      preferred_language: formData.preferred_language,
      timezone: formData.timezone,
    }

    if (profilePicture.value) {
      profileUpdateData.profile_picture = profilePicture.value
    }


    await updateProfileAsync(
        {
          profileId: Number(profileId),
          body: profileUpdateData,
        },
       {
         onSuccess: () => {
           // Show success message
           showSuccess.value = true
           setTimeout(() => {
             showSuccess.value = false
             $notyf.success('Profile updated successfully!')
           }, 3000)
         },
         onError: (err) => {
           $notyf.error('Error updating profile' + (err instanceof Error ? `: ${err.message}` : ''))
           console.log(err);
           
         },
       }
    
    )

    // Show success message
    // showSuccess.value = true
    // setTimeout(() => {
    //   showSuccess.value = false
    //   $notyf.success('Profile updated successfully!')
    // }, 3000)

    // Reset profile picture input
    profilePicture.value = null
  }
  catch (err) {
    console.error('Error updating profile:', err)
  }
}

definePageMeta({
  layout: false, // Full screen layout for admin
  middleware: 'auth'
})
</script>