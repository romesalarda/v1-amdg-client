<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 flex-1 min-w-[240px]">
        <UInput
          v-model="searchQuery"
          placeholder="Search forms by title or description..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="flex-1"
          :loading="isLoading"
        />
        <UButton
          v-if="searchQuery"
          icon="i-heroicons-x-mark"
          size="sm"
          color="gray"
          variant="ghost"
          @click="searchQuery = ''"
        />
      </div>
      <UButton
        v-if="!readOnly"
        label="Create Form"
        icon="i-heroicons-plus"
        size="sm"
        @click="openCreateModal"
      />
    </div>

    <!-- Forms Grid -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <USkeleton v-for="i in 3" :key="i" class="h-48 rounded-xl" />
    </div>

    <!-- Empty: no forms yet -->
    <UCard v-else-if="forms.length === 0 && !searchQuery" class="text-center py-16">
      <div class="space-y-4">
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No custom forms yet</h3>
          <p class="text-sm text-gray-600 mb-6">Create additional feedback forms, surveys, or questionnaires for your attendees.</p>
        </div>
        <UButton
          v-if="!readOnly"
          label="Create First Form"
          icon="i-heroicons-plus"
          size="lg"
          @click="openCreateModal"
        />
      </div>
    </UCard>

    <!-- Empty: search returned no results -->
    <UCard v-else-if="forms.length === 0 && searchQuery" class="text-center py-12">
      <div class="space-y-3">
        <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 text-gray-400 mx-auto" />
        <h3 class="font-semibold text-gray-900">No results for &ldquo;{{ searchQuery }}&rdquo;</h3>
        <p class="text-sm text-gray-600">Try a different search term.</p>
        <UButton label="Clear Search" variant="ghost" size="sm" @click="searchQuery = ''" />
      </div>
    </UCard>

    <!-- Cards List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="form in forms"
        :key="form.id"
        class="hover:shadow-lg transition-all border border-gray-100 relative group flex flex-col justify-between"
        :class="{
          'border-t-4 border-t-blue-500': form.status === 'published',
          'border-t-4 border-t-gray-400': form.status === 'draft',
          'border-t-4 border-t-red-400': form.status === 'closed',
        }"
      >
        <div class="space-y-3 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 cursor-pointer" @click="$emit('edit', form.id)">
                {{ form.title }}
              </h4>
              <p class="text-xs text-gray-400 mt-0.5">
                Created {{ formatDate(form.created_at) }}
              </p>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0" v-if="!readOnly">
              <UDropdown
                :items="getActionMenuItems(form)"
                :popper="{ placement: 'bottom-end' }"
              >
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-vertical"
                  size="xs"
                />
              </UDropdown>
            </div>
          </div>

          <p class="text-sm text-gray-600 line-clamp-3 min-h-[40px]">
            {{ form.description || 'No description provided.' }}
          </p>

          <div class="flex items-center gap-4 pt-3 border-t border-gray-100 flex-wrap">
            <UBadge
              :label="form.status_display || form.status"
              :color="getStatusColor(form.status)"
              variant="soft"
              size="xs"
            />
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4" />
              <span>{{ form.question_count || 0 }} questions</span>
            </div>
            <UBadge
              v-if="form.required"
              label="Required"
              color="red"
              variant="soft"
              size="xs"
            />
          </div>
        </div>

        <div class="pt-4 mt-auto flex items-center gap-2 justify-end">
          <UButton
            label="Edit Questions"
            icon="i-heroicons-pencil-square"
            size="xs"
            variant="soft"
            @click="$emit('edit', form.id)"
          />
          <UButton
            v-if="form.status === 'published' && !readOnly"
            label="Close Form"
            color="red"
            variant="ghost"
            size="xs"
            @click="closeForm(form.id)"
          />
          <UButton
            v-if="form.status === 'draft' && !readOnly"
            label="Publish"
            color="green"
            variant="solid"
            size="xs"
            @click="publishForm(form.id)"
          />
        </div>
      </UCard>
    </div>

    <!-- Create Form Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 text-lg">
              {{ editingFormId ? 'Edit Form Settings' : 'Create Custom Form' }}
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              size="xs"
              @click="closeCreateModal"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Form Title" required>
            <UInput
              v-model="formFields.title"
              placeholder="e.g. Workshop Session Feedback"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="formFields.description"
              placeholder="Provide context or instructions for attendees answering this form."
              :rows="4"
              :disabled="isSubmitting"
            />
          </UFormGroup>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
            <UCheckbox
              v-model="formFields.required"
              label="All attendees are required to fill this form"
              :disabled="isSubmitting"
            />
            <UCheckbox
              v-model="formFields.allow_response_editing"
              label="Allow response editing after submission"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Scheduling -->
          <div class="space-y-3 pt-2 border-t border-gray-200">
            <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Scheduling</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormGroup label="Opens At"> 
                <UInput
                  label="Opens At"
                  v-model="formFields.opens_at"
                  type="datetime-local"
                  :disabled="isSubmitting"
                />
              </UFormGroup>
              <UFormGroup label="Deadline"> 
                <UInput
                  label="Deadline"
                  v-model="formFields.deadline"
                  type="datetime-local"
                  :disabled="isSubmitting"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Pre-opens Message" hint="Shown to attendees before the form opens">
              <UInput
                v-model="formFields.pre_opens_message"
                placeholder="e.g. This form will open on June 15th."
                :disabled="isSubmitting"
              />
            </UFormGroup>

            <UFormGroup label="Deadline Message" hint="Shown to attendees after the deadline has passed">
              <UInput
                v-model="formFields.deadline_message"
                placeholder="e.g. Submissions are now closed."
                :disabled="isSubmitting"
              />
            </UFormGroup>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              size="sm"
              @click="closeCreateModal"
            />
            <UButton
              :label="editingFormId ? 'Save Changes' : 'Create'"
              size="sm"
              :loading="isSubmitting"
              @click="submitForm"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { DateTime } from 'luxon'
import Swal from 'sweetalert2'
import {
  useCreateEventForm,
  useUpdateEventForm,
  useDeleteEventForm,
  usePublishEventForm,
  useCloseEventForm,
} from '~/composables/resources/events/eventForms'

const props = defineProps<{
  formsList: any[]
  eventIntId: number
  eventUuid: string | undefined
  eventUrlSafeTitle: string
  isLoading: boolean
  readOnly: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', formId: string): void
  (e: 'refresh'): void
}>()

const searchQuery = ref('')
const showCreateModal = ref(false)
const editingFormId = ref<string | null>(null)
const isSubmitting = ref(false)

const toast = useToast()
const createFormMutation = useCreateEventForm()
const updateFormMutation = useUpdateEventForm()
const deleteFormMutation = useDeleteEventForm()
const publishFormMutation = usePublishEventForm()
const closeFormMutation = useCloseEventForm()

const formFields = reactive({
  title: '',
  description: '',
  required: false,
  allow_response_editing: true,
  deadline: '',
  deadline_message: '',
  opens_at: '',
  pre_opens_message: '',
})

// Convert ISO datetime string to datetime-local input value (YYYY-MM-DDTHH:mm)
const toDatetimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return ''
  try {
    console.log('Converting ISO to local:', iso)
    const d = new Date(iso)
    // Offset to local time
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - offset).toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

// Convert datetime-local input value to ISO string (or null if empty)
const fromDatetimeLocal = (local: string): string | null => {
  if (!local) return null
  return new Date(local).toISOString()
}

const forms = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return props.formsList
  return props.formsList.filter(form =>
    (form.title || '').toLowerCase().includes(query) ||
    (form.description || '').toLowerCase().includes(query)
  )
})

type BadgeColor = 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'white' | 'black'

const getStatusColor = (status: string): BadgeColor => {
  const colors: Record<string, BadgeColor> = {
    draft: 'gray',
    published: 'green',
    closed: 'red',
  }
  return colors[status] ?? 'gray'
}

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return DateTime.fromISO(isoString).toLocaleString(DateTime.DATE_MED)
}

const openCreateModal = () => {
  editingFormId.value = null
  formFields.title = ''
  formFields.description = ''
  formFields.required = false
  formFields.allow_response_editing = true
  formFields.deadline = ''
  formFields.deadline_message = ''
  formFields.opens_at = ''
  formFields.pre_opens_message = ''
  showCreateModal.value = true
}

const openEditModal = (form: any) => {
  editingFormId.value = form.id
  formFields.title = form.title
  formFields.description = form.description || ''
  formFields.required = !!form.required
  formFields.allow_response_editing = !!form.allow_response_editing
  formFields.deadline = toDatetimeLocal(form.deadline)
  formFields.deadline_message = form.deadline_message || ''
  formFields.opens_at = toDatetimeLocal(form.opens_at)
  formFields.pre_opens_message = form.pre_opens_message || ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const submitForm = async () => {
  if (!formFields.title.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Form title is required',
      color: 'red',
    })
    return
  }

  isSubmitting.value = true
  try {
    if (!props.eventUuid || typeof props.eventUuid !== 'string') {
      toast.add({
        title: 'Error',
        description: 'Event identifier is missing. Please try again later.',
        color: 'red',
      })
      return
    }

    const payload = {
      event: props.eventUuid, // required by schema field Event slug slugrelatedfield
      title: formFields.title.trim(),
      description: formFields.description.trim() || null,
      required: formFields.required,
      allow_response_editing: formFields.allow_response_editing,
      deadline: fromDatetimeLocal(formFields.deadline),
      deadline_message: formFields.deadline_message.trim(),
      opens_at: fromDatetimeLocal(formFields.opens_at),
      pre_opens_message: formFields.pre_opens_message.trim(),
    }

    

    if (editingFormId.value) {
      await updateFormMutation.mutateAsync({
        formId: editingFormId.value,
        body: payload,
      })
      toast.add({ title: 'Form Updated', description: 'Form settings saved successfully', color: 'green' })
    } else {
      await createFormMutation.mutateAsync(payload)
      toast.add({ title: 'Form Created', description: 'Form created successfully', color: 'green' })
    }
    closeCreateModal()
    emit('refresh')
  } catch (error: any) {
    toast.add({
      title: 'Operation Failed',
      description: error?.message || 'Failed to save form settings',
      color: 'red',
    })
  } finally {
    isSubmitting.value = false
  }
}

const publishForm = async (formId: string) => {
  const result = await Swal.fire({
    title: 'Publish Form?',
    text: 'Attendees will be able to view and answer this form.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Publish Now',
  })

  if (!result.isConfirmed) return

  try {
    await publishFormMutation.mutateAsync(formId)
    toast.add({ title: 'Form Published', description: 'Form is now live!', color: 'green' })
    emit('refresh')
  } catch (error: any) {
    toast.add({ title: 'Publish Failed', description: error?.message || 'An error occurred', color: 'red' })
  }
}

const closeForm = async (formId: string) => {
  const result = await Swal.fire({
    title: 'Close Form?',
    text: 'Further submissions will be disabled.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Close Form',
  })

  if (!result.isConfirmed) return

  try {
    await closeFormMutation.mutateAsync(formId)
    toast.add({ title: 'Form Closed', description: 'Form is closed to submissions', color: 'green' })
    emit('refresh')
  } catch (error: any) {
    toast.add({ title: 'Operation Failed', description: error?.message || 'An error occurred', color: 'red' })
  }
}

const deleteForm = async (formId: string, title: string) => {
  const result = await Swal.fire({
    title: 'Delete Form?',
    text: `Are you sure you want to delete "${title}"? This will permanently remove all questions and attendee responses!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete Permanently',
  })

  if (!result.isConfirmed) return

  try {
    await deleteFormMutation.mutateAsync(formId)
    toast.add({ title: 'Form Deleted', description: 'Form was deleted successfully', color: 'green' })
    emit('refresh')
  } catch (error: any) {
    toast.add({ title: 'Delete Failed', description: error?.message || 'An error occurred', color: 'red' })
  }
}

const getActionMenuItems = (form: any) => {
  return [
    [
      {
        label: 'Edit Settings',
        icon: 'i-heroicons-cog-6-tooth',
        click: () => openEditModal(form),
      },
      {
        label: 'Delete Form',
        icon: 'i-heroicons-trash',
        class: 'text-red-600 hover:text-red-700',
        click: () => deleteForm(form.id, form.title),
      },
    ],
  ]
}
</script>
