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
    console.log('[QuestionSync] user.joined event:', { user, currentUser: currentUserEmail.value })
    
    if (!user || user.email === currentUserEmail.value) {
      console.log('[QuestionSync] Ignoring own join event')
      return
    }
    
    const exists = activeUsers.value.some(u => u.id === user.id)
    if (!exists) {
      activeUsers.value.push(user)
      console.log('[QuestionSync] Added user to activeUsers:', user)
      // No toast notification - presence is shown in the UI indicator
    } else {
      console.log('[QuestionSync] User already in activeUsers')
    }
  }
  
  /**
   * Handle presence list (sent when we first join)
   */
  function handlePresenceList(data: any) {
    const { users } = data
    console.log('[QuestionSync] Received presence.list:', { users, currentUser: currentUserEmail.value })
    
    if (!users || !Array.isArray(users)) {
      console.warn('[QuestionSync] Invalid presence list data:', data)
      return
    }
    
    // Filter out current user and populate activeUsers
    activeUsers.value = users.filter(u => u.email !== currentUserEmail.value)
    
    console.log('[QuestionSync] Active users after filtering:', activeUsers.value)
    // No notification - presence indicator in UI is sufficient
  }
  
  function handleUserLeft(data: any) {
    const { user } = data
    if (!user) return
    
    const index = activeUsers.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      activeUsers.value.splice(index, 1)
      // No notification - presence indicator updates automatically
    }
  }
  
  /**
   * Handle question created event from WebSocket
   */
  function handleQuestionCreated(data: QuestionEventData) {
    console.log('[QuestionSync] handleQuestionCreated called with data:', data)
    
    // Defensive check: ensure data exists and has required properties
    if (!data || !data.question) {
      console.warn('[QuestionSync] Received invalid question create data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) {
      console.log('[QuestionSync] Ignoring create during undo')
      return
    }
    
    const { question, actor } = data
    const isOwnAction = actor?.email === currentUserEmail.value
    
    console.log('[QuestionSync] Processing question create:', {
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
      
      // Only show notification if it's from another user
      if (!isOwnAction) {
        toast.add({
          title: 'Question Added',
          description: `"${question.question_title}" was added`,
          color: 'blue',
          timeout: 3000,
          icon: 'i-heroicons-plus-circle',
        })
      }
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
      const isOwnAction = actor?.email === currentUserEmail.value
      const oldOrder = questions.value[index].order
      const newOrder = question.order
      
      console.log('[QuestionSync] Updating question (not editing):', {
        questionId: question.id,
        isOwnAction,
        actor: actor?.email,
        currentUser: currentUserEmail.value,
        orderChanged: oldOrder !== newOrder,
        oldOrder,
        newOrder
      })
      
      questions.value[index] = question
      
      // Re-sort if order changed to maintain proper visual ordering
      if (oldOrder !== newOrder) {
        questions.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
      
      // No notification - content updates happen silently for better UX
      // Users can see the changes happening in real-time without notification spam
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
  function handleQuestionReordered(data: any) {
    console.log('[QuestionSync] handleQuestionReordered called with data:', data)
    
    // Defensive check - backend sends question_ids in question.question_ids
    const question_ids = data?.question?.question_ids
    if (!question_ids || !Array.isArray(question_ids)) {
      console.warn('[QuestionSync] Invalid reorder data:', data)
      return
    }
    
    // Ignore our own changes during undo
    if (isPerformingUndo.value) return
    
    const { actor } = data
    const isOwnAction = actor?.email === currentUserEmail.value
    
    console.log('[QuestionSync] Processing reorder:', {
      questionCount: question_ids.length,
      actor: actor?.email,
      currentUser: currentUserEmail.value,
      isOwnAction
    })
    
    // Ignore our own reorder actions
    if (isOwnAction) {
      console.log('[QuestionSync] Ignoring own reorder action')
      return
    }
    
    // Set bulk operation flag to suppress individual update notifications
    isBulkOperation.value = true
    
    console.log('[QuestionSync] Current order:', questions.value.map(q => ({ id: q.id, order: q.order })))
    console.log('[QuestionSync] New order from server:', question_ids)
    
    // Create new array in the correct order to force Vue reactivity
    const reorderedQuestions: EventQuestion[] = []
    
    question_ids.forEach((id: string, index: number) => {
      const question = questions.value.find(q => q.id === id)
      if (question) {
        // Create new object to force reactivity
        reorderedQuestions.push({ ...question, order: index })
      }
    })
    
    // Add any questions not in the reorder list (shouldn't happen)
    questions.value.forEach(q => {
      if (!question_ids.includes(q.id)) {
        reorderedQuestions.push({ ...q })
      }
    })
    
    console.log('[QuestionSync] Reordered array:', reorderedQuestions.map(q => ({ id: q.id, order: q.order })))
    
    // Replace the entire array to trigger Vue reactivity
    questions.value.splice(0, questions.value.length, ...reorderedQuestions)
    
    console.log('[QuestionSync] Questions after splice:', questions.value.map(q => ({ id: q.id, order: q.order })))
    
    // No notification - visual reordering is sufficient feedback
    
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
  
  // Subscribe to WebSocket events IMMEDIATELY (not in onMounted)
  // This prevents race condition where messages arrive before handlers are registered
  console.log('[QuestionSync] Registering WebSocket event handlers')
  
  const unsubscribers: (() => void)[] = [
    ws.on('question.created', handleQuestionCreated),
    ws.on('question.updated', handleQuestionUpdated),
    ws.on('question.deleted', handleQuestionDeleted),
    ws.on('question.reordered', handleQuestionReordered),
    ws.on('user.joined', handleUserJoined),
    ws.on('user.left', handleUserLeft),
    ws.on('presence.list', handlePresenceList),
  ]
  
  console.log('[QuestionSync] Registered', unsubscribers.length, 'event handlers')
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    console.log('[QuestionSync] Cleaning up event handlers')
    unsubscribers.forEach(unsub => unsub())
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
