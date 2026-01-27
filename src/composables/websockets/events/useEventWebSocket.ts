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
export function useEventWebSocket(eventId: MaybeRef<string>) {
  // Token management for event questions
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  
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
    },
    onError: (error) => {
      console.error('[EventWebSocket] Connection error:', error.message)
    },
  })
  
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
  
  // Watch eventId changes and refresh token
  watch(() => unref(eventId), async (newId, oldId) => {
    if (newId !== oldId && newId) {
      console.log('[EventWebSocket] Event ID changed, fetching new token')
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
    
    // Token management (exposed for debugging/monitoring)
    token: readonly(token),
    tokenExpiresAt: readonly(tokenExpiresAt),
    refreshToken: fetchToken,
  }
}
