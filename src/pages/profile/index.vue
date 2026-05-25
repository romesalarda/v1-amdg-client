<template>
  <div class="py-8 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p class="text-gray-600">Manage your account information and preferences</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-8">
        <div class="space-y-4">
          <div class="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl shadow-drawn p-6">
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

      <!-- Main Content Grid -->
      <div v-else-if="userData && profileData" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Content (8/12) -->
        <div class="lg:col-span-8 space-y-8">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Profile Picture Section -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="bg-primary px-6 py-4">
                <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-white">account_circle</span>
                  Profile Picture
                </h2>
              </div>
              <div class="p-8">
                <div class="flex items-center gap-6">
                  <div class="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-navy-100/50 shadow-lg">
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
                    <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-3xl">
                      {{ getInitials(userData.data?.display_name) }}
                    </div>
                  </div>
                  <div class="flex-1">
                    <label class="block">
                      <span class="sr-only">Choose profile photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        class="block w-full text-sm text-navy-700 font-medium file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-mist-blue file:text-primary hover:file:bg-primary hover:file:text-white file:transition-all cursor-pointer"
                        @change="handleFileChange"
                      />
                    </label>
                    <p class="mt-3 text-xs text-navy-600 font-medium">JPG, PNG or GIF. Maximum size 5MB.</p>
                    <p v-if="profilePicture" class="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      New image selected: {{ profilePicture.name }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Personal Information -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="bg-primary px-6 py-4">
                <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-white">person</span>
                  Personal Information
                </h2>
              </div>
              <div class="p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-black text-primary uppercase tracking-wider">First Name <span class="text-red-500">*</span></label>
                    <input
                      v-model="first_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                        errors.first_name ? 'border-red-500 focus:border-red-500' : ''
                      ]"
                      placeholder="Enter first name"
                    />
                    <p v-if="errors.first_name" class="text-xs text-red-500 font-medium">{{ errors.first_name }}</p>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="block text-xs font-black text-primary uppercase tracking-wider">Last Name <span class="text-red-500">*</span></label>
                    <input
                      v-model="last_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                        errors.last_name ? 'border-red-500 focus:border-red-500' : ''
                      ]"
                      placeholder="Enter last name"
                    />
                    <p v-if="errors.last_name" class="text-xs text-red-500 font-medium">{{ errors.last_name }}</p>
                  </div>
                  
                  <div class="md:col-span-2 space-y-2">
                    <label class="block text-xs font-black text-primary uppercase tracking-wider">Preferred Name</label>
                    <input
                      v-model="preferred_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                        errors.preferred_name ? 'border-red-500 focus:border-red-500' : ''
                      ]"
                      placeholder="How would you like to be called?"
                    />
                    <p v-if="errors.preferred_name" class="text-xs text-red-500 font-medium">{{ errors.preferred_name }}</p>
                  </div>
                  
                  <div class="md:col-span-2 space-y-2">
                    <label class="block text-xs font-black text-primary uppercase tracking-wider">Email Address</label>
                    <input
                      :value="userData.data?.email"
                      type="email"
                      disabled
                      class="w-full px-4 py-3 border border-navy-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-medium"
                    />
                    <p class="text-xs text-navy-600 font-medium flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">info</span>
                      Email address cannot be changed
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Contact Information -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
              <div class="bg-primary -mx-8 -mt-8 px-6 py-4 mb-8">
                <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-white">phone</span>
                  Contact & Preferences
                </h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-xs font-black text-primary uppercase tracking-wider">Phone Number</label>
                  <input
                    v-model="contact_phone"
                    type="tel"
                    :class="[
                      'w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                      errors.contact_phone ? 'border-red-500 focus:border-red-500' : ''
                    ]"
                    placeholder="+44 1234 567890"
                  />
                  <p v-if="errors.contact_phone" class="text-xs text-red-500 font-medium">{{ errors.contact_phone }}</p>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-xs font-black text-primary uppercase tracking-wider">Preferred Language</label>
                  <input
                    v-model="preferred_language"
                    type="text"
                    :class="[
                      'w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all outline-none',
                      errors.preferred_language ? 'border-red-500 focus:border-red-500' : ''
                    ]"
                    placeholder="English"
                  />
                  <p v-if="errors.preferred_language" class="text-xs text-red-500 font-medium">{{ errors.preferred_language }}</p>
                </div>
                
                <div class="relative z-20 space-y-2">
                  <label class="block text-xs font-black text-primary uppercase tracking-wider">Timezone</label>
                    <TimezoneSelect
                      :model-value="timezone ?? 'Europe/London'"
                      :has-error="!!errors.timezone"
                      @update:model-value="timezone = $event"
                    />
                  <p v-if="errors.timezone" class="text-xs text-red-500 font-medium">{{ errors.timezone }}</p>
                </div>
              </div>
            </section>

            <!-- Spacing for actions -->
            <div class="h-4"></div>
          </form>
        </div>

        <!-- Sidebar (4/12) -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Account Info -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="bg-primary px-6 py-4">
              <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-base">badge</span>
                Account Info
              </h2>
            </div>
            <div class="p-6 space-y-6">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</p>
                <p class="text-[11px] font-bold text-primary break-all bg-mist-blue p-2 rounded-lg border border-navy-100/50">
                  {{ userData.data?.username || '-' }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Name</p>
                <p class="text-xs font-bold text-primary">
                  {{ userData.data?.display_name || '-' }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                <span class="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[11px] font-black border border-green-200">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Active
                </span>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Verification</p>
                <button
                  type="button"
                  :class="[
                    'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-black border transition-all w-full justify-center',
                    userData.data?.email_verified
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                  ]"
                  @click="showEmailVerificationModal = true"
                >
                  <span class="material-symbols-outlined text-sm">{{ userData.data?.email_verified ? 'verified' : 'mark_email_unread' }}</span>
                  {{ userData.data?.email_verified ? 'Verified' : 'Not Verified' }}
                </button>
              </div>
              <div class="pt-2 border-t border-navy-100/50">
                <button
                  type="button"
                  class="w-full py-2.5 bg-white border border-primary text-primary text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
                  @click="showChangePasswordModal = true"
                >
                  <span class="material-symbols-outlined text-base">lock_reset</span>
                  Change Password
                </button>
              </div>
            </div>
          </section>

          <!-- Profile Tips -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
              <h2 class="text-[11px] font-black text-primary uppercase tracking-widest">Profile Tips</h2>
            </div>
            <div class="p-6">
              <ul class="space-y-4">
                <li class="flex gap-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <p class="text-xs text-navy-600 font-medium">Keep your contact information up to date for event notifications.</p>
                </li>
                <li class="flex gap-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <p class="text-xs text-navy-600 font-medium">Upload a clear profile picture to personalize your account.</p>
                </li>
                <li class="flex gap-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <p class="text-xs text-navy-600 font-medium">Set your preferred timezone for accurate event times.</p>
                </li>
                <li class="flex gap-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <p class="text-xs text-navy-600 font-medium">Your email address is used for login and cannot be modified.</p>
                </li>
              </ul>
            </div>
          </section>

          <!-- Action Buttons Card -->
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-6">
            <div class="flex flex-col gap-3">
              <button
                type="button"
                @click="resetForm"
                :disabled="isSaving"
                class="w-full py-3 bg-white border border-primary text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                @click="handleSubmit"
                :disabled="isSaving"
                class="w-full py-3 bg-primary text-white rounded-xl hover:bg-navy-600 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-lg" v-if="!isSaving">save</span>
                <span class="material-symbols-outlined text-lg animate-spin" v-else>progress_activity</span>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="showSuccess" class="fixed bottom-8 right-8 bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-6 flex items-center gap-4 max-w-md z-50">
          <div class="flex items-center justify-center w-12 h-12 bg-green-50 rounded-full">
            <span class="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
          </div>
          <div>
            <p class="text-sm font-black text-primary uppercase tracking-wider">Success!</p>
            <p class="text-xs text-navy-600 font-medium mt-1">Profile updated successfully</p>
          </div>
        </div>
      </Transition>

      <!-- Unsaved Changes Bar -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="hasUnsavedChanges"
          class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl bg-primary text-white border border-white/20 rounded-2xl shadow-2xl px-4 md:px-6 py-4"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-white">warning</span>
              <p class="text-xs md:text-sm font-black uppercase tracking-wider">You have unsaved changes</p>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                class="px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg border border-white/40 text-white hover:bg-white hover:text-primary transition-all disabled:opacity-50"
                :disabled="isSaving"
                @click="resetForm"
              >
                Discard
              </button>
              <button
                type="button"
                class="px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg bg-white text-primary hover:bg-navy-50 transition-all disabled:opacity-50 flex items-center gap-1.5"
                :disabled="isSaving"
                @click="handleSubmit"
              >
                <span class="material-symbols-outlined text-base" v-if="!isSaving">save</span>
                <span class="material-symbols-outlined text-base animate-spin" v-else>progress_activity</span>
                {{ isSaving ? 'Saving...' : 'Save now' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Modals -->
    <ChangePasswordModal v-model="showChangePasswordModal" />
    <EmailVerificationModal
      v-model="showEmailVerificationModal"
      :email-verified="!!userData?.data?.email_verified"
      :verified-at="userData?.data?.email_verified_at"
      :user-email="userData?.data?.email"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useMe, useUpdateMe } from '~/composables/resources/user/users'
import { useMyProfile, usePartialUpdateProfile } from '~/composables/resources/user/profiles'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'
import ChangePasswordModal from '~/components/profile/ChangePasswordModal.vue'
import EmailVerificationModal from '~/components/profile/EmailVerificationModal.vue'
import type { ProfileRequest } from '~/api/types.gen'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ProfileSchema } from '~/schemas/profile.schema'
import { validateImageFile, createImagePreview, resolveImageUrl } from '~/utils/image'

const { $notyf } = useNuxtApp()
const route = useRoute()

// Modal state
const showChangePasswordModal = ref(false)
const showEmailVerificationModal = ref(false)

// Fetch user and profile data
const { data: userData, isLoading: isUserLoading, error: userError } = useMe()
const { data: profileData, isLoading: isProfileLoading, error: profileError } = useMyProfile()

// Mutations
const { isPending: isUpdatingUser, mutateAsync: updateUserAsync } = useUpdateMe()
const { isPending: isUpdatingProfile, mutateAsync: updateProfileAsync } = usePartialUpdateProfile()

// Setup vee-validate form with zod schema
const { handleSubmit: handleFormSubmit, errors, setValues } = useForm({
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

type ProfileFormValues = {
  first_name: string
  last_name: string
  preferred_name: string
  contact_phone: string
  preferred_language: string
  timezone: string
}

const profilePicture = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const showSuccess = ref(false)
const initialFormValues = ref<ProfileFormValues | null>(null)

// Computed states
const isLoading = computed(() => isUserLoading.value || isProfileLoading.value)
const isSaving = computed(() => isUpdatingUser.value || isUpdatingProfile.value)
const error = computed(() => userError.value || profileError.value)
const hasFieldChanges = computed(() => {
  if (!initialFormValues.value) return false

  return (
    first_name.value !== initialFormValues.value.first_name
    || last_name.value !== initialFormValues.value.last_name
    || preferred_name.value !== initialFormValues.value.preferred_name
    || contact_phone.value !== initialFormValues.value.contact_phone
    || preferred_language.value !== initialFormValues.value.preferred_language
    || timezone.value !== initialFormValues.value.timezone
  )
})
const hasUnsavedChanges = computed(() => hasFieldChanges.value || !!profilePicture.value)

const captureInitialValues = (values: ProfileFormValues) => {
  initialFormValues.value = { ...values }
}

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) return

  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true
  return window.confirm('You have unsaved changes. Are you sure you want to leave this page?')
})

// Cleanup image preview on unmount
onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})

// Initialize form data when profile loads
watch([userData, profileData], () => {
  if (userData.value?.data && profileData.value?.data) {
    const values = {
      first_name: userData.value.data.first_name || '',
      last_name: userData.value.data.last_name || '',
      preferred_name: profileData.value.data.preferred_name || '',
      contact_phone: profileData.value.data.contact_phone || '',
      preferred_language: profileData.value.data.preferred_language || '',
      timezone: profileData.value.data.timezone || 'Europe/London',
    }

    setValues(values)
    captureInitialValues(values)
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
    const values = {
      first_name: userData.value.data.first_name || '',
      last_name: userData.value.data.last_name || '',
      preferred_name: profileData.value.data.preferred_name || '',
      contact_phone: profileData.value.data.contact_phone || '',
      preferred_language: profileData.value.data.preferred_language || '',
      timezone: profileData.value.data.timezone || 'Europe/London',
    }

    setValues(values)
    captureInitialValues(values)
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

  $notyf.success('Changes discarded')
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

    captureInitialValues({
      first_name: values.first_name,
      last_name: values.last_name,
      preferred_name: values.preferred_name || '',
      contact_phone: values.contact_phone || '',
      preferred_language: values.preferred_language || '',
      timezone: values.timezone,
    })
  }
  catch (err) {
    console.error('Error updating profile:', err)
    $notyf.error('Error updating profile' + (err instanceof Error ? `: ${err.message}` : ''))
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>