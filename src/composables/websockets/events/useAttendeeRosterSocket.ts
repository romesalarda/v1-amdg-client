import type { MaybeRef } from 'vue'
import type { WSUnsubscribe } from '~/types/websocket'
import { getWebSocketToken } from '~/utils/websocket-api'
import { useRealtimeConnection } from '../../useRealtimeConnection'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AttendeeRosterFilters {
  day?: number | null
  is_checked_in?: boolean | null
  search?: string | null
}

/**
 * An attendee row in the live roster table.
 * Mirrors AttendeeRosterItemSerializer on the backend.
 */
export interface AttendeeRosterItem {
  attendee_id: string
  attendee_display_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  area_from_name: string | null
  status: string
  is_checked_in: boolean
  is_cancelled: boolean
  last_check_in_at: string | null
  event_day_last_seen: number | null
  ticket_type_code: string | null
  has_outstanding_payments: boolean
}

export interface AttendeeRosterListResponse {
  type: 'attendee.list.response'
  attendees: AttendeeRosterItem[]
  page: number
  page_size: number
  total_count: number
  timestamp: string
}

export interface AttendeeUpdatedPayload {
  type: 'attendee.updated'
  attendee: AttendeeRosterItem
  timestamp: string
}

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * WebSocket composable for the live attendee roster table.
 *
 * Connects to `/ws/events/{eventIdentifier}/attendees/`.
 *
 * Features:
 * - `requestPage(page, pageSize, filters?)` — fetches a paginated attendee list
 * - `setFilters(filters)` — updates persistent per-connection filters
 * - `onPageReceived(handler)` — subscribe to `attendee.list.response`
 * - `onAttendeeUpdated(handler)` — subscribe to real-time `attendee.updated` updates
 *
 * @example
 * ```ts
 * const ws = useAttendeeRosterSocket(eventIdentifier)
 *
 * ws.onPageReceived((resp) => {
 *   attendees.value = resp.attendees
 *   totalCount.value = resp.total_count
 * })
 *
 * ws.onAttendeeUpdated((payload) => {
 *   const idx = attendees.value.findIndex(a => a.attendee_id === payload.attendee.attendee_id)
 *   if (idx !== -1) attendees.value[idx] = payload.attendee
 * })
 * ```
 */
export function useAttendeeRosterSocket(eventIdentifier: MaybeRef<string>) {
  // Token state
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)

  // Custom handlers
  const pageHandlers = ref<Set<(resp: AttendeeRosterListResponse) => void>>(new Set())
  const updatedHandlers = ref<Set<(payload: AttendeeUpdatedPayload) => void>>(new Set())

  async function fetchToken(): Promise<string> {
    const data = await getWebSocketToken(unref(eventIdentifier))
    token.value = data.token
    tokenExpiresAt.value = Date.now() + data.expires_in * 1000
    return data.token
  }

  function needsTokenRefresh(): boolean {
    if (!token.value || !tokenExpiresAt.value) return true
    return Date.now() > tokenExpiresAt.value - 5 * 60 * 1000
  }

  const connection = useRealtimeConnection({
    url: computed(() => `/ws/events/${unref(eventIdentifier)}/attendees/`),
    token: computed(() => token.value),
    heartbeatInterval: 30000,
    pongTimeout: 10000,
    maxReconnectAttempts: 5,
    autoConnect: false,
    handleVisibilityChange: true,
    onDisconnected: () => {
      console.log('[AttendeeRosterSocket] Disconnected')
    },
    onError: (err) => {
      console.error('[AttendeeRosterSocket] Error:', err.message)
    },
  })

  // ── Incoming message handlers ──────────────────────────────────────────

  if (import.meta.client) {
    connection.on<AttendeeRosterListResponse>('attendee.list.response', (data) => {
      pageHandlers.value.forEach((h) => {
        try {
          h(data)
        } catch (e) {
          console.error('[AttendeeRosterSocket] Page handler error:', e)
        }
      })
    })

    connection.on<AttendeeUpdatedPayload>('attendee.updated', (data) => {
      updatedHandlers.value.forEach((h) => {
        try {
          h(data)
        } catch (e) {
          console.error('[AttendeeRosterSocket] Updated handler error:', e)
        }
      })
    })
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Subscribe to paginated list responses from the server.
   */
  function onPageReceived(handler: (resp: AttendeeRosterListResponse) => void): WSUnsubscribe {
    pageHandlers.value.add(handler)
    return () => pageHandlers.value.delete(handler)
  }

  /**
   * Subscribe to real-time attendee updates (triggered by check-in events).
   */
  function onAttendeeUpdated(handler: (payload: AttendeeUpdatedPayload) => void): WSUnsubscribe {
    updatedHandlers.value.add(handler)
    return () => updatedHandlers.value.delete(handler)
  }

  /**
   * Request a page of attendees from the server.
   */
  function requestPage(page = 1, pageSize = 20, filters?: AttendeeRosterFilters) {
    if (connection.isConnected.value) {
      connection.emit('attendee.list.request', {
        page,
        page_size: pageSize,
        filters: filters ?? {},
      })
    }
  }

  /**
   * Set persistent per-connection filters (applied server-side for all future requests).
   */
  function setFilters(filters: AttendeeRosterFilters) {
    if (connection.isConnected.value) {
      connection.emit('attendee.filter.set', { filters })
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  if (import.meta.client) {
    fetchToken()
      .then(() => connection.connect())
      .catch((err) => console.error('[AttendeeRosterSocket] Token fetch failed:', err))

    const tokenRefreshInterval = setInterval(async () => {
      if (needsTokenRefresh() && connection.isConnected.value) {
        try {
          await fetchToken()
          connection.reconnect()
        } catch (err) {
          console.error('[AttendeeRosterSocket] Token refresh failed:', err)
        }
      }
    }, 60_000)

    onBeforeUnmount(() => {
      clearInterval(tokenRefreshInterval)
      connection.disconnect()
    })
  }

  watch(
    () => unref(eventIdentifier),
    async (newId, oldId) => {
      if (newId !== oldId && newId) {
        try {
          await fetchToken()
          connection.reconnect()
        } catch (err) {
          console.error('[AttendeeRosterSocket] Token refresh on event change failed:', err)
        }
      }
    },
  )

  return {
    // State
    isConnected: connection.isConnected,
    connectionState: connection.connectionState,
    error: connection.error,

    // Methods
    onPageReceived,
    onAttendeeUpdated,
    requestPage,
    setFilters,
    disconnect: connection.disconnect,
    reconnect: connection.reconnect,

    // Escape hatch
    on: connection.on,
    off: connection.off,
  }
}

export type UseAttendeeRosterSocket = ReturnType<typeof useAttendeeRosterSocket>
