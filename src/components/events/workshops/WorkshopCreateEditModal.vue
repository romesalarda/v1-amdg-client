<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-6 py-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">{{ isEdit ? 'edit' : 'add_circle' }}</span>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest flex-1">
              {{ isEdit ? 'Edit Workshop' : 'Create Workshop' }}
            </h2>
            <button @click="close" class="text-navy-400 hover:text-navy-700 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Loading skeleton (when fetching detail for edit) -->
          <div v-if="isLoadingDetail" class="p-6 space-y-4">
            <div v-for="i in 6" :key="i" class="h-10 bg-mist-blue/50 rounded-xl animate-pulse" />
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

            <!-- ─── Landing image upload ─────────────────────────────── -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Landing Image</label>
              <!-- Preview -->
              <div v-if="imagePreview || existingImageUrl" class="relative mb-2">
                <img
                  :src="imagePreview || existingImageUrl || ''"
                  alt="Landing image preview"
                  class="w-full h-36 object-cover rounded-xl border border-deep-navy/10"
                />
                <button
                  type="button"
                  @click="clearImage"
                  class="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full shadow text-navy-600 hover:text-red-600 transition-colors"
                  title="Remove image"
                >
                  <span class="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <!-- Drop zone -->
              <div
                class="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
                :class="isDraggingImage
                  ? 'border-primary bg-primary/10'
                  : 'border-deep-navy/15 bg-mist-blue/30 hover:border-primary/50 hover:bg-primary/5'"
                style="min-height: 90px;"
                @dragover.prevent="isDraggingImage = true"
                @dragleave.prevent="isDraggingImage = false"
                @drop.prevent="onImageDrop"
                @click="imageInputRef?.click()"
              >
                <span class="material-symbols-outlined text-2xl" :class="isDraggingImage ? 'text-primary' : 'text-navy-300'">
                  {{ isDraggingImage ? 'file_download' : 'add_photo_alternate' }}
                </span>
                <p class="text-xs font-semibold" :class="isDraggingImage ? 'text-primary' : 'text-navy-400'">
                  {{ isDraggingImage ? 'Drop to upload' : 'Drag & drop or click to upload' }}
                </p>
                <p class="text-[10px] text-navy-300">JPG, PNG, WEBP — max 5 MB</p>
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onImageFileChange"
                />
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Title *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Workshop title"
                class="field"
                :class="{ 'border-red-400': errors.title }"
              />
              <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Description *</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe the workshop…"
                class="field resize-none"
                :class="{ 'border-red-400': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
            </div>

            <!-- What to expect -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">What to Expect</label>
              <textarea
                v-model="form.what_to_expect"
                rows="2"
                placeholder="What attendees can expect from this workshop…"
                class="field resize-none"
              />
            </div>

            <!-- What to bring -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">What to Bring</label>
              <textarea
                v-model="form.what_to_bring"
                rows="2"
                placeholder="What attendees should bring…"
                class="field resize-none"
              />
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Date & Time *</label>
              <input
                v-model="form.date"
                type="datetime-local"
                class="field"
                :class="{ 'border-red-400': errors.date }"
              />
              <p v-if="errors.date" class="text-xs text-red-500 mt-1">{{ errors.date }}</p>
            </div>

            <!-- Capacity + Duration row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Capacity</label>
                <input
                  v-model.number="form.capacity"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  class="field"
                  :class="{ 'border-red-400': errors.capacity }"
                />
                <p v-if="errors.capacity" class="text-xs text-red-500 mt-1">{{ errors.capacity }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Duration (min)</label>
                <input
                  v-model.number="form.duration_minutes"
                  type="number"
                  min="1"
                  placeholder="e.g. 60"
                  class="field"
                  :class="{ 'border-red-400': errors.duration_minutes }"
                />
                <p v-if="errors.duration_minutes" class="text-xs text-red-500 mt-1">{{ errors.duration_minutes }}</p>
              </div>
            </div>

            <!-- Allocation mode + Status row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Allocation Mode</label>
                <select v-model="form.allocation_mode" class="field">
                  <option value="FCFS">First Come First Served</option>
                  <option value="INTEREST_RANKING">Interest Ranking</option>
                  <option value="RANDOM">Random</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Status</label>
                <select v-model="form.status" class="field">
                  <option value="DRAFT">Draft</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Optional internal notes…"
                class="field resize-none"
              />
            </div>

            <!-- Registration window -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Reg. Opens At</label>
                <input v-model="form.registration_opens_at" type="datetime-local" class="field" />
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Reg. Closes At</label>
                <input v-model="form.registration_closes_at" type="datetime-local" class="field" />
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-50 bg-mist-blue/30">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-xs font-bold text-navy-600 hover:text-navy-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              @click="handleSubmit"
              :disabled="isSubmitting || isLoadingDetail"
              class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-sm animate-spin">refresh</span>
              {{ isEdit ? 'Save Changes' : 'Create Workshop' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWorkshopForm } from '~/composables/workshops/useWorkshopForm'
import { useWorkshop } from '~/composables/resources/workshops'
import type { WorkshopList } from '~/api/types.gen'
import type { WorkshopFormData } from '~/schemas/workshops/workshop.schema'
import { defaultWorkshopForm } from '~/schemas/workshops/workshop.schema'

const props = defineProps<{
  modelValue: boolean
  eventId: string
  editWorkshop?: WorkshopList | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

const isEdit = computed(() => !!props.editWorkshop)

// ─── Fetch detail when editing ─────────────────────────────────────────────────
const editId = computed(() => (props.editWorkshop?.id ?? 0))
const { data: detailData, isLoading: isLoadingDetail } = useWorkshop(
  computed(() => editId.value),
)
// Only treat as loading when we're actually editing
const isLoadingDetail$ = computed(() => isEdit.value && isLoadingDetail.value)

// ─── Image upload state ────────────────────────────────────────────────────────
const imageInputRef = ref<HTMLInputElement | null>(null)
const landingImageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const existingImageUrl = ref<string | null>(null)
const isDraggingImage = ref(false)

function setImageFile(file: File) {
  if (!file.type.startsWith('image/')) return
  landingImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function onImageDrop(event: DragEvent) {
  isDraggingImage.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) setImageFile(file)
}

function onImageFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) setImageFile(file)
}

function clearImage() {
  landingImageFile.value = null
  imagePreview.value = null
  existingImageUrl.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

// ─── Form composable ───────────────────────────────────────────────────────────
const { errors, isSubmitting, loadForEdit, submitCreate, submitUpdate, resetForm, setValues } =
  useWorkshopForm(() => {
    emit('saved')
    close()
  })

// Local reactive mirror of form values
const form = ref<WorkshopFormData>({ ...defaultWorkshopForm(), event: props.eventId })

watch(
  form,
  (val) => setValues({ ...val }),
  { deep: true },
)

// Pre-fill from fetched detail when editing
watch(
  detailData,
  (data) => {
    if (!isEdit.value || !data?.data) return
    const d = data.data as any
    existingImageUrl.value = d.landing_image || null
    const patch: Partial<WorkshopFormData> = {
      title: d.title,
      event: d.event,
      date: d.date ? d.date.slice(0, 16) : '',
      description: d.description ?? '',
      notes: d.notes ?? null,
      what_to_expect: d.what_to_expect ?? null,
      what_to_bring: d.what_to_bring ?? null,
      status: d.status,
      allocation_mode: d.allocation_mode,
      capacity: d.capacity ?? null,
      duration_minutes: d.duration_minutes ?? null,
      registration_opens_at: d.registration_opens_at ? d.registration_opens_at.slice(0, 16) : null,
      registration_closes_at: d.registration_closes_at ? d.registration_closes_at.slice(0, 16) : null,
    }
    form.value = { ...defaultWorkshopForm(), event: props.eventId, ...patch }
    loadForEdit(form.value)
  },
  { immediate: true },
)

// Reset when switching between create/edit or opening
watch(
  () => [props.modelValue, props.editWorkshop] as const,
  ([open, workshop]) => {
    if (!open) return
    if (!workshop) {
      // Create mode
      landingImageFile.value = null
      imagePreview.value = null
      existingImageUrl.value = null
      form.value = { ...defaultWorkshopForm(), event: props.eventId }
      resetForm()
    }
    // Edit mode: detail fetch watcher handles pre-fill
  },
)

async function handleSubmit() {
  if (isEdit.value && props.editWorkshop) {
    await submitUpdate(props.editWorkshop.id, landingImageFile.value)
  } else {
    await submitCreate(landingImageFile.value)
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2 bg-mist-blue/40 border border-deep-navy/10 focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 placeholder:text-navy-400 transition-all outline-none;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
