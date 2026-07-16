<template>
  <div class="space-y-6 bg-slate-50 -m-4 p-4 rounded-2xl md:-m-6 md:p-6">
    <!-- Header Controls -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 flex-1 min-w-[240px]">
        <div class="relative flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Search forms by title or description..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
            class="flex-1"
            :loading="isLoading"
            :ui="{
              rounded: 'rounded-full',
              base: 'shadow-sm border-slate-200 focus:ring-2 focus:ring-[#2F6FED]/40 focus:border-[#2F6FED]',
            }"
          />
        </div>
        <UButton
          v-if="searchQuery"
          icon="i-heroicons-x-mark"
          size="lg"
          color="gray"
          variant="ghost"
          class="rounded-full"
          @click="searchQuery = ''"
        />
      </div>
      <UButton
        v-if="!readOnly"
        label="Create Form"
        icon="i-heroicons-plus"
        size="lg"
        class="rounded-full font-bold tracking-tight bg-[#2F6FED] hover:bg-[#2559C7] shadow-lg shadow-[#2F6FED]/25 px-5"
        @click="openCreateModal"
      />
    </div>

    <!-- Forms Grid -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <USkeleton v-for="i in 3" :key="i" class="h-64 rounded-2xl" />
    </div>

    <!-- Empty: no forms yet -->
    <div v-else-if="forms.length === 0 && !searchQuery" class="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
      <div class="space-y-4">
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center bg-[#2F6FED]/10">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-10 h-10 text-[#2F6FED]" />
          </div>
        </div>
        <div>
          <h3 class="text-xl font-extrabold tracking-tight text-[#0B1120] mb-2">No custom forms yet</h3>
          <p class="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Create additional feedback forms, surveys, or questionnaires for your attendees.</p>
        </div>
        <UButton
          v-if="!readOnly"
          label="Create First Form"
          icon="i-heroicons-plus"
          size="lg"
          class="rounded-full font-bold bg-[#2F6FED] hover:bg-[#2559C7] shadow-lg shadow-[#2F6FED]/25 px-6"
          @click="openCreateModal"
        />
      </div>
    </div>

    <!-- Empty: search returned no results -->
    <div v-else-if="forms.length === 0 && searchQuery" class="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
      <div class="space-y-3">
        <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 text-slate-300 mx-auto" />
        <h3 class="font-bold text-[#0B1120]">No results for &ldquo;{{ searchQuery }}&rdquo;</h3>
        <p class="text-sm text-slate-500">Try a different search term.</p>
        <UButton label="Clear Search" variant="ghost" size="sm" class="rounded-full" @click="searchQuery = ''" />
      </div>
    </div>

    <!-- Cards List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="form in forms"
        :key="form.id"
        class="ticket-card group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
      >
        <!-- Poster / landing image -->
        <div class="relative w-full h-44 rounded-t-2xl overflow-hidden">
          <img
            v-if="form.landing_image"
            :src="form.landing_image"
            alt="Form landing image"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full ticket-placeholder" :class="statusMeta(form.status).placeholder" />

          <!-- scrim -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

          <!-- actions menu -->
          <div class="absolute top-2.5 right-2.5" v-if="!readOnly">
            <UDropdown :items="getActionMenuItems(form)" :popper="{ placement: 'bottom-end' }">
              <UButton
                color="white"
                variant="solid"
                icon="i-heroicons-ellipsis-vertical"
                size="xs"
                class="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm ring-1 ring-white/30 text-white"
              />
            </UDropdown>
          </div>

          <!-- status pill, top-left -->
          <span
            class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow"
            :class="statusMeta(form.status).pill"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="statusMeta(form.status).dot"></span>
            {{ form.status_display || form.status }}
          </span>

          <!-- title over scrim -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <h4
              class="font-extrabold tracking-tight text-lg text-white leading-tight truncate cursor-pointer drop-shadow-sm"
              @click="$emit('edit', form.id)"
            >
              {{ form.title }}
            </h4>
            <p class="text-[11px] font-medium text-white/70 mt-0.5 uppercase tracking-wide">
              Created {{ formatDate(form.created_at) }}
            </p>
          </div>
        </div>

        <!-- Ticket stub perforation -->
        <div class="ticket-perforation"></div>

        <!-- Card body -->
        <div class="px-4 pb-4 pt-3 space-y-3">
          <p class="text-sm text-slate-500 line-clamp-2 min-h-[36px]">
            {{ form.description || 'No description provided.' }}
          </p>

          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="stub-tag">
                <span class="stub-tag-num">{{ form.question_count || 0 }}</span>
                <span class="stub-tag-label">Q's</span>
              </div>
              <UBadge
                v-if="form.required"
                label="Required"
                variant="soft"
                size="xs"
                class="font-bold"
                :ui="{ rounded: 'rounded-full' }"
                color="amber"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 justify-end pt-1 border-t border-dashed border-slate-200">
            <UButton
              label="Edit Questions"
              icon="i-heroicons-pencil-square"
              size="xs"
              variant="soft"
              class="rounded-full font-semibold mt-2"
              @click="$emit('edit', form.id)"
            />
            <UButton
              v-if="form.status === 'published' && !readOnly"
              label="Close"
              color="red"
              variant="ghost"
              size="xs"
              class="rounded-full font-semibold mt-2"
              @click="closeForm(form.id)"
            />
            <UButton
              v-if="form.status === 'draft' && !readOnly"
              label="Publish"
              size="xs"
              class="rounded-full font-bold mt-2 bg-[#16A34A] hover:bg-[#128038]"
              @click="publishForm(form.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Form Modal -->
    <UModal v-model="showCreateModal">
      <UCard :ui="{ rounded: 'rounded-2xl', ring: '' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold tracking-tight text-[#0B1120] text-lg">
              {{ editingFormId ? 'Edit Form Settings' : 'Create Custom Form' }}
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              size="xs"
              class="rounded-full"
              @click="closeCreateModal"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Landing Image Upload -->
          <div>
            <label class="block text-sm font-semibold text-[#0B1120] mb-1">Landing Image</label>
            <!-- Preview -->
            <div v-if="formImagePreview || (editingFormId && editingFormLandingImage)" class="relative mb-2">
              <img
                :src="formImagePreview || editingFormLandingImage || ''"
                alt="Landing image preview"
                class="w-full h-32 object-cover rounded-xl border border-slate-200"
              />
              <UButton
                icon="i-heroicons-x-mark"
                variant="ghost"
                size="xs"
                color="gray"
                class="absolute top-2 right-2 bg-white/80 hover:bg-white shadow rounded-full"
                title="Remove image"
                @click="clearFormImage"
              />
            </div>
            <!-- Drop zone -->
            <div
              class="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
              :class="isFormImageDragging
                ? 'border-[#2F6FED] bg-[#2F6FED]/5'
                : 'border-slate-300 bg-slate-50 hover:border-[#2F6FED]/60 hover:bg-[#2F6FED]/5'"
              style="min-height: 80px;"
              @dragover.prevent="isFormImageDragging = true"
              @dragleave.prevent="isFormImageDragging = false"
              @drop.prevent="onFormImageDrop"
              @click="formImageInputRef?.click()"
            >
              <UIcon
                :name="isFormImageDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'"
                class="w-6 h-6"
                :class="isFormImageDragging ? 'text-[#2F6FED]' : 'text-slate-400'"
              />
              <p class="text-xs font-semibold" :class="isFormImageDragging ? 'text-[#2F6FED]' : 'text-slate-500'">
                {{ isFormImageDragging ? 'Drop to upload' : 'Drag & drop or click to upload' }}
              </p>
              <p class="text-[10px] text-slate-400">JPG, PNG, WEBP — max 5 MB</p>
              <input
                ref="formImageInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFormImageFileChange"
              />
            </div>
          </div>

          <UFormGroup label="Form Title" required>
            <UInput
              v-model="formFields.title"
              placeholder="e.g. Workshop Session Feedback"
              :disabled="isSubmitting"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="formFields.description"
              placeholder="Provide context or instructions for attendees answering this form."
              :rows="4"
              :disabled="isSubmitting"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
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
          <div class="space-y-3 pt-2 border-t border-slate-200">
            <p class="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Scheduling</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormGroup label="Opens At">
                <UInput
                  v-model="formFields.opens_at"
                  type="datetime-local"
                  :disabled="isSubmitting"
                  :ui="{ rounded: 'rounded-lg' }"
                />
              </UFormGroup>
              <UFormGroup label="Deadline">
                <UInput
                  v-model="formFields.deadline"
                  type="datetime-local"
                  :disabled="isSubmitting"
                  :ui="{ rounded: 'rounded-lg' }"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Pre-opens Message" hint="Shown to attendees before the form opens">
              <UInput
                v-model="formFields.pre_opens_message"
                placeholder="e.g. This form will open on June 15th."
                :disabled="isSubmitting"
                :ui="{ rounded: 'rounded-lg' }"
              />
            </UFormGroup>

            <UFormGroup label="Deadline Message" hint="Shown to attendees after the deadline has passed">
              <UInput
                v-model="formFields.deadline_message"
                placeholder="e.g. Submissions are now closed."
                :disabled="isSubmitting"
                :ui="{ rounded: 'rounded-lg' }"
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
              class="rounded-full"
              @click="closeCreateModal"
            />
            <UButton
              :label="editingFormId ? 'Save Changes' : 'Create'"
              size="sm"
              :loading="isSubmitting"
              class="rounded-full font-bold bg-[#2F6FED] hover:bg-[#2559C7] px-5"
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
const editingFormLandingImage = ref<string | null>(null)
const isSubmitting = ref(false)

// ── Landing image upload state ─────────────────────────────────────────────────────
const formImageInputRef = ref<HTMLInputElement | null>(null)
const formImageFile = ref<File | null>(null)
const formImagePreview = ref<string | null>(null)
const isFormImageDragging = ref(false)

function setFormImageFile(file: File) {
  if (!file.type.startsWith('image/')) return
  formImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    formImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function onFormImageFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) setFormImageFile(file)
}

function onFormImageDrop(event: DragEvent) {
  isFormImageDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) setFormImageFile(file)
}

function clearFormImage() {
  formImageFile.value = null
  formImagePreview.value = null
  editingFormLandingImage.value = null
  if (formImageInputRef.value) formImageInputRef.value.value = ''
}

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
    const d = new Date(iso)
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

// Status → visual language (pill, dot, image placeholder pattern)
const statusMeta = (status: string) => {
  const map: Record<string, { pill: string; dot: string; placeholder: string }> = {
    draft: {
      pill: 'bg-white/90 text-slate-600',
      dot: 'bg-slate-400',
      placeholder: 'ticket-placeholder--draft',
    },
    published: {
      pill: 'bg-[#16A34A] text-white',
      dot: 'bg-white',
      placeholder: 'ticket-placeholder--published',
    },
    closed: {
      pill: 'bg-[#E11D48] text-white',
      dot: 'bg-white',
      placeholder: 'ticket-placeholder--closed',
    },
  }
  return map[status] ?? map.draft
}

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  return DateTime.fromISO(isoString).toLocaleString(DateTime.DATE_MED)
}

const openCreateModal = () => {
  editingFormId.value = null
  editingFormLandingImage.value = null
  formImageFile.value = null
  formImagePreview.value = null
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
  editingFormLandingImage.value = form.landing_image || null
  formImageFile.value = null
  formImagePreview.value = null
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
      event: props.eventUuid,
      title: formFields.title.trim(),
      description: formFields.description.trim() || null,
      required: formFields.required,
      allow_response_editing: formFields.allow_response_editing,
      deadline: fromDatetimeLocal(formFields.deadline),
      deadline_message: formFields.deadline_message.trim(),
      opens_at: fromDatetimeLocal(formFields.opens_at),
      pre_opens_message: formFields.pre_opens_message.trim(),
    }

    const clearImage = editingFormId.value ? editingFormLandingImage.value === null && !formImageFile.value : false
    const imagePayload = clearImage ? { landing_image: null as null } : {}

    if (editingFormId.value) {
      await updateFormMutation.mutateAsync({
        formId: editingFormId.value,
        body: { ...payload, ...imagePayload },
        landingImage: formImageFile.value ?? undefined,
      })
      toast.add({ title: 'Form Updated', description: 'Form settings saved successfully', color: 'green' })
    } else {
      const created = await createFormMutation.mutateAsync(payload)
      if (formImageFile.value && created?.data?.id) {
        await updateFormMutation.mutateAsync({
          formId: created.data.id,
          body: {},
          landingImage: formImageFile.value,
        })
      }
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
    confirmButtonColor: '#16A34A',
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
    confirmButtonColor: '#E11D48',
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
    confirmButtonColor: '#E11D48',
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

<style scoped>
/* Torn-ticket-stub divider: dashed rule with circular notches cut
   into the card, echoing a physical ticket stub tear-line. */
.ticket-perforation {
  position: relative;
  height: 1px;
  margin: 0 14px;
  border-top: 2px dashed theme('colors.slate.200');
}
.ticket-perforation::before,
.ticket-perforation::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: theme('colors.slate.50'); /* matches page background so it reads as a cutout */
  transform: translateY(-50%);
}
.ticket-perforation::before { left: -23px; }
.ticket-perforation::after { right: -23px; }

/* Small "stub" tag showing the question count, styled like a price/admit tag */
.stub-tag {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 2px 8px;
  border: 1px dashed theme('colors.slate.300');
  border-radius: 6px;
  background: theme('colors.slate.50');
}
.stub-tag-num {
  font-weight: 800;
  font-size: 0.8rem;
  color: theme('colors.slate.700');
}
.stub-tag-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: theme('colors.slate.400');
}

/* Placeholder art for forms without a landing image, diagonal ticket-stripe pattern */
.ticket-placeholder {
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.08) 0px,
    rgba(255, 255, 255, 0.08) 10px,
    transparent 10px,
    transparent 20px
  );
}
.ticket-placeholder--draft { background-color: #64748B; }
.ticket-placeholder--published { background-color: #2F6FED; }
.ticket-placeholder--closed { background-color: #E11D48; }

.ticket-card {
  overflow: visible; /* let the perforation notches sit outside the card edge */
}
</style>