import type { MaybeRef } from 'vue'
import type { EventQuestion } from '~/api/types.gen'
import type {
  QuestionEventData,
  QuestionReorderedData,
  QuestionDeletedData,
} from '~/types/websocket'
import type { useEventWebSocket } from './useEventWebSocket'
import { eventQuestionsRetrieve } from '~/api/sdk.gen'

/**
 * Question synchronization composable for real-time updates
 * 
 * Manages synchronization between local question state and WebSocket updates,
 * handling conflicts when multiple users edit simultaneously.
 * 
 * @param eventId - Event ID to sync questions for
 * @param ws - WebSocket connection instance
 * @returns Question sync state and methods
 * 
 * @example
 * ```ts
 * const ws = useEventWebSocket(eventId)
 * const sync = useQuestionSync(eventId, ws)
 * 
 * // Mark question as being edited
 * sync.markAsEditing(questionId)
 * 
 * // When done editing
 * sync.markAsNotEditing(questionId)
 * 
 * // Handle conflicts
 * sync.resolveConflict(questionId, 'keep') // or 'refresh'
 * ```
 */
export function useQuestionSync(
  eventId: MaybeRef<string>,
  ws: ReturnType<typeof useEventWebSocket>
) {
  const toast = useToast()
  
  // Local state
  const questions = ref<EventQuestion[]>([])
  const conflictingQuestions = ref<Set<string>>(new Set())
  const editingQuestions = ref<Set<string>>(new Set())
  
  // Track if we're performing an undo operation
  const isPerformingUndo = ref(false)
  
  /**
   * Handle question created event from WebSocket
   */
  function handleQuestionCreated(data: QuestionEventData) {
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question } = data
    
    // Check if question already exists (optimistic create)
    const existingIndex = questions.value.findIndex(q => q.id === question.id)
    
    if (existingIndex === -1) {
      // New question from another user - add to array
      questions.value.push(question)
      
      // Sort by order
      questions.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      // Show notification
      toast.add({
        title: 'Question Added',
        description: `"${question.question_title}" was added by ${data.actor?.email || 'another admin'}`,
        color: 'blue',
        timeout: 4000,
        icon: 'i-heroicons-plus-circle',
      })
    } else {
      // Question already exists (from optimistic update) - update with server data
      questions.value[existingIndex] = question
    }
  }
  
  /**
   * Handle question updated event from WebSocket
   */
  function handleQuestionUpdated(data: QuestionEventData) {
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question, actor } = data
    
    // Find question in local array
    const index = questions.value.findIndex(q => q.id === question.id)
    
    if (index === -1) {
      // Question doesn't exist locally - might have been deleted, add it back
      questions.value.push(question)
      questions.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      return
    }
    
    // Check if user is currently editing this question
    const isEditing = editingQuestions.value.has(question.id)
    
    if (isEditing) {
      // User is editing - create conflict
      conflictingQuestions.value.add(question.id)
      
      // Show conflict warning
      toast.add({
        title: 'Question Updated by Another Admin',
        description: `"${question.question_title}" was modified by ${actor?.email || 'another admin'} while you were editing.`,
        color: 'amber',
        timeout: 0, // Don't auto-dismiss
        actions: [
          {
            label: 'View Changes',
            click: () => {
              // Store the remote version for comparison
              const localQuestion = questions.value[index]
              const remoteQuestion = question
              
              // Show diff modal or side-by-side comparison
              // For now, just log the differences
              console.log('Local:', localQuestion)
              console.log('Remote:', remoteQuestion)
            },
          },
          {
            label: 'Keep Mine',
            click: () => {
              resolveConflict(question.id, 'keep')
            },
          },
          {
            label: 'Use Theirs',
            click: () => {
              resolveConflict(question.id, 'refresh')
            },
          },
        ],
      })
    } else {
      // Not editing - safely merge changes
      questions.value[index] = question
      
      // Show subtle notification
      toast.add({
        title: 'Question Updated',
        description: `"${question.question_title}" was updated`,
        color: 'blue',
        timeout: 3000,
        icon: 'i-heroicons-arrow-path',
      })
    }
  }
  
  /**
   * Handle question deleted event from WebSocket
   */
  function handleQuestionDeleted(data: QuestionDeletedData) {
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question_id, actor } = data
    
    // Find and remove question
    const index = questions.value.findIndex(q => q.id === question_id)
    
    if (index !== -1) {
      const deletedQuestion = questions.value[index]
      
      // Check if user was editing
      const wasEditing = editingQuestions.value.has(question_id)
      
      // Remove from arrays
      questions.value.splice(index, 1)
      conflictingQuestions.value.delete(question_id)
      editingQuestions.value.delete(question_id)
      
      // Show notification
      if (wasEditing) {
        toast.add({
          title: 'Question Deleted',
          description: `"${deletedQuestion.question_title}" was deleted by ${actor?.email || 'another admin'} while you were editing it.`,
          color: 'red',
          timeout: 6000,
          icon: 'i-heroicons-trash',
        })
      } else {
        toast.add({
          title: 'Question Deleted',
          description: `"${deletedQuestion.question_title}" was deleted`,
          color: 'orange',
          timeout: 4000,
          icon: 'i-heroicons-trash',
        })
      }
    }
  }
  
  /**
   * Handle question reordered event from WebSocket
   */
  function handleQuestionReordered(data: QuestionReorderedData) {
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question_ids } = data
    
    // Reorder questions to match server order
    const orderedQuestions: EventQuestion[] = []
    
    question_ids.forEach((id, index) => {
      const question = questions.value.find(q => q.id === id)
      if (question) {
        orderedQuestions.push({ ...question, order: index })
      }
    })
    
    // Add any questions not in the reorder list (shouldn't happen)
    questions.value.forEach(q => {
      if (!question_ids.includes(q.id)) {
        orderedQuestions.push(q)
      }
    })
    
    questions.value = orderedQuestions
  }
  
  /**
   * Mark question as being edited by current user
   */
  function markAsEditing(questionId: string) {
    editingQuestions.value.add(questionId)
  }
  
  /**
   * Mark question as no longer being edited by current user
   */
  function markAsNotEditing(questionId: string) {
    editingQuestions.value.delete(questionId)
  }
  
  /**
   * Resolve conflict for a question
   * @param questionId - Question ID with conflict
   * @param action - 'keep' to keep local changes, 'refresh' to use server version
   */
  async function resolveConflict(questionId: string, action: 'keep' | 'refresh') {
    conflictingQuestions.value.delete(questionId)
    
    if (action === 'refresh') {
      // Fetch latest from server
      try {
        const { data, error } = await eventQuestionsRetrieve({
          path: { id: questionId },
        })
        
        if (error || !data) {
          throw new Error('Failed to fetch question')
        }
        
        // Update local state
        const index = questions.value.findIndex(q => q.id === questionId)
        if (index !== -1) {
          questions.value[index] = data
        }
        
        toast.add({
          title: 'Changes Refreshed',
          description: 'Question updated with latest version',
          color: 'green',
          timeout: 3000,
        })
      } catch (err) {
        console.error('Failed to refresh question:', err)
        toast.add({
          title: 'Refresh Failed',
          description: 'Could not fetch latest question data',
          color: 'red',
          timeout: 5000,
        })
      }
    } else {
      // Keep local changes - just remove from conflicts
      toast.add({
        title: 'Keeping Your Changes',
        description: 'Your local changes will be preserved',
        color: 'blue',
        timeout: 3000,
      })
    }
  }
  
  /**
   * Initialize local questions from provided data
   */
  function setQuestions(newQuestions: EventQuestion[]) {
    questions.value = [...newQuestions].sort((a, b) => (a.order || 0) - (b.order || 0))
  }
  
  /**
   * Set undo operation flag
   */
  function setUndoMode(enabled: boolean) {
    isPerformingUndo.value = enabled
  }
  
  // Subscribe to WebSocket events
  onMounted(() => {
    const unsubscribers: (() => void)[] = []
    
    unsubscribers.push(
      ws.on('question.created', handleQuestionCreated),
      ws.on('question.updated', handleQuestionUpdated),
      ws.on('question.deleted', handleQuestionDeleted),
      ws.on('question.reordered', handleQuestionReordered),
    )
    
    onBeforeUnmount(() => {
      unsubscribers.forEach(unsub => unsub())
    })
  })
  
  return {
    // State
    questions,
    conflictingQuestions: readonly(conflictingQuestions),
    editingQuestions: readonly(editingQuestions),
    
    // Methods
    markAsEditing,
    markAsNotEditing,
    resolveConflict,
    setQuestions,
    setUndoMode,
    
    // Computed
    hasConflicts: computed(() => conflictingQuestions.value.size > 0),
  }
}
