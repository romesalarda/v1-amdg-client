<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Sticky top header: barbara stays here, and only here -->
    <div
      :class="[
        'w-full bg-blue-600 sticky top-10 z-30 transition-shadow duration-300',
        'px-4 py-3 sm:px-6 sm:py-6',
        scrolled ? 'shadow-lg shadow-primary/20' : 'shadow-none',
      ]"
    >
      <h1 class="
        font-barbara text-xl tracking-normal
        sm:text-3xl sm:tracking-widest
        text-white mb-1
      ">
        PROFILE SETTINGS
      </h1>

      <p class="text-xs sm:text-sm text-white/75">
        Manage your account information and preferences
      </p>
    </div>


    <div class="max-w-6xl mx-auto px-4 md:px-6 pb-28">
      <!-- Loading State -->
      <div v-if="isLoading" class="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-4">
        <div class="h-36 bg-slate-100 rounded-xl animate-pulse"></div>
        <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
        <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
        <div class="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-red-600">error</span>
          <div>
            <h3 class="font-semibold text-red-900 text-sm">Error loading profile</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="userData && profileData" class="page-enter">
        <!-- Hero: cover + avatar -->
        <section class="mt-6 bg-gray-200 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="relative h-36 md:h-44 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 overflow-hidden">
            <svg class="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none" viewBox="0 0 400 120">
              <path d="M0 90 L120 40 L240 70 L400 10" stroke="white" stroke-width="2" fill="none" />
              <path d="M0 110 L140 60 L260 95 L400 45" stroke="white" stroke-width="2" fill="none" />
            </svg>
          </div>

          <div class="px-6 sm:px-8 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">
              <!-- Avatar with hover-to-upload -->
              <div
                class="group relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md bg-white cursor-pointer motion-reduce:transition-none"
                @click="triggerFilePicker"
              >
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Preview"
                  class="w-full h-full rounded-full object-cover"
                />
                <img
                  v-else-if="profileData.data?.profile_picture_url"
                  :src="resolveImageUrl(profileData.data.profile_picture_url)"
                  :alt="userData.data?.display_name"
                  class="w-full h-full rounded-full object-cover"
                />
                <div v-else class="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-2xl">
                  {{ getInitials(userData.data?.display_name) }}
                </div>

                <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/45 transition-colors duration-200 flex items-center justify-center motion-reduce:transition-none">
                  <span class="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100">
                    photo_camera
                  </span>
                </div>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  class="sr-only"
                  @change="handleFileChange"
                />
              </div>

              <div class="flex-1 pb-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-xl font-semibold text-slate-900">{{ userData.data?.display_name || '—' }}</h2>
                  <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </div>
                <p class="text-sm text-slate-500">@{{ userData.data?.username || '—' }}</p>
              </div>
            </div>

            <p v-if="profilePicture" class="mt-4 text-sm text-emerald-600 font-medium flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">check_circle</span>
              New photo selected — {{ profilePicture.name }}
            </p>
            <p v-else class="mt-4 text-xs text-slate-400">Click your photo to change it. JPG, PNG or GIF, up to 5MB.</p>
          </div>
        </section>

        <!-- Content grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <!-- Form (8/12) -->
          <div class="lg:col-span-8">
            <form @submit.prevent="handleSubmit" class="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
              <!-- Personal Information -->
              <div class="p-6 sm:p-8">
                <div class="flex items-center gap-2 mb-6">
                  <span class="material-symbols-outlined text-primary text-xl">person</span>
                  <div>
                    <h3 class="text-base font-semibold text-slate-900">Personal information</h3>
                    <p class="text-xs text-slate-500">Your name as it appears across the platform</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">First name</label>
                    <input
                      v-model="first_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 outline-none transition-all duration-150',
                        errors.first_name
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15',
                      ]"
                      placeholder="Enter first name"
                    />
                    <p v-if="errors.first_name" class="text-xs text-red-500">{{ errors.first_name }}</p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Last name</label>
                    <input
                      v-model="last_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 outline-none transition-all duration-150',
                        errors.last_name
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15',
                      ]"
                      placeholder="Enter last name"
                    />
                    <p v-if="errors.last_name" class="text-xs text-red-500">{{ errors.last_name }}</p>
                  </div>

                  <div class="md:col-span-2 space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Preferred name</label>
                    <input
                      v-model="preferred_name"
                      type="text"
                      :class="[
                        'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 outline-none transition-all duration-150',
                        errors.preferred_name
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15',
                      ]"
                      placeholder="How would you like to be called?"
                    />
                    <p v-if="errors.preferred_name" class="text-xs text-red-500">{{ errors.preferred_name }}</p>
                  </div>

                  <div class="md:col-span-2 space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Email address</label>
                    <input
                      :value="userData.data?.email"
                      type="email"
                      disabled
                      class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
                    />
                    <p class="text-xs text-slate-400 flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">info</span>
                      Email address cannot be changed
                    </p>
                  </div>
                </div>
              </div>

              <!-- Contact & Preferences -->
              <div class="p-6 sm:p-8">
                <div class="flex items-center gap-2 mb-6">
                  <span class="material-symbols-outlined text-primary text-xl">tune</span>
                  <div>
                    <h3 class="text-base font-semibold text-slate-900">Contact & preferences</h3>
                    <p class="text-xs text-slate-500">How we reach you and how content is shown to you</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Phone number</label>
                    <input
                      v-model="contact_phone"
                      type="tel"
                      :class="[
                        'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 outline-none transition-all duration-150',
                        errors.contact_phone
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15',
                      ]"
                      placeholder="+44 1234 567890"
                    />
                    <p v-if="errors.contact_phone" class="text-xs text-red-500">{{ errors.contact_phone }}</p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Preferred language</label>
                    <input
                      v-model="preferred_language"
                      type="text"
                      :class="[
                        'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 outline-none transition-all duration-150',
                        errors.preferred_language
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15',
                      ]"
                      placeholder="English"
                    />
                    <p v-if="errors.preferred_language" class="text-xs text-red-500">{{ errors.preferred_language }}</p>
                  </div>

                  <div class="relative z-20 space-y-1.5">
                    <label class="block text-sm font-medium text-slate-700">Timezone</label>
                    <TimezoneSelect
                      :model-value="timezone ?? 'Europe/London'"
                      :has-error="!!errors.timezone"
                      @update:model-value="timezone = $event"
                    />
                    <p v-if="errors.timezone" class="text-xs text-red-500">{{ errors.timezone }}</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 bg-slate-50/70 rounded-b-2xl">
                <button
                  type="button"
                  @click="resetForm"
                  :disabled="isSaving"
                  class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none"
                >
                  Reset changes
                </button>
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:brightness-110 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 motion-reduce:transition-none"
                >
                  <span class="material-symbols-outlined text-lg" v-if="!isSaving">save</span>
                  <span class="material-symbols-outlined text-lg animate-spin" v-else>progress_activity</span>
                  {{ isSaving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Sidebar (4/12) -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Account -->
            <section class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div class="flex items-center gap-2 mb-5">
                <span class="material-symbols-outlined text-primary text-xl">badge</span>
                <h3 class="text-sm font-semibold text-slate-900">Account</h3>
              </div>

              <dl class="space-y-4 text-sm">
                <div>
                  <dt class="text-xs text-slate-400 mb-0.5">Username</dt>
                  <dd class="text-slate-700 font-medium break-all">{{ userData.data?.username || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-400 mb-0.5">Display name</dt>
                  <dd class="text-slate-700 font-medium">{{ userData.data?.display_name || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-400 mb-1">Email verification</dt>
                  <dd>
                    <button
                      type="button"
                      :class="[
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border w-full justify-center transition-colors duration-150',
                        userData.data?.email_verified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                      ]"
                      @click="showEmailVerificationModal = true"
                    >
                      <span class="material-symbols-outlined text-sm">{{ userData.data?.email_verified ? 'verified' : 'mark_email_unread' }}</span>
                      {{ userData.data?.email_verified ? 'Verified' : 'Not verified' }}
                    </button>
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                class="mt-5 w-full py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 motion-reduce:transition-none"
                @click="showChangePasswordModal = true"
              >
                <span class="material-symbols-outlined text-base">lock_reset</span>
                Change password
              </button>
            </section>

            <!-- Tips (quiet, no card weight) -->
            <section class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-slate-400 text-lg">lightbulb</span>
                <h3 class="text-sm font-semibold text-slate-700">Profile tips</h3>
              </div>
              <ul class="space-y-3">
                <li class="flex gap-2.5 text-sm text-slate-500">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Keep your contact information up to date for event notifications.
                </li>
                <li class="flex gap-2.5 text-sm text-slate-500">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Upload a clear profile picture to personalise your account.
                </li>
                <li class="flex gap-2.5 text-sm text-slate-500">
                  <span class="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Set your preferred timezone for accurate event times.
                </li>
              </ul>
            </section>
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
      <div v-if="showSuccess" class="fixed bottom-8 right-8 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 flex items-center gap-4 max-w-md z-50">
        <div class="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-full">
          <span class="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">Success</p>
          <p class="text-xs text-slate-500 mt-0.5">Profile updated successfully</p>
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
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl bg-slate-900 text-white rounded-2xl shadow-2xl px-4 md:px-6 py-4"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-400 text-lg">warning</span>
            <p class="text-sm font-medium">You have unsaved changes</p>
          </div>
          <div class="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 motion-reduce:transition-none"
              :disabled="isSaving"
              @click="resetForm"
            >
              Discard
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5 motion-reduce:transition-none"
              :disabled="isSaving"
              @click="handleSubmit"
            >
              <span class="material-symbols-outlined text-base" v-if="!isSaving">save</span>
              <span class="material-symbols-outlined text-base animate-spin" v-else>progress_activity</span>
              {{ isSaving ? 'Saving…' : 'Save now' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

// Header scroll state (purely visual)
const scrolled = ref(false)
const handleScroll = () => {
  scrolled.value = window.scrollY > 4
}

// Hidden file input ref, triggered by clicking the avatar
const fileInputRef = ref<HTMLInputElement | null>(null)
const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

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
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true
  return window.confirm('You have unsaved changes. Are you sure you want to leave this page?')
})

// Cleanup image preview on unmount
onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  window.removeEventListener('scroll', handleScroll)

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
  if (fileInputRef.value) fileInputRef.value.value = ''

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
    if (fileInputRef.value) fileInputRef.value.value = ''

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

<style scoped>
.page-enter {
  animation: page-enter 0.35s ease-out;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter {
    animation: none;
  }
}
</style>