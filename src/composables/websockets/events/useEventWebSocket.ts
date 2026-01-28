import type { MaybeRef } from 'vue'
import type { WSUnsubscribe } from '~/types/websocket'
import { getWebSocketToken } from '~/utils/websocket-api'
import { useRealtimeConnection } from '../../useRealtimeConnection'

/**
 * Event-specific types for question WebSocket messages
 */
export interface QuestionCreatedData {
  question: {
    id: string
    text: string
    author: {
      id: string
      name: string
      email: string
    }
    created_at: string
    upvotes: number
    is_answered: boolean
  }
}

export interface QuestionUpdatedData {
  question: {
    id: string
    text?: string
    is_answered?: boolean
    upvotes?: number
  }
}

export interface QuestionDeletedData {
  question_id: string
}

export interface QuestionUpvotedData {
  question_id: string
  upvotes: number
  user_id: string
}

/**
 * WebSocket connection manager for real-time event question updates
 * 
 * This composable provides a specialized WebSocket connection for event questions,
 * handling token management and providing type-safe event handlers.
 * 
 * @param eventId - Event ID to connect WebSocket for
 * @returns WebSocket connection state and methods with event-specific typing
 * 
 * @example
 * ```ts
 * const ws = useEventWebSocket(eventId)
 * 
 * // Subscribe to question events with type safety
 * const unsubscribe = ws.on<QuestionCreatedData>('question.created', (data) => {
 *   console.log('New question:', data.question.text)
 * })
 * 
 * // Check connection state
 * if (ws.isConnected.value) {
 *   console.log('Connected to event questions')
 * }
 * 
 * // Cleanup
 * onBeforeUnmount(() => unsubscribe())
 * ```
 */
/**
 * Pending request tracking for request/response correlation
 */
interface PendingRequest {
  resolve: (data: any) => void
  reject: (error: Error) => void
  timeout: ReturnType<typeof setTimeout>
  type: string
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function useEventWebSocket(eventId: MaybeRef<string>) {
  // Token management for event questions
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  
  // Pending requests map for request/response correlation
  const pendingRequests = ref<Map<string, PendingRequest>>(new Map())
  
  // Track last sent transaction ID for deduplication
  const lastSentTxnId = ref<string | null>(null)
  
  /**
   * Fetch WebSocket authentication token from API
   */
  async function fetchToken(): Promise<string> {
    try {
      const data = await getWebSocketToken(unref(eventId))
      
      // Store token and expiration
      token.value = data.token
      tokenExpiresAt.value = Date.now() + (data.expires_in * 1000)
      
      return data.token
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(`Token fetch failed: ${errorMsg}`)
    }
  }
  
  /**
   * Check if token needs refresh
   */
  function needsTokenRefresh(): boolean {
    if (!token.value || !tokenExpiresAt.value) return true
    
    // Refresh if token expires in less than 5 minutes
    const bufferMs = 5 * 60 * 1000
    return Date.now() > (tokenExpiresAt.value - bufferMs)
  }
  
  // Create base WebSocket connection using reusable composable
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/events/${unref(eventId)}/questions/`),
    token: computed(() => token.value),
    heartbeatInterval: 30000, // 30 seconds
    pongTimeout: 10000, // 10 seconds
    maxReconnectAttempts: 5,
    autoConnect: false, // Wait for token before connecting
    handleVisibilityChange: true,
    debug: false, // Set to true for debugging
    
    // Lifecycle callbacks
    onConnected: () => {
      console.log('[EventWebSocket] Connected to event questions:', unref(eventId))
    },
    onDisconnected: () => {
      console.log('[EventWebSocket] Disconnected from event questions')
      clearPendingRequests('WebSocket disconnected')
    },
    onError: (error) => {
      console.error('[EventWebSocket] Connection error:', error.message)
      clearPendingRequests(error.message)
    },
  })
  
  /**
   * Clear all pending requests with error
   */
  function clearPendingRequests(reason: string) {
    pendingRequests.value.forEach((request, txnId) => {
      clearTimeout(request.timeout)
      request.reject(new Error(`Request cancelled: ${reason}`))
    })
    pendingRequests.value.clear()
  }
  
  /**
   * Send WebSocket mutation and wait for response
   */
  function sendMutation<T = any>(type: string, data: any, txnId: string, timeoutMs: number = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!connection.isConnected.value) {
        reject(new Error('WebSocket not connected'))
        return
      }
      
      const timeout = setTimeout(() => {
        pendingRequests.value.delete(txnId)
        reject(new Error(`Request timeout after ${timeoutMs}ms`))
      }, timeoutMs)
      
      pendingRequests.value.set(txnId, { resolve, reject, timeout, type })
      lastSentTxnId.value = txnId
      
      connection.emit(type, { ...data, txn_id: txnId })
      console.log('[EventWebSocket] Sent mutation:', { type, txnId, data })
    })
  }
  
  /**
   * Handle response messages with txn_id
   */
  function handleResponse(eventType: string, data: any) {
    const txnId = data.txn_id
    if (!txnId) {
      console.warn('[EventWebSocket] Response without txn_id:', eventType, data)
      return
    }
    
    const request = pendingRequests.value.get(txnId)
    if (!request) {
      console.log('[EventWebSocket] Response for unknown txn_id:', txnId, eventType)
      return
    }
    
    clearTimeout(request.timeout)
    pendingRequests.value.delete(txnId)
    request.resolve(data)
    console.log('[EventWebSocket] Request completed:', { type: request.type, txnId, eventType })
  }
  
  /**
   * Handle error response with txn_id
   */
  function handleErrorResponse(data: any) {
    const txnId = data.txn_id
    if (!txnId) {
      console.error('[EventWebSocket] Error without txn_id:', data)
      return
    }
    
    const request = pendingRequests.value.get(txnId)
    if (!request) {
      console.error('[EventWebSocket] Error for unknown txn_id:', txnId, data)
      return
    }
    
    clearTimeout(request.timeout)
    pendingRequests.value.delete(txnId)
    request.reject(new Error(data.error || 'Operation failed'))
    console.error('[EventWebSocket] Request failed:', { type: request.type, txnId, error: data })
  }
  
  // Initialize token and connect on composable creation
  if (import.meta.client) {
    // Fetch token then connect
    fetchToken()
      .then(() => {
        console.log('[EventWebSocket] Token fetched, connecting...')
        connection.connect()
      })
      .catch(err => {
        console.error('[EventWebSocket] Failed to fetch initial token:', err)
      })
  }
  
  // Subscribe to response events
  if (import.meta.client) {
    connection.on('question.created', (data) => handleResponse('question.created', data))
    connection.on('question.updated', (data) => handleResponse('question.updated', data))
    connection.on('question.deleted', (data) => handleResponse('question.deleted', data))
    connection.on('question.reordered', (data) => handleResponse('question.reordered', data))
    connection.on('error', handleErrorResponse)
  }
  
  // Watch eventId changes and refresh token
  watch(() => unref(eventId), async (newId, oldId) => {
    if (newId !== oldId && newId) {
      console.log('[EventWebSocket] Event ID changed, fetching new token')
      clearPendingRequests('Event ID changed')
      try {
        await fetchToken()
      } catch (err) {
        console.error('[EventWebSocket] Failed to fetch token for new event:', err)
      }
    }
  })
  
  // Periodically check and refresh token before expiration
  if (import.meta.client) {
    const tokenRefreshInterval = setInterval(async () => {
      if (needsTokenRefresh() && connection.isConnected.value) {
        console.log('[EventWebSocket] Token expiring soon, refreshing...')
        try {
          await fetchToken()
          // Reconnect with new token
          connection.reconnect()
        } catch (err) {
          console.error('[EventWebSocket] Token refresh failed:', err)
        }
      }
    }, 60000) // Check every minute
    
    onBeforeUnmount(() => {
      clearInterval(tokenRefreshInterval)
      clearPendingRequests('Component unmounting')
    })
  }
  
  // Type-safe event handler registration
  // These provide convenience methods with proper typing for event-specific messages
  
  /**
   * Subscribe to question created events
   */
  function onQuestionCreated(handler: (data: QuestionCreatedData) => void): WSUnsubscribe {
    return connection.on<QuestionCreatedData>('question.created', handler)
  }
  
  /**
   * Subscribe to question updated events
   */
  function onQuestionUpdated(handler: (data: QuestionUpdatedData) => void): WSUnsubscribe {
    return connection.on<QuestionUpdatedData>('question.updated', handler)
  }
  
  /**
   * Subscribe to question deleted events
   */
  /**
   * Create question via WebSocket
   */
  async function createQuestion(data: {
    question_title: string
    question_body: string
    question_type: string
    event: number
    required: boolean
    order: number
    options?: any[]
  }): Promise<{ txn_id: string; question: any }> {
    const txnId = generateUUID()
    console.log('[EventWebSocket] Creating question:', { txnId, data })
    
    try {
      const response = await sendMutation('question.create', { data }, txnId)
      return { txn_id: txnId, ...response }
    } catch (error) {
      console.error('[EventWebSocket] Create question failed:', error)
      throw error
    }
  }
  
  /**
   * Update question via WebSocket
   */
  async function updateQuestion(questionId: string, data: any): Promise<{ txn_id: string; question: any }> {
    const txnId = generateUUID()
    console.log('[EventWebSocket] Updating question:', { questionId, txnId, data })
    
    try {
      const response = await sendMutation('question.update', { question_id: questionId, data }, txnId)
      return { txn_id: txnId, ...response }
    } catch (error) {
      console.error('[EventWebSocket] Update question failed:', error)
      throw error
    }
  }
  
  /**
   * Delete question via WebSocket
   */
  async function deleteQuestion(questionId: string): Promise<{ txn_id: string }> {
    const txnId = generateUUID()
    console.log('[EventWebSocket] Deleting question:', { questionId, txnId })
    
    try {
      await sendMutation('question.delete', { question_id: questionId }, txnId)
      return { txn_id: txnId }
    } catch (error) {
      console.error('[EventWebSocket] Delete question failed:', error)
      throw error
    }
  }
  
  /**
   * Reorder questions via WebSocket
   */
  async function reorderQuestions(questions: Array<{ id: string; order: number }>): Promise<{ txn_id: string }> {
    const txnId = generateUUID()
    console.log('[EventWebSocket] Reordering questions:', { txnId, questions })
    
    try {
      await sendMutation('question.reorder', { questions }, txnId)
      return { txn_id: txnId }
    } catch (error) {
      console.error('[EventWebSocket] Reorder questions failed:', error)
      throw error
    }
  }
  
  function onQuestionDeleted(handler: (data: QuestionDeletedData) => void): WSUnsubscribe {
    return connection.on<QuestionDeletedData>('question.deleted', handler)
  }
  
  /**
   * Subscribe to question upvoted events
   */
  function onQuestionUpvoted(handler: (data: QuestionUpvotedData) => void): WSUnsubscribe {
    return connection.on<QuestionUpvotedData>('question.upvoted', handler)
  }
  
  return {
    // Re-export all base connection functionality
    ...connection,
    
    // Event-specific convenience methods
    onQuestionCreated,
    onQuestionUpdated,
    onQuestionDeleted,
    onQuestionUpvoted,
    
    // WebSocket mutation methods
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    
    // Transaction tracking (for deduplication)
    lastSentTxnId: readonly(lastSentTxnId),
    
    // Token management (exposed for debugging/monitoring)
    token: readonly(token),
    tokenExpiresAt: readonly(tokenExpiresAt),
    refreshToken: fetchToken,
  }
}
