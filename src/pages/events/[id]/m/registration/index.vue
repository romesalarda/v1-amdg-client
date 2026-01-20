<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Questions List -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold">Registration Questions</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure questions to ask during event registration
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Question"
                @click="openAddModal()"
              />
            </div>
          </template>

          <div v-if="questionsLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-20" />
          </div>

          <div v-else-if="questionsList.length" class="space-y-3">
            <div
              v-for="question in questionsList"
              :key="question.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold">{{ question.question_title }}</h3>
                    <UBadge
                      v-if="question.required"
                      label="Required"
                      color="red"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  
                  <p v-if="question.question_body" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ question.question_body }}
                  </p>
                  
                  <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <UIcon :name="getQuestionTypeIcon(question.question_type || 'short_answer')" />
                      {{ formatQuestionType(question.question_type || 'short_answer') }}
                    </span>
                    <span v-if="question.order">Order: {{ question.order }}</span>
                  </div>

                  <!-- Show options for multiple choice questions -->
                  <div
                    v-if="question.question_type && ['multiple_choice', 'single_choice'].includes(question.question_type) && question.options?.length"
                    class="mt-3 space-y-1"
                  >
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Options:</div>
                    <div class="flex flex-wrap gap-2">
                      <UBadge
                        v-for="option in question.options"
                        :key="option.id"
                        :label="option.option_text"
                        variant="subtle"
                        size="xs"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    variant="ghost"
                    size="sm"
                    @click="openEditModal(question)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                    @click="removeQuestion(question.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="text-gray-400 dark:text-gray-600 mb-4">
              <UIcon name="i-heroicons-clipboard-document-list" class="text-5xl" />
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-4">No registration questions yet</p>
            <UButton
              label="Add First Question"
              @click="openAddModal()"
            />
          </div>
        </UCard>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="space-y-6">
        <!-- Stats Card -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Form Overview</h3>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-bold">{{ questionsList.length }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Total Questions</div>
            </div>
            <div>
              <div class="text-2xl font-bold">
                {{ questionsList.filter((q: any) => q.required).length }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Required Questions</div>
            </div>
          </div>
        </UCard>

        <!-- Question Types Guide -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Question Types</h3>
          </template>
          <div class="space-y-3 text-sm">
            <div>
              <div class="font-medium">Short Answer</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Single line text input</div>
            </div>
            <div>
              <div class="font-medium">Long Answer</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Multi-line text area</div>
            </div>
            <div>
              <div class="font-medium">Multiple Choice</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Select multiple options</div>
            </div>
            <div>
              <div class="font-medium">Single Choice</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Select one option</div>
            </div>
            <div>
              <div class="font-medium">File Upload</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Upload documents/images</div>
            </div>
            <div>
              <div class="font-medium">Slider</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs">Numeric scale input</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Add/Edit Question Modal -->
    <UModal v-model="showQuestionModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingQuestion ? 'Edit Question' : 'Add Question' }}
          </h3>
        </template>

        <form @submit="onSubmitQuestion" class="space-y-4">
          <UFormGroup label="Question Title" name="question_title" required>
            <UInput
              v-model="questionForm.question_title"
              placeholder="Enter your question title"
            />
          </UFormGroup>

          <UFormGroup label="Question Body" name="question_body">
            <UTextarea
              v-model="questionForm.question_body"
              placeholder="Additional details or instructions..."
              :rows="2"
            />
          </UFormGroup>

          <UFormGroup label="Question Type" name="question_type" required>
            <USelectMenu
              v-model="questionForm.question_type"
              :options="questionTypes"
              placeholder="Select question type"
            />
          </UFormGroup>

          <UFormGroup label="Order" name="order">
            <UInput
              v-model="questionForm.order"
              type="number"
              placeholder="Question order (optional)"
            />
          </UFormGroup>

          <UFormGroup name="required">
            <UCheckbox
              v-model="questionForm.required"
              label="Required Question"
            />
          </UFormGroup>

          <!-- Options for multiple/single choice questions -->
          <div
            v-if="['multiple_choice', 'single_choice'].includes(questionForm.question_type)"
            class="space-y-2"
          >
            <label class="block text-sm font-medium">Options</label>
            <div class="space-y-2">
              <div
                v-for="(option, index) in questionForm.options"
                :key="index"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="questionForm.options[index]"
                  placeholder="Option text"
                  class="flex-1"
                />
                <UButton
                  icon="i-heroicons-x-mark"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="questionForm.options.splice(index, 1)"
                />
              </div>
            </div>
            <UButton
              icon="i-heroicons-plus"
              label="Add Option"
              variant="soft"
              size="sm"
              @click="questionForm.options.push('')"
            />
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="closeQuestionModal()"
            />
            <UButton
              :label="editingQuestion ? 'Update' : 'Create'"
              type="submit"
              :loading="questionMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import type { EventQuestion } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions, useCreateEventQuestion, useDeleteEventQuestion } from '~/composables/resources/events/eventQuestions'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Fetch questions
const eventIdFilter = { event__event_id: route.params.id as string }
const { data: questionsData, isLoading: questionsLoading, refetch: refetchQuestions } = useEventQuestions(eventIdFilter)
const questionsList = computed(() => questionsData.value?.data?.results || [])

// Question types
const questionTypes = [
  { label: 'Short Answer', value: 'short_answer' },
  { label: 'Long Answer', value: 'long_answer' },
  { label: 'Multiple Choice', value: 'multiple_choice' },
  { label: 'Single Choice', value: 'single_choice' },
  { label: 'File Upload', value: 'upload' },
  { label: 'Slider', value: 'slider' },
]

// Modal state
const showQuestionModal = ref(false)
const editingQuestion = ref<EventQuestion | null>(null)

// Question form
const questionForm = reactive({
  question_title: '',
  question_body: '',
  question_type: 'short_answer' as 'short_answer' | 'long_answer' | 'multiple_choice' | 'single_choice' | 'upload' | 'slider',
  order: '',
  required: false,
  options: [] as string[],
})

const questionMutation = useCreateEventQuestion()

const openAddModal = () => {
  editingQuestion.value = null
  questionForm.question_title = ''
  questionForm.question_body = ''
  questionForm.question_type = 'short_answer'
  questionForm.order = ''
  questionForm.required = false
  questionForm.options = []
  showQuestionModal.value = true
}

const openEditModal = (question: EventQuestion) => {
  editingQuestion.value = question
  questionForm.question_title = question.question_title
  questionForm.question_body = question.question_body
  questionForm.question_type = (question.question_type || 'short_answer') as typeof questionForm.question_type
  questionForm.order = question.order?.toString() || ''
  questionForm.required = question.required || false
  questionForm.options = question.options?.map((o: any) => o.option_text) || []
  showQuestionModal.value = true
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  editingQuestion.value = null
}

const onSubmitQuestion = async (e: Event) => {
  e.preventDefault()

  try {
    await questionMutation.mutateAsync({
      question_title: questionForm.question_title,
      question_body: questionForm.question_body,
      question_type: questionForm.question_type,
      event: Number(route.params.id),
      order: questionForm.order ? Number(questionForm.order) : undefined,
      required: questionForm.required,
      // Options will need to be created separately via API
    })

    toast.add({
      title: editingQuestion.value ? 'Question updated' : 'Question created',
      color: 'green',
    })

    closeQuestionModal()
    refetchQuestions()
  } catch (error) {
    toast.add({
      title: 'Failed to save question',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove question
const removeQuestionMutation = useDeleteEventQuestion()

const removeQuestion = async (questionId: number | string) => {
  if (!confirm('Remove this question? All responses will be lost.')) return

  try {
    await removeQuestionMutation.mutateAsync(typeof questionId === 'string' ? parseInt(questionId) : questionId)

    toast.add({
      title: 'Question removed',
      color: 'green',
    })

    refetchQuestions()
  } catch (error) {
    toast.add({
      title: 'Failed to remove question',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Helper functions
const getQuestionTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    short_answer: 'i-heroicons-pencil',
    long_answer: 'i-heroicons-document-text',
    multiple_choice: 'i-heroicons-check-circle',
    single_choice: 'i-heroicons-radio',
    upload: 'i-heroicons-arrow-up-tray',
    slider: 'i-heroicons-adjustments-horizontal',
  }
  return icons[type] || 'i-heroicons-question-mark-circle'
}

const formatQuestionType = (type: string) => {
  return questionTypes.find(t => t.value === type)?.label || type
}
</script>
