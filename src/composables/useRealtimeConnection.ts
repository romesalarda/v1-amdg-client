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

/**
 * Configuration options for realtime WebSocket connection
 */
export interface RealtimeConnectionOptions {
  /**
   * WebSocket URL (can be relative like /ws/... or absolute)
   * Can be reactive for dynamic URL changes
   */
  url: MaybeRef<string>
  
  /**
   * Authentication token for WebSocket connection
   * Token is sent via 'authenticate' message after connection opens
   * Can be reactive to handle token refresh
   */
  token: MaybeRef<string | null>
  
  /**
   * Interval between heartbeat pings in milliseconds
   * @default 30000 (30 seconds)
   */
  heartbeatInterval?: number
  
  /**
   * Maximum time to wait for pong response before reconnecting (ms)
   * @default 10000 (10 seconds)
   */
  pongTimeout?: number
  
  /**
   * Initial reconnection delay in milliseconds
   * Delay increases exponentially with each attempt
   * @default 1000 (1 second)
   */
  reconnectDelay?: number
  
  /**
   * Maximum number of reconnection attempts before giving up
   * @default 5
   */
  maxReconnectAttempts?: number
  
  /**
   * Whether to automatically connect on composable initialization
   * @default true
   */
  autoConnect?: boolean
  
  /**
   * Whether to automatically reconnect on page visibility change
   * @default true
   */
  handleVisibilityChange?: boolean
  
  /**
   * Custom function to build WebSocket URL
   * Useful for adding query parameters or custom logic
   * @param url - Base URL from options
   * @returns Complete WebSocket URL
   */
  buildUrl?: (url: string) => string
  
  /**
   * Callback fired when connection is established and authenticated
   */
  onConnected?: () => void
  
  /**
   * Callback fired when connection is lost
   */
  onDisconnected?: () => void
  
  /**
   * Callback fired on connection error
   */
  onError?: (error: Error) => void
  
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

/**
 * Calculate exponential backoff delay for reconnection
 * @param attempt - Current retry attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @returns Delay in milliseconds with exponential backoff (max 30s)
 */
function getReconnectDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff: baseDelay, 2x, 4x, 8x, 16x, max 30s
  return Math.min(baseDelay * Math.pow(2, attempt), 30000)
}

/**
 * Production-grade WebSocket connection composable for real-time features
 * 
 * This composable provides a reusable foundation for any WebSocket connection with:
 * - Automatic reconnection with exponential backoff
 * - JWT token injection via authentication message
 * - Heartbeat/ping mechanism to keep connection alive
 * - Connection state management
 * - Page visibility handling (pause/resume)
 * - Type-safe message handler registry
 * - Comprehensive error handling and logging
 * - Memory leak prevention with proper cleanup
 * 
 * @param options - Connection configuration options
 * @returns Connection state, methods, and handler registry
 * 
 * @example
 * ```ts
 * // Basic usage
 * const connection = useRealtimeConnection({
 *   url: '/ws/chat/room-123/',
 *   token: accessToken
 * })
 * 
 * // Subscribe to messages
 * const unsubscribe = connection.on('message.new', (data) => {
 *   console.log('New message:', data)
 * })
 * 
 * // Cleanup
 * onBeforeUnmount(() => unsubscribe())
 * ```
 * 
 * @example
 * ```ts
 * // Advanced usage with custom configuration
 * const connection = useRealtimeConnection({
 *   url: computed(() => `/ws/game/${gameId.value}/`),
 *   token: computed(() => authStore.token),
 *   heartbeatInterval: 15000,
 *   maxReconnectAttempts: 10,
 *   autoConnect: false,
 *   onConnected: () => {
 *     console.log('Game connection ready')
 *   },
 *   debug: true
 * })
 * 
 * // Manual connection control
 * await connection.connect()
 * connection.disconnect()
 * ```
 */
export function useRealtimeConnection(options: RealtimeConnectionOptions) {
  const config = useRuntimeConfig()
  const toast = useToast()
  
  // Extract and set defaults
  const {
    url,
    token,
    heartbeatInterval = 30000,
    pongTimeout = 10000,
    reconnectDelay = 1000,
    maxReconnectAttempts = 5,
    autoConnect = true,
    handleVisibilityChange = true,
    buildUrl,
    onConnected,
    onDisconnected,
    onError,
    debug = false,
  } = options
  
  // Connection state
  const connectionState = ref<WSConnectionState>('disconnected')
  const socket = ref<WebSocket | null>(null)
  const error = ref<Error | null>(null)
  const lastMessage = ref<WSMessage | null>(null)
  
  // Message handlers registry
  const messageHandlers = new Map<string, Set<WSMessageHandler>>()
  
  // Reconnection state
  let reconnectAttempts = 0
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let isManualDisconnect = false
  
  // Heartbeat state
  let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null
  let lastPongReceived = Date.now()
  
  /**
   * Log debug message if debug mode is enabled
   */
  function log(...args: any[]) {
    if (debug) {
      console.log('[WS]', ...args)
    }
  }
  
  /**
   * Log warning message
   */
  function warn(...args: any[]) {
    console.warn('[WS]', ...args)
  }
  
  /**
   * Log error message
   */
  function logError(...args: any[]) {
    console.error('[WS]', ...args)
  }
  
  /**
   * Build complete WebSocket URL from configuration
   */
  function constructWebSocketUrl(): string {
    const baseUrl = unref(url)
    
    // Use custom URL builder if provided
    if (buildUrl) {
      return buildUrl(baseUrl)
    }
    
    // Handle relative URLs
    if (baseUrl.startsWith('/ws/')) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const apiBaseUrl = (config.public.apiBaseUrl as string | undefined)
      const wsHost = apiBaseUrl?.replace(/^https?:\/\//, '') || window.location.host
      return `${wsProtocol}//${wsHost}${baseUrl}`
    }
    
    // Already absolute URL
    return baseUrl
  }
  
  /**
   * Start heartbeat mechanism to keep connection alive
   */
  function startHeartbeat() {
    stopHeartbeat()
    
    log('Starting heartbeat with interval:', heartbeatInterval)
    
    heartbeatIntervalId = setInterval(() => {
      // Don't send ping if page is hidden/inactive
      if (document.hidden) {
        log('Page hidden, skipping heartbeat')
        return
      }
      
      if (socket.value?.readyState === WebSocket.OPEN) {
        // Send ping
        const ping: PingMessage = {
          type: 'ping',
          timestamp: new Date().toISOString(),
        }
        socket.value.send(JSON.stringify(ping))
        log('Sent ping')
        
        // Check if we received pong recently (only if page is visible)
        const timeSinceLastPong = Date.now() - lastPongReceived
        if (timeSinceLastPong > pongTimeout + heartbeatInterval) {
          warn('No pong received, reconnecting...')
          reconnect()
        }
      }
    }, heartbeatInterval)
  }
  
  /**
   * Stop heartbeat mechanism
   */
  function stopHeartbeat() {
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId)
      heartbeatIntervalId = null
      log('Stopped heartbeat')
    }
  }
  
  /**
   * Connect to WebSocket server
   */
  async function connect() {
    // Prevent multiple simultaneous connections
    if (
      connectionState.value === 'connecting' ||
      connectionState.value === 'connected' ||
      connectionState.value === 'authenticating'
    ) {
      log('Already connecting/connected, skipping duplicate connect()')
      return
    }
    
    log('Initiating connection')
    
    connectionState.value = 'connecting'
    error.value = null
    isManualDisconnect = false
    
    try {
      // Build WebSocket URL
      const wsUrl = constructWebSocketUrl()
      log('Connecting to:', wsUrl)
      
      // Create WebSocket connection
      socket.value = new WebSocket(wsUrl)
      
      // Store token to send after connection
      const authToken = unref(token)
      
      // Connection opened
      socket.value.onopen = () => {
        log('Connection opened')
        
        // Send authentication as first message (more secure than URL)
        if (socket.value && authToken) {
          socket.value.send(JSON.stringify({
            type: 'authenticate',
            token: authToken,
          }))
          log('Sent authentication')
        }
        
        // Note: Connection is not fully ready until auth confirmation
        connectionState.value = 'authenticating'
        reconnectAttempts = 0
        lastPongReceived = Date.now()
        
        // Start heartbeat
        startHeartbeat()
      }
      
      // Message received
      socket.value.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          lastMessage.value = message
          
          // Update last pong time for ANY message (server is alive)
          // This prevents false disconnects when other messages are flowing
          lastPongReceived = Date.now()
          
          // Handle pong
          if (message.type === 'pong') {
            log('Received pong')
            return
          }
          
          // Handle authentication confirmation
          if (message.type === 'authenticated') {
            connectionState.value = 'connected'
            log('Authenticated successfully')
            onConnected?.()
            
            // Show success toast only after reconnection
            if (reconnectAttempts > 0) {
              toast.add({
                title: 'Reconnected',
                description: 'Real-time updates restored',
                color: 'green',
                timeout: 3000,
              })
            }
            return
          }
          
          // Handle connection confirmation
          if (message.type === 'connected') {
            const connMsg = message as unknown as ConnectionMessage
            log('Connection confirmed for user:', connMsg.user?.email || 'unknown')
            return
          }
          
          // Handle errors
          if (message.type === 'error') {
            const errMsg = message as unknown as ErrorMessage
            logError('Server error:', errMsg.message)
            const serverError = new Error(errMsg.message)
            error.value = serverError
            onError?.(serverError)
            return
          }
          
          // Dispatch to registered handlers
          const handlers = messageHandlers.get(message.type)
          if (handlers) {
            log(`Dispatching ${message.type} to ${handlers.size} handler(s)`)
            
            // Extract payload (everything except 'type')
            const { type, ...payload } = message as any
            
            handlers.forEach(handler => {
              try {
                handler(payload)
              } catch (err) {
                logError('Handler error:', err)
              }
            })
          } else {
            log(`No handlers registered for message type: ${message.type}`)
          }
        } catch (err) {
          logError('Failed to parse message:', err)
        }
      }
      
      // Connection error
      socket.value.onerror = (event) => {
        logError('Connection error:', event)
        const connError = new Error('WebSocket connection error')
        error.value = connError
        connectionState.value = 'error'
        onError?.(connError)
      }
      
      // Connection closed
      socket.value.onclose = (event) => {
        log('Connection closed:', event.code, event.reason)
        
        stopHeartbeat()
        socket.value = null
        
        if (!isManualDisconnect && connectionState.value !== 'disconnecting') {
          connectionState.value = 'disconnected'
          onDisconnected?.()
          
          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = getReconnectDelay(reconnectAttempts, reconnectDelay)
            log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
            
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++
              reconnect()
            }, delay)
          } else {
            logError('Max reconnection attempts reached')
            connectionState.value = 'error'
            const maxAttemptsError = new Error('Failed to reconnect after multiple attempts')
            error.value = maxAttemptsError
            onError?.(maxAttemptsError)
            
            toast.add({
              title: 'Connection Lost',
              description: 'Unable to restore real-time updates. Please refresh the page.',
              color: 'red',
              timeout: 10000,
            })
          }
        } else {
          connectionState.value = 'disconnected'
          onDisconnected?.()
        }
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      const connError = new Error(`Connection failed: ${errorMsg}`)
      error.value = connError
      connectionState.value = 'error'
      onError?.(connError)
      
      logError('Connect error:', error.value)
      
      // Retry connection
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = getReconnectDelay(reconnectAttempts, reconnectDelay)
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++
          connect()
        }, delay)
      }
    }
  }
  
  /**
   * Reconnect to WebSocket (resets reconnection counter)
   */
  async function reconnect() {
    log('Reconnecting...')
    disconnect()
    await nextTick()
    connect()
  }
  
  /**
   * Disconnect from WebSocket server
   */
  function disconnect() {
    log('Disconnecting...')
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
    log('Disconnected')
  }
  
  /**
   * Subscribe to WebSocket message type
   * @param eventType - Message type to listen for (e.g., 'question.created')
   * @param handler - Callback function to handle the message payload
   * @returns Unsubscribe function to remove the handler
   * 
   * @example
   * ```ts
   * const unsubscribe = connection.on('user.joined', (data) => {
   *   console.log('User joined:', data.user.name)
   * })
   * 
   * // Later, cleanup
   * unsubscribe()
   * ```
   */
  function on<T = any>(eventType: string, handler: WSMessageHandler<T>): WSUnsubscribe {
    if (!messageHandlers.has(eventType)) {
      messageHandlers.set(eventType, new Set())
    }
    
    const handlers = messageHandlers.get(eventType)!
    handlers.add(handler as WSMessageHandler)
    
    log(`Registered handler for '${eventType}' (total: ${handlers.size})`)
    
    // Return unsubscribe function
    return () => {
      const handlers = messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler as WSMessageHandler)
        log(`Unregistered handler for '${eventType}' (remaining: ${handlers.size})`)
        if (handlers.size === 0) {
          messageHandlers.delete(eventType)
          log(`Removed empty handler set for '${eventType}'`)
        }
      }
    }
  }
  
  /**
   * Remove handler(s) for a specific event type
   * @param eventType - Message type to remove handlers for
   * @param handler - Specific handler to remove (if omitted, removes all handlers)
   * 
   * @example
   * ```ts
   * // Remove specific handler
   * connection.off('user.joined', myHandler)
   * 
   * // Remove all handlers for event type
   * connection.off('user.joined')
   * ```
   */
  function off(eventType: string, handler?: WSMessageHandler) {
    if (!handler) {
      // Remove all handlers for this event type
      messageHandlers.delete(eventType)
      log(`Removed all handlers for '${eventType}'`)
    } else {
      // Remove specific handler
      const handlers = messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
        log(`Removed handler for '${eventType}' (remaining: ${handlers.size})`)
        if (handlers.size === 0) {
          messageHandlers.delete(eventType)
        }
      }
    }
  }
  
  /**
   * Send a message through the WebSocket connection
   * @param eventType - Message type
   * @param data - Message payload
   * 
   * @example
   * ```ts
   * connection.emit('chat.message', {
   *   text: 'Hello, world!',
   *   timestamp: Date.now()
   * })
   * ```
   */
  function emit(eventType: string, data?: any) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      const message = {
        type: eventType,
        ...data,
      }
      socket.value.send(JSON.stringify(message))
      log('Sent message:', eventType)
    } else {
      warn('Cannot send message - not connected')
    }
  }
  
  /**
   * Send raw message through WebSocket (for backward compatibility)
   * @param message - Raw message object or string
   */
  function send(message: any) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message)
      socket.value.send(payload)
      log('Sent raw message')
    } else {
      warn('Cannot send message - not connected')
    }
  }
  
  // Auto-connect if enabled
  if (import.meta.client && autoConnect) {
    log('Auto-connecting on composable init')
    connect()
  }
  
  // Handle page visibility changes
  if (import.meta.client && handleVisibilityChange) {
    const handleVisibilityChangeEvent = () => {
      if (document.hidden) {
        log('Page hidden, pausing heartbeat')
        // Heartbeat will skip pings but keep connection alive
      } else {
        log('Page visible again')
        // Update lastPongReceived to prevent false timeout after tab becomes visible
        lastPongReceived = Date.now()
        
        // Check if connection is still alive
        if (
          socket.value?.readyState !== WebSocket.OPEN &&
          socket.value?.readyState !== WebSocket.CONNECTING
        ) {
          log('Connection lost while hidden, reconnecting...')
          reconnect()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChangeEvent)
    
    // Cleanup visibility listener on unmount
    onBeforeUnmount(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChangeEvent)
    })
  }
  
  // Disconnect on unmount
  onBeforeUnmount(() => {
    log('Component unmounting, disconnecting')
    disconnect()
  })
  
  // Watch for URL changes and reconnect
  watch(() => unref(url), (newUrl, oldUrl) => {
    if (newUrl !== oldUrl && newUrl) {
      log('URL changed, reconnecting:', newUrl)
      disconnect()
      nextTick(() => connect())
    }
  })
  
  // Watch for token changes and reconnect if already connected
  watch(() => unref(token), (newToken, oldToken) => {
    if (newToken !== oldToken && newToken && connectionState.value === 'connected') {
      log('Token changed, reconnecting with new token')
      disconnect()
      nextTick(() => connect())
    }
  })
  
  // Computed state helpers
  const isConnected = computed(() => connectionState.value === 'connected')
  const isConnecting = computed(() => 
    connectionState.value === 'connecting' || 
    connectionState.value === 'authenticating'
  )
  const isDisconnected = computed(() => connectionState.value === 'disconnected')
  const hasError = computed(() => connectionState.value === 'error')
  
  return {
    // State (readonly to prevent external modification)
    connectionState: readonly(connectionState),
    error: readonly(error),
    lastMessage: readonly(lastMessage),
    
    // Computed state helpers
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    
    // Connection control methods
    connect,
    disconnect,
    reconnect,
    
    // Message handling methods
    on,
    off,
    emit,
    send,
  }
}
