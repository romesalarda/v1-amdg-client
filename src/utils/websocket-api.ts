import type { WSTokenResponse } from '~/types/websocket'
import { eventListWsTokenCreate } from '~/api/sdk.gen'

/**
 * Fetch WebSocket authentication token for an event.
 * Token is valid for 5 minutes.
 * 
 * @param eventId - UUID of the event
 * @returns Promise resolving to WSTokenResponse with token, expires_in, and ws_url
 * @throws Error if token fetch fails
 * 
 * @example
 * ```ts
 * const tokenData = await getWebSocketToken('abc-123-def')
 * // Use tokenData.token to connect to WebSocket
 * ```
 */
export async function getWebSocketToken(eventIdentifier: string): Promise<WSTokenResponse> {
  try {
    const response = await eventListWsTokenCreate({
      path: {
        url_safe_title: eventIdentifier
      }
    } as any) // Cast to any - OpenAPI spec incorrectly requires body
    
    if (!response.data) {
      throw new Error('No token data received from server')
    }
    
    return response.data as WSTokenResponse
  } catch (error) {
    console.error('[WebSocket API] Failed to fetch token:', error)
    throw new Error(
      error instanceof Error 
        ? `Token fetch failed: ${error.message}` 
        : 'Failed to fetch WebSocket token'
    )
  }
}
