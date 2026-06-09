import { ref, computed, readonly, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ZodError } from 'zod'
import {
  formQuestionSchema,
  formQuestionsArraySchema,
} from '~/schemas/events/forms'
import {
  useCreateEventFormQuestion,
  useUpdateEventFormQuestion,
  useDeleteEventFormQuestion,
  useReorderEventFormQuestions,
} from '~/composables/resources/events/eventForms'

interface QuestionDraft {
  id?: number
  tempId?: string
  question_title?: string
  question_body?: string
  question_type?: string
  required?: boolean
  order?: number
  options?: any[]
  min_value?: number | null
  max_value?: number | null
  isNew?: boolean
  isExpanded?: boolean
  isEditing?: boolean
  [key: string]: any
}

interface UndoState {
  questions: QuestionDraft[]
  timestamp: number
}

interface QuestionValidationErrors {
  question_title?: string
  question_body?: string
  question_type?: string
  options?: string
  min_value?: string
  max_value?: string
}

export const useEventFormBuilder = (
  formId: Ref<string | undefined>,
  eventIntId: Ref<number | undefined>,
  focusedFields?: Ref<Set<string>>
) => {
  const toast = useToast()

  // Mutations
  const createQuestionMutation = useCreateEventFormQuestion()
  const updateQuestionMutation = useUpdateEventFormQuestion()
  const deleteQuestionMutation = useDeleteEventFormQuestion()
  const reorderQuestionsMutation = useReorderEventFormQuestions()

  // State
  const questions = ref<QuestionDraft[]>([])
  const selectedQuestion = ref<QuestionDraft | null>(null)
  const previewMode = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)

  // Loading & validation states
  const questionLoadingStates = ref<Map<string, boolean>>(new Map())
  const questionValidationErrors = ref<Map<string, QuestionValidationErrors>>(new Map())

  // Undo/Redo stacks
  const undoStack = ref<UndoState[]>([])
  const redoStack = ref<UndoState[]>([])
  const MAX_HISTORY = 50

  const questionTemplates = [
    {
      name: 'Full Name',
      question_title: 'Full Name',
      question_type: 'short_answer',
      required: true,
    },
    {
      name: 'Email Address',
      question_title: 'Email Address',
      question_type: 'email',
      required: true,
    },
    {
      name: 'Phone Number',
      question_title: 'Phone Number',
      question_type: 'phone',
      required: false,
    },
    {
      name: 'Arrival Date',
      question_title: 'When do you plan to arrive?',
      question_type: 'date',
      required: false,
    },
    {
      name: 'Arrival Time',
      question_title: 'What time do you plan to arrive?',
      question_type: 'time',
      required: false,
    },
    {
      name: 'Document Upload',
      question_title: 'Please upload the required document',
      question_type: 'upload',
      required: false,
    },
    {
      name: 'Satisfaction Rating',
      question_title: 'How would you rate this event?',
      question_type: 'rating',
      required: true,
      min_value: 1,
      max_value: 5,
    },
    {
      name: 'Multiple Choice Choice',
      question_title: 'Select your preferred workshop sessions',
      question_type: 'multiple_choice',
      required: false,
      options: ['Session A', 'Session B', 'Session C'],
    },
  ]

  // Validate single question using Zod schema
  const validateQuestion = (question: QuestionDraft): { success: boolean; errors?: string[] } => {
    try {
      formQuestionSchema.parse(question)
      return { success: true }
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as ZodError
        const errors = zodError.errors.map((err) => {
          const field = err.path.join('.')
          return field ? `${field}: ${err.message}` : err.message
        })
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  // Get errors for a specific field of a question
  const getFieldError = (question: QuestionDraft, field: keyof QuestionValidationErrors): string | undefined => {
    const questionKey = String(question.id ?? question.tempId ?? 'unknown')
    const errors = questionValidationErrors.value.get(questionKey)

    if (errors && errors[field]) {
      // min_value and max_value errors only apply to slider and rating questions
      if ((field === 'min_value' || field === 'max_value') && !['slider', 'rating'].includes(question.question_type || '')) {
        return undefined
      }
      // options errors only apply to choice questions
      if (field === 'options' && !['multiple_choice', 'single_choice'].includes(question.question_type || '')) {
        return undefined
      }
      return errors[field]
    }

    return undefined
  }

  // Get field-level validation errors for a specific question
  const getQuestionFieldErrors = (question: QuestionDraft): QuestionValidationErrors => {
    const questionKey = String(question.id ?? question.tempId ?? 'unknown')

    try {
      formQuestionSchema.parse(question)
      questionValidationErrors.value.delete(questionKey)
      return {}
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as ZodError
        const fieldErrors: QuestionValidationErrors = {}

        zodError.errors.forEach((err) => {
          const field = err.path[0] as string
          if (field && !fieldErrors[field as keyof QuestionValidationErrors]) {
            fieldErrors[field as keyof QuestionValidationErrors] = err.message
          }
        })

        questionValidationErrors.value.set(questionKey, fieldErrors)
        return fieldErrors
      }
    }

    return {}
  }

  // Validate all questions for duplicate titles
  const validateAllQuestions = (): { success: boolean; errors?: string[] } => {
    try {
      formQuestionsArraySchema.parse(questions.value)
      return { success: true }
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as ZodError
        const errors = zodError.errors.map((err) => {
          const field = err.path.join('.')
          return field ? `Question ${parseInt(field) + 1}: ${err.message}` : err.message
        })
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  // Save question to backend via REST API
  const saveQuestion = async (question: QuestionDraft) => {
    // Run Zod validation
    const fieldErrors = getQuestionFieldErrors(question)
    const validation = validateQuestion(question)

    if (!validation.success) {
      toast.add({
        title: 'Validation Error',
        description: validation.errors?.[0] || 'Please check the form',
        color: 'red',
        timeout: 5000,
      })
      return
    }

    if (!formId.value) {
      toast.add({
        title: 'Form ID missing',
        description: 'Cannot save question - form is not initialized',
        color: 'red',
        timeout: 5000,
      })
      return
    }

    // Filter empty options
    if (['multiple_choice', 'single_choice'].includes(question.question_type || '')) {
      if (question.options) {
        question.options = question.options.filter((opt: any) => {
          const optionText = typeof opt === 'string' ? opt : opt.option_text
          return optionText && optionText.trim().length > 0
        })
      }
    }

    // Set defaults for slider/rating
    if (['slider', 'rating'].includes(question.question_type || '')) {
      if (question.min_value === undefined || question.min_value === null) {
        question.min_value = 1
      }
      if (question.max_value === undefined || question.max_value === null) {
        question.max_value = 5
      }
    }

    const questionKey = String(question.id ?? question.tempId ?? 'unknown')
    questionLoadingStates.value.set(questionKey, true)
    isSaving.value = true

    const originalQuestion = JSON.parse(JSON.stringify(question))
    const questionIndex = questions.value.findIndex(q =>
      (q.tempId && q.tempId === question.tempId) || (q.id && q.id === question.id)
    )

    try {
      const isNewQuestion = question.isNew || !question.id

      // Prepare options payload
      const optionsPayload = (question.options || []).map((opt, idx) => {
        const text = typeof opt === 'string' ? opt : opt.option_text
        const payload: any = {
          option_text: text,
          order: idx,
        }
        if (opt && typeof opt === 'object' && opt.id) {
          payload.id = opt.id
        }
        return payload
      })

      const payload: any = {
        form: formId.value,
        question_title: question.question_title!,
        question_body: question.question_body || '',
        question_type: question.question_type as any,
        required: question.required || false,
        order: question.order ?? questions.value.length,
        options: optionsPayload,
      }

      if (['slider', 'rating'].includes(question.question_type || '')) {
        payload.min_value = question.min_value
        payload.max_value = question.max_value
      }

      if (isNewQuestion) {
        // Create question via REST POST
        const res = await createQuestionMutation.mutateAsync(payload)
        if (questionIndex !== -1 && res.data) {
          questions.value[questionIndex] = {
            ...res.data,
            isNew: false,
            isExpanded: question.isExpanded,
            isEditing: question.isEditing,
          }
        }
        toast.add({
          title: 'Question Created',
          description: 'Question saved successfully',
          color: 'green',
          timeout: 2000,
        })
      } else {
        // Update question via REST PATCH
        const res = await updateQuestionMutation.mutateAsync({
          questionId: question.id!,
          body: payload,
        })
        if (questionIndex !== -1 && res.data) {
          questions.value[questionIndex] = {
            ...res.data,
            isNew: false,
            isExpanded: question.isExpanded,
            isEditing: question.isEditing,
          }
        }
      }
      hasUnsavedChanges.value = false
    } catch (error: any) {
      console.error('[FormBuilder] Save question error:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error saving question'
      if (questionIndex !== -1) {
        questions.value[questionIndex] = originalQuestion
      }
      toast.add({
        title: 'Save Failed',
        description: errorMessage,
        color: 'red',
        timeout: 5000,
      })
    } finally {
      questionLoadingStates.value.set(questionKey, false)
      isSaving.value = false
    }
  }

  const debouncedSave = useDebounceFn(saveQuestion, 2000)

  // Reordering API handler
  const saveQuestionsOrder = async () => {
    if (!formId.value) return

    isSaving.value = true
    try {
      const orderPayload = questions.value
        .filter(q => q.id && !q.isNew)
        .map((q, index) => ({ id: q.id!, order: index }))

      if (orderPayload.length > 0) {
        await reorderQuestionsMutation.mutateAsync({
          formId: formId.value,
          body: { questions: orderPayload } as any,
        })
      }

      // Sync orders locally
      questions.value.forEach((q, index) => {
        q.order = index
      })
      hasUnsavedChanges.value = false
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to update order'
      toast.add({
        title: 'Reorder Failed',
        description: errorMessage,
        color: 'red',
        timeout: 5000,
      })
    } finally {
      isSaving.value = false
    }
  }

  const debouncedSaveOrder = useDebounceFn(saveQuestionsOrder, 1000)

  const addToHistory = () => {
    const state: UndoState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    undoStack.value.push(state)
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  const undo = () => {
    if (undoStack.value.length === 0) return
    const currentState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    redoStack.value.push(currentState)

    const previousState = undoStack.value.pop()
    if (previousState) {
      questions.value = previousState.questions
      hasUnsavedChanges.value = true
    }
    toast.add({ title: 'Undone', color: 'gray' })
  }

  const redo = () => {
    if (redoStack.value.length === 0) return
    const currentState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    undoStack.value.push(currentState)

    const nextState = redoStack.value.pop()
    if (nextState) {
      questions.value = nextState.questions
      hasUnsavedChanges.value = true
    }
    toast.add({ title: 'Redone', color: 'gray' })
  }

  // Question CRUD methods
  const addQuestion = (template?: any) => {
    addToHistory()

    const tempId = `temp-${Date.now()}`
    const type = template?.question_type || 'short_answer'
    const newQuestion: QuestionDraft = {
      tempId,
      question_title: template?.question_title || 'Untitled Question',
      question_body: template?.question_body || '',
      question_type: type,
      required: template?.required || false,
      order: questions.value.length,
      options: template?.options || [],
      isNew: true,
      isExpanded: true,
      isEditing: true,
    }

    if (['slider', 'rating'].includes(type)) {
      newQuestion.min_value = template?.min_value ?? 1
      newQuestion.max_value = template?.max_value ?? 5
    }

    questions.value.push(newQuestion)
    selectedQuestion.value = newQuestion
    hasUnsavedChanges.value = true

    if (template) {
      nextTick(() => {
        saveQuestion(newQuestion)
      })
    }
  }

  const duplicateQuestion = (question: QuestionDraft) => {
    addToHistory()

    const tempId = `temp-${Date.now()}`
    const duplicate: QuestionDraft = {
      ...JSON.parse(JSON.stringify(question)),
      id: undefined,
      tempId,
      question_title: `${question.question_title} (Copy)`,
      order: (question.order || 0) + 1,
      isNew: true,
      isExpanded: true,
      isEditing: false,
    }

    const index = questions.value.findIndex(q =>
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )

    if (index !== -1) {
      questions.value.splice(index + 1, 0, duplicate)
      questions.value.forEach((q, i) => {
        if (i > index) q.order = i
      })
    } else {
      questions.value.push(duplicate)
    }

    hasUnsavedChanges.value = true
    toast.add({ title: 'Question duplicated', color: 'green' })
  }

  const deleteQuestion = async (question: QuestionDraft) => {
    addToHistory()

    const isUnsaved = !question.id || question.isNew

    if (isUnsaved) {
      const index = questions.value.findIndex(q =>
        (q.tempId && q.tempId === question.tempId) || (q.id && q.id === question.id)
      )
      if (index !== -1) {
        questions.value.splice(index, 1)
      }
      toast.add({ title: 'Question removed', color: 'green', timeout: 2000 })
      return
    }

    try {
      const qKey = question.id!
      questionLoadingStates.value.set(String(qKey), true)
      isSaving.value = true

      await deleteQuestionMutation.mutateAsync({
        questionId: qKey,
        formId: formId.value,
      })

      const index = questions.value.findIndex(q => q.id === qKey)
      if (index !== -1) {
        questions.value.splice(index, 1)
      }

      questions.value.forEach((q, i) => {
        q.order = i
      })

      hasUnsavedChanges.value = true
      debouncedSaveOrder()

      toast.add({ title: 'Question deleted', color: 'green', timeout: 2000 })
    } catch (error: any) {
      toast.add({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete question',
        color: 'red',
        timeout: 5000,
      })
      undo()
    } finally {
      isSaving.value = false
    }
  }

  const updateQuestion = async (question: QuestionDraft, changes: Partial<QuestionDraft>) => {
    const index = questions.value.findIndex(q =>
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )

    if (index === -1) return

    Object.assign(questions.value[index], changes)
    getQuestionFieldErrors(questions.value[index])
    hasUnsavedChanges.value = true

    if (question.isNew || !question.id) {
      return
    }

    const questionId = question.id || question.tempId
    const isFieldFocused = focusedFields?.value &&
      Array.from(focusedFields.value).some(field => field.startsWith(String(questionId)))

    if (isFieldFocused) return

    debouncedSave(questions.value[index])
  }

  const toggleExpanded = async (question: QuestionDraft) => {
    const index = questions.value.findIndex(q =>
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )

    if (index !== -1) {
      const willCollapse = questions.value[index].isExpanded

      if (willCollapse && questions.value[index].isNew &&
        questions.value[index].question_title &&
        questions.value[index].question_type) {
        await saveQuestion(questions.value[index])
      }

      questions.value[index].isExpanded = !questions.value[index].isExpanded
    }
  }

  const collapseAll = () => {
    questions.value.forEach(q => { q.isExpanded = false })
  }

  const expandAll = () => {
    questions.value.forEach(q => { q.isExpanded = true })
  }

  const saveAll = async () => {
    const validation = validateAllQuestions()
    if (!validation.success) {
      toast.add({
        title: 'Validation Error',
        description: validation.errors?.[0] || 'Please check all questions',
        color: 'red',
        timeout: 7000,
      })
      return
    }

    isSaving.value = true
    let hasErrors = false

    try {
      const promises = questions.value.map(q =>
        saveQuestion(q).catch(() => {
          hasErrors = true
          return null
        })
      )
      await Promise.all(promises)

      if (!hasErrors) {
        await saveQuestionsOrder()
        hasUnsavedChanges.value = false
        toast.add({ title: 'All changes saved', color: 'green' })
      } else {
        toast.add({
          title: 'Some questions failed to save',
          description: 'Please resolve errors and try again',
          color: 'red',
        })
      }
    } catch (error) {
      toast.add({ title: 'Failed to save', description: 'Unexpected error occurred', color: 'red' })
    } finally {
      isSaving.value = false
    }
  }

  // Keyboard events
  const handleKeyboardShortcut = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? event.metaKey : event.ctrlKey

    if (modKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          if (event.shiftKey) {
            event.preventDefault()
            redo()
          } else {
            event.preventDefault()
            undo()
          }
          break
        case 'y':
          event.preventDefault()
          redo()
          break
        case 's':
          event.preventDefault()
          saveAll()
          break
        case 'd':
          if (selectedQuestion.value) {
            event.preventDefault()
            duplicateQuestion(selectedQuestion.value)
          }
          break
      }
    } else if (event.key === 'Delete' && selectedQuestion.value) {
      const target = event.target as HTMLElement | null
      if (target && !target.closest('input, textarea')) {
        event.preventDefault()
        if (confirm('Delete this question?')) {
          deleteQuestion(selectedQuestion.value)
        }
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyboardShortcut)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyboardShortcut)
  })

  return {
    questions,
    selectedQuestion,
    previewMode,
    isSaving,
    hasUnsavedChanges,
    questionTemplates,
    questionLoadingStates: readonly(questionLoadingStates),
    questionValidationErrors: readonly(questionValidationErrors),

    validateQuestion,
    validateAllQuestions,
    getQuestionFieldErrors,
    getFieldError,

    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
    undo,
    redo,

    addQuestion,
    duplicateQuestion,
    deleteQuestion,
    updateQuestion,
    toggleExpanded,
    collapseAll,
    expandAll,

    saveQuestion,
    saveAll,
    saveQuestionsOrder,
    debouncedSave,
    debouncedSaveOrder,
  }
}
