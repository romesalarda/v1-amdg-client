<template>
  <EventManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Resources List -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">folder_open</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Event Resources</h2>
              <p class="text-xs text-navy-400 mt-0.5">Upload and manage documents, PDFs, and other files</p>
            </div>
            <button
              v-if="canCreate"
              @click="showUploadModal = true"
              class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">upload</span>
              Upload Resource
            </button>
          </div>

          <div v-if="isLoadingResources" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="resourcesList.length" class="space-y-3">
            <div
              v-for="resource in resourcesList"
              :key="resource.id"
              class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-primary text-xl">
                      {{ getResourceIcon(resource.resource_type || 'OTHER') }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-sm font-semibold text-navy-900 truncate">{{ resource.name }}</h3>
                      <span v-if="resource.public" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Public
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Private
                      </span>
                    </div>
                    <p v-if="resource.description" class="text-xs text-navy-500 mb-2">{{ resource.description }}</p>
                    <div class="flex items-center gap-3 text-xs text-navy-400">
                      <span>{{ resource.resource_type }}</span>
                      <span v-if="resource.tag">• {{ resource.tag }}</span>
                      <span>• {{ formatCompactDateTime(resource.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <button
                    v-if="getResourceUrl(resource)"
                    @click="previewResource(resource)"
                    class="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <span class="material-symbols-outlined text-navy-600 text-lg">visibility</span>
                  </button>
                  <a
                    v-if="getResourceUrl(resource)"
                    :href="getResourceUrl(resource)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Open"
                  >
                    <span class="material-symbols-outlined text-navy-600 text-lg">open_in_new</span>
                  </a>
                  <button
                    v-if="canEdit"
                    @click="editResource(resource)"
                    class="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <span class="material-symbols-outlined text-navy-600 text-lg">edit</span>
                  </button>
                  <button
                    v-if="canDelete"
                    @click="deleteResource(resource)"
                    class="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <span class="material-symbols-outlined text-red-600 text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <span class="material-symbols-outlined text-navy-300 text-6xl block mx-auto mb-4">description</span>
            <p class="text-sm text-navy-600 mb-4">No resources yet</p>
            <button
              @click="showUploadModal = true"
              class="px-4 py-2 border border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              Upload Your First Resource
            </button>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Resource Stats -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">analytics</span>
              Resource Stats
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Total Resources</span>
              <span class="text-2xl font-black text-navy-900">{{ resourcesList.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Public</span>
              <span class="text-xl font-black text-green-600">{{ resourcesList.filter(r => r.public).length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600 font-medium">Private</span>
              <span class="text-xl font-black text-gray-600">{{ resourcesList.filter(r => !r.public).length }}</span>
            </div>
          </div>
        </section>

        <!-- Guidelines -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Guidelines</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p><strong>Max file size:</strong> 10MB</p>
            <p><strong>Supported formats:</strong> PDF, DOC, XLS, Images, Videos</p>
            <p><strong>Best practices:</strong> Use descriptive names and set visibility appropriately</p>
          </div>
        </section>
      </div>
    </div>

    <!-- Upload/Edit Modal -->
    <div v-if="showUploadModal || showEditModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModals">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-md w-full">
        <div class="flex items-center gap-2 px-6 py-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">{{ showEditModal ? 'edit' : 'upload' }}</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ showEditModal ? 'Edit Resource' : 'Upload Resource' }}
          </h3>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-name">
              Resource Name <span class="text-red-500">*</span>
            </label>
            <input
              id="resource-name"
              v-model="resourceForm.name"
              type="text"
              placeholder="e.g., Event Schedule PDF"
              required
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-description">
              Description
            </label>
            <textarea
              id="resource-description"
              v-model="resourceForm.description"
              placeholder="Brief description"
              rows="2"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-type">
              Resource Type <span class="text-red-500">*</span>
            </label>
            <select
              id="resource-type"
              v-model="resourceForm.resource_type"
              :disabled="showEditModal"
              required
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="type in resourceTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <p v-if="showEditModal" class="text-xs text-navy-400">Resource type cannot be changed during edit.</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-tag">
              Tag
            </label>
            <input
              id="resource-tag"
              v-model="resourceForm.tag"
              type="text"
              placeholder="e.g., SCHEDULE, INFO"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div v-if="!showEditModal && resourceForm.resource_type === 'LINK'" class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-link">
              Link URL <span class="text-red-500">*</span>
            </label>
            <input
              id="resource-link"
              v-model="resourceForm.link"
              type="url"
              placeholder="https://example.com/resource"
              :required="!showEditModal && resourceForm.resource_type === 'LINK'"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div v-if="!showEditModal && resourceForm.resource_type !== 'LINK'" class="space-y-2">
            <label class="block text-sm font-medium text-navy-900" for="resource-file">
              File <span class="text-red-500">*</span>
            </label>
            <input
              ref="fileInput"
              id="resource-file"
              type="file"
              :accept="resourceFileAccept"
              @change="onFileSelected"
              :required="!showEditModal && resourceForm.resource_type !== 'LINK'"
              class="block w-full text-sm text-navy-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-start gap-3 p-3 bg-mist-blue/40 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
              <input
                type="checkbox"
                v-model="resourceForm.public"
                class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <div>
                <p class="text-sm font-semibold text-navy-900">Make publicly accessible</p>
                <p class="text-xs text-navy-400">Allow anyone to view and download this resource</p>
              </div>
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button
              type="button"
              @click="closeModals"
              class="px-4 py-2 border border-navy-200 text-navy-600 text-sm font-bold rounded-xl hover:bg-navy-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || (!showEditModal && requiresUploadValue)"
              class="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              {{ showEditModal ? 'Update' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Resource Preview Modal -->
    <div v-if="showPreviewModal && previewingResource" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="closePreviewModal">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-navy-50">
          <div class="min-w-0">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest truncate">{{ previewingResource.name }}</h3>
            <p class="text-xs text-navy-500 mt-1">{{ previewingResource.resource_type }}</p>
          </div>
          <div class="flex items-center gap-2">
            <a
              v-if="getResourceUrl(previewingResource)"
              :href="getResourceUrl(previewingResource)"
              target="_blank"
              rel="noopener noreferrer"
              class="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Open in New Tab
            </a>
            <button
              type="button"
              @click="closePreviewModal"
              class="p-2 hover:bg-navy-50 rounded-lg transition-colors"
              title="Close"
            >
              <span class="material-symbols-outlined text-navy-700 text-lg">close</span>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-auto">
          <template v-if="isPreviewImage(previewingResource)">
            <img :src="getResourceUrl(previewingResource) || ''" :alt="previewingResource.name" class="max-h-[70vh] w-full object-contain rounded-xl bg-mist-blue/30" />
          </template>
          <template v-else-if="isPreviewVideo(previewingResource)">
            <video :src="getResourceUrl(previewingResource) || ''" controls class="w-full rounded-xl bg-black max-h-[70vh]" />
          </template>
          <template v-else-if="isPreviewAudio(previewingResource)">
            <audio :src="getResourceUrl(previewingResource) || ''" controls class="w-full" />
          </template>
          <template v-else-if="isPreviewPdf(previewingResource)">
            <iframe :src="getResourceUrl(previewingResource) || ''" class="w-full h-[70vh] rounded-xl border border-navy-100" title="Resource Preview" />
          </template>
          <template v-else>
            <div class="text-center py-16 bg-mist-blue/30 rounded-xl border border-deep-navy/10">
              <span class="material-symbols-outlined text-navy-300 text-6xl block mx-auto mb-4">description</span>
              <p class="text-sm text-navy-700 font-semibold mb-2">Preview not available for this file type.</p>
              <p class="text-xs text-navy-500 mb-6">Open the resource in a new tab to view or download it.</p>
              <a
                v-if="getResourceUrl(previewingResource)"
                :href="getResourceUrl(previewingResource)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <span class="material-symbols-outlined text-base">open_in_new</span>
                Open Resource
              </a>
            </div>
          </template>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventResources, useAddEventResource, useRemoveEventResource, useUpdateEventResource } from '~/composables/resources/events/eventResources'
import type { EventListAddResourceCreateData } from '~/api/types.gen'
import { resolveImageUrl } from '~/utils/image'
import { formatCompactDateTime } from '~/utils/time'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useCurrentUserEventPermissions } from '~/composables/permissions'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'RESOURCE_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})


const route = useRoute()
const toast = useToast()
const id = computed(() => route.params.id as string)

const { can, refetch: refetchPermissions } = useCurrentUserEventPermissions(id)

const canEdit = computed(() => can('CONTENT_MANAGEMENT', 'update').value.allowed)
const canCreate = computed(() => can('CONTENT_MANAGEMENT', 'create').value.allowed)
const canDelete = computed(() => can('CONTENT_MANAGEMENT', 'delete').value.allowed)

const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

const { data: resources, isLoading: isLoadingResources } = useEventResources(id)
// Filter out landing images (they're managed on the landing page)
const resourcesList = computed(() => {
  const results = resources.value?.data?.results || []
  return results.filter((r: any) => 
    r.tag !== 'LANDING_PHOTO_MAIN' && r.tag !== 'LANDING_PHOTO_SECONDARY'
  )
})

const showUploadModal = ref(false)
const showEditModal = ref(false)
const showPreviewModal = ref(false)
const editingResource = ref<any>(null)
const previewingResource = ref<any>(null)
const fileInput = ref<HTMLInputElement>()

const resourceTypes = [
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'LINK', label: 'Link' },
  { value: 'OTHER', label: 'Other' },
]

const resourceForm = ref({
  name: '',
  description: '',
  resource_type: 'DOCUMENT' as any,
  tag: '',
  file: null as File | null,
  link: '',
  public: true,
})

const resourceFileAccept = computed(() => {
  switch (resourceForm.value.resource_type) {
    case 'IMAGE':
      return 'image/*'
    case 'VIDEO':
      return 'video/*'
    case 'AUDIO':
      return 'audio/*'
    default:
      return ''
  }
})

const requiresUploadValue = computed(() => {
  if (resourceForm.value.resource_type === 'LINK') {
    return !resourceForm.value.link?.trim()
  }

  return !resourceForm.value.file
})

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    resourceForm.value.file = target.files[0]
  }
}

const addResourceMutation = useAddEventResource()
const updateResourceMutation = useUpdateEventResource()
// const removeResourceMutation = useRemoveEventResource()
const isSubmitting = computed(() => 
  addResourceMutation.isPending.value || 
  updateResourceMutation.isPending.value || 
  removeResourceMutation.isPending.value
)

const editResource = (resource: any) => {
  editingResource.value = resource
  resourceForm.value = {
    name: resource.name,
    description: resource.description || '',
    resource_type: resource.resource_type,
    tag: resource.tag || '',
    file: null,
    link: resource.link || '',
    public: resource.public,
  }
  showEditModal.value = true
}

const closeModals = () => {
  showUploadModal.value = false
  showEditModal.value = false
  editingResource.value = null
  resourceForm.value = {
    name: '',
    description: '',
    resource_type: 'DOCUMENT',
    tag: '',
    file: null,
    link: '',
    public: true,
  }
  if (fileInput.value) fileInput.value.value = ''
}

const getResourceUrl = (resource: any) => {
  const rawUrl = resource?.image || resource?.file || resource?.link || null
  if (!rawUrl) return undefined
  return resolveImageUrl(rawUrl, rawUrl)
}

const isPreviewImage = (resource: any) => {
  return resource?.resource_type === 'IMAGE'
}

const isPreviewVideo = (resource: any) => {
  return resource?.resource_type === 'VIDEO'
}

const isPreviewAudio = (resource: any) => {
  return resource?.resource_type === 'AUDIO'
}

const isPreviewPdf = (resource: any) => {
  const url = (getResourceUrl(resource) || '').toLowerCase()
  return resource?.resource_type === 'DOCUMENT' && url.includes('.pdf')
}

const previewResource = (resource: any) => {
  previewingResource.value = resource
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewingResource.value = null
}

watch(
  () => resourceForm.value.resource_type,
  (nextType) => {
    if (showEditModal.value) return

    if (nextType === 'LINK') {
      resourceForm.value.file = null
      if (fileInput.value) fileInput.value.value = ''
    } else {
      resourceForm.value.link = ''
    }
  }
)

const handleSubmit = async () => {
  if (showEditModal.value) {
    // For edit: use efficient update endpoint (only updates metadata, no file re-upload)
    if (!editingResource.value) return
    
    try {
      await updateResourceMutation.mutateAsync({
        eventId: id.value,
        query: { resource_id: editingResource.value.id },
        body: {
          name: resourceForm.value.name,
          description: resourceForm.value.description,
          tag: resourceForm.value.tag,
          public: resourceForm.value.public,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Resource updated successfully',
        color: 'green',
      })

      closeModals()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to update resource',
        color: 'red',
      })
    }
  } else {
    // For upload: create new resource
    if (requiresUploadValue.value) return

    try {
      const payload: EventListAddResourceCreateData['body'] = {
        name: resourceForm.value.name,
        description: resourceForm.value.description,
        resource_type: resourceForm.value.resource_type,
        tag: resourceForm.value.tag,
        public: resourceForm.value.public,
      }

      if (resourceForm.value.resource_type === 'LINK') {
        payload.link = resourceForm.value.link.trim()
      } else {
        const selectedFile = resourceForm.value.file
        if (!selectedFile) return

        if (resourceForm.value.resource_type === 'IMAGE') {
          payload.image = selectedFile
        } else {
          payload.file = selectedFile
        }
      }

      await addResourceMutation.mutateAsync({
        eventId: id.value,
        body: payload,
      })

      toast.add({
        title: 'Success',
        description: 'Resource uploaded successfully',
        color: 'green',
      })

      closeModals()
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to upload resource',
        color: 'red',
      })
    }
  }
}

const removeResourceMutation = useRemoveEventResource()

const deleteResource = async (resource: any) => {
  if (!confirm('Are you sure you want to delete this resource?')) return

  try {
    await removeResourceMutation.mutateAsync({
      eventId: id.value,
      query: { resource_id: resource.id },
    })

    toast.add({
      title: 'Success',
      description: 'Resource deleted successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete resource',
      color: 'red',
    })
  }
}

const getResourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    DOCUMENT: 'description',
    IMAGE: 'image',
    VIDEO: 'videocam',
    AUDIO: 'audiotrack',
    LINK: 'link',
    OTHER: 'folder',
  }
  return icons[type] || 'folder'
}

onMounted(() => {
  refetchPermissions()
})
</script>
