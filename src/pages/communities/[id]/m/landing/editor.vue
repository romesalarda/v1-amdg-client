<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <USkeleton class="h-64 w-full" />
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-32 w-full" />
    </div>

    <!-- Editor Form -->
    <form v-else-if="organisation" @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Current Landing Image -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Landing Image</h2>
        
        <!-- Current Image Preview -->
        <div v-if="organisation.landing_image || imagePreview" class="mb-4">
          <img 
            :src="imagePreview || resolveImageUrl(organisation.landing_image!)" 
            :alt="organisation.title"
            @error="onImageError"
            class="w-full h-64 object-cover rounded-lg"
          />
        </div>
        <div v-else class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
        </div>

        <!-- Upload New Image -->
        <div class="mt-4">
          <label for="landing_image" class="block text-sm font-medium text-gray-700 mb-2">
            Upload New Landing Image
          </label>
          <input
            id="landing_image"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p class="mt-2 text-sm text-gray-500">
            Recommended: 1920x1080px, max 5MB (JPG, PNG, WebP)
          </p>
        </div>
      </div>

      <!-- Logo -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Logo</h2>
        
        <!-- Current Logo Preview -->
        <div class="flex items-center gap-6 mb-4">
          <div class="w-24 h-24 bg-gray-100 rounded-lg p-3 flex items-center justify-center">
            <img 
              v-if="organisation.logo || logoPreview"
              :src="logoPreview || resolveImageUrl(organisation.logo!)" 
              :alt="organisation.title"
              @error="onImageError"
              class="w-full h-full object-contain"
            />
            <UIcon v-else name="i-heroicons-building-office" class="w-12 h-12 text-gray-400" />
          </div>
          <div class="flex-1">
            <label for="logo" class="block text-sm font-medium text-gray-700 mb-2">
              Upload New Logo
            </label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              @change="handleLogoChange"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p class="mt-2 text-sm text-gray-500">
              Recommended: Square 512x512px, max 2MB
            </p>
          </div>
        </div>
      </div>

      <!-- Organization Details -->
      <div class="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">Organization Details</h2>

        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            v-model="description"
            rows="6"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell members about your community..."
          ></textarea>
          <p class="mt-2 text-sm text-gray-500">
            Describe your community's mission, activities, and what makes it special
          </p>
        </div>

        <!-- External Website -->
        <div>
          <label for="external_website" class="block text-sm font-medium text-gray-700 mb-2">
            External Website
          </label>
          <input
            id="external_website"
            v-model="external_website"
            type="url"
            placeholder="https://example.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between bg-white rounded-lg shadow p-6">
        <UButton
          type="button"
          variant="ghost"
          @click="resetForm"
          :disabled="isSaving"
        >
          Reset Changes
        </UButton>

        <div class="flex gap-3">
          <UButton
            type="button"
            variant="outline"
            :to="`/communities/${organisationId}`"
            :disabled="isSaving"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="isSaving"
            :disabled="isSaving"
            color="primary"
            size="lg"
          >
            Save Changes
          </UButton>
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
        <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
            <span class="text-green-800 font-medium">Changes saved successfully!</span>
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
  layout: 'default',
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)

useHead({
  title: 'Edit Landing Page',
})

// Fetch organization data
const { data: orgData, isLoading } = useOrganisation(computed(() => Number(organisationId.value)))
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
        organisationId: Number(organisationId.value),
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
        organisationId: Number(organisationId.value),
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