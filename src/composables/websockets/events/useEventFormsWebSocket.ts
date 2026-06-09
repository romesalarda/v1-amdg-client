import type { MaybeRef } from 'vue'
import type { WSUnsubscribe } from '~/types/websocket'
import { getWebSocketToken } from '~/utils/websocket-api'
import { useRealtimeConnection } from '../../useRealtimeConnection'

export interface FormBroadcastPayload {
  type: string
  payload: any
  timestamp: string
  actor: {
    id: string
    name: string
    email: string
  } | null
}

export function useEventFormsWebSocket(eventIdentifier: MaybeRef<string>) {
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)

  /**
   * Fetch WebSocket authentication token from API
   */
  async function fetchToken(): Promise<string> {
    try {
      const data = await getWebSocketToken(unref(eventIdentifier))
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
    const bufferMs = 5 * 60 * 1000
    return Date.now() > (tokenExpiresAt.value - bufferMs)
  }

  // Create base WebSocket connection using reusable composable
  const connection = useRealtimeConnection({
    url: computed(() => `/ws/events/${unref(eventIdentifier)}/forms/`),
    token: computed(() => token.value),
    heartbeatInterval: 30000,
    pongTimeout: 10000,
    maxReconnectAttempts: 5,
    autoConnect: false,
    handleVisibilityChange: true,
    debug: false,

    onConnected: () => {
      console.log('[EventFormsWebSocket] Connected to event forms:', unref(eventIdentifier))
    },
    onDisconnected: () => {
      console.log('[EventFormsWebSocket] Disconnected from event forms')
    },
    onError: (error) => {
      console.error('[EventFormsWebSocket] Connection error:', error.message)
    },
  })

  // Initialize token and connect on client creation
  if (import.meta.client) {
    fetchToken()
      .then(() => {
        console.log('[EventFormsWebSocket] Token fetched, connecting...')
        connection.connect()
      })
      .catch(err => {
        console.error('[EventFormsWebSocket] Failed to fetch initial token:', err)
      })
  }

  // Watch eventIdentifier changes and refresh token
  watch(() => unref(eventIdentifier), async (newId, oldId) => {
    if (newId !== oldId && newId) {
      console.log('[EventFormsWebSocket] Event ID changed, fetching new token')
      try {
        await fetchToken()
      } catch (err) {
        console.error('[EventFormsWebSocket] Failed to fetch token for new event:', err)
      }
    }
  })

  // Periodically check and refresh token before expiration
  if (import.meta.client) {
    const tokenRefreshInterval = setInterval(async () => {
      if (needsTokenRefresh() && connection.isConnected.value) {
        console.log('[EventFormsWebSocket] Token expiring soon, refreshing...')
        try {
          await fetchToken()
          connection.reconnect()
        } catch (err) {
          console.error('[EventFormsWebSocket] Token refresh failed:', err)
        }
      }
    }, 60000)

    onBeforeUnmount(() => {
      clearInterval(tokenRefreshInterval)
    })
  }

  // Helper registrations for forms events broadcasts
  // The backend broadcast format matches what EventFormConsumer forwards

  /**
   * Listen to form mutation updates (form.created, form.updated, form.deleted, form.published, form.closed)
   */
  function onFormMutation(handler: (data: FormBroadcastPayload) => void): WSUnsubscribe {
    // FormConsumer group forwards form mutations as broadcasts
    return connection.on<FormBroadcastPayload>('form_event', handler)
  }

  /**
   * Listen to form responses updates (response.created, response.updated)
   */
  function onResponseMutation(handler: (data: FormBroadcastPayload) => void): WSUnsubscribe {
    return connection.on<FormBroadcastPayload>('form_response_event', handler)
  }

  return {
    ...connection,
    onFormMutation,
    onResponseMutation,
    token: readonly(token),
    refreshToken: fetchToken,
  }
}
