import type { MaybeRef } from 'vue'
import type { EventQuestion } from '~/api/types.gen'
import type {
  QuestionEventData,
  QuestionReorderedData,
  QuestionDeletedData,
} from '~/types/websocket'
import type { useEventWebSocket } from './useEventWebSocket'
import { eventQuestionsRetrieve } from '~/api/sdk.gen'
import { useAuthStore } from '~/stores/auth'

/**
 * Question synchronization composable for real-time updates
 * 
 * Manages synchronization between local question state and WebSocket updates,
 * handling conflicts when multiple users edit simultaneously.
 * 
 * @param eventId - Event ID to sync questions for
 * @param ws - WebSocket connection instance
 * @param externalQuestions - External questions ref to sync with
 * @returns Question sync state and methods
 * 
 * @example
 * ```ts
 * const ws = useEventWebSocket(eventId)
 * const { questions } = useRegistrationFormBuilder(eventId)
 * const sync = useQuestionSync(eventId, ws, questions)
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
export function useQuestionSync<T extends EventQuestion = EventQuestion>(
  eventId: MaybeRef<string>,
  ws: ReturnType<typeof useEventWebSocket>,
  externalQuestions: Ref<T[]> // Accept external questions ref with generic type
) {
  const toast = useToast()
  const authStore = useAuthStore()
  const currentUserEmail = computed(() => authStore.user?.email || null)
  
  // Use external questions ref instead of creating our own
  const questions = externalQuestions as Ref<any[]> // Type assertion for internal use
  const conflictingQuestions = ref<Set<string>>(new Set())
  
  // Presence tracking
  const activeUsers = ref<Array<{ id: number; email: string; name: string }>>([])
  const editingQuestions = ref<Set<string>>(new Set())
  const deletedQuestions = ref<Set<string>>(new Set()) // Track recently deleted to prevent re-adding
  
  // Track if we're performing an undo operation
  const isPerformingUndo = ref(false)
  
  // Track if we're in a bulk operation (suppress individual notifications)
  const isBulkOperation = ref(false)
  
  /**
   * Handle user presence events (joined/left)
   */
  function handleUserJoined(data: any) {
    const { user } = data
    if (!user || user.email === currentUserEmail.value) return
    
    const exists = activeUsers.value.some(u => u.id === user.id)
    if (!exists) {
      activeUsers.value.push(user)
      toast.add({
        title: 'User Joined',
        description: `${user.name} is now viewing this form`,
        icon: 'i-heroicons-user-plus',
        color: 'blue',
        timeout: 3000,
      })
    }
  }
  
  function handleUserLeft(data: any) {
    const { user } = data
    if (!user) return
    
    const index = activeUsers.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      activeUsers.value.splice(index, 1)
      toast.add({
        title: 'User Left',
        description: `${user.name} left`,
        icon: 'i-heroicons-user-minus',
        color: 'gray',
        timeout: 2000,
      })
    }
  }
  
  /**
   * Handle question created event from WebSocket
   */
  function handleQuestionCreated(data: QuestionEventData) {
    // Defensive check: ensure data exists and has required properties
    if (!data || !data.question) {
      console.warn('[QuestionSync] Received invalid question create data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question, actor } = data
    const isOwnAction = actor?.email === currentUserEmail.value
    
    console.log('[QuestionSync] handleQuestionCreated:', {
      questionId: question.id,
      questionTitle: question.question_title,
      actorEmail: actor?.email,
      currentUserEmail: currentUserEmail.value,
      isOwnAction,
      existingQuestions: questions.value.length
    })
    
    // Check if question already exists (optimistic create)
    const existingIndex = questions.value.findIndex(q => q.id === question.id)
    
    console.log('[QuestionSync] Existing check:', {
      existingIndex,
      existsById: existingIndex !== -1
    })
    
    if (existingIndex === -1) {
      // If this is our own action, the question is already in the array from optimistic update
      // It just might not have the server ID yet (race condition: WebSocket arrives before HTTP response)
      if (isOwnAction) {
        console.log('[QuestionSync] Own action - question already in array from optimistic update, skipping WebSocket add')
        
        // Try to find by tempId and update it with server data
        const tempIndex = questions.value.findIndex(q => q.tempId && !q.id)
        if (tempIndex !== -1) {
          console.log('[QuestionSync] Found temp question, updating with server ID')
          questions.value[tempIndex] = {
            ...questions.value[tempIndex],
            ...question,
            id: question.id,
            isNew: false,
          }
        } else {
          console.log('[QuestionSync] No temp question found - HTTP response likely already updated it')
        }
        return // Don't add duplicate - it's already there
      }
      
      // New question from another user - add to array
      console.log('[QuestionSync] Adding new question from another user')
      questions.value.push(question)
      
      // Sort by order
      questions.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      // Show notification
      toast.add({
        title: 'Question Added',
        description: `"${question.question_title}" was added by ${actor?.email || 'another admin'}`,
        color: 'blue',
        timeout: 4000,
        icon: 'i-heroicons-plus-circle',
      })
    } else {
      // Question already exists (from optimistic update) - update with server data
      console.log('[QuestionSync] Question already exists - updating with server data')
      const preservedState = {
        isExpanded: questions.value[existingIndex].isExpanded,
        isEditing: questions.value[existingIndex].isEditing,
      }
      questions.value[existingIndex] = {
        ...question,
        ...preservedState,
        isNew: false,
      }
    }
  }
  
  /**
   * Handle question updated event from WebSocket
   */
  function handleQuestionUpdated(data: QuestionEventData) {
    // Defensive check: ensure data exists and has required properties
    if (!data || !data.question) {
      console.warn('[QuestionSync] Received invalid question update data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question, actor } = data
    
    // Find question in local array
    const index = questions.value.findIndex(q => q.id === question.id)
    
    if (index === -1) {
      // Question doesn't exist locally
      // Check if it was recently deleted - don't re-add it
      if (deletedQuestions.value.has(question.id)) {
        console.log('[QuestionSync] Ignoring update for recently deleted question:', question.id)
        return
      }
      
      // Not deleted - must be new from another admin, add it
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
      // Not editing - silently merge changes
      questions.value[index] = question
      
      // Only show notification if not in bulk operation (like reordering)
      // This prevents notification spam when multiple questions update at once
    }
  }
  
  /**
   * Handle question deleted event from WebSocket
   */
  function handleQuestionDeleted(data: QuestionDeletedData) {
    // Defensive check: ensure data exists and has required properties
    if (!data || !data.question_id) {
      console.warn('[QuestionSync] Received invalid question delete data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question_id, actor } = data
    
    // Find and remove question
    const index = questions.value.findIndex(q => q.id === question_id)
    
    if (index !== -1) {
      const deletedQuestion = questions.value[index]
      
      // Add to deleted tracking to prevent re-adding
      deletedQuestions.value.add(question_id)
      
      // Clear from deleted tracking after 10 seconds (enough time for any pending WebSocket messages)
      setTimeout(() => {
        deletedQuestions.value.delete(question_id)
      }, 10000)
      
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
    // Defensive check
    if (!data || !data.question_ids) {
      console.warn('[QuestionSync] Received invalid reorder data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { question_ids, actor } = data
    
    // Set bulk operation flag to suppress individual update notifications
    isBulkOperation.value = true
    
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
    
    // Show single notification for reorder operation
    toast.add({
      title: 'Questions Reordered',
      description: actor ? `Reordered by ${actor}` : 'Question order updated',
      color: 'blue',
      timeout: 2000,
      icon: 'i-heroicons-arrows-up-down',
    })
    
    // Clear bulk operation flag after a short delay
    setTimeout(() => {
      isBulkOperation.value = false
    }, 1000)
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
      ws.on('user.joined', handleUserJoined),
      ws.on('user.left', handleUserLeft),
    )
    
    onBeforeUnmount(() => {
      unsubscribers.forEach(unsub => unsub())
    })
  })
  
  return {
    // State
    conflictingQuestions: readonly(conflictingQuestions),
    editingQuestions: readonly(editingQuestions),
    activeUsers: readonly(activeUsers),
    
    // Methods
    markAsEditing,
    markAsNotEditing,
    resolveConflict,
    setUndoMode,
    
    // Computed
    hasConflicts: computed(() => conflictingQuestions.value.size > 0),
  }
}
