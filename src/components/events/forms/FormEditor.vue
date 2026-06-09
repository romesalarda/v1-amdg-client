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
      <!-- Main questions area (3/4) -->
      <div class="lg:col-span-3 space-y-4">
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
            <div class="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span class="text-gray-600">Required form</span>
              <UBadge
                :label="formData?.data?.required ? 'Required' : 'Optional'"
                :color="formData?.data?.required ? 'red' : 'gray'"
                variant="soft"
                size="xs"
              />
            </div>
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
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <UIcon
                name="i-heroicons-command-line"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </template>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Undo</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+Z</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Redo</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+Y</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Save All</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+S</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Duplicate</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+D</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Delete</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Del</kbd>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, nextTick, onMounted } from 'vue'
import draggable from 'vuedraggable'
import Swal from 'sweetalert2'
import QuestionCard from './QuestionCard.vue'
import { useEventForm } from '~/composables/resources/events/eventForms'
import { useEventFormBuilder } from '~/composables/websockets/events/useEventFormBuilder'
import { useEventFormsWebSocket } from '~/composables/websockets/events/useEventFormsWebSocket'

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

// Fetch details for the form
const { data: formData, isLoading: isFormLoading, refetch } = useEventForm(toRef(props, 'formId'))

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
