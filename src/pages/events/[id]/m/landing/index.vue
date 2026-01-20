<template>
  <EventsManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Landing Images Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Landing Images</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Manage photos that appear on your event landing page
                </p>
              </div>
              <UButton
                color="blue"
                icon="i-heroicons-plus"
                @click="showUploadModal = true"
              >
                Add Image
              </UButton>
            </div>
          </div>
          <div class="p-6">
            <div v-if="3 > 5" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="animate-pulse">
                <div class="aspect-video bg-gray-200 rounded-lg" />
              </div>
            </div>

            <div v-else-if="landingImagesList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="image in landingImagesList"
                :key="image.id"
                class="group relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                <img
                  :src="resolveImageUrl(image.image)"
                  :alt="image.name"
                  class="w-full h-full object-cover"
                  @error="onImageError"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <UButton
                      color="white"
                      size="sm"
                      icon="i-heroicons-eye"
                      square
                      @click="previewImage(image)"
                    />
                    <UButton
                      color="red"
                      size="sm"
                      icon="i-heroicons-trash"
                      square
                      @click="deleteImage(image)"
                    />
                  </div>
                </div>
                <div v-if="image.tag === 'LANDING_PHOTO_MAIN'" class="absolute top-2 left-2">
                  <UBadge color="blue" variant="solid" size="xs">
                    Main Image
                  </UBadge>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p class="text-sm text-gray-600 mb-4">No landing images yet</p>
              <UButton
                color="blue"
                variant="outline"
                @click="showUploadModal = true"
              >
                Upload Your First Image
              </UButton>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Landing Page Preview</h2>
            <p class="text-sm text-gray-600 mt-1">
              Preview how your event landing page will look to visitors
            </p>
          </div>

          <div class="p-6">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div class="flex items-center justify-center gap-3">
                <UIcon name="i-heroicons-eye" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600">
                  Preview will show here or 
                  <UButton
                    :to="`/events/${id}/preview`"
                    variant="link"
                    color="blue"
                    size="sm"
                    class="p-0 h-auto"
                  >
                    open full preview
                  </UButton>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Image Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Image Stats</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Total Images</span>
              <span class="font-medium text-gray-900">{{ landingImagesList.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Main Image</span>
              <span class="font-medium text-gray-900">
                {{ landingImagesList.some(img => img.tag === 'LANDING_PHOTO_MAIN') ? 'Set' : 'Not Set' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Guidelines -->
        <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-blue-900 mb-2">Image Guidelines</h3>
              <ul class="text-xs text-blue-800 space-y-1.5">
                <li>• Recommended size: 1920x1080px</li>
                <li>• Max file size: 5MB</li>
                <li>• Format: JPG, PNG, WebP</li>
                <li>• Use high-quality images</li>
                <li>• Set one as main image</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <UModal v-model="showUploadModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Upload Landing Image</h3>
        </template>

        <form @submit.prevent="handleUpload" class="space-y-4">
          <UFormGroup label="Image Name" required>
            <UInput v-model="uploadForm.name" placeholder="e.g., Main Event Banner" />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea v-model="uploadForm.description" placeholder="Image description" :rows="2" />
          </UFormGroup>

          <UFormGroup label="Image File" required>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="onFileSelected"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </UFormGroup>

          <UFormGroup label="Options">
            <UCheckbox v-model="uploadForm.is_main" label="Set as main landing image" />
          </UFormGroup>

          <div class="flex justify-end gap-2 pt-4">
            <UButton
              type="button"
              variant="outline"
              color="gray"
              @click="showUploadModal = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="blue"
              :loading="isUploading"
              :disabled="!uploadForm.file || isUploading"
            >
              Upload
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventLandingImages, useAddEventLandingImage } from '~/composables/resources/events/eventLandingImages'
import { useRemoveEventResource } from '~/composables/resources/events/eventResources'
import { resolveImageUrl, onImageError } from '~/utils/image'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const toast = useToast()
const id = computed(() => route.params.id as string)

// Fetch data
const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

const landingImages = useEventLandingImages(id)
const landingImagesList = computed(() => landingImages.data.value?.data?.results || [])

// Upload form
const showUploadModal = ref(false)
const fileInput = ref<HTMLInputElement>()
const uploadForm = ref({
  name: '',
  description: '',
  file: null as File | null,
  is_main: false,
})

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
  }
}

const addImageMutation = useAddEventLandingImage()
const isUploading = computed(() => addImageMutation.isPending.value)

const handleUpload = async () => {
  if (!uploadForm.value.file) return

  try {
    await addImageMutation.mutateAsync({
      eventId: id.value,
      body: {
        name: uploadForm.value.name,
        description: uploadForm.value.description,
        image: uploadForm.value.file,
        is_main: uploadForm.value.is_main,
        public: true,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Landing image uploaded successfully',
      color: 'green',
    })

    showUploadModal.value = false
    uploadForm.value = {
      name: '',
      description: '',
      file: null,
      is_main: false,
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to upload image',
      color: 'red',
    })
  }
}

const removeResourceMutation = useRemoveEventResource()

const deleteImage = async (image: any) => {
  if (!confirm('Are you sure you want to delete this image?')) return

  try {
    await removeResourceMutation.mutateAsync({
      eventId: id.value,
      query: { resource_id: image.id },
    })

    toast.add({
      title: 'Success',
      description: 'Image deleted successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete image',
      color: 'red',
    })
  }
}

const previewImage = (image: any) => {
  window.open(image.resource_url, '_blank')
}
</script>
