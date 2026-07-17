<template>
  <EventManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Policy: Require Landing Image Banner -->
        <div v-if="requiresImageWarning" class="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-lg">
          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full flex-shrink-0">
              <span class="material-symbols-outlined text-yellow-700 text-xl">policy</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xs font-black text-yellow-900 uppercase tracking-wider mb-1">Landing Image Required</h3>
              <p class="text-sm text-yellow-800 leading-relaxed">Your community's policy requires a main landing image before this event can be published. Upload an image below and mark it as the main image.</p>
            </div>
          </div>
        </div>

        <!-- Landing Images Section -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">collections</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Landing Images</h2>
              <p class="text-xs text-navy-400 mt-0.5">
                Manage photos that appear on your event landing page
              </p>
            </div>
            <button
              @click="showUploadModal = true"
              class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">add_photo_alternate</span>
              Add Image
            </button>
          </div>
          <div v-if="landingImages.isLoading.value" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="i in 3" :key="i" class="aspect-video bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="landingImagesList.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="image in landingImagesList"
                :key="image.id"
                class="group relative aspect-video rounded-xl overflow-hidden border-2 border-deep-navy/10 hover:border-primary transition-colors"
              >
                <AppImage
                  :resource="image"
                  :alt="image.name"
                  size="medium"
                  fit="cover"
                  class="w-full h-full"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <div class="flex flex-col gap-2">
                    <button
                      v-if="image.tag !== 'LANDING_PHOTO_MAIN'"
                      @click="promoteToMain(image)"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                      title="Set as main image"
                    >
                      <span class="material-symbols-outlined text-sm">star</span>
                      Set as Main
                    </button>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openCropModal(image)"
                      class="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="Crop / resize"
                    >
                      <span class="material-symbols-outlined text-white text-lg">crop</span>
                    </button>
                    <button
                      @click="previewImage(image)"
                      class="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="Preview"
                    >
                      <span class="material-symbols-outlined text-white text-lg">visibility</span>
                    </button>
                    <button
                      @click="deleteImage(image)"
                      class="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <span class="material-symbols-outlined text-white text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div v-if="image.tag === 'LANDING_PHOTO_MAIN'" class="absolute top-3 left-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-lg">
                    <span class="material-symbols-outlined text-sm">star</span>
                    Main Image
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="material-symbols-outlined text-navy-300 text-6xl block mx-auto mb-4">collections</span>
              <p class="text-sm text-navy-600 mb-4">No landing images yet</p>
              <button
                @click="showUploadModal = true"
                class="px-4 py-2 border border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                Upload Your First Image
              </button>
            </div>
          </section>

        <!-- Preview -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">preview</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Landing Page Preview</h2>
              <p class="text-xs text-navy-400 mt-0.5">
                Preview how your event landing page will look to visitors
              </p>
            </div>
          </div>

          <div class="border-2 border-dashed border-deep-navy/20 rounded-xl p-8 bg-mist-blue/20">
            <div class="flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-navy-400 text-2xl">visibility</span>
              <span class="text-sm text-navy-600">
                Preview will show here or 
                <a
                  :href="`/events/${id}/?view=preview`"
                  class="text-primary font-bold hover:underline"
                >
                  open full preview
                </a>
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Image Stats -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">analytics</span>
              Image Stats
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Total Images</span>
              <span class="text-2xl font-black text-navy-900">{{ landingImagesList.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Main Image</span>
              <span class="text-lg font-black" :class="landingImagesList.some(img => img.tag === 'LANDING_PHOTO_MAIN') ? 'text-green-600' : 'text-gray-400'">
                {{ landingImagesList.some(img => img.tag === 'LANDING_PHOTO_MAIN') ? 'Set' : 'Not Set' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Secondary Images</span>
              <span class="text-lg font-black text-blue-600">{{ landingImagesList.filter(img => img.tag === 'LANDING_PHOTO_SECONDARY').length }}</span>
            </div>
            <div v-if="policy?.require_landing_image" class="pt-3 mt-3 border-t border-navy-50 flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">policy</span>
                Image Required
              </span>
              <span class="text-xs font-black px-2 py-1 rounded-full" :class="hasMainImage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ hasMainImage ? 'Satisfied' : 'Missing' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Guidelines -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Image Guidelines</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p><strong>Recommended size:</strong> 1920x1080px</p>
            <p><strong>Max file size:</strong> 5MB</p>
            <p><strong>Format:</strong> JPG, PNG, WebP</p>
            <p><strong>Best practices:</strong> Use high-quality images and set one as main image</p>
          </div>
        </section>
      </div>
    </div>

    <!-- Crop Modal -->
    <ImageCropModal
      v-if="cropTarget"
      v-model="showCropModal"
      :resource="cropTarget"
      :event-id="id"
      @saved="cropTarget = null"
    />

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white  border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-md w-full">
        <div class="flex items-center gap-2 px-6 py-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">add_photo_alternate</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            Upload Landing Image
          </h3>
        </div>

        <form @submit.prevent="handleUpload" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="image-name">
              Image Name <span class="text-red-500">*</span>
            </label>
            <input
              id="image-name"
              v-model="uploadForm.name"
              type="text"
              placeholder="e.g., Main Event Banner"
              required
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="image-description">
              Description
            </label>
            <textarea
              id="image-description"
              v-model="uploadForm.description"
              placeholder="Image description"
              rows="2"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="image-file">
              Image File <span class="text-red-500">*</span>
            </label>
            <input
              ref="fileInput"
              id="image-file"
              type="file"
              accept="image/*"
              @change="onFileSelected"
              required
              class="block w-full text-sm text-navy-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-start gap-3 p-3 bg-mist-blue/90 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
              <input
                type="checkbox"
                v-model="uploadForm.is_main"
                class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <div>
                <p class="text-sm font-semibold text-navy-900">Set as main landing image</p>
                <p class="text-xs text-navy-400">This image will be featured prominently on your event page</p>
              </div>
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-navy-200 text-navy-600 text-sm font-bold rounded-xl hover:bg-navy-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!uploadForm.file || isUploading"
              class="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isUploading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventLandingImages, useAddEventLandingImage } from '~/composables/resources/events/eventLandingImages'
import { useRemoveEventResource, usePromoteLandingImage, useDemoteLandingImage } from '~/composables/resources/events/eventResources'
import { resolveImageUrl, onImageError } from '~/utils/image'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AppImage from '~/components/common/AppImage.vue'
import ImageCropModal from '~/components/common/ImageCropModal.vue'
import { useOrganisationPolicy } from '~/composables/resources/organisation/organisationPolicy'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'CONTENT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})
  

const route = useRoute()
const toast = useToast()
const id = computed(() => route.params.id as string)

// Fetch data
const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

const orgUrlSafeTitle = computed(() => event.value?.organisation_url_safe_title || '')
const { data: policyData } = useOrganisationPolicy(orgUrlSafeTitle)
const policy = computed(() => policyData.value?.data)

const hasMainImage = computed(() => landingImagesList.value.some((img: any) => img.tag === 'LANDING_PHOTO_MAIN'))
const requiresImageWarning = computed(() => policy.value?.require_landing_image && !hasMainImage.value)

const landingImages = useEventLandingImages(id)
const landingImagesList = computed(() => landingImages.data.value?.data?.results || [])

// Upload form
const showUploadModal = ref(false)

// Crop modal
const showCropModal = ref(false)
const cropTarget = ref<any>(null)

const openCropModal = (image: any) => {
  cropTarget.value = image
  showCropModal.value = true
}
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

const closeModal = () => {
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

    closeModal()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to upload image',
      color: 'red',
    })
    throw error
  }
}

// Promote image to main - now uses efficient tag update instead of delete-and-recreate
const promoteLandingImageMutation = usePromoteLandingImage()

const promoteToMain = async (image: any) => {
  if (!confirm('Set this image as the main landing image?')) return

  try {
    await promoteLandingImageMutation.mutateAsync({
      eventId: id.value,
      query: { resource_id: image.id },
    })

    toast.add({
      title: 'Success',
      description: 'Image promoted to main successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to promote image',
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
  window.open(resolveImageUrl(image.image), '_blank')
}
</script>
