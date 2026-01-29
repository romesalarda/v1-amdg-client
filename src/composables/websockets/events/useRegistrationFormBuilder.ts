import type { EventQuestion, EventQuestionOption } from '~/api/types.gen'
import { useDebounceFn } from '@vueuse/core'
import { nextTick } from 'vue'
import type { useEventWebSocket } from './useEventWebSocket'
import { eventQuestionSchema, eventQuestionsArraySchema } from '~/schemas/events/registration'
import type { ZodError } from 'zod'

interface QuestionDraft {
  id?: string  // UUID from backend
  tempId?: string
  question_title?: string
  question_body?: string
  question_type?: string
  required?: boolean
  order?: number
  options?: EventQuestionOption[] | string[]  // Support both formats
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

export const useRegistrationFormBuilder = (
  eventIntId: Ref<number | undefined>,
  ws: ReturnType<typeof useEventWebSocket>,
  focusedFields?: Ref<Set<string>>
) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  
  // Per-question loading states
  const questionLoadingStates = ref<Map<string, boolean>>(new Map())
  
  // Per-question validation errors
  const questionValidationErrors = ref<Map<string, QuestionValidationErrors>>(new Map())
  
  // State
  const questions = ref<QuestionDraft[]>([])
  const selectedQuestion = ref<QuestionDraft | null>(null)
  const previewMode = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)
  
  // Undo/Redo stacks
  const undoStack = ref<UndoState[]>([])
  const redoStack = ref<UndoState[]>([])
  const MAX_HISTORY = 50
  
  // Question templates
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
      question_type: 'short_answer',
      required: true,
    },
    {
      name: 'Phone Number',
      question_title: 'Phone Number',
      question_type: 'short_answer',
      required: false,
    },
    {
      name: 'Dietary Requirements',
      question_title: 'Do you have any dietary requirements?',
      question_type: 'long_answer',
      required: false,
    },
    {
      name: 'T-Shirt Size',
      question_title: 'T-Shirt Size',
      question_type: 'single_choice',
      required: false,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      name: 'Age Group',
      question_title: 'Age Group',
      question_type: 'single_choice',
      required: false,
      options: ['Under 18', '18-25', '26-35', '36-45', '46-55', '56+'],
    },
    {
      name: 'How did you hear about us?',
      question_title: 'How did you hear about us?',
      question_type: 'multiple_choice',
      required: false,
      options: ['Social Media', 'Friend', 'Search Engine', 'Advertisement', 'Other'],
    },
  ]

  // Validate single question using Zod schema
  const validateQuestion = (question: QuestionDraft): { success: boolean; errors?: string[] } => {
    try {
      eventQuestionSchema.parse(question)
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
    const questionKey = question.id || question.tempId || 'unknown'
    const errors = questionValidationErrors.value.get(questionKey)
    
    // Filter out errors that don't apply to the current question type
    if (errors && errors[field]) {
      // min_value and max_value errors only apply to slider questions
      if ((field === 'min_value' || field === 'max_value') && question.question_type !== 'slider') {
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
    const questionKey = question.id || question.tempId || 'unknown'
    
    try {
      eventQuestionSchema.parse(question)
      // Clear errors if validation passes
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
        
        // Store errors for this question
        questionValidationErrors.value.set(questionKey, fieldErrors)
        return fieldErrors
      }
    }
    
    return {}
  }

  // Validate all questions for duplicate titles
  const validateAllQuestions = (): { success: boolean; errors?: string[] } => {
    try {
      eventQuestionsArraySchema.parse(questions.value)
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

  // Normalize options to EventQuestionOption format
  const normalizeOptions = (options: any[] | undefined): EventQuestionOption[] => {
    if (!options) return []
    
    return options.map((opt, index) => {
      if (typeof opt === 'string') {
        return {
          option_text: opt,
          order: index,
        } as any  // API will set other fields
      }
      return opt
    })
  }
  
  // Save question to backend via WebSocket (debounced)
  const saveQuestion = async (question: QuestionDraft) => {
    // Validate using Zod schema and populate field errors
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

    if (!question.question_type) {
      toast.add({
        title: 'Validation Error',
        description: 'Question type is required',
        color: 'red',
        timeout: 5000,
      })
      return
    }
    
    // Filter out empty options for choice questions
    if (['multiple_choice', 'single_choice'].includes(question.question_type)) {
      if (question.options) {
        question.options = question.options.filter((opt: any) => {
          const optionText = typeof opt === 'string' ? opt : opt.option_text
          return optionText && optionText.trim().length > 0
        }) as any
      }
    }
    
    // Ensure slider questions have min_value and max_value
    if (question.question_type === 'slider') {
      if (question.min_value === undefined || question.min_value === null) {
        question.min_value = 0
      }
      if (question.max_value === undefined || question.max_value === null) {
        question.max_value = 10
      }
    }
    
    // Validate eventId
    if (!eventIntId.value) {
      toast.add({
        title: 'Event not loaded',
        description: 'Cannot save question - event data not available',
        color: 'red',
        timeout: 5000,
      })
      return
    }
    
    // Check WebSocket connection
    if (!ws.isConnected.value) {
      toast.add({
        title: 'Not Connected',
        description: 'WebSocket connection lost. Please wait for reconnection.',
        color: 'amber',
        timeout: 5000,
      })
      return
    }
    
    // Set loading state for this question
    const questionKey = question.id || question.tempId || 'unknown'
    questionLoadingStates.value.set(questionKey, true)
    isSaving.value = true
    
    // Store original state for rollback
    const originalQuestion = { ...question }
    const questionIndex = questions.value.findIndex(q => 
      (q.tempId && q.tempId === question.tempId) || (q.id && q.id === question.id)
    )
    
    try {
      // Determine if this is a new question (needs CREATE) or existing (needs UPDATE)
      const isNewQuestion = question.isNew || !question.id || question.id.startsWith('temp-')
      
      if (isNewQuestion) {
        // CREATE new question via WebSocket
        console.log('[FormBuilder] Creating question via WebSocket:', question)
        
        // Prepare options for nested creation
        const optionsPayload = (question.options || []).map((opt, idx) => {
          if (typeof opt === 'string') {
            return {
              option_text: opt,
              order: idx
            } as any
          }
          return {
            option_text: opt.option_text || opt,
            order: idx
          } as any
        })
        
        const createPayload: any = {
          question_title: question.question_title!,
          question_body: question.question_body || '',
          question_type: question.question_type as any,
          event: eventIntId.value!,
          order: question.order ?? questions.value.length,
          required: question.required || false,
          options: optionsPayload,
        }
        
        // Include min_value and max_value for slider questions
        if (question.question_type === 'slider') {
          createPayload.min_value = question.min_value
          createPayload.max_value = question.max_value
        }
        
        const result = await ws.createQuestion(createPayload)
        
        console.log('[FormBuilder] Question created:', result)
        
        // Update local state with server response (will be confirmed by WebSocket broadcast)
        if (questionIndex !== -1 && result?.question) {
          questions.value[questionIndex] = {
            ...result.question,
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
        // UPDATE existing question via WebSocket
        console.log('[FormBuilder] Updating question via WebSocket:', question)
        
        // Prepare options payload
        const optionsPayload = (question.options || []).map((opt, idx) => {
          if (typeof opt === 'string') {
            return {
              option_text: opt,
              order: idx
            }
          }
          const payload: any = {
            option_text: opt.option_text || opt,
            order: idx
          }
          if (opt.id) {
            payload.id = opt.id
          }
          return payload
        })
        
        const updatePayload: any = {
          question_title: question.question_title,
          question_body: question.question_body,
          question_type: question.question_type as any,
          order: question.order,
          required: question.required,
          options: optionsPayload as any,
        }
        
        // Include min_value and max_value for slider questions
        if (question.question_type === 'slider') {
          updatePayload.min_value = question.min_value
          updatePayload.max_value = question.max_value
        }
        
        const result = await ws.updateQuestion(question.id as string, updatePayload)
        
        console.log('[FormBuilder] Question updated:', result)
        
        // Mark as no longer new after successful update
        if (questionIndex !== -1) {
          questions.value[questionIndex].isNew = false
        }
      }
      
      hasUnsavedChanges.value = false
    } catch (error: unknown) {
      console.error('[FormBuilder] Save question error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Rollback optimistic update on error
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
      // Clear loading state
      questionLoadingStates.value.set(questionKey, false)
      isSaving.value = false
    }
  }
  
  // Debounced save with 2 second delay
  const debouncedSave = useDebounceFn(saveQuestion, 2000)
  
  // Save all questions order via WebSocket
  const saveQuestionsOrder = async () => {
    // Check WebSocket connection
    if (!ws.isConnected.value) {
      toast.add({
        title: 'Not Connected',
        description: 'Cannot save order - WebSocket connection lost',
        color: 'amber',
      })
      return
    }
    
    isSaving.value = true
    
    try {
      const questionsToReorder = questions.value.filter(q => {
        const hasValidId = q.id && 
                          typeof q.id === 'string' && 
                          !q.id.startsWith('temp-') &&
                          !q.isNew
        return hasValidId
      })
      
      console.log('[FormBuilder] Reordering questions via WebSocket:', questionsToReorder)
      
      await ws.reorderQuestions(
        questionsToReorder.map((q, index) => ({ id: q.id as string, order: index }))
      )
      
      console.log('[FormBuilder] Questions reordered successfully')
      
      // Update local state
      questions.value.forEach((q, index) => {
        q.order = index
      })
      
      hasUnsavedChanges.value = false
    } catch (error: any) {
      let errorMessage = 'An error occurred while saving order'
      if (error?.message) {
        errorMessage = error.message
      }
      
      toast.add({
        title: 'Failed to save order',
        description: errorMessage,
        color: 'red',
        timeout: 5000,
      })
    } finally {
      isSaving.value = false
    }
  }
  
  const debouncedSaveOrder = useDebounceFn(saveQuestionsOrder, 1000)
  
  // Add to history (for undo/redo)
  const addToHistory = () => {
    const state: UndoState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    
    undoStack.value.push(state)
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift()
    }
    
    // Clear redo stack when new action is performed
    redoStack.value = []
  }
  
  // Undo
  const undo = () => {
    if (undoStack.value.length === 0) return
    
    // Save current state to redo stack
    const currentState: UndoState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    redoStack.value.push(currentState)
    
    // Restore previous state
    const previousState = undoStack.value.pop()
    if (previousState) {
      questions.value = previousState.questions
      hasUnsavedChanges.value = true
    }
    
    toast.add({
      title: 'Undone',
      color: 'gray',
    })
  }
  
  // Redo
  const redo = () => {
    if (redoStack.value.length === 0) return
    
    // Save current state to undo stack
    const currentState: UndoState = {
      questions: JSON.parse(JSON.stringify(questions.value)),
      timestamp: Date.now(),
    }
    undoStack.value.push(currentState)
    
    // Restore next state
    const nextState = redoStack.value.pop()
    if (nextState) {
      questions.value = nextState.questions
      hasUnsavedChanges.value = true
    }
    
    toast.add({
      title: 'Redone',
      color: 'gray',
    })
  }
  
  // Add new question
  const addQuestion = (template?: any) => {
    addToHistory()
    
    const tempId = `temp-${Date.now()}`
    const questionType = template?.question_type || 'short_answer'
    const newQuestion: QuestionDraft = {
      tempId,
      question_title: template?.question_title || 'Untitled Question',
      question_body: template?.question_body || '',
      question_type: questionType,
      required: template?.required || false,
      order: questions.value.length,
      options: template?.options || [],
      isNew: true,
      isExpanded: true,
      isEditing: true,
    }
    
    // Set defaults for slider questions
    if (questionType === 'slider') {
      newQuestion.min_value = template?.min_value ?? 0
      newQuestion.max_value = template?.max_value ?? 10
    }
    
    questions.value.push(newQuestion)
    selectedQuestion.value = newQuestion
    hasUnsavedChanges.value = true
    
    // Auto-save template questions (they have valid data)
    if (template && newQuestion.question_title && newQuestion.question_type) {
      // Use nextTick to ensure the question is added to the DOM first
      nextTick(() => {
        saveQuestion(newQuestion)
      })
    }
  }
  
  // Duplicate question
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
    
    // Insert after the original question
    const index = questions.value.findIndex(q => 
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )
    
    if (index !== -1) {
      questions.value.splice(index + 1, 0, duplicate)
      // Update order for subsequent questions
      questions.value.forEach((q, i) => {
        if (i > index) q.order = i
      })
    } else {
      questions.value.push(duplicate)
    }
    
    hasUnsavedChanges.value = true
    
    toast.add({
      title: 'Question duplicated',
      color: 'green',
    })
  }
  
  // Delete question via WebSocket
  const deleteQuestion = async (question: QuestionDraft) => {
    addToHistory()
    
    // Check if this is a new unsaved question
    const isUnsaved = !question.id || question.id.startsWith('temp-') || question.isNew
    
    if (isUnsaved) {
      // Just remove from local state if not saved yet
      const index = questions.value.findIndex(q => 
        (q.tempId && q.tempId === question.tempId) || (q.id && q.id === question.id)
      )
      if (index !== -1) {
        questions.value.splice(index, 1)
      }
      toast.add({
        title: 'Question removed',
        color: 'green',
        timeout: 2000,
      })
      return
    }
    
    // Check WebSocket connection
    if (!ws.isConnected.value) {
      toast.add({
        title: 'Not Connected',
        description: 'Cannot delete - WebSocket connection lost',
        color: 'amber',
      })
      // Revert history
      undo()
      return
    }
    
    try {
      console.log('[FormBuilder] Deleting question via WebSocket:', question.id)
      
      await ws.deleteQuestion(question.id as string)
      
      console.log('[FormBuilder] Question deleted successfully')
      
      // Remove from local state (will be confirmed by WebSocket broadcast)
      const index = questions.value.findIndex(q => q.id === question.id)
      if (index !== -1) {
        questions.value.splice(index, 1)
      }
      
      // Update order for remaining questions
      questions.value.forEach((q, i) => {
        q.order = i
      })
      
      hasUnsavedChanges.value = true
      debouncedSaveOrder()
      
      toast.add({
        title: 'Question deleted',
        color: 'green',
        timeout: 2000,
      })
    } catch (error) {
      console.error('[FormBuilder] Delete failed:', error)
      
      toast.add({
        title: 'Failed to delete question',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
        timeout: 5000,
      })
      
      // Revert history on error
      undo()
    }
  }
  
  // Update question (triggers auto-save only for existing questions)
  const updateQuestion = async (question: QuestionDraft, changes: Partial<QuestionDraft>) => {
    const index = questions.value.findIndex(q => 
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )
    
    if (index === -1) return
    
    // Apply changes optimistically
    Object.assign(questions.value[index], changes)
    
    // Validate and update field errors
    getQuestionFieldErrors(questions.value[index])
    
    hasUnsavedChanges.value = true
    
    // If new question (no server ID yet), don't call API
    if (question.isNew || !question.id || question.id.startsWith('temp-')) {
      return
    }
    
    // Don't auto-save if user is actively typing in a field for this question
    const questionId = question.id || question.tempId
    const isFieldFocused = focusedFields?.value && 
      Array.from(focusedFields.value).some(field => field.startsWith(String(questionId)))
    
    if (isFieldFocused) {
      return // Wait until blur to save
    }
    
    // Trigger debounced save with the updated question
    debouncedSave(questions.value[index])
  }
  
  // Toggle question expansion (saves new questions when collapsed)
  const toggleExpanded = async (question: QuestionDraft) => {
    const index = questions.value.findIndex(q => 
      (q.id && q.id === question.id) || (q.tempId && q.tempId === question.tempId)
    )
    
    if (index !== -1) {
      const willCollapse = questions.value[index].isExpanded
      
      // If collapsing a new question with valid data, save it first
      if (willCollapse && questions.value[index].isNew && 
          questions.value[index].question_title && 
          questions.value[index].question_type) {
        await saveQuestion(questions.value[index])
      }
      
      questions.value[index].isExpanded = !questions.value[index].isExpanded
    }
  }
  
  // Collapse all questions
  const collapseAll = () => {
    questions.value.forEach(q => {
      q.isExpanded = false
    })
  }
  
  // Expand all questions
  const expandAll = () => {
    questions.value.forEach(q => {
      q.isExpanded = true
    })
  }
  
  // Manual save all
  const saveAll = async () => {
    // First validate all questions for duplicates
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
      // Save all questions, but catch individual errors
      const promises = questions.value.map(q => 
        saveQuestion(q).catch(err => {
          hasErrors = true
          return null
        })
      )
      await Promise.all(promises)
      
      if (!hasErrors) {
        await saveQuestionsOrder()
        hasUnsavedChanges.value = false
        
        toast.add({
          title: 'All changes saved',
          color: 'green',
        })
      } else {
        toast.add({
          title: 'Some questions failed to save',
          description: 'Please check the errors and try again',
          color: 'red',
        })
      }
    } catch (error) {
      toast.add({
        title: 'Failed to save',
        description: 'An unexpected error occurred',
        color: 'red',
      })
    } finally {
      isSaving.value = false
    }
  }
  
  // Keyboard shortcuts
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
  
  // Setup keyboard listener
  onMounted(() => {
    window.addEventListener('keydown', handleKeyboardShortcut)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyboardShortcut)
  })
  
  // Show warning if disconnected
  watch(() => ws.isConnected.value, (connected, wasConnected) => {
    if (wasConnected && !connected) {
      toast.add({
        title: 'Connection Lost',
        description: 'Real-time updates paused. Waiting for reconnection...',
        color: 'amber',
        timeout: 5000,
      })
    } else if (!wasConnected && connected) {
      toast.add({
        title: 'Reconnected',
        description: 'Real-time updates restored',
        color: 'green',
        timeout: 3000,
      })
    }
  })
  
  return {
    // State
    questions,
    selectedQuestion,
    previewMode,
    isSaving,
    hasUnsavedChanges,
    questionTemplates,
    questionLoadingStates: readonly(questionLoadingStates),
    questionValidationErrors: readonly(questionValidationErrors),
    
    // Connection state
    isConnected: ws.isConnected,
    isConnecting: ws.isConnecting,
    
    // Validation
    validateQuestion,
    validateAllQuestions,
    getQuestionFieldErrors,
    getFieldError,
    
    // Undo/Redo
    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
    undo,
    redo,
    
    // Question actions
    addQuestion,
    duplicateQuestion,
    deleteQuestion,
    updateQuestion,
    toggleExpanded,
    collapseAll,
    expandAll,
    
    // Save actions
    saveQuestion,
    saveAll,
    saveQuestionsOrder,
    debouncedSave,
    debouncedSaveOrder,
    
    // Utils
    addToHistory,
  }
}
