import type { MaybeRef } from 'vue'
import type {
  WSConnectionState,
  WSMessage,
  WSMessageHandler,
  WSUnsubscribe,
  ConnectionMessage,
  ErrorMessage,
  PingMessage,
  PongMessage,
} from '~/types/websocket'
import { getWebSocketToken } from '~/utils/websocket-api'

/**
 * Calculate exponential backoff delay for reconnection
 * @param attempt - Current retry attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function getReconnectDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  return Math.min(1000 * Math.pow(2, attempt), 30000)
}

/**
 * WebSocket connection manager for real-time event updates
 * 
 * @param eventId - Event ID to connect WebSocket for
 * @returns WebSocket connection state and methods
 * 
 * @example
 * ```ts
 * const ws = useEventWebSocket(eventId)
 * 
 * // Subscribe to question events
 * const unsubscribe = ws.on('question.created', (data) => {
 *   console.log('New question:', data.question)
 * })
 * 
 * // Cleanup
 * onBeforeUnmount(() => unsubscribe())
 * ```
 */
export function useEventWebSocket(eventId: MaybeRef<string>) {
  const config = useRuntimeConfig()
  const toast = useToast()
  
  // Connection state
  const connectionState = ref<WSConnectionState>('disconnected')
  const socket = ref<WebSocket | null>(null)
  const error = ref<Error | null>(null)
  const lastMessage = ref<WSMessage | null>(null)
  
  // Token management
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  
  // Message handlers registry
  const messageHandlers = new Map<string, Set<WSMessageHandler>>()
  
  // Reconnection state
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let isManualDisconnect = false
  
  // Heartbeat state
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null
  let lastPongReceived = Date.now()
  const heartbeatIntervalMs = 30000 // 30 seconds
  const pongTimeoutMs = 10000 // 10 seconds
  
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
      error.value = new Error(`Token fetch failed: ${errorMsg}`)
      throw error.value
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
  
  /**
   * Start heartbeat mechanism
   */
  function startHeartbeat() {
    stopHeartbeat()
    
    heartbeatInterval = setInterval(() => {
      if (socket.value?.readyState === WebSocket.OPEN) {
        // Send ping
        const ping: PingMessage = {
          type: 'ping',
          timestamp: new Date().toISOString(),
        }
        socket.value.send(JSON.stringify(ping))
        
        // Check if we received pong recently
        const timeSinceLastPong = Date.now() - lastPongReceived
        if (timeSinceLastPong > pongTimeoutMs + heartbeatIntervalMs) {
          console.warn('[WebSocket] No pong received, reconnecting...')
          reconnect()
        }
      }
    }, heartbeatIntervalMs)
  }
  
  /**
   * Stop heartbeat mechanism
   */
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }
  
  /**
   * Connect to WebSocket server
   */
  async function connect() {
    // Prevent multiple simultaneous connections
    if (connectionState.value === 'connecting' || connectionState.value === 'connected') {
      return
    }
    
    connectionState.value = 'connecting'
    error.value = null
    isManualDisconnect = false
    
    try {
      // Fetch or refresh token if needed
      if (needsTokenRefresh()) {
        await fetchToken()
      }
      
      // Build WebSocket URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const apiBaseUrl = (config.public.apiBaseUrl as string | undefined)
      const wsHost = apiBaseUrl?.replace(/^https?:\/\//, '') || 'localhost:8000'
      const wsUrl = `${wsProtocol}//${wsHost}/ws/events/${unref(eventId)}/questions/?token=${token.value}`
      
      // Create WebSocket connection
      socket.value = new WebSocket(wsUrl)
      
      // Connection opened
      socket.value.onopen = () => {
        connectionState.value = 'connected'
        reconnectAttempts = 0
        lastPongReceived = Date.now()
        
        console.log('[WebSocket] Connected to event:', unref(eventId))
        
        // Start heartbeat
        startHeartbeat()
        
        // Show success toast (only after reconnection)
        if (reconnectAttempts > 0) {
          toast.add({
            title: 'Reconnected',
            description: 'Real-time updates restored',
            color: 'green',
            timeout: 3000,
          })
        }
      }
      
      // Message received
      socket.value.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          lastMessage.value = message
          
          // Handle pong
          if (message.type === 'pong') {
            lastPongReceived = Date.now()
            return
          }
          
          // Handle connection confirmation
          if (message.type === 'connected') {
            const connMsg = message as unknown as ConnectionMessage
            console.log('[WebSocket] Connection confirmed for user:', connMsg.user.email)
            return
          }
          
          // Handle errors
          if (message.type === 'error') {
            const errMsg = message as unknown as ErrorMessage
            console.error('[WebSocket] Server error:', errMsg.message)
            error.value = new Error(errMsg.message)
            return
          }
          
          // Dispatch to registered handlers
          const handlers = messageHandlers.get(message.type)
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(message.data)
              } catch (err) {
                console.error('[WebSocket] Handler error:', err)
              }
            })
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }
      
      // Connection error
      socket.value.onerror = (event) => {
        console.error('[WebSocket] Connection error:', event)
        error.value = new Error('WebSocket connection error')
        connectionState.value = 'error'
      }
      
      // Connection closed
      socket.value.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason)
        
        stopHeartbeat()
        socket.value = null
        
        if (!isManualDisconnect && connectionState.value !== 'disconnecting') {
          connectionState.value = 'disconnected'
          
          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = getReconnectDelay(reconnectAttempts)
            console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
            
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++
              reconnect()
            }, delay)
          } else {
            console.error('[WebSocket] Max reconnection attempts reached')
            connectionState.value = 'error'
            error.value = new Error('Failed to reconnect after multiple attempts')
            
            toast.add({
              title: 'Connection Lost',
              description: 'Unable to restore real-time updates. Please refresh the page.',
              color: 'red',
              timeout: 10000,
            })
          }
        } else {
          connectionState.value = 'disconnected'
        }
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      error.value = new Error(`Connection failed: ${errorMsg}`)
      connectionState.value = 'error'
      
      console.error('[WebSocket] Connect error:', error.value)
      
      // Retry connection
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = getReconnectDelay(reconnectAttempts)
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++
          connect()
        }, delay)
      }
    }
  }
  
  /**
   * Reconnect to WebSocket (clears reconnect attempts)
   */
  async function reconnect() {
    disconnect()
    await nextTick()
    connect()
  }
  
  /**
   * Disconnect from WebSocket server
   */
  function disconnect() {
    isManualDisconnect = true
    connectionState.value = 'disconnecting'
    
    // Clear reconnection timeout
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    
    // Stop heartbeat
    stopHeartbeat()
    
    // Close socket
    if (socket.value) {
      socket.value.close(1000, 'Manual disconnect')
      socket.value = null
    }
    
    connectionState.value = 'disconnected'
    reconnectAttempts = 0
  }
  
  /**
   * Subscribe to WebSocket message type
   * @param eventType - Message type to listen for
   * @param handler - Callback function
   * @returns Unsubscribe function
   */
  function on<T = any>(eventType: string, handler: WSMessageHandler<T>): WSUnsubscribe {
    if (!messageHandlers.has(eventType)) {
      messageHandlers.set(eventType, new Set())
    }
    
    messageHandlers.get(eventType)!.add(handler as WSMessageHandler)
    
    // Return unsubscribe function
    return () => {
      const handlers = messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler as WSMessageHandler)
        if (handlers.size === 0) {
          messageHandlers.delete(eventType)
        }
      }
    }
  }
  
  /**
   * Send message through WebSocket
   * @param message - Message to send
   */
  function send(message: any) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send message - not connected')
    }
  }
  
  // Auto-connect on mount
  onMounted(() => {
    connect()
  })
  
  // Disconnect on unmount
  onBeforeUnmount(() => {
    disconnect()
  })
  
  // Reconnect when eventId changes
  watch(() => unref(eventId), (newId, oldId) => {
    if (newId !== oldId && newId) {
      disconnect()
      nextTick(() => connect())
    }
  })
  
  // Computed helpers
  const isConnected = computed(() => connectionState.value === 'connected')
  const isConnecting = computed(() => connectionState.value === 'connecting')
  const isDisconnected = computed(() => connectionState.value === 'disconnected')
  const hasError = computed(() => connectionState.value === 'error')
  
  return {
    // State
    connectionState: readonly(connectionState),
    error: readonly(error),
    lastMessage: readonly(lastMessage),
    
    // Computed
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    
    // Methods
    connect,
    disconnect,
    reconnect,
    on,
    send,
  }
}
