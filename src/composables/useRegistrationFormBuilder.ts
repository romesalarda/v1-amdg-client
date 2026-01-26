import type { EventQuestion, EventQuestionOption } from '~/api/types.gen'
import { useDebounceFn } from '@vueuse/core'
import { useCreateEventQuestion, usePartialUpdateEventQuestion, useDeleteEventQuestion } from '~/composables/resources/events/eventQuestions'
import { useOptimisticUpdates } from './useOptimisticUpdates'
import { useAuthStore } from '~/stores/auth'

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
  operationId?: string  // Track optimistic operation
  [key: string]: any
}

interface UndoState {
  questions: QuestionDraft[]
  timestamp: number
}

export const useRegistrationFormBuilder = (eventIntId: Ref<number | undefined>) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { $api } = useNuxtApp()
  
  // Get current user for actor tracking
  const authStore = useAuthStore()
  const actorEmail = computed(() => authStore.user?.email || 'unknown')
  
  // Initialize mutations at top level (required for Vue Query)
  const createMutation = useCreateEventQuestion()
  const updateMutation = usePartialUpdateEventQuestion()
  const deleteMutation = useDeleteEventQuestion()
  
  // Optimistic updates manager
  const optimistic = useOptimisticUpdates<QuestionDraft>()
  
  // Per-question loading states
  const questionLoadingStates = ref<Map<string, boolean>>(new Map())
  
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
  
  // Save question to backend with optimistic updates (debounced)
  const saveQuestion = async (question: QuestionDraft) => {
    if (!question.question_title || !question.question_type) return
    
    // Validate eventId
    if (!eventIntId.value) {
      toast.add({
        title: 'Event not loaded',
        description: 'Cannot save question - event data not available',
        color: 'red',
      })
      return
    }
    
    // Set loading state for this question
    const questionKey = question.id || question.tempId || 'unknown'
    questionLoadingStates.value.set(questionKey, true)
    isSaving.value = true
    
    // Store original state for rollback
    const originalQuestion = { ...question }
    
    try {
      // Determine if this is a new question (needs CREATE) or existing (needs UPDATE)
      const isNewQuestion = question.isNew || !question.id || question.id.startsWith('temp-')
      
      if (isNewQuestion) {
        // CREATE new question with optimistic update
        const operationId = optimistic.addOperation(
          'create',
          question,
          originalQuestion,
          async () => {
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
            
            const result = await createMutation.mutateAsync({
              question_title: question.question_title!,
              question_body: question.question_body || '',
              question_type: question.question_type as any,
              event: eventIntId.value!,
              order: question.order ?? questions.value.length,
              required: question.required || false,
              options: optionsPayload, // Include nested options
            })
            
            // Update local state with server response (including UUID)
            const index = questions.value.findIndex(q => 
              q.tempId === question.tempId || q.id === question.id
            )
            if (index !== -1 && result?.data) {
              questions.value[index] = {
                ...result.data,
                isNew: false,
                isExpanded: question.isExpanded,
                isEditing: question.isEditing,
                options: (result.data as any).options || [],
              }
            }
            
            // Manual cache update
            queryClient.setQueryData(
              ['event-questions', { event__event_id: eventIntId.value }],
              (old: any) => {
                if (!old?.data?.results) return old
                return {
                  ...old,
                  data: {
                    ...old.data,
                    results: [...(old.data.results || []), result]
                  }
                }
              }
            )
            
            return result
          }
        )
        
        question.operationId = operationId
      } else {
        // UPDATE existing question with optimistic update
        const operationId = optimistic.addOperation(
          'update',
          question,
          originalQuestion,
          async () => {
            // Prepare options payload (only id, option_text, order)
            const optionsPayload = (question.options || []).map((opt, idx) => {
              if (typeof opt === 'string') {
                return {
                  option_text: opt,
                  order: idx
                }
              }
              // Only include id if it exists (for updates)
              const payload: any = {
                option_text: opt.option_text || opt,
                order: idx
              }
              if (opt.id) {
                payload.id = opt.id
              }
              return payload
            })
            
            await updateMutation.mutateAsync({
              questionId: question.id as string,
              body: {
                question_title: question.question_title,
                question_body: question.question_body,
                question_type: question.question_type as any,
                order: question.order,
                required: question.required,
                options: optionsPayload as any,
              } as any,
            })
            
            // Manual cache update
            queryClient.setQueryData(
              ['event-questions', { event__event_id: eventIntId.value }],
              (old: any) => {
                if (!old?.data?.results) return old
                return {
                  ...old,
                  data: {
                    ...old.data,
                    results: old.data.results.map((q: any) =>
                      q.id === question.id ? { ...q, options: optionsPayload } : q
                    )
                  }
                }
              }
            )
            
            // Mark as no longer new after successful update
            const index = questions.value.findIndex(q => q.id === question.id)
            if (index !== -1) {
              questions.value[index].isNew = false
            }
          }
        )
        
        question.operationId = operationId
      }
    } catch (error: unknown) {
      console.error('Save question error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.add({
        title: 'Save Failed',
        description: errorMessage,
        color: 'red',
      })
    } finally {
      // Clear loading state
      questionLoadingStates.value.set(questionKey, false)
      isSaving.value = false
    }
  }
  
  // Debounced save with 2 second delay
  const debouncedSave = useDebounceFn(saveQuestion, 2000)
  
  // Save all questions order
  const saveQuestionsOrder = async () => {
    isSaving.value = true
    try {
      // Two-phase update to avoid unique constraint violations:
      // Phase 1: Set all questions to temporary high orders (10000+)
      // Phase 2: Set questions to their final orders (0, 1, 2...)
      
      const questionsToUpdate = questions.value.filter(q => {
        const hasValidId = q.id && 
                          typeof q.id === 'string' && 
                          !q.id.startsWith('temp-') &&
                          !q.isNew
        return hasValidId
      })
      
      // Phase 1: Move to temporary high positive orders (avoids conflicts with final positions)
      const phase1Promises = questionsToUpdate.map((q, index) => {
        return updateMutation.mutateAsync({
          questionId: q.id as string,
          body: { order: 10000 + index }, // High positive number to avoid conflicts
        })
      })
      await Promise.all(phase1Promises)
      
      // Phase 2: Set final orders
      const phase2Promises = questionsToUpdate.map((q, index) => {
        return updateMutation.mutateAsync({
          questionId: q.id as string,
          body: { order: index },
        })
      })
      await Promise.all(phase2Promises)
      
      // Update local state
      questions.value.forEach((q, index) => {
        q.order = index
      })
      
      hasUnsavedChanges.value = false
      
      toast.add({
        title: 'Order saved',
        color: 'green',
      })
    } catch (error: any) {
      let errorMessage = 'An error occurred while saving order'
      if (error?.data?.non_field_errors) {
        errorMessage = Array.isArray(error.data.non_field_errors) 
          ? error.data.non_field_errors[0] 
          : error.data.non_field_errors
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.add({
        title: 'Failed to save order',
        description: errorMessage,
        color: 'red',
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
    const newQuestion: QuestionDraft = {
      tempId,
      question_title: template?.question_title || 'Untitled Question',
      question_body: template?.question_body || '',
      question_type: template?.question_type || 'short_answer',
      required: template?.required || false,
      order: questions.value.length,
      options: template?.options || [],
      isNew: true,
      isExpanded: true,
      isEditing: true,
    }
    
    questions.value.push(newQuestion)
    selectedQuestion.value = newQuestion
    hasUnsavedChanges.value = true
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
  
  // Delete question
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
      })
      return
    }
    
    try {
      await deleteMutation.mutateAsync(question.id as string)
      
      // Remove from local state
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
      })
    } catch (error) {
      toast.add({
        title: 'Failed to delete question',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
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
    
    hasUnsavedChanges.value = true
    
    // If new question (no server ID yet), don't call API
    if (question.isNew || !question.id || question.id.startsWith('temp-')) {
      return
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
  
  return {
    // State
    questions,
    selectedQuestion,
    previewMode,
    isSaving,
    hasUnsavedChanges,
    questionTemplates,
    questionLoadingStates: readonly(questionLoadingStates),
    
    // Optimistic updates
    optimistic,
    
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
