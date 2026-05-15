<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-8">
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8 space-y-4">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-64 w-full rounded-xl" />
        <USkeleton class="h-12 w-full rounded-xl" />
      </div>
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8 space-y-4">
        <USkeleton class="h-6 w-24" />
        <USkeleton class="h-24 w-24 rounded-xl" />
      </div>
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8 space-y-4">
        <USkeleton class="h-6 w-48" />
        <USkeleton class="h-12 w-full rounded-xl" />
        <USkeleton class="h-32 w-full rounded-xl" />
      </div>
    </div>

    <!-- Editor Form -->
    <form v-else-if="organisation" @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Current Landing Image -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Landing Image</h2>
        </div>
        
        <div class="p-8">
          <!-- Current Image Preview -->
          <div v-if="organisation.landing_image || imagePreview" class="mb-6">
            <img 
              :src="imagePreview || resolveImageUrl(organisation.landing_image!)" 
              :alt="organisation.title"
              @error="onImageError"
              class="w-full h-64 object-cover rounded-xl border-2 border-deep-navy/10"
            />
          </div>
          <div v-else class="w-full h-64 bg-deep-navy/5 rounded-xl flex items-center justify-center border-2 border-deep-navy/10 mb-6">
            <svg class="w-20 h-20 text-deep-navy/30" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Upload New Image -->
          <div>
            <label for="landing_image" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
              Upload New Landing Image
            </label>
            <input
              id="landing_image"
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="block w-full text-sm text-deep-navy font-medium file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-2 file:border-deep-navy file:text-sm file:font-black file:uppercase file:tracking-wider file:bg-white file:text-deep-navy hover:file:bg-deep-navy hover:file:text-white file:transition-all file:cursor-pointer"
            />
            <p class="mt-3 text-xs text-deep-navy/50 font-medium">
              Recommended: 1920x1080px, max 5MB (JPG, PNG, WebP)
            </p>
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Logo</h2>
        </div>
        
        <!-- Current Logo Preview -->
        <div class="p-8">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-deep-navy/5 rounded-xl p-3 flex items-center justify-center border-2 border-deep-navy/10">
              <img 
                v-if="organisation.logo || logoPreview"
                :src="logoPreview || resolveImageUrl(organisation.logo!)" 
                :alt="organisation.title"
                @error="onImageError"
                class="w-full h-full object-contain"
              />
              <svg v-else class="w-12 h-12 text-deep-navy/30" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <label for="logo" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                Upload New Logo
              </label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                @change="handleLogoChange"
                class="block w-full text-sm text-deep-navy font-medium file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-2 file:border-deep-navy file:text-sm file:font-black file:uppercase file:tracking-wider file:bg-white file:text-deep-navy hover:file:bg-deep-navy hover:file:text-white file:transition-all file:cursor-pointer"
              />
              <p class="mt-3 text-xs text-deep-navy/50 font-medium">
                Recommended: Square 512x512px, max 2MB
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Organization Details -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Organization Details</h2>
        </div>

        <div class="p-8 space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="title"
              type="text"
              required
              class="w-full px-4 py-4 border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
              :class="{ 'border-red-500': errors.title }"
            />
            <p v-if="errors.title" class="mt-2 text-xs text-red-600 font-bold">{{ errors.title }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
              Description
            </label>
            <textarea
              id="description"
              v-model="description"
              rows="6"
              class="w-full px-4 py-4 border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
              placeholder="Tell members about your community..."
            ></textarea>
            <p class="mt-3 text-xs text-deep-navy/50 font-medium">
              Describe your community's mission, activities, and what makes it special
            </p>
          </div>

          <!-- External Website -->
          <div>
            <label for="external_website" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
              External Website
            </label>
            <input
              id="external_website"
              v-model="external_website"
              type="url"
              placeholder="https://example.com"
              class="w-full px-4 py-4 border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8">
        <button
          type="button"
          @click="resetForm"
          :disabled="isSaving"
          class="px-6 py-3 border-2 border-deep-navy/20 text-deep-navy hover:bg-deep-navy/5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
        >
          Reset Changes
        </button>

        <div class="flex gap-3">
          <NuxtLink
            :to="`/communities/${organisationId}`"
            class="px-6 py-3 border-2 border-deep-navy/20 text-deep-navy hover:bg-deep-navy/5 rounded-xl font-black text-sm uppercase tracking-wider transition-all"
            :class="{ 'opacity-50 pointer-events-none': isSaving }"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-8 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="isSaving" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="showSuccess" class="bg-green-500/10 border-2 border-green-500/20 rounded-xl p-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span class="text-deep-navy font-black text-sm uppercase tracking-tight">Changes saved successfully!</span>
          </div>
        </div>
      </Transition>
    </form>
  </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { useOrganisation, usePartialUpdateOrganisation } from '~/composables/resources/organisation/organisations'
import { resolveImageUrl, onImageError, validateImageFile, createImagePreview } from '~/utils/image'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: false,
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)

useHead({
  title: 'Edit Landing Page',
})

// Fetch organization data
const { data: orgData, isLoading } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)

// Form validation
const validationSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    external_website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  })
)

const { handleSubmit: handleFormSubmit, errors, setValues } = useForm({
  validationSchema,
})

const { value: title } = useField<string>('title')
const { value: description } = useField<string>('description')
const { value: external_website } = useField<string>('external_website')

const landingImage = ref<File | null>(null)
const logo = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const logoPreview = ref<string | null>(null)
const showSuccess = ref(false)

// Update mutation
const { mutate: updateOrganisation, isPending: isSaving } = usePartialUpdateOrganisation()

// Initialize form data when organization loads
watch(organisation, (org) => {
  if (org) {
    setValues({
      title: org.title || '',
      description: org.description || '',
      external_website: org.external_website || '',
    })
  }
}, { immediate: true })

// Handle image file changes
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      validateImageFile(file, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
      })
      
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value)
      }
      
      landingImage.value = file
      imagePreview.value = createImagePreview(file)
      $notyf.success('Landing image selected')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid file'
      $notyf.error(errorMessage)
      target.value = ''
      landingImage.value = null
      imagePreview.value = null
    }
  }
}

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      validateImageFile(file, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
      })
      
      if (logoPreview.value) {
        URL.revokeObjectURL(logoPreview.value)
      }
      
      logo.value = file
      logoPreview.value = createImagePreview(file)
      $notyf.success('Logo selected')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid file'
      $notyf.error(errorMessage)
      target.value = ''
      logo.value = null
      logoPreview.value = null
    }
  }
}

// Reset form
const resetForm = () => {
  if (organisation.value) {
    setValues({
      title: organisation.value.title || '',
      description: organisation.value.description || '',
      external_website: organisation.value.external_website || '',
    })
  }
  
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
    logoPreview.value = null
  }
  
  landingImage.value = null
  logo.value = null
  
  const imageInput = document.querySelector('#landing_image') as HTMLInputElement
  const logoInput = document.querySelector('#logo') as HTMLInputElement
  if (imageInput) imageInput.value = ''
  if (logoInput) logoInput.value = ''
}

// Submit form
const handleSubmit = handleFormSubmit(async (values) => {
  if (!organisation.value) return

  try {
    // If files are being uploaded, use FormData
    if (landingImage.value || logo.value) {
      const formData = new FormData()
      formData.append('title', values.title)
      if (values.description) formData.append('description', values.description)
      if (values.external_website) formData.append('external_website', values.external_website)
      if (landingImage.value) formData.append('landing_image', landingImage.value)
      if (logo.value) formData.append('logo', logo.value)

      updateOrganisation({
        organisationId: organisationId.value,
        body: formData,
      }, {
        onSuccess: () => {
          showSuccess.value = true
          $notyf.success('Organization updated successfully!')
          
          // Cleanup
          if (imagePreview.value) {
            URL.revokeObjectURL(imagePreview.value)
            imagePreview.value = null
          }
          if (logoPreview.value) {
            URL.revokeObjectURL(logoPreview.value)
            logoPreview.value = null
          }
          landingImage.value = null
          logo.value = null
          
          setTimeout(() => {
            showSuccess.value = false
          }, 3000)
        },
        onError: (error: any) => {
          $notyf.error(error?.body?.error || error?.message || 'Failed to update organization')
        }
      })
    } else {
      // JSON update only
      updateOrganisation({
        organisationId: organisationId.value,
        body: values,
      }, {
        onSuccess: () => {
          showSuccess.value = true
          $notyf.success('Organization updated successfully!')
          setTimeout(() => {
            showSuccess.value = false
          }, 3000)
        },
        onError: (error: any) => {
          $notyf.error(error?.body?.error || error?.message || 'Failed to update organization')
        }
      })
    }
  } catch (err) {
    console.error('Error updating organization:', err)
    $notyf.error('Error updating organization' + (err instanceof Error ? `: ${err.message}` : ''))
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
})
</script>