<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">Question Answers</h3>
        <p class="text-xs text-gray-500 mt-1">
          {{ answeredCount }} of {{ totalQuestionsCount }} questions answered
          <span v-if="unansweredRequiredCount > 0" class="text-red-600 font-semibold">
            ({{ unansweredRequiredCount }} required unanswered)
          </span>
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8 text-gray-500 text-sm">
      <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin mx-auto mb-2" />
      Loading questions...
    </div>

    <!-- No Questions -->
    <div v-else-if="!eventQuestions.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
      No questions defined for this event
    </div>

    <!-- Questions List -->
    <div v-else class="space-y-4">
      <div
        v-for="question in sortedQuestions"
        :key="question.id"
        class="bg-white border rounded-xl p-4"
        :class="{
          'border-gray-200': !question.required || hasAnswer(question.id),
          'border-red-300 bg-red-50/30': question.required && !hasAnswer(question.id)
        }"
      >
        <!-- Question Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-sm font-bold text-gray-900">{{ question.question_title }}</h4>
              <UBadge v-if="question.required" color="red" variant="soft" size="xs">Required</UBadge>
              <UBadge color="gray" variant="soft" size="xs">{{ formatQuestionType(question.question_type || '') }}</UBadge>
            </div>
            <p v-if="question.question_body" class="text-xs text-gray-600 mb-2">
              {{ question.question_body }}
            </p>
          </div>
        </div>

        <!-- Answer Display/Edit -->
        <div class="mt-3 pt-3 border-t border-gray-100">
          <!-- Draft Mode: Always-editable, Google Forms style -->
          <div v-if="isDraftMode" class="space-y-3">
            <div v-if="question.question_type === 'short_answer'">
              <input
                :value="draftAnswerText(question.id)"
                type="text"
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                @input="setDraftAnswerText(question.id, ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div v-else-if="question.question_type === 'long_answer'">
              <textarea
                :value="draftAnswerText(question.id)"
                rows="4"
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                @input="setDraftAnswerText(question.id, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </div>

            <div v-else-if="question.question_type === 'slider'" class="space-y-2">
              <input
                :value="draftAnswerNumber(question.id, Number(question.min_value || 0))"
                type="range"
                :min="question.min_value || 0"
                :max="question.max_value || 100"
                class="w-full"
                @input="setDraftAnswerText(question.id, String(Number(($event.target as HTMLInputElement).value)))"
              />
              <div class="flex justify-between text-xs text-gray-600">
                <span>{{ question.min_value || 0 }}</span>
                <span class="font-semibold text-primary">{{ draftAnswerNumber(question.id, Number(question.min_value || 0)) }}</span>
                <span>{{ question.max_value || 100 }}</span>
              </div>
            </div>

            <div v-else-if="question.question_type === 'single_choice'" class="space-y-2">
              <label
                v-for="option in question.options"
                :key="option.id"
                class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-primary/5 border-primary': draftSelectedIds(question.id).includes(option.id) }"
              >
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  :value="option.id"
                  :checked="draftSelectedIds(question.id).includes(option.id)"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                  @change="setDraftSingleChoice(question.id, option.id)"
                />
                <span class="text-sm text-gray-900">{{ option.option_text }}</span>
              </label>
            </div>

            <div v-else-if="question.question_type === 'multiple_choice'" class="space-y-2">
              <label
                v-for="option in question.options"
                :key="option.id"
                class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-primary/5 border-primary': draftSelectedIds(question.id).includes(option.id) }"
              >
                <input
                  type="checkbox"
                  :value="option.id"
                  :checked="draftSelectedIds(question.id).includes(option.id)"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  @change="toggleDraftMultipleChoice(question.id, option.id, ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-sm text-gray-900">{{ option.option_text }}</span>
              </label>
            </div>

            <div v-else-if="question.question_type === 'upload'" class="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
              <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p class="text-xs text-gray-500">Upload a file or provide a link</p>
              <input
                type="file"
                class="mt-3 w-full text-xs"
                @change="handleUploadFile(question.id, $event)"
                :disabled="uploadAnswerMutation.isPending.value"
              />
              <p v-if="Boolean(getDraftAnswer(question.id)?.uploadResourceId)" class="mt-2 text-xs text-emerald-600">
                File uploaded and ready to submit.
              </p>
              <input
                :value="getDraftAnswer(question.id)?.uploadUrl || ''"
                type="text"
                placeholder="Or paste a file URL"
                class="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                @input="setDraftUploadUrl(question.id, ($event.target as HTMLInputElement).value)"
              />
            </div>

            <p v-if="question.required && !hasAnswer(question.id)" class="text-xs text-red-600">
              This question is required.
            </p>
          </div>

          <!-- Non-draft mode: existing edit workflow -->
          <div v-else-if="!hasAnswer(question.id) && !isEditing(question.id)" class="flex items-center justify-between">
            <p class="text-xs text-gray-500 italic">No answer provided</p>
            <UButton
              @click="startEditing(question)"
              size="xs"
              color="primary"
              variant="soft"
              icon="i-heroicons-pencil-square"
            >
              Add Answer
            </UButton>
          </div>

          <div v-else-if="!isEditing(question.id)" class="space-y-2">
            <div v-if="isTextQuestion(question.question_type || '')" class="bg-gray-50 rounded-lg p-3">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ getAnswer(question.id)?.answer_text }}</p>
            </div>

            <div v-else-if="question.question_type === 'slider'" class="bg-gray-50 rounded-lg p-3">
              <p class="text-sm text-gray-900">
                <span class="font-semibold">{{ getAnswer(question.id)?.answer_text }}</span>
                <span class="text-gray-500 text-xs ml-2">(Range: {{ question.min_value }} - {{ question.max_value }})</span>
              </p>
            </div>

            <div v-else-if="isChoiceQuestion(question.question_type || '')" class="bg-gray-50 rounded-lg p-3">
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="option in getSelectedOptions(question.id)"
                  :key="option.id"
                  color="primary"
                  variant="soft"
                >
                  {{ option.option_text }}
                </UBadge>
              </div>
            </div>

            <div class="flex gap-2 mt-2">
              <UButton
                @click="startEditing(question)"
                size="xs"
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil"
              >
                Edit
              </UButton>
              <UButton
                @click="handleDeleteAnswer(question.id)"
                size="xs"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
              >
                Delete
              </UButton>
            </div>
          </div>

          <div v-else class="space-y-3">
            <!-- Short Answer -->
            <div v-if="question.question_type === 'short_answer'">
              <input
                v-model="answerText"
                type="text"
                required
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
              <p v-if="answerTextError" class="mt-1 text-xs text-red-600">{{ answerTextError }}</p>
            </div>

            <!-- Long Answer -->
            <div v-else-if="question.question_type === 'long_answer'">
              <textarea
                v-model="answerText"
                required
                rows="4"
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              ></textarea>
              <p v-if="answerTextError" class="mt-1 text-xs text-red-600">{{ answerTextError }}</p>
            </div>

            <!-- Slider -->
            <div v-else-if="question.question_type === 'slider'">
              <div class="space-y-2">
                <input
                  v-model.number="answerText"
                  type="range"
                  :min="question.min_value || 0"
                  :max="question.max_value || 100"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-600">
                  <span>{{ question.min_value || 0 }}</span>
                  <span class="font-semibold text-primary">{{ answerText }}</span>
                  <span>{{ question.max_value || 100 }}</span>
                </div>
                <p v-if="answerTextError" class="mt-1 text-xs text-red-600">{{ answerTextError }}</p>
              </div>
            </div>

            <!-- Single Choice -->
            <div v-else-if="question.question_type === 'single_choice'">
              <div class="space-y-2">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/5 border-primary': selectedOptions === option.id }"
                >
                  <input
                    v-model="selectedOptions"
                    type="radio"
                    :value="option.id"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span class="text-sm text-gray-900">{{ option.option_text }}</span>
                </label>
                <p v-if="selectedOptionsError" class="mt-1 text-xs text-red-600">{{ selectedOptionsError }}</p>
              </div>
            </div>

            <!-- Multiple Choice -->
            <div v-else-if="question.question_type === 'multiple_choice'">
              <div class="space-y-2">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/5 border-primary': Array.isArray(selectedOptions) && selectedOptions.includes(option.id) }"
                >
                  <input
                    v-model="selectedOptions"
                    type="checkbox"
                    :value="option.id"
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  />
                  <span class="text-sm text-gray-900">{{ option.option_text }}</span>
                </label>
                <p v-if="selectedOptionsError" class="mt-1 text-xs text-red-600">{{ selectedOptionsError }}</p>
              </div>
            </div>

            <!-- Upload -->
            <div v-else-if="question.question_type === 'upload'">
              <div class="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p class="text-xs text-gray-500">Upload a file or provide a link</p>
                <input
                  type="file"
                  class="mt-3 w-full text-xs"
                  @change="handleUploadFile(undefined, $event)"
                  :disabled="!isDraftMode || uploadAnswerMutation.isPending.value"
                />
                <p v-if="uploadResourceId" class="mt-2 text-xs text-emerald-600">
                  File uploaded and ready to submit.
                </p>
                <input
                  v-model="uploadUrl"
                  type="text"
                  placeholder="Or paste a file URL"
                  class="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
                <p v-if="uploadError" class="mt-1 text-xs text-red-600">{{ uploadError }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between gap-2 pt-2">
              <p v-if="saveError" class="text-xs text-red-600">{{ saveError }}</p>
              <p v-else-if="isSaving" class="text-xs text-gray-500">Saving...</p>
              <p v-else-if="lastSavedAt" class="text-xs text-gray-500">Saved</p>
              <UButton
                type="button"
                @click="cancelEditing"
                size="sm"
                color="gray"
                variant="soft"
              >
                Done
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from '#ui/composables/useToast'
import type { EventQuestion, EventQuestionNestedOption, EventDetail } from '~/api/types.gen'
import type { EventQuestionAnswerDraft } from '~/stores/registration'

// Composables
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import {
  useEventQuestionAnswers,
  useCreateEventQuestionAnswer,
  usePartialUpdateEventQuestionAnswer,
  useDeleteEventQuestionAnswer,
  useUploadEventQuestionAnswer
} from '~/composables/resources/events/eventQuestionAnswers'
import {
  useEventAnswerChoices,
  useCreateEventAnswerChoice,
  useDeleteEventAnswerChoice
} from '~/composables/resources/events/eventAnswerChoices'

// Props
const props = defineProps<{
  event: EventDetail
  attendeeId?: string
  modelValue?: EventQuestionAnswerDraft[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: EventQuestionAnswerDraft[]): void
}>()

// Composables
const toast = useToast()
const uploadAnswerMutation = useUploadEventQuestionAnswer()

const isDraftMode = computed(() => props.modelValue !== undefined)

// Data Queries
const eventQuestions = useEventQuestions(computed(() => ({
  event: props.event.event_id,
  page_size: 100
})))

const attendeeAnswers = useEventQuestionAnswers(
  computed(() => (props.attendeeId ? {
    attendee_id: props.attendeeId,
    page_size: 100
  } : undefined)),
  { enabled: computed(() => !!props.attendeeId && !isDraftMode.value) }
)

// Mutations
const createAnswerMutation = useCreateEventQuestionAnswer()
const partialUpdateAnswerMutation = usePartialUpdateEventQuestionAnswer()
const deleteAnswerMutation = useDeleteEventQuestionAnswer()
const createAnswerChoiceMutation = useCreateEventAnswerChoice()
const deleteAnswerChoiceMutation = useDeleteEventAnswerChoice()

// State
const editingQuestionId = ref<string | null>(null)
const currentQuestion = ref<EventQuestion | null>(null)
const isSaving = ref(false)
const lastSavedAt = ref<Date | null>(null)
const saveError = ref<string | null>(null)
const isHydrating = ref(false)

const buildQuestionSchema = (question: EventQuestion | null) => {
  const base = z.object({
    answer_text: z.union([z.string(), z.number()]).optional(),
    selected_options: z.union([z.number(), z.array(z.number())]).nullable().optional(),
    upload_url: z.string().optional(),
    upload_resource_id: z.number().optional(),
  })

  if (!question) return base

  if (question.question_type === 'short_answer' || question.question_type === 'long_answer') {
    return base.extend({
      answer_text: z.string().trim().min(1, 'Please provide an answer'),
    })
  }

  if (question.question_type === 'slider') {
    return base.extend({
      answer_text: z.number({ required_error: 'Select a value' }),
    })
  }

  if (question.question_type === 'single_choice') {
    return base.extend({
      selected_options: z.number({ required_error: 'Select an option' }),
    })
  }

  if (question.question_type === 'multiple_choice') {
    return base.extend({
      selected_options: z.array(z.number()).min(1, 'Select at least one option'),
    })
  }

  if (question.question_type === 'upload') {
    return base.refine((values) => {
      const hasUpload = Boolean(values.upload_resource_id) || (values.upload_url?.trim().length ?? 0) > 0
      const hasAnswer =
        typeof values.answer_text === 'string'
          ? values.answer_text.trim().length > 0
          : typeof values.answer_text === 'number'
      return isDraftMode.value ? hasUpload : (hasUpload || hasAnswer)
    }, {
      message: 'Please upload a file or provide a link',
      path: ['upload_url'],
    })
  }

  return base
}

const validationSchema = computed(() => toTypedSchema(buildQuestionSchema(currentQuestion.value)))
const { validate, resetForm, setFieldValue } = useForm<{
  answer_text?: string | number
  selected_options?: number[] | number | null
  upload_url?: string
  upload_resource_id?: number
}>({
  validationSchema,
  initialValues: {
    answer_text: '',
    selected_options: [],
    upload_url: '',
    upload_resource_id: undefined,
  },
})

const { value: answerText, errorMessage: answerTextError } = useField<string | number | undefined>('answer_text')
const { value: selectedOptions, errorMessage: selectedOptionsError } = useField<number[] | number | null>('selected_options')
const { value: uploadUrl, errorMessage: uploadUrlError } = useField<string | undefined>('upload_url')
const { value: uploadResourceId, errorMessage: uploadResourceIdError } = useField<number | undefined>('upload_resource_id')

const uploadError = computed(() => uploadUrlError.value || uploadResourceIdError.value)

// Watcher to refetch answers when mutations succeed
watch(
  () => [
    createAnswerMutation.isSuccess.value,
    partialUpdateAnswerMutation.isSuccess.value,
    deleteAnswerMutation.isSuccess.value,
    createAnswerChoiceMutation.isSuccess.value,
    deleteAnswerChoiceMutation.isSuccess.value
  ],
  () => {
    // Refetch attendee answers when any mutation succeeds
    if (!isDraftMode.value) {
      attendeeAnswers.refetch()
    }
  }
)

watch(
  () => [answerText.value, selectedOptions.value, uploadUrl.value, uploadResourceId.value],
  () => {
    if (!editingQuestionId.value) return
    if (isHydrating.value) return
    debouncedSave()
  },
  { deep: true }
)

// Computed
const isLoading = computed(() => eventQuestions.isLoading.value || (!isDraftMode.value && attendeeAnswers.isLoading.value))

const sortedQuestions = computed(() => {
  const questions = eventQuestions.data.value?.data?.results || []
  return [...questions].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const draftAnswers = computed(() => props.modelValue ?? [])

const answersMap = computed(() => {
  if (isDraftMode.value) {
    const map = new Map<string, EventQuestionAnswerDraft>()
    draftAnswers.value.forEach((answer) => {
      map.set(answer.questionId, answer)
    })
    return map
  }

  const answers = attendeeAnswers.data.value?.data?.results || []
  const map = new Map<string, any>()
  answers.forEach((answer) => {
    map.set(answer.question, answer)
  })
  return map
})

const totalQuestionsCount = computed(() => sortedQuestions.value.length)
const hasQuestionAnswerContent = (answer: EventQuestionAnswerDraft): boolean => {
  if (typeof answer.answerText === 'string' && answer.answerText.trim().length > 0) return true
  if (typeof answer.answerText === 'number') return true
  if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) return true
  if (answer.uploadResourceId) return true
  if (answer.uploadUrl) return true
  return false
}

const answeredCount = computed(() => {
  if (isDraftMode.value) {
    return draftAnswers.value.filter((answer) => hasQuestionAnswerContent(answer)).length
  }
  return answersMap.value.size
})

const unansweredRequiredCount = computed(() => {
  if (isDraftMode.value) {
    return sortedQuestions.value.filter((question) => {
      if (!question.required) return false
      const answer = answersMap.value.get(question.id)
      if (!answer) return true
      return !hasQuestionAnswerContent(answer)
    }).length
  }
  return sortedQuestions.value.filter(q => q.required && !answersMap.value.has(q.id)).length
})

// Methods
const hasAnswer = (questionId: string): boolean => {
  const answer = answersMap.value.get(questionId)
  if (!answer) return false
  if (isDraftMode.value) {
    return hasQuestionAnswerContent(answer)
  }
  return true
}

const getAnswer = (questionId: string) => {
  const answer = answersMap.value.get(questionId)
  if (!answer) return null
  if (isDraftMode.value) {
    return {
      answer_text: answer.answerText ?? '',
      selected_option_ids: answer.selectedOptionIds ?? [],
      upload_resource_id: answer.uploadResourceId,
      upload_url: answer.uploadUrl
    }
  }
  return answer
}

const getSelectedOptions = (questionId: string): EventQuestionNestedOption[] => {
  const answer = getAnswer(questionId)
  if (!answer) return []
  
  const question = sortedQuestions.value.find(q => q.id === questionId)
  if (!question || !question.options) return []
  
  if (isDraftMode.value) {
    const selectedIds = answer.selected_option_ids || []
    return question.options.filter(opt => selectedIds.includes(opt.id))
  }

  if (!answer.selected_options) return []

  return question.options.filter(opt =>
    answer.selected_options.some((selOpt: any) => selOpt.option === opt.id)
  )
}

const isEditing = (questionId: string): boolean => {
  return editingQuestionId.value === questionId
}

const isTextQuestion = (type: string): boolean => {
  return ['short_answer', 'long_answer'].includes(type)
}

const isChoiceQuestion = (type: string): boolean => {
  return ['single_choice', 'multiple_choice'].includes(type)
}

const formatQuestionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'short_answer': 'Short Answer',
    'long_answer': 'Long Answer',
    'upload': 'File Upload',
    'multiple_choice': 'Multiple Choice',
    'single_choice': 'Single Choice',
    'slider': 'Slider'
  }
  return typeMap[type] || type
}

const startEditing = async (question: EventQuestion) => {
  editingQuestionId.value = question.id
  currentQuestion.value = question
  saveError.value = null
  lastSavedAt.value = null
  isHydrating.value = true

  const existingAnswer = getAnswer(question.id)

  if (existingAnswer) {
    if (question.question_type === 'single_choice') {
      resetForm({
        values: {
          answer_text: existingAnswer.answer_text || '',
          selected_options: isDraftMode.value
            ? (existingAnswer.selected_option_ids?.[0] ?? null as any)
            : existingAnswer.selected_options?.[0]?.option || null as any,
          upload_url: existingAnswer.upload_url || '',
          upload_resource_id: existingAnswer.upload_resource_id,
        },
      })
    } else if (question.question_type === 'multiple_choice') {
      resetForm({
        values: {
          answer_text: existingAnswer.answer_text || '',
          selected_options: isDraftMode.value
            ? (existingAnswer.selected_option_ids || [])
            : existingAnswer.selected_options?.map((opt: any) => opt.option) || [],
          upload_url: existingAnswer.upload_url || '',
          upload_resource_id: existingAnswer.upload_resource_id,
        },
      })
    } else if (question.question_type === 'upload') {
      resetForm({
        values: {
          answer_text: existingAnswer.answer_text || '',
          selected_options: [],
          upload_url: existingAnswer.upload_url || '',
          upload_resource_id: existingAnswer.upload_resource_id,
        },
      })
    } else if (question.question_type === 'slider') {
      resetForm({
        values: {
          answer_text: Number(existingAnswer.answer_text || question.min_value || 0),
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    } else {
      resetForm({
        values: {
          answer_text: existingAnswer.answer_text || '',
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    }
  } else {
    if (question.question_type === 'slider') {
      resetForm({
        values: {
          answer_text: Number(question.min_value || 0),
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    } else if (question.question_type === 'single_choice') {
      resetForm({
        values: {
          answer_text: '',
          selected_options: null as any,
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    } else if (question.question_type === 'multiple_choice') {
      resetForm({
        values: {
          answer_text: '',
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    } else if (question.question_type === 'upload') {
      resetForm({
        values: {
          answer_text: '',
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    } else {
      resetForm({
        values: {
          answer_text: '',
          selected_options: [],
          upload_url: '',
          upload_resource_id: undefined,
        },
      })
    }
  }

  await nextTick()
  isHydrating.value = false
}

const cancelEditing = () => {
  editingQuestionId.value = null
  currentQuestion.value = null
  resetForm()
}

const updateDraftAnswers = (nextAnswers: EventQuestionAnswerDraft[]) => {
  emit('update:modelValue', nextAnswers)
}

const getDraftAnswer = (questionId: string): EventQuestionAnswerDraft | undefined => {
  return draftAnswers.value.find((answer) => answer.questionId === questionId)
}

const draftAnswerText = (questionId: string): string => {
  return String(getDraftAnswer(questionId)?.answerText || '')
}

const draftAnswerNumber = (questionId: string, fallback: number): number => {
  const raw = getDraftAnswer(questionId)?.answerText
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.trim().length > 0) return Number(raw)
  return fallback
}

const draftSelectedIds = (questionId: string): number[] => {
  return getDraftAnswer(questionId)?.selectedOptionIds || []
}

const setDraftAnswerText = (questionId: string, text: string) => {
  const trimmed = text.trim()
  upsertDraftAnswer(questionId, {
    answerText: trimmed.length ? text : undefined,
  })
}

const setDraftSingleChoice = (questionId: string, optionId: number) => {
  upsertDraftAnswer(questionId, {
    selectedOptionIds: [optionId],
    answerText: String(optionId),
  })
}

const toggleDraftMultipleChoice = (questionId: string, optionId: number, checked: boolean) => {
  const current = draftSelectedIds(questionId)
  const next = checked
    ? Array.from(new Set([...current, optionId]))
    : current.filter((id) => id !== optionId)

  upsertDraftAnswer(questionId, {
    selectedOptionIds: next,
    answerText: next.length ? next.join(',') : undefined,
  })
}

const setDraftUploadUrl = (questionId: string, value: string) => {
  const trimmed = value.trim()
  upsertDraftAnswer(questionId, {
    uploadUrl: trimmed.length ? value : undefined,
  })
}

const upsertDraftAnswer = (questionId: string, update: Partial<EventQuestionAnswerDraft>) => {
  const nextAnswers = [...draftAnswers.value]
  const existingIndex = nextAnswers.findIndex((answer) => answer.questionId === questionId)
  const merged = { questionId, ...update } as EventQuestionAnswerDraft

  if (existingIndex >= 0) {
    nextAnswers[existingIndex] = { ...nextAnswers[existingIndex], ...merged }
  } else {
    nextAnswers.push(merged)
  }

  updateDraftAnswers(nextAnswers)
}

const saveCurrentAnswer = async () => {
  if (!currentQuestion.value) return
  if (!editingQuestionId.value) return
  if (isHydrating.value) return

  const question = currentQuestion.value
  const validation = await validate()
  if (!validation.valid) return

  isSaving.value = true
  saveError.value = null

  try {
    const existingAnswer = getAnswer(question.id)
    const isChoice = isChoiceQuestion(question.question_type || '')

    let answerTextValue = answerText.value
    let selectedOptionIds: number[] = []

    if (isChoice) {
      if (Array.isArray(selectedOptions.value)) {
        selectedOptionIds = selectedOptions.value
        answerTextValue = selectedOptions.value.join(',')
      } else if (typeof selectedOptions.value === 'number') {
        selectedOptionIds = [selectedOptions.value]
        answerTextValue = String(selectedOptions.value)
      }
    }

    const answerTextString = typeof answerTextValue === 'number'
      ? String(answerTextValue)
      : (answerTextValue || '')

    if (isDraftMode.value) {
      upsertDraftAnswer(question.id, {
        answerText: answerTextString || undefined,
        selectedOptionIds: isChoice ? selectedOptionIds : undefined,
        uploadResourceId: uploadResourceId.value,
        uploadUrl: uploadUrl.value || undefined,
      })

      lastSavedAt.value = new Date()
      return
    }

    let answerId: number

    if (existingAnswer) {
      await partialUpdateAnswerMutation.mutateAsync({
        answerId: existingAnswer.id,
        body: {
          question: question.id,
          attendee: props.attendeeId,
          answer_text: answerTextString,
        }
      })
      answerId = existingAnswer.id
    } else {
      const response = await createAnswerMutation.mutateAsync({
        question: question.id,
        attendee: props.attendeeId as string,
        answer_text: answerTextString,
      })
      answerId = response.data?.id || 0
      if (!answerId) {
        throw new Error('Failed to get answer ID from response')
      }
    }

    if (isChoice) {
      const existingChoices = existingAnswer?.selected_options || []
      const existingOptionIds = existingChoices.map((choice: any) => choice.option)
      const optionsToAdd = selectedOptionIds.filter(id => !existingOptionIds.includes(id))
      const optionsToRemove = existingChoices.filter((choice: any) => !selectedOptionIds.includes(choice.option))

      for (const choice of optionsToRemove) {
        await deleteAnswerChoiceMutation.mutateAsync(choice.id)
      }

      for (const optionId of optionsToAdd) {
        await createAnswerChoiceMutation.mutateAsync({
          answer: answerId,
          option: optionId,
        })
      }
    }

    lastSavedAt.value = new Date()
  } catch (error) {
    console.error('Failed to save answer:', error)
    saveError.value = 'Failed to save answer'
  } finally {
    isSaving.value = false
  }
}

const debouncedSave = useDebounceFn(saveCurrentAnswer, 500)

const handleDeleteAnswer = async (questionId: string) => {
  const answer = getAnswer(questionId)
  if (!answer) return
  
  if (!confirm('Are you sure you want to delete this answer?')) return

  if (isDraftMode.value) {
    const nextAnswers = draftAnswers.value.filter((draft) => draft.questionId !== questionId)
    updateDraftAnswers(nextAnswers)
    toast.add({ title: 'Success', description: 'Answer deleted', color: 'green' })
    return
  }

  try {
    await deleteAnswerMutation.mutateAsync(answer.id)
    toast.add({ title: 'Success', description: 'Answer deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete answer:', error)
    toast.add({ title: 'Error', description: 'Failed to delete answer', color: 'red' })
  }
}

const handleUploadFile = async (questionId: string | undefined, event: Event) => {
  if (!isDraftMode.value || !questionId) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await uploadAnswerMutation.mutateAsync(formData)
    upsertDraftAnswer(questionId, {
      uploadResourceId: response.id,
    })
    toast.add({ title: 'Uploaded', description: 'File uploaded successfully.', color: 'green' })
  } catch (error) {
    console.error('Failed to upload file:', error)
    toast.add({ title: 'Error', description: 'Failed to upload file.', color: 'red' })
  }
}
</script>
