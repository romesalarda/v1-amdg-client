<template>
  <div class="space-y-6">
    <!-- Floating Action Bar -->
    <div
      v-if="(hasUnsavedChanges || isSaving) && !previewMode"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200"
    >
      <UIcon
        v-if="isSaving"
        name="i-heroicons-arrow-path"
        class="w-5 h-5 text-blue-600 animate-spin"
      />
      <span class="text-sm font-medium text-gray-700">
        {{ isSaving ? 'Saving...' : 'Unsaved changes' }}
      </span>
      <UButton
        v-if="hasUnsavedChanges && !isSaving"
        label="Save All"
        size="xs"
        @click="saveAll"
      />
    </div>

    <!-- Landing Image Banner -->
    <div
      class="relative w-full rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
      style="height: 200px;"
      :class="{ 'cursor-default': readOnly }"
      @click="!readOnly && landingImageInputRef?.click()"
    >
      <!-- Image or placeholder -->
      <img
        v-if="landingImagePreview || formData?.data?.landing_image"
        :src="landingImagePreview || formData?.data?.landing_image || ''"
        alt="Form landing image"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
      />

      <!-- Hover overlay (edit mode only) -->
      <div
        v-if="!readOnly"
        class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
      >
        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2 text-white">
          <UIcon
            v-if="isUploadingLandingImage"
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin"
          />
          <template v-else>
            <UIcon name="i-heroicons-camera" class="w-8 h-8" />
            <span class="text-sm font-semibold drop-shadow">
              {{ formData?.data?.landing_image || landingImagePreview ? 'Change landing image' : 'Upload landing image' }}
            </span>
            <span class="text-xs opacity-75">JPG, PNG, WEBP — max 5 MB</span>
          </template>
        </div>
      </div>

      <!-- Remove button (shown when image exists) -->
      <button
        v-if="!readOnly && (landingImagePreview || formData?.data?.landing_image)"
        type="button"
        class="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full shadow text-gray-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove landing image"
        @click.stop="removeLandingImage"
      >
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </button>

      <!-- Hidden file input -->
      <input
        ref="landingImageInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onLandingImageChange"
      />
    </div>

    <!-- Page Header / Form Header Card -->
    <UCard class="border-t-4 border-t-blue-500 mb-6">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-3">
            <UButton
              icon="i-heroicons-arrow-left"
              variant="ghost"
              color="gray"
              size="sm"
              @click="$emit('back')"
            />
            <h1 class="text-2xl font-bold text-gray-900 truncate">
              {{ formData?.data?.title || 'Loading Form...' }}
            </h1>
            <UBadge
              v-if="previewMode"
              label="Preview Mode"
              color="blue"
              variant="soft"
            />

            <!-- View tab switcher -->
            <div class="flex bg-gray-100 rounded-lg p-0.5 ml-1">
              <button
                v-for="tab in [{ value: 'questions', label: 'Questions', icon: 'i-heroicons-document-text' }, { value: 'responses', label: 'Responses', icon: 'i-heroicons-users' }]"
                :key="tab.value"
                type="button"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                  activeTab === tab.value ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
                @click="activeTab = tab.value as EditorTab"
              >
                <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
                {{ tab.label }}
              </button>
            </div>
            
            <!-- WS Connection Status Indicator -->
            <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50">
              <div 
                class="w-2 h-2 rounded-full transition-colors"
                :class="{
                  'bg-green-500': ws.isConnected.value,
                  'bg-yellow-500 animate-pulse': ws.isConnecting.value,
                  'bg-gray-400': ws.isDisconnected.value
                }"
              />
              <span class="text-xs text-gray-600 font-medium">
                {{ 
                  ws.isConnected.value ? 'Live' : 
                  ws.isConnecting.value ? 'Connecting...' : 
                  'Offline' 
                }}
              </span>
            </div>
          </div>
          <p class="text-gray-600">
            {{
              previewMode
                ? 'This is how attendees will see this form'
                : formData?.data?.description || 'Configure questions to collect information from attendees'
            }}
          </p>
        </div>

        <!-- Toolbar controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Undo/Redo -->
          <UTooltip text="Undo (Ctrl+Z)">
            <UButton
              icon="i-heroicons-arrow-uturn-left"
              variant="ghost"
              size="sm"
              :disabled="!canUndo"
              @click="undo"
            />
          </UTooltip>
          <UTooltip text="Redo (Ctrl+Y)">
            <UButton
              icon="i-heroicons-arrow-uturn-right"
              variant="ghost"
              size="sm"
              :disabled="!canRedo"
              @click="redo"
            />
          </UTooltip>
          
          <div class="w-px h-6 bg-gray-300 mx-1" />
          
          <!-- View controls -->
          <UTooltip :text="previewMode ? 'Exit Preview' : 'Preview Form'">
            <UButton
              :icon="previewMode ? 'i-heroicons-pencil-square' : 'i-heroicons-eye'"
              :variant="previewMode ? 'solid' : 'ghost'"
              :disabled="readOnly"
              size="sm"
              @click="togglePreviewMode"
            />
          </UTooltip>
          
          <UTooltip text="Validate Questions">
            <UButton
              icon="i-heroicons-check-circle"
              variant="ghost"
              size="sm"
              color="green"
              @click="validateAll"
              :disabled="readOnly"
            />
          </UTooltip>
          
          <UTooltip text="Collapse All">
            <UButton
              icon="i-heroicons-chevron-up-down"
              variant="ghost"
              size="sm"
              @click="collapseAll"
              :disabled="readOnly"
            />
          </UTooltip>
          
          <div class="w-px h-6 bg-gray-300 mx-1" />
          
          <!-- Save All button -->
          <UButton
            label="Save All"
            icon="i-heroicons-cloud-arrow-up"
            size="sm"
            :loading="isSaving"
            :disabled="!hasUnsavedChanges"
            @click="saveAll"
          />
        </div>
      </div>
    </UCard>

    <!-- Content Split -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main area (3/4) -->
      <div class="lg:col-span-3 space-y-4">

        <!-- ── Responses tab ──────────────────────────────────────────────── -->
        <template v-if="activeTab === 'responses'">
          <FormResponsesTable
            :responses="responsesTable.responses.value"
            :total-count="responsesTable.totalCount.value"
            :total-pages="responsesTable.totalPages.value"
            :filters="responsesTable.filters.value"
            :active-filter-count="responsesTable.activeFilterCount.value"
            :advanced-active-count="responsesTable.advancedActiveCount.value"
            :is-advanced-filtering="responsesTable.filterMutation.isPending.value"
            :is-filter-sidebar-open="responsesTable.isFilterSidebarOpen.value"
            :responses-query="responsesTable.responsesQuery"
            @open-response="handleOpenResponse"
            @apply-filters="responsesTable.applyFilters"
            @clear-filters="responsesTable.clearFilters"
            @set-page="responsesTable.setPage"
            @update:is-filter-sidebar-open="v => responsesTable.isFilterSidebarOpen.value = v"
            @open-advanced-filter="isAdvancedFilterOpen = true"
          />

          <FormResponseDetailModal
            v-model="isResponseDetailOpen"
            :response="responsesTable.selectedResponse.value"
            :answers="responsesTable.selectedResponse.value ? responsesTable.getAnswers(responsesTable.selectedResponse.value.id) : []"
            :form-questions="(responsesTable.formDetail.value?.questions ?? []) as any[]"
            :is-loading-answers="responsesTable.selectedResponse.value ? responsesTable.isLoadingAnswers(responsesTable.selectedResponse.value.id) : false"
            @close="handleCloseResponseDetail"
          />

          <FormResponsesFilterSlideover
            v-model="isAdvancedFilterOpen"
            :filters="responsesTable.advancedFilters.value"
            :form-id="props.formId"
            @apply="responsesTable.applyAdvancedFilters"
            @clear="responsesTable.clearAdvancedFilters"
          />
        </template>

        <!-- ── Questions tab ─────────────────────────────────────────────── -->
        <template v-else>
        <div v-if="isFormLoading" class="space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="h-40 rounded-xl" />
        </div>

        <div v-else class="space-y-6">
          <div class="relative">
            <!-- Drag overlay -->
            <div 
              v-if="isReordering" 
              class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
            >
              <div class="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-200">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
                <span class="text-lg font-medium text-gray-900">Saving question order...</span>
              </div>
            </div>

            <!-- Draggable Question List -->
            <draggable
              v-model="questions"
              item-key="id"
              handle=".drag-handle"
              :animation="200"
              ghost-class="opacity-50"
              :disabled="isReordering || previewMode || readOnly"
              @end="onDragEnd"
            >
              <template #item="{ element: question, index }">
                <QuestionCard
                  :key="question.id || question.tempId"
                  :question="question"
                  :index="index"
                  :selected="selectedQuestion?.id === question.id || selectedQuestion?.tempId === question.tempId"
                  :read-only="readOnly"
                  :preview-mode="previewMode"
                  :is-loading="!!questionLoadingStates.get(question.id || question.tempId || '')"
                  :validation-errors="questionValidationErrors"
                  @select="handleQuestionSelect"
                  @update="updateQuestion"
                  @duplicate="duplicateQuestion"
                  @delete="confirmDelete"
                  @toggle-expand="toggleExpanded"
                  @focus="markEditing"
                  @blur="unmarkEditing"
                />
              </template>
            </draggable>
          </div>

          <!-- Empty State -->
          <UCard v-if="questions.length === 0" class="text-center py-16">
            <div class="space-y-4">
              <div class="flex justify-center">
                <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p class="text-sm text-gray-600 mb-6">Build your form questionnaire by adding questions manually or using templates.</p>
              </div>
              <div class="flex items-center justify-center gap-3">
                <UButton
                  label="Add Question"
                  icon="i-heroicons-plus"
                  size="lg"
                  @click="addQuestionWithLoading()"
                />
                <UDropdown
                  :items="templateMenuItems"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    label="Use Template"
                    icon="i-heroicons-sparkles"
                    variant="outline"
                    size="lg"
                  />
                </UDropdown>
              </div>
            </div>
          </UCard>

          <!-- Action buttons below questions -->
          <div v-else-if="!readOnly" class="flex items-center gap-3 flex-wrap">
            <UButton
              class="flex-1 min-w-[200px]"
              icon="i-heroicons-plus"
              label="Add Question"
              variant="outline"
              size="lg"
              @click="addQuestionWithLoading()"
            />
            
            <UDropdown
              :items="templateMenuItems"
              :popper="{ placement: 'bottom-start' }"
            >
              <UButton
                icon="i-heroicons-sparkles"
                label="Template"
                variant="outline"
                size="lg"
              />
            </UDropdown>
          </div>
        </div>
        </template><!-- end questions tab -->
      </div>

      <!-- Sidebar widgets (1/4) -->
      <div class="space-y-4">
        <!-- Overview Widget -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Form Details</h3>
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-3xl font-bold text-gray-900">{{ questions.length }}</div>
              <div class="text-sm text-gray-600">Total Questions</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-blue-600">
                {{ questions.filter(q => q.required).length }}
              </div>
              <div class="text-sm text-gray-600">Required Questions</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-emerald-600">
                {{ responsesTable.totalCount.value }}
              </div>
              <div class="text-sm text-gray-600">Total Responses</div>
            </div>
            <div class="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span class="text-gray-600">Required form</span>
              <UBadge
                :label="formData?.data?.required ? 'Required' : 'Optional'"
                :color="formData?.data?.required ? 'red' : 'gray'"
                variant="soft"
                size="xs"
              />
            </div>
            <UButton
              label="View Responses"
              icon="i-heroicons-users"
              size="xs"
              variant="soft"
              color="green"
              block
              @click="activeTab = 'responses'"
            />
          </div>
        </UCard>

        <!-- Jump to Question List Widget -->
        <UCard v-if="questions.length > 3">
          <template #header>
            <h3 class="font-semibold text-gray-900">Jump to Question</h3>
          </template>
          <div class="space-y-1 max-h-64 overflow-y-auto">
            <button
              v-for="(question, idx) in questions"
              :key="question.id || question.tempId"
              class="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm group"
              :class="{
                'bg-blue-50 text-blue-700': selectedQuestion?.id === question.id || selectedQuestion?.tempId === question.tempId
              }"
              @click="scrollToQuestion(question)"
            >
              <div class="flex items-start gap-2">
                <span class="text-gray-500 font-medium flex-shrink-0">{{ idx + 1 }}.</span>
                <span class="flex-1 truncate">{{ question.question_title || 'Untitled' }}</span>
                <span v-if="question.required" class="text-red-500 font-bold">*</span>
              </div>
            </button>
          </div>
        </UCard>

        <!-- Keyboard Shortcuts Widget -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, nextTick, onMounted } from 'vue'
import draggable from 'vuedraggable'
import Swal from 'sweetalert2'
import QuestionCard from './QuestionCard.vue'
import FormResponsesTable from './FormResponsesTable.vue'
import FormResponseDetailModal from './FormResponseDetailModal.vue'
import FormResponsesFilterSlideover from './FormResponsesFilterSlideover.vue'
import { useEventForm, useUpdateEventForm } from '~/composables/resources/events/eventForms'
import { useEventFormBuilder } from '~/composables/websockets/events/useEventFormBuilder'
import { useEventFormsWebSocket } from '~/composables/websockets/events/useEventFormsWebSocket'
import { useFormResponsesTable } from '~/composables/resources/events/useFormResponsesTable'

const props = defineProps<{
  formId: string
  eventIntId: number
  eventUuid: string
  eventUrlSafeTitle: string
  readOnly: boolean
}>()

defineEmits<{
  (e: 'back'): void
}>()

const toast = useToast()

const focusedFields = ref(new Set<string>())
const isReordering = ref(false)
let reorderTimeout: ReturnType<typeof setTimeout> | null = null

// ── View tab ──────────────────────────────────────────────────────────────────
type EditorTab = 'questions' | 'responses'
const activeTab = ref<EditorTab>('questions')

// ── Responses table ───────────────────────────────────────────────────────────
const responsesTable = useFormResponsesTable(toRef(props, 'formId'))
const isResponseDetailOpen = ref(false)
const isAdvancedFilterOpen = ref(false)

function handleOpenResponse(response: Parameters<typeof responsesTable.openResponse>[0]) {
  responsesTable.openResponse(response)
  isResponseDetailOpen.value = true
}

function handleCloseResponseDetail() {
  isResponseDetailOpen.value = false
  responsesTable.closeResponse()
}

// Fetch details for the form
const { data: formData, isLoading: isFormLoading, refetch } = useEventForm(toRef(props, 'formId'))

// ── Landing image ─────────────────────────────────────────────────────────────
const landingImageInputRef = ref<HTMLInputElement | null>(null)
const landingImagePreview = ref<string | null>(null)
const isUploadingLandingImage = ref(false)
const updateFormMutation = useUpdateEventForm()

function onLandingImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  // Show local preview immediately
  const reader = new FileReader()
  reader.onload = (e) => {
    landingImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  // Upload right away
  uploadLandingImage(file)
  // Reset the input so the same file can be selected again
  if (landingImageInputRef.value) landingImageInputRef.value.value = ''
}

async function uploadLandingImage(file: File) {
  isUploadingLandingImage.value = true
  try {
    await updateFormMutation.mutateAsync({
      formId: props.formId,
      body: {},
      landingImage: file,
    })
    toast.add({ title: 'Landing image saved', color: 'green', timeout: 2000 })
  } catch {
    toast.add({ title: 'Upload failed', description: 'Could not save landing image', color: 'red', timeout: 3000 })
    landingImagePreview.value = null
  } finally {
    isUploadingLandingImage.value = false
  }
}

async function removeLandingImage() {
  landingImagePreview.value = null
  isUploadingLandingImage.value = true
  try {
    await updateFormMutation.mutateAsync({
      formId: props.formId,
      body: { landing_image: null },
    })
    toast.add({ title: 'Landing image removed', color: 'green', timeout: 2000 })
  } catch {
    toast.add({ title: 'Remove failed', description: 'Could not remove landing image', color: 'red', timeout: 3000 })
  } finally {
    isUploadingLandingImage.value = false
  }
}

// WebSocket
const ws = useEventFormsWebSocket(toRef(props, 'eventUrlSafeTitle'))

// Form builder composable
const {
  questions,
  selectedQuestion,
  previewMode,
  isSaving,
  hasUnsavedChanges,
  questionTemplates,
  questionLoadingStates,
  questionValidationErrors,
  canUndo,
  canRedo,
  validateQuestion,
  validateAllQuestions,
  getQuestionFieldErrors,
  getFieldError,
  undo,
  redo,
  addQuestion,
  duplicateQuestion,
  deleteQuestion,
  updateQuestion,
  toggleExpanded,
  collapseAll,
  expandAll,
  saveAll,
  saveQuestionsOrder,
} = useEventFormBuilder(toRef(props, 'formId'), toRef(props, 'eventIntId'), focusedFields)

// Monitor external changes via WebSocket
onMounted(() => {
  ws.onFormMutation((data) => {
    if (data.type.startsWith('question.') && data.payload?.form_id === props.formId) {
      console.log('[FormEditor] Refreshing form contents due to WebSocket broadcast:', data)
      refetch()
    }
  })
})

// Initialize local questions when data is fetched
watch(formData, (newData) => {
  if (newData?.data?.questions && questions.value.length === 0) {
    questions.value = newData.data.questions.map((q: any) => ({
      ...q,
      isExpanded: false,
      isEditing: false,
      isNew: false,
    }))
  }
}, { immediate: true })

const templateMenuItems = computed(() => {
  const items: any[][] = [
    [
      {
        label: 'Common Templates',
        slot: 'header',
      },
    ],
  ]
  const list = questionTemplates.map(t => ({
    label: t.name,
    icon: 'i-heroicons-sparkles',
    click: () => addQuestionWithLoading(t),
  }))
  if (list.length > 0) items.push(list)
  return items
})

const addQuestionWithLoading = async (template?: any) => {
  if (isReordering.value) return
  isReordering.value = true
  const start = Date.now()
  try {
    addQuestion(template)
  } finally {
    const elapsed = Date.now() - start
    setTimeout(() => { isReordering.value = false }, Math.max(0, 1000 - elapsed))
  }
}

const deleteQuestionWithLoading = async (q: any) => {
  if (isReordering.value) return
  isReordering.value = true
  const start = Date.now()
  try {
    await deleteQuestion(q)
  } finally {
    const elapsed = Date.now() - start
    setTimeout(() => { isReordering.value = false }, Math.max(0, 1000 - elapsed))
  }
}

const confirmDelete = async (q: any) => {
  const result = await Swal.fire({
    title: 'Delete Question?',
    text: q.question_title || 'This question',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  })
  if (result.isConfirmed) {
    await deleteQuestionWithLoading(q)
  }
}

const onDragEnd = async () => {
  if (isReordering.value) return
  isReordering.value = true
  
  if (reorderTimeout) clearTimeout(reorderTimeout)

  questions.value.forEach((q, index) => {
    q.order = index
  })

  const start = Date.now()
  try {
    await saveQuestionsOrder()
  } finally {
    const elapsed = Date.now() - start
    reorderTimeout = setTimeout(() => {
      isReordering.value = false
    }, Math.max(0, 1000 - elapsed))
  }
}

const togglePreviewMode = async () => {
  if (!previewMode.value && hasUnsavedChanges.value) {
    const result = await Swal.fire({
      title: 'Unsaved Changes',
      text: 'You have unsaved changes. Do you want to save before previewing?',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#3b82f6',
      denyButtonColor: '#6b7280',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Save & Preview',
      denyButtonText: 'Preview Without Saving',
      cancelButtonText: 'Cancel'
    })
    
    if (result.isConfirmed) {
      await saveAll()
      previewMode.value = true
      expandAll()
    } else if (result.isDenied) {
      previewMode.value = true
      expandAll()
    }
  } else {
    previewMode.value = !previewMode.value
    if (previewMode.value) expandAll()
  }
}

const handleQuestionSelect = (q: any) => {
  selectedQuestion.value = q
}

const markEditing = (qId: string) => {
  focusedFields.value.add(`${qId}`)
}

const unmarkEditing = (qId: string) => {
  focusedFields.value.delete(`${qId}`)
}

const scrollToQuestion = (q: any) => {
  selectedQuestion.value = q
  q.isExpanded = true
  nextTick(() => {
    const el = document.querySelector(`[data-question-id="${q.id || q.tempId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const validateAll = () => {
  const res = validateAllQuestions()
  if (res.success) {
    toast.add({ title: 'Validation Passed', description: 'All questions are valid!', color: 'green', timeout: 3000 })
  } else {
    Swal.fire({
      title: 'Validation Errors',
      html: `<div class="text-left space-y-2">
        ${res.errors?.map(err => `<p class="text-sm text-red-600">• ${err}</p>`).join('') || 'Unknown validation errors'}
      </div>`,
      icon: 'error',
      confirmButtonText: 'Fix Issues',
      confirmButtonColor: '#ef4444',
    })
  }
}
</script>
