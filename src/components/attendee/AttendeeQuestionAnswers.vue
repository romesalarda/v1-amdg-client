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
          <!-- No Answer State -->
          <div v-if="!hasAnswer(question.id) && !isEditing(question.id)" class="flex items-center justify-between">
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

          <!-- Existing Answer Display -->
          <div v-else-if="!isEditing(question.id)" class="space-y-2">
            <!-- Text Answer -->
            <div v-if="isTextQuestion(question.question_type || '')" class="bg-gray-50 rounded-lg p-3">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ getAnswer(question.id)?.answer_text }}</p>
            </div>

            <!-- Slider Answer -->
            <div v-else-if="question.question_type === 'slider'" class="bg-gray-50 rounded-lg p-3">
              <p class="text-sm text-gray-900">
                <span class="font-semibold">{{ getAnswer(question.id)?.answer_text }}</span>
                <span class="text-gray-500 text-xs ml-2">(Range: {{ question.min_value }} - {{ question.max_value }})</span>
              </p>
            </div>

            <!-- Choice Answer -->
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

            <!-- Edit Button -->
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

          <!-- Edit Form -->
          <form v-else @submit.prevent="handleSaveAnswer(question)" class="space-y-3">
            <!-- Short Answer -->
            <div v-if="question.question_type === 'short_answer'">
              <input
                v-model="editingAnswer.answer_text"
                type="text"
                required
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <!-- Long Answer -->
            <div v-else-if="question.question_type === 'long_answer'">
              <textarea
                v-model="editingAnswer.answer_text"
                required
                rows="4"
                placeholder="Enter your answer"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              ></textarea>
            </div>

            <!-- Slider -->
            <div v-else-if="question.question_type === 'slider'">
              <div class="space-y-2">
                <input
                  v-model.number="editingAnswer.answer_text"
                  type="range"
                  :min="question.min_value || 0"
                  :max="question.max_value || 100"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-600">
                  <span>{{ question.min_value || 0 }}</span>
                  <span class="font-semibold text-primary">{{ editingAnswer.answer_text }}</span>
                  <span>{{ question.max_value || 100 }}</span>
                </div>
              </div>
            </div>

            <!-- Single Choice -->
            <div v-else-if="question.question_type === 'single_choice'">
              <div class="space-y-2">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/5 border-primary': editingAnswer.selected_options === option.id }"
                >
                  <input
                    v-model="editingAnswer.selected_options"
                    type="radio"
                    :value="option.id"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span class="text-sm text-gray-900">{{ option.option_text }}</span>
                </label>
              </div>
            </div>

            <!-- Multiple Choice -->
            <div v-else-if="question.question_type === 'multiple_choice'">
              <div class="space-y-2">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/5 border-primary': Array.isArray(editingAnswer.selected_options) && editingAnswer.selected_options.includes(option.id) }"
                >
                  <input
                    v-model="editingAnswer.selected_options"
                    type="checkbox"
                    :value="option.id"
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  />
                  <span class="text-sm text-gray-900">{{ option.option_text }}</span>
                </label>
              </div>
            </div>

            <!-- Upload (placeholder) -->
            <div v-else-if="question.question_type === 'upload'">
              <div class="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p class="text-xs text-gray-500">File upload not yet implemented</p>
                <input
                  v-model="editingAnswer.answer_text"
                  type="text"
                  placeholder="Enter file URL or description"
                  class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 pt-2">
              <UButton
                type="submit"
                size="sm"
                color="green"
                :loading="isSaving"
              >
                Save Answer
              </UButton>
              <UButton
                type="button"
                @click="cancelEditing"
                size="sm"
                color="gray"
                variant="soft"
              >
                Cancel
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useToast } from '#ui/composables/useToast'
import type { EventQuestion, EventQuestionAnswer, EventQuestionOption, EventDetail } from '~/api/types.gen'

// Composables
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import {
  useEventQuestionAnswers,
  useCreateEventQuestionAnswer,
  useUpdateEventQuestionAnswer,
  usePartialUpdateEventQuestionAnswer,
  useDeleteEventQuestionAnswer
} from '~/composables/resources/events/eventQuestionAnswers'
import {
  useEventAnswerChoices,
  useCreateEventAnswerChoice,
  useDeleteEventAnswerChoice
} from '~/composables/resources/events/eventAnswerChoices'

// Props
const props = defineProps<{
  event: EventDetail
  attendeeId: string
}>()

// Composables
const toast = useToast()

// Data Queries
const eventQuestions = useEventQuestions(computed(() => ({
  event: props.event.id,
  page_size: 100
})))

const attendeeAnswers = useEventQuestionAnswers(computed(() => ({
  attendee_id: props.attendeeId,
  page_size: 100
})))

// Mutations
const createAnswerMutation = useCreateEventQuestionAnswer()
const updateAnswerMutation = useUpdateEventQuestionAnswer()
const partialUpdateAnswerMutation = usePartialUpdateEventQuestionAnswer()
const deleteAnswerMutation = useDeleteEventQuestionAnswer()
const createAnswerChoiceMutation = useCreateEventAnswerChoice()
const deleteAnswerChoiceMutation = useDeleteEventAnswerChoice()

// State
const editingQuestionId = ref<string | null>(null)
const editingAnswer = ref<{
  answer_text: string
  selected_options: number[] | number | null
}>({
  answer_text: '',
  selected_options: []
})
const isSaving = ref(false)

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
    attendeeAnswers.refetch()
  }
)

// Computed
const isLoading = computed(() => eventQuestions.isLoading.value || attendeeAnswers.isLoading.value)

const sortedQuestions = computed(() => {
  const questions = eventQuestions.data.value?.data?.results || []
  return [...questions].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const answersMap = computed(() => {
  const answers = attendeeAnswers.data.value?.data?.results || []
  const map = new Map<string, any>()
  answers.forEach(answer => {
    map.set(answer.question, answer)
  })
  return map
})

const totalQuestionsCount = computed(() => sortedQuestions.value.length)
const answeredCount = computed(() => answersMap.value.size)
const unansweredRequiredCount = computed(() => {
  return sortedQuestions.value.filter(q => q.required && !answersMap.value.has(q.id)).length
})

// Methods
const hasAnswer = (questionId: string): boolean => {
  return answersMap.value.has(questionId)
}

const getAnswer = (questionId: string) => {
  return answersMap.value.get(questionId)
}

const getSelectedOptions = (questionId: string): EventQuestionOption[] => {
  const answer = getAnswer(questionId)
  if (!answer || !answer.selected_options) return []
  
  const question = sortedQuestions.value.find(q => q.id === questionId)
  if (!question || !question.options) return []
  
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

const startEditing = (question: EventQuestion) => {
  editingQuestionId.value = question.id
  
  const existingAnswer = getAnswer(question.id)
  
  if (existingAnswer) {
    // Edit mode
    if (question.question_type === 'single_choice') {
      // For single choice, store as single value (not array)
      editingAnswer.value = {
        answer_text: existingAnswer.answer_text || '',
        selected_options: existingAnswer.selected_options?.[0]?.option || null as any
      }
    } else if (question.question_type === 'multiple_choice') {
      // For multiple choice, store as array
      editingAnswer.value = {
        answer_text: existingAnswer.answer_text || '',
        selected_options: existingAnswer.selected_options?.map((opt: any) => opt.option) || []
      }
    } else {
      editingAnswer.value = {
        answer_text: existingAnswer.answer_text || '',
        selected_options: []
      }
    }
  } else {
    // Add mode
    if (question.question_type === 'slider') {
      editingAnswer.value = {
        answer_text: String(question.min_value || 0),
        selected_options: []
      }
    } else if (question.question_type === 'single_choice') {
      editingAnswer.value = {
        answer_text: '',
        selected_options: null as any // Will hold single option ID for radio
      }
    } else if (question.question_type === 'multiple_choice') {
      editingAnswer.value = {
        answer_text: '',
        selected_options: [] // Array for checkboxes
      }
    } else {
      editingAnswer.value = {
        answer_text: '',
        selected_options: []
      }
    }
  }
}

const cancelEditing = () => {
  editingQuestionId.value = null
  editingAnswer.value = {
    answer_text: '',
    selected_options: []
  }
}

const handleSaveAnswer = async (question: EventQuestion) => {
  isSaving.value = true
  
  try {
    const existingAnswer = getAnswer(question.id)
    const isChoice = isChoiceQuestion(question.question_type || '')
    
    // Prepare answer text based on question type
    let answerText = editingAnswer.value.answer_text
    let selectedOptionIds: number[] = []
    
    // For choice questions, validate and prepare option IDs
    if (isChoice) {
      const selectedOptions = editingAnswer.value.selected_options
      
      // Check if any option is selected
      if (!selectedOptions || (Array.isArray(selectedOptions) && selectedOptions.length === 0)) {
        toast.add({ title: 'Error', description: 'Please select at least one option', color: 'red' })
        isSaving.value = false
        return
      }
      
      // For single choice (radio), selectedOptions is a single value, not array
      // For multiple choice (checkbox), it's an array
      if (Array.isArray(selectedOptions)) {
        selectedOptionIds = selectedOptions
        answerText = selectedOptions.join(',')
      } else {
        selectedOptionIds = [selectedOptions]
        answerText = String(selectedOptions)
      }
    } else if (!answerText && question.question_type !== 'upload') {
      toast.add({ title: 'Error', description: 'Please provide an answer', color: 'red' })
      isSaving.value = false
      return
    }
    
    let answerId: number
    
    if (existingAnswer) {
      // Update existing answer
      await partialUpdateAnswerMutation.mutateAsync({
        answerId: existingAnswer.id,
        body: {
          question: question.id,
          attendee: props.attendeeId,
          answer_text: answerText,
        }
      })
      answerId = existingAnswer.id
    } else {
      // Create new answer
      const response = await createAnswerMutation.mutateAsync({
        question: question.id,
        attendee: props.attendeeId,
        answer_text: answerText
      })
      answerId = response.data?.id || 0
      if (!answerId) {
        throw new Error('Failed to get answer ID from response')
      }
    }
    
    // For choice questions, manage answer choices
    if (isChoice) {
      // Get existing choices
      const existingChoices = existingAnswer?.selected_options || []
      const existingOptionIds = existingChoices.map((choice: any) => choice.option)
      
      // Determine which choices to add and remove
      const optionsToAdd = selectedOptionIds.filter(id => !existingOptionIds.includes(id))
      const optionsToRemove = existingChoices.filter((choice: any) => !selectedOptionIds.includes(choice.option))
      
      // Delete removed choices
      for (const choice of optionsToRemove) {
        await deleteAnswerChoiceMutation.mutateAsync(choice.id)
      }
      
      // Create new choices
      for (const optionId of optionsToAdd) {
        await createAnswerChoiceMutation.mutateAsync({
          answer: answerId,
          option: optionId
        })
      }
    }
    
    toast.add({ title: 'Success', description: existingAnswer ? 'Answer updated' : 'Answer added', color: 'green' })
    cancelEditing()
  } catch (error) {
    console.error('Failed to save answer:', error)
    toast.add({ title: 'Error', description: 'Failed to save answer', color: 'red' })
  } finally {
    isSaving.value = false
  }
}

const handleDeleteAnswer = async (questionId: string) => {
  const answer = getAnswer(questionId)
  if (!answer) return
  
  if (!confirm('Are you sure you want to delete this answer?')) return
  
  try {
    await deleteAnswerMutation.mutateAsync(answer.id)
    toast.add({ title: 'Success', description: 'Answer deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete answer:', error)
    toast.add({ title: 'Error', description: 'Failed to delete answer', color: 'red' })
  }
}
</script>
