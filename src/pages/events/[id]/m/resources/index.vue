<template>
  <EventsManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Resources List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Event Resources</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Upload and manage documents, PDFs, and other files
                </p>
              </div>
              <UButton
                color="blue"
                icon="i-heroicons-arrow-up-tray"
                @click="showUploadModal = true"
              >
                Upload Resource
              </UButton>
            </div>
          </div>

          <div class="p-6">
            <div v-if="resources.isLoading" class="space-y-3">
              <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <div class="w-10 h-10 bg-gray-200 rounded" />
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div class="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>

            <div v-else-if="resourcesList.length" class="space-y-2">
              <div
                v-for="resource in resourcesList"
                :key="resource.id"
                class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div class="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <UIcon :name="getResourceIcon(resource.resource_type || 'OTHER')" class="w-5 h-5 text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ resource.name }}</p>
                  <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{{ resource.resource_type }}</span>
                    <span v-if="resource.tag">• {{ resource.tag }}</span>
                    <span>• {{ formatCompactDateTime(resource.created_at) }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="resource.public" color="green" variant="subtle" size="xs">
                    Public
                  </UBadge>
                  <UBadge v-else color="gray" variant="subtle" size="xs">
                    Private
                  </UBadge>
                  <UButton
                    :href="resource.resource_url"
                    target="_blank"
                    variant="ghost"
                    color="gray"
                    size="sm"
                    icon="i-heroicons-arrow-down-tray"
                  />
                  <UButton
                    variant="ghost"
                    color="red"
                    size="sm"
                    icon="i-heroicons-trash"
                    @click="deleteResource(resource)"
                  />
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p class="text-sm text-gray-600 mb-4">No resources yet</p>
              <UButton
                color="blue"
                variant="outline"
                @click="showUploadModal = true"
              >
                Upload Your First Resource
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Resource Stats</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Total Resources</span>
              <span class="font-medium text-gray-900">{{ resourcesList.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Public</span>
              <span class="font-medium text-gray-900">{{ resourcesList.filter(r => r.public).length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Private</span>
              <span class="font-medium text-gray-900">{{ resourcesList.filter(r => !r.public).length }}</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-blue-900 mb-2">Guidelines</h3>
              <ul class="text-xs text-blue-800 space-y-1.5">
                <li>• Max file size: 10MB</li>
                <li>• Supported: PDF, DOC, XLS, Images</li>
                <li>• Use descriptive names</li>
                <li>• Set visibility appropriately</li>
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
          <h3 class="text-lg font-semibold">Upload Resource</h3>
        </template>

        <form @submit.prevent="handleUpload" class="space-y-4">
          <UFormGroup label="Resource Name" required>
            <UInput v-model="uploadForm.name" placeholder="e.g., Event Schedule PDF" />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea v-model="uploadForm.description" placeholder="Brief description" :rows="2" />
          </UFormGroup>

          <UFormGroup label="Resource Type" required>
            <USelectMenu
              v-model="uploadForm.resource_type"
              :options="resourceTypes"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormGroup>

          <UFormGroup label="Tag">
            <UInput v-model="uploadForm.tag" placeholder="e.g., SCHEDULE, INFO" />
          </UFormGroup>

          <UFormGroup label="File" required>
            <input
              ref="fileInput"
              type="file"
              @change="onFileSelected"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </UFormGroup>

          <UFormGroup>
            <UCheckbox v-model="uploadForm.public" label="Make publicly accessible" />
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
import { useEventResources, useAddEventResource, useRemoveEventResource } from '~/composables/resources/events/eventResources'
import { formatCompactDateTime } from '~/utils/time'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
definePageMeta({
  layout: false,
})

const route = useRoute()
const toast = useToast()
const id = computed(() => route.params.id as string)

const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

const resources = useEventResources(id)
const resourcesList = computed(() => resources.data.value?.data?.results || [])

const showUploadModal = ref(false)
const fileInput = ref<HTMLInputElement>()

const resourceTypes = [
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'LINK', label: 'Link' },
  { value: 'OTHER', label: 'Other' },
]

const uploadForm = ref({
  name: '',
  description: '',
  resource_type: 'DOCUMENT' as any,
  tag: '',
  file: null as File | null,
  public: true,
})

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
  }
}

const addResourceMutation = useAddEventResource()
const isUploading = computed(() => addResourceMutation.isPending.value)

const handleUpload = async () => {
  if (!uploadForm.value.file) return

  try {
    await addResourceMutation.mutateAsync({
      eventId: id.value,
      body: {
        name: uploadForm.value.name,
        description: uploadForm.value.description,
        resource_type: uploadForm.value.resource_type,
        tag: uploadForm.value.tag,
        file: uploadForm.value.file,
        public: uploadForm.value.public,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Resource uploaded successfully',
      color: 'green',
    })

    showUploadModal.value = false
    uploadForm.value = {
      name: '',
      description: '',
      resource_type: 'DOCUMENT',
      tag: '',
      file: null,
      public: true,
    }
    if (fileInput.value) fileInput.value.value = ''
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to upload resource',
      color: 'red',
    })
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
    DOCUMENT: 'i-heroicons-document-text',
    IMAGE: 'i-heroicons-photo',
    VIDEO: 'i-heroicons-film',
    AUDIO: 'i-heroicons-musical-note',
    LINK: 'i-heroicons-link',
    OTHER: 'i-heroicons-document',
  }
  return icons[type] || 'i-heroicons-document'
}
</script>
