/**
 * Example composables showing how to use useRealtimeConnection
 * for different WebSocket endpoints across the application.
 * 
 * ⚠️ THIS IS A REFERENCE FILE - NOT MEANT TO BE IMPORTED OR COMPILED
 * 
 * Copy and adapt these patterns for your specific use cases.
 * Replace `useAuth()` and other placeholders with your actual implementations.
 * 
 * @file Reference examples only
 */

// @ts-nocheck - This is a reference file with example code

import type { MaybeRef } from 'vue'
import { useRealtimeConnection } from './useRealtimeConnection'

// ============================================================================
// Example 1: Simple Chat WebSocket
// ============================================================================

export interface ChatMessage {
  id: string
  user: {
    id: string
    name: string
  }
  text: string
  timestamp: string
}

export interface UserJoinedData {
  user: {
    id: string
    name: string
  }
}

/**
 * WebSocket connection for chat room real-time updates
 */
export function useChatWebSocket(roomId: MaybeRef<string>) {
  const { token } = useAuth() // Get token from your auth store
  
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/chat/${unref(roomId)}/`),
    token: computed(() => token.value),
    heartbeatInterval: 20000, // 20 second heartbeat for chat
    debug: import.meta.dev, // Debug in development only
    onConnected: () => {
      console.log('[ChatWebSocket] Connected to room:', unref(roomId))
    },
  })
  
  // Type-safe convenience methods
  function onMessageReceived(handler: (data: ChatMessage) => void) {
    return connection.on<ChatMessage>('chat.message', handler)
  }
  
  function onUserJoined(handler: (data: UserJoinedData) => void) {
    return connection.on<UserJoinedData>('user.joined', handler)
  }
  
  function onUserLeft(handler: (data: UserJoinedData) => void) {
    return connection.on<UserJoinedData>('user.left', handler)
  }
  
  function sendMessage(text: string) {
    connection.emit('chat.message', {
      text,
      timestamp: new Date().toISOString(),
    })
  }
  
  return {
    ...connection,
    onMessageReceived,
    onUserJoined,
    onUserLeft,
    sendMessage,
  }
}

// ============================================================================
// Example 2: Dashboard WebSocket with Custom Token Fetching
// ============================================================================

export interface DashboardStatsData {
  active_users: number
  total_events: number
  revenue: number
}

/**
 * WebSocket connection for dashboard real-time statistics
 */
export function useDashboardWebSocket() {
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  
  // Custom token fetching for dashboard
  async function fetchDashboardToken(): Promise<string> {
    try {
      const response = await $fetch<{ token: string; expires_in: number }>(
        '/api/dashboard/ws-token'
      )
      
      token.value = response.token
      tokenExpiresAt.value = Date.now() + (response.expires_in * 1000)
      
      return response.token
    } catch (err) {
      console.error('[DashboardWebSocket] Failed to fetch token:', err)
      throw err
    }
  }
  
  // Fetch token on init
  if (import.meta.client) {
    fetchDashboardToken().catch(err => {
      console.error('[DashboardWebSocket] Initial token fetch failed:', err)
    })
  }
  
  const connection = useRealtimeConnection({
    url: '/ws/dashboard/',
    token: computed(() => token.value),
    heartbeatInterval: 30000,
    autoConnect: true,
    onConnected: () => {
      console.log('[DashboardWebSocket] Connected to dashboard')
      // Request initial stats on connect
      connection.emit('stats.request', {})
    },
  })
  
  // Periodic token refresh
  if (import.meta.client) {
    const refreshInterval = setInterval(() => {
      if (tokenExpiresAt.value && Date.now() > tokenExpiresAt.value - 60000) {
        fetchDashboardToken().then(() => connection.reconnect())
      }
    }, 30000) // Check every 30 seconds
    
    onBeforeUnmount(() => clearInterval(refreshInterval))
  }
  
  function onStatsUpdate(handler: (data: DashboardStatsData) => void) {
    return connection.on<DashboardStatsData>('stats.update', handler)
  }
  
  return {
    ...connection,
    onStatsUpdate,
    refreshToken: fetchDashboardToken,
  }
}

// ============================================================================
// Example 3: Notification WebSocket with Conditional Connection
// ============================================================================

export interface NotificationData {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
}

/**
 * WebSocket connection for user notifications
 * Only connects when user is authenticated
 */
export function useNotificationWebSocket() {
  const { token, isAuthenticated } = useAuth()
  
  const connection = useRealtimeConnection({
    url: '/ws/notifications/',
    token: computed(() => token.value),
    autoConnect: false, // Don't auto-connect, we'll control it
    onConnected: () => {
      console.log('[NotificationWebSocket] Connected')
    },
  })
  
  // Connect/disconnect based on auth state
  watch(isAuthenticated, (authenticated) => {
    if (authenticated && !connection.isConnected.value) {
      console.log('[NotificationWebSocket] User authenticated, connecting...')
      connection.connect()
    } else if (!authenticated && connection.isConnected.value) {
      console.log('[NotificationWebSocket] User logged out, disconnecting...')
      connection.disconnect()
    }
  }, { immediate: true })
  
  function onNotification(handler: (data: NotificationData) => void) {
    return connection.on<NotificationData>('notification', handler)
  }
  
  function markAsRead(notificationId: string) {
    connection.emit('notification.read', { id: notificationId })
  }
  
  return {
    ...connection,
    onNotification,
    markAsRead,
  }
}

// ============================================================================
// Example 4: Game WebSocket with Advanced Configuration
// ============================================================================

export interface GameState {
  id: string
  status: 'waiting' | 'playing' | 'paused' | 'finished'
  players: Array<{
    id: string
    name: string
    score: number
  }>
}

export interface GameMoveData {
  player_id: string
  move: any
  timestamp: string
}

/**
 * WebSocket connection for multiplayer game
 * Features: Fast heartbeat, more reconnect attempts, custom URL building
 */
export function useGameWebSocket(gameId: MaybeRef<string>, playerId: MaybeRef<string>) {
  const { token } = useAuth()
  const gameState = ref<GameState>()
  const toast = useToast()
  
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/game/${unref(gameId)}/`),
    token: computed(() => token.value),
    heartbeatInterval: 10000, // Faster heartbeat for real-time game (10s)
    pongTimeout: 5000, // Shorter timeout
    maxReconnectAttempts: 10, // More attempts for games
    buildUrl: (url) => {
      // Add player ID as query parameter
      return `${url}?player=${unref(playerId)}`
    },
    onConnected: () => {
      console.log('[GameWebSocket] Connected to game:', unref(gameId))
      // Request current game state
      connection.emit('game.state.request', {})
      gameState.value = { ...gameState.value, status: 'playing' } as GameState
    },
    onDisconnected: () => {
      console.log('[GameWebSocket] Disconnected from game')
      if (gameState.value) {
        gameState.value = { ...gameState.value, status: 'paused' } as GameState
      }
    },
    onError: (error) => {
      console.error('[GameWebSocket] Error:', error)
      toast.add({
        title: 'Connection Error',
        description: 'Lost connection to game server. Reconnecting...',
        color: 'red',
      })
    },
    debug: import.meta.dev,
  })
  
  // Type-safe event handlers
  function onGameStateUpdate(handler: (data: GameState) => void) {
    return connection.on<GameState>('game.state', (data) => {
      gameState.value = data
      handler(data)
    })
  }
  
  function onPlayerMove(handler: (data: GameMoveData) => void) {
    return connection.on<GameMoveData>('game.move', handler)
  }
  
  function onGameEnd(handler: (data: GameState) => void) {
    return connection.on<GameState>('game.end', (data) => {
      gameState.value = data
      handler(data)
    })
  }
  
  function makeMove(move: any) {
    connection.emit('game.move', {
      player_id: unref(playerId),
      move,
      timestamp: new Date().toISOString(),
    })
  }
  
  return {
    ...connection,
    gameState: readonly(gameState),
    onGameStateUpdate,
    onPlayerMove,
    onGameEnd,
    makeMove,
  }
}

// ============================================================================
// Example 5: Workshop WebSocket with Batched Messages
// ============================================================================

export interface WorkshopUpdateData {
  workshop_id: string
  field: string
  value: any
}

/**
 * WebSocket connection for workshop live editing
 * Features: Message batching, custom handlers
 */
export function useWorkshopWebSocket(workshopId: MaybeRef<string>) {
  const { token } = useAuth()
  const pendingUpdates = ref<WorkshopUpdateData[]>([])
  let batchTimeout: ReturnType<typeof setTimeout> | null = null
  
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/workshop/${unref(workshopId)}/`),
    token: computed(() => token.value),
    heartbeatInterval: 25000,
    debug: false,
  })
  
  // Batch updates to reduce message frequency
  function queueUpdate(field: string, value: any) {
    pendingUpdates.value.push({
      workshop_id: unref(workshopId),
      field,
      value,
    })
    
    // Clear existing timeout
    if (batchTimeout) {
      clearTimeout(batchTimeout)
    }
    
    // Send batched updates after 500ms of no changes
    batchTimeout = setTimeout(() => {
      if (pendingUpdates.value.length > 0) {
        connection.emit('workshop.batch_update', {
          updates: pendingUpdates.value,
        })
        pendingUpdates.value = []
      }
    }, 500)
  }
  
  function onWorkshopUpdate(handler: (data: WorkshopUpdateData) => void) {
    return connection.on<WorkshopUpdateData>('workshop.update', handler)
  }
  
  // Cleanup batch timeout on unmount
  onBeforeUnmount(() => {
    if (batchTimeout) {
      clearTimeout(batchTimeout)
    }
  })
  
  return {
    ...connection,
    onWorkshopUpdate,
    queueUpdate,
  }
}

// ============================================================================
// Usage in Components
// ============================================================================

/*
// Chat Example
const chat = useChatWebSocket(roomId)

const unsubscribeMessage = chat.onMessageReceived((data) => {
  messages.value.push(data)
})

const unsubscribeJoin = chat.onUserJoined((data) => {
  console.log(`${data.user.name} joined`)
})

function sendChatMessage() {
  chat.sendMessage(messageText.value)
  messageText.value = ''
}

onBeforeUnmount(() => {
  unsubscribeMessage()
  unsubscribeJoin()
})

// Dashboard Example
const dashboard = useDashboardWebSocket()

dashboard.onStatsUpdate((stats) => {
  dashboardStats.value = stats
})

// Notification Example
const notifications = useNotificationWebSocket()

notifications.onNotification((notification) => {
  toast.add({
    title: notification.title,
    description: notification.message,
    color: notification.type,
  })
  notifications.markAsRead(notification.id)
})

// Game Example
const game = useGameWebSocket(gameId, playerId)

game.onGameStateUpdate((state) => {
  console.log('Game state updated:', state)
})

game.onPlayerMove((move) => {
  console.log('Player moved:', move)
})

function handleMove(move: any) {
  game.makeMove(move)
}

// Workshop Example
const workshop = useWorkshopWebSocket(workshopId)

workshop.onWorkshopUpdate((update) => {
  // Apply update to local state
  applyUpdate(update)
})

// Queue updates as user types
watch(workshopTitle, (newValue) => {
  workshop.queueUpdate('title', newValue)
})
*/
