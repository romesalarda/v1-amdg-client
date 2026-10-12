import type { MaybeRef } from 'vue'
import type { WSUnsubscribe } from '~/types/websocket'
import { getWebSocketToken } from '~/utils/websocket-api'
import { useRealtimeConnection } from '~/composables/useRealtimeConnection'

export interface DashboardPresenceUser {
  id: number
  email: string
  name: string
  profile_picture_url: string | null
  event_id: string
}

interface DashboardPresenceState {
  sections: Record<string, DashboardPresenceUser[]>
  timestamp: string
}

export function useDashboardPresence(
  eventIdentifier: MaybeRef<string>,
  activeSection: MaybeRef<string>,
) {
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  const sections = ref<Record<string, DashboardPresenceUser[]>>({})
  let disposed = false

  const connection = useRealtimeConnection({
    url: computed(
      () => `/ws/events/${unref(eventIdentifier)}/dashboard/presence/`,
    ),
    token: computed(() => token.value),
    heartbeatInterval: 30000,
    pongTimeout: 10000,
    maxReconnectAttempts: 5,
    autoConnect: false,
    handleVisibilityChange: true,
    onConnected: () => {
      connection.emit('page.change', { section: unref(activeSection) })
    },
    onDisconnected: () => {
      sections.value = {}
    },
    onError: (error) => {
      console.error('[DashboardPresence] Connection error:', error.message)
    },
  })

  const unsubscribePresence = connection.on<DashboardPresenceState>(
    'presence.state',
    (state) => {
      sections.value = state.sections
    },
  )

  async function refreshToken(): Promise<void> {
    const tokenData = await getWebSocketToken(unref(eventIdentifier))
    if (disposed) return

    token.value = tokenData.token
    tokenExpiresAt.value = Date.now() + tokenData.expires_in * 1000
  }

  function usersForSection(section: string): DashboardPresenceUser[] {
    return sections.value[section] ?? []
  }

  watch(
    () => unref(activeSection),
    (section) => {
      if (connection.isConnected.value) {
        connection.emit('page.change', { section })
      }
    },
  )

  watch(
    () => unref(eventIdentifier),
    async (eventId, previousEventId) => {
      if (!eventId || eventId === previousEventId) return
      sections.value = {}
      try {
        await refreshToken()
      } catch (error) {
        console.error('[DashboardPresence] Failed to refresh token:', error)
      }
    },
  )

  if (import.meta.client) {
    refreshToken()
      .then(() => {
        if (!disposed) connection.connect()
      })
      .catch((error: unknown) => {
        console.error('[DashboardPresence] Failed to fetch initial token:', error)
      })

    const tokenRefreshInterval = window.setInterval(async () => {
      if (!token.value || !tokenExpiresAt.value) return
      if (Date.now() < tokenExpiresAt.value - 60000) return

      try {
        await refreshToken()
      } catch (error) {
        console.error('[DashboardPresence] Failed to refresh token:', error)
      }
    }, 30000)

    onBeforeUnmount(() => {
      disposed = true
      window.clearInterval(tokenRefreshInterval)
      unsubscribePresence()
      connection.disconnect()
    })
  }

  return {
    ...connection,
    sections: readonly(sections),
    usersForSection,
  }
}
