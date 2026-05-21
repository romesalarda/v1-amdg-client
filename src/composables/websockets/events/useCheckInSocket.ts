import type { MaybeRef } from 'vue'
import type { WSUnsubscribe } from '~/types/websocket'
import type { CheckInResponse } from '~/api/types.gen'
import { getWebSocketToken } from '~/utils/websocket-api'
import { useRealtimeConnection } from '../../useRealtimeConnection'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CheckInFilters {
  has_outstanding_payments?: boolean | null
  attendee_status?: string | null
  ticket_type?: string | null
  area_from?: string | null
}

/**
 * The minimal broadcast payload sent over the WS channel.
 * Mirrors CheckInBroadcastSerializer + `matches_priority_filter` injected by consumer.
 */
export interface CheckInBroadcastPayload {
  check_in_id: string
  attendee_id: string
  attendee_display_id: string
  ticket_id: string | null
  ticket_code: string | null
  ticket_type_code: string | null
  action: 'CHECK_IN' | 'CHECK_OUT'
  method: 'QR_CODE' | 'MANUAL' | 'ADMIN'
  scan_result: string
  venue_id: string | null
  venue_room_id: string | null
  has_outstanding_payments: boolean
  attendee_status: string
  area_from: string | null
  performed_at: string
  performed_by_id: number | null
  matches_priority_filter: boolean
}

export interface CheckInHistoryItem extends CheckInBroadcastPayload {}

export interface CheckInSocketState {
  isConnected: Readonly<Ref<boolean>>
  recentCheckIns: Readonly<Ref<CheckInBroadcastPayload[]>>
  priorityQueue: Readonly<Ref<CheckInBroadcastPayload[]>>
  connectionState: ReturnType<typeof useRealtimeConnection>['connectionState']
  error: ReturnType<typeof useRealtimeConnection>['error']
}

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * WebSocket composable for real-time check-in broadcasts.
 *
 * Wraps `useRealtimeConnection` for the `/ws/events/{eventId}/checkin/` endpoint.
 * The consumer is read-only — no mutations are sent over WS.
 *
 * Features:
 * - Accumulates `recentCheckIns` from `checkin.occurred` broadcasts
 * - Exposes `priorityQueue` (items where `matches_priority_filter === true`)
 * - `setFilters(filters)` — sends `checkin.filter.set` to update server-side filter
 * - `requestHistory(cursor?, pageSize?)` — fetches paginated history from server
 *
 * @example
 * ```ts
 * const ws = useCheckInSocket(eventId)
 * // Already connecting — no explicit connect() needed
 *
 * const unsubscribe = ws.onCheckIn((item) => {
 *   if (item.scan_result === 'SUCCESS') toast.success(item.attendee_display_id)
 * })
 * onBeforeUnmount(unsubscribe)
 * ```
 */
export function useCheckInSocket(
  eventIdentifier: MaybeRef<string>,
  initialFilters?: CheckInFilters,
) {
  const MAX_RECENT = 200

  // Token state (same pattern as useEventWebSocket)
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)

  // Check-in state
  const recentCheckIns = ref<CheckInBroadcastPayload[]>([])
  const priorityQueue = ref<CheckInBroadcastPayload[]>([])

  // Current filters (kept in sync with server)
  const activeFilters = ref<CheckInFilters>(initialFilters ?? {})

  // Custom handlers registry
  const checkInHandlers = ref<Set<(item: CheckInBroadcastPayload) => void>>(new Set())

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
    url: computed(() => `/ws/events/${unref(eventIdentifier)}/checkin/`),
    token: computed(() => token.value),
    heartbeatInterval: 30000,
    pongTimeout: 10000,
    maxReconnectAttempts: 5,
    autoConnect: false,
    handleVisibilityChange: true,
    onConnected: () => {
      // Send initial filters right after authentication if any are set
      const f = activeFilters.value
      const hasFilters = Object.values(f).some((v) => v !== null && v !== undefined)
      if (hasFilters) {
        connection.emit('checkin.filter.set', { filters: f })
      }
    },
    onDisconnected: () => {
      console.log('[CheckInSocket] Disconnected')
    },
    onError: (err) => {
      console.error('[CheckInSocket] Error:', err.message)
    },
  })

  // ── Incoming message handlers ───────────────────────────────────────────

  if (import.meta.client) {
    connection.on<CheckInBroadcastPayload>('checkin.occurred', (data) => {
      // Prepend and cap the recent list
      recentCheckIns.value = [data, ...recentCheckIns.value].slice(0, MAX_RECENT)

      // Maintain priority queue
      if (data.matches_priority_filter) {
        priorityQueue.value = [data, ...priorityQueue.value].slice(0, MAX_RECENT)
      }

      // Notify custom handlers
      checkInHandlers.value.forEach((h) => {
        try {
          h(data)
        } catch (e) {
          console.error('[CheckInSocket] Handler error:', e)
        }
      })
    })
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Subscribe to every incoming check-in broadcast.
   * Returns an unsubscribe function.
   */
  function onCheckIn(handler: (item: CheckInBroadcastPayload) => void): WSUnsubscribe {
    checkInHandlers.value.add(handler)
    return () => checkInHandlers.value.delete(handler)
  }

  /**
   * Update priority filters on the server for this connection.
   */
  function setFilters(filters: CheckInFilters) {
    activeFilters.value = filters
    if (connection.isConnected.value) {
      connection.emit('checkin.filter.set', { filters })
    }
  }

  /**
   * Request a page of historical check-ins from the server.
   * Results arrive via a `checkin.history.response` message — listen with
   * `connection.on('checkin.history.response', handler)`.
   */
  function requestHistory(cursor = 0, pageSize = 20) {
    if (connection.isConnected.value) {
      connection.emit('checkin.history', { cursor, page_size: pageSize })
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  if (import.meta.client) {
    fetchToken()
      .then(() => connection.connect())
      .catch((err) => console.error('[CheckInSocket] Token fetch failed:', err))

    // Token refresh interval
    const tokenRefreshInterval = setInterval(async () => {
      if (needsTokenRefresh() && connection.isConnected.value) {
        try {
          await fetchToken()
          connection.reconnect()
        } catch (err) {
          console.error('[CheckInSocket] Token refresh failed:', err)
        }
      }
    }, 60_000)

    onBeforeUnmount(() => {
      clearInterval(tokenRefreshInterval)
      connection.disconnect()
    })
  }

  // Re-connect on event change
  watch(
    () => unref(eventIdentifier),
    async (newId, oldId) => {
      if (newId !== oldId && newId) {
        recentCheckIns.value = []
        priorityQueue.value = []
        try {
          await fetchToken()
          connection.reconnect()
        } catch (err) {
          console.error('[CheckInSocket] Token refresh on event change failed:', err)
        }
      }
    },
  )

  return {
    // State
    isConnected: connection.isConnected,
    connectionState: connection.connectionState,
    error: connection.error,
    recentCheckIns: readonly(recentCheckIns),
    priorityQueue: readonly(priorityQueue),
    activeFilters: readonly(activeFilters),

    // Methods
    onCheckIn,
    setFilters,
    requestHistory,
    disconnect: connection.disconnect,
    reconnect: connection.reconnect,

    // Escape hatch for raw WS events (e.g., checkin.history.response)
    on: connection.on,
    off: connection.off,
  }
}

export type UseCheckInSocket = ReturnType<typeof useCheckInSocket>
