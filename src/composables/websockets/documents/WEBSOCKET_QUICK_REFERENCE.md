# WebSocket Composables - Quick Reference

## 🚀 Quick Start

### Using Existing Event WebSocket
```typescript
// In your component
const ws = useEventWebSocket(eventId)

// Subscribe to events
const unsubscribe = ws.on('question.created', (data) => {
  console.log('New question:', data.question)
})

// Or use type-safe helpers
const unsubscribe2 = ws.onQuestionCreated((data) => {
  // TypeScript knows the shape of data
  questions.value.push(data.question)
})

// Clean up on unmount
onBeforeUnmount(() => {
  unsubscribe()
  unsubscribe2()
})
```

### Creating New WebSocket Endpoint

```typescript
// src/composables/useChatWebSocket.ts
import { useRealtimeConnection } from './useRealtimeConnection'

export function useChatWebSocket(roomId: string) {
  const { token } = useAuthStore() // Your auth store
  
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/chat/${roomId}/`),
    token: computed(() => token.value),
  })
  
  // Add convenience methods
  function sendMessage(text: string) {
    connection.emit('chat.message', { text })
  }
  
  return {
    ...connection,
    sendMessage,
  }
}
```

## 📋 Common Patterns

### Pattern 1: Basic Connection
```typescript
const connection = useRealtimeConnection({
  url: '/ws/endpoint/',
  token: myToken,
})
```

### Pattern 2: Dynamic URL
```typescript
const connection = useRealtimeConnection({
  url: computed(() => `/ws/room/${roomId.value}/`),
  token: computed(() => authToken.value),
})
```

### Pattern 3: Custom Configuration
```typescript
const connection = useRealtimeConnection({
  url: '/ws/game/',
  token: gameToken,
  heartbeatInterval: 10000,    // Faster heartbeat
  maxReconnectAttempts: 10,    // More retries
  debug: true,                  // Enable logging
  onConnected: () => {
    console.log('Connected!')
  },
})
```

### Pattern 4: Manual Connection Control
```typescript
const connection = useRealtimeConnection({
  url: '/ws/notifications/',
  token: userToken,
  autoConnect: false,  // Don't connect automatically
})

// Connect manually when ready
if (userIsReady.value) {
  connection.connect()
}
```

## 🎯 Message Handling

### Subscribe to Events
```typescript
// Generic handler
const unsubscribe = connection.on('event.type', (data) => {
  console.log('Received:', data)
})

// Type-safe handler
const unsubscribe = connection.on<MyDataType>('event.type', (data) => {
  // TypeScript knows the shape of data
})
```

### Unsubscribe from Events
```typescript
// Option 1: Use the unsubscribe function
const unsubscribe = connection.on('event.type', handler)
unsubscribe()

// Option 2: Use off method
connection.off('event.type', handler)

// Option 3: Remove all handlers for event
connection.off('event.type')
```

### Send Messages
```typescript
// Using emit (recommended)
connection.emit('chat.message', {
  text: 'Hello!',
  timestamp: Date.now(),
})

// Using send (raw JSON)
connection.send({
  type: 'chat.message',
  text: 'Hello!',
})
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string \| Ref<string>` | required | WebSocket endpoint URL |
| `token` | `string \| null \| Ref` | required | Authentication token |
| `heartbeatInterval` | `number` | `30000` | Ping interval (ms) |
| `pongTimeout` | `number` | `10000` | Pong timeout (ms) |
| `reconnectDelay` | `number` | `1000` | Initial reconnect delay (ms) |
| `maxReconnectAttempts` | `number` | `5` | Max reconnection attempts |
| `autoConnect` | `boolean` | `true` | Auto-connect on init |
| `handleVisibilityChange` | `boolean` | `true` | Handle page visibility |
| `debug` | `boolean` | `false` | Enable debug logging |
| `buildUrl` | `function` | `undefined` | Custom URL builder |
| `onConnected` | `function` | `undefined` | Connected callback |
| `onDisconnected` | `function` | `undefined` | Disconnected callback |
| `onError` | `function` | `undefined` | Error callback |

## 📊 Connection State

### Check Connection Status
```typescript
// Computed properties
if (connection.isConnected.value) {
  console.log('Connected!')
}

if (connection.isConnecting.value) {
  console.log('Connecting...')
}

if (connection.hasError.value) {
  console.log('Error:', connection.error.value)
}

// Or use connectionState directly
const state = connection.connectionState.value
// 'disconnected' | 'connecting' | 'authenticating' | 'connected' | 'error'
```

### React to State Changes
```typescript
watch(connection.isConnected, (connected) => {
  if (connected) {
    // Connection established
    loadInitialData()
  }
})

watch(connection.error, (error) => {
  if (error) {
    toast.add({
      title: 'Connection Error',
      description: error.message,
      color: 'red',
    })
  }
})
```

## 🎨 Return Values

Every WebSocket composable returns:
```typescript
{
  // State (readonly)
  connectionState: Ref<WSConnectionState>
  error: Ref<Error | null>
  lastMessage: Ref<WSMessage | null>
  
  // Computed helpers
  isConnected: ComputedRef<boolean>
  isConnecting: ComputedRef<boolean>
  isDisconnected: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  
  // Connection control
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  
  // Message handling
  on: <T>(event: string, handler: (data: T) => void) => () => void
  off: (event: string, handler?: Function) => void
  emit: (event: string, data?: any) => void
  send: (message: any) => void
  
  // + any custom properties/methods
}
```

## 🧪 Testing Tips

### Mock WebSocket Connection
```typescript
// In your test
const mockConnection = {
  isConnected: ref(true),
  on: vi.fn((event, handler) => () => {}),
  emit: vi.fn(),
  // ... other properties
}

vi.mock('~/composables/useRealtimeConnection', () => ({
  useRealtimeConnection: () => mockConnection,
}))
```

### Simulate Messages
```typescript
// Trigger a handler manually
const handler = vi.fn()
connection.on('test.event', handler)

// In your test, call the handler
handler({ some: 'data' })

expect(handler).toHaveBeenCalledWith({ some: 'data' })
```

## 🚨 Common Issues

### Issue: "Cannot send message - not connected"
**Solution**: Check `isConnected` before sending:
```typescript
if (connection.isConnected.value) {
  connection.emit('message', data)
}
```

### Issue: Token expires and connection fails
**Solution**: Use reactive token with refresh:
```typescript
const connection = useRealtimeConnection({
  url: '/ws/...',
  token: computed(() => authStore.token), // Reactive!
})

// Refresh token
authStore.refreshToken().then(() => {
  connection.reconnect() // Reconnect with new token
})
```

### Issue: Multiple connections to same endpoint
**Solution**: Create composable at component level, not in composables:
```typescript
// ❌ Bad: Creates new connection on every call
function useMyFeature() {
  const ws = useEventWebSocket(id) // New connection!
  // ...
}

// ✅ Good: Create once at component level
const ws = useEventWebSocket(id) // In component setup
```

### Issue: Memory leaks
**Solution**: Always unsubscribe in `onBeforeUnmount`:
```typescript
const unsubscribe = connection.on('event', handler)

onBeforeUnmount(() => {
  unsubscribe()
})
```

## 📚 Advanced Examples

### Batched Messages
```typescript
const pendingMessages = ref([])
let batchTimeout = null

function queueMessage(msg) {
  pendingMessages.value.push(msg)
  
  clearTimeout(batchTimeout)
  batchTimeout = setTimeout(() => {
    connection.emit('batch.messages', {
      messages: pendingMessages.value,
    })
    pendingMessages.value = []
  }, 500)
}
```

### Conditional Connection
```typescript
const { isAuthenticated } = useAuth()

watch(isAuthenticated, (auth) => {
  if (auth) {
    connection.connect()
  } else {
    connection.disconnect()
  }
}, { immediate: true })
```

### Rate Limiting
```typescript
let lastEmit = 0
const RATE_LIMIT = 100 // ms

function emitThrottled(event, data) {
  const now = Date.now()
  if (now - lastEmit >= RATE_LIMIT) {
    connection.emit(event, data)
    lastEmit = now
  }
}
```

## 🔗 Resources

- **Base Composable**: `src/composables/useRealtimeConnection.ts`
- **Event Example**: `src/composables/useEventWebSocket.ts`
- **More Examples**: `src/composables/useRealtimeConnection.examples.ts`
- **Full Documentation**: `WEBSOCKET_REFACTORING_SUMMARY.md`
- **Types**: `src/types/websocket.ts`

## 💡 Best Practices

1. ✅ Always unsubscribe handlers on unmount
2. ✅ Use type-safe handlers with generics
3. ✅ Check `isConnected` before sending messages
4. ✅ Use reactive refs for dynamic URLs/tokens
5. ✅ Enable `debug: true` during development
6. ✅ Handle errors with `onError` callback
7. ✅ Use `autoConnect: false` for conditional connections
8. ✅ Keep connection state in parent component
9. ✅ Use computed refs for derived state
10. ✅ Test with mocked connections

## 🎯 Next Steps

1. Review the full documentation in `WEBSOCKET_REFACTORING_SUMMARY.md`
2. Check out examples in `useRealtimeConnection.examples.ts`
3. Create your own WebSocket composable following the patterns
4. Write tests for your composable
5. Share your patterns with the team!
