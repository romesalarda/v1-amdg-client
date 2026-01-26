import type { EventQuestion } from '~/api/types.gen'

/**
 * WebSocket connection states
 */
export type WSConnectionState = 'connecting' | 'authenticating' | 'connected' | 'disconnecting' | 'disconnected' | 'error'

/**
 * Token response from /ws-token/ endpoint
 */
export interface WSTokenResponse {
  token: string
  expires_in: number
  ws_url: string
}

/**
 * Base WebSocket message structure
 */
export interface WSMessage<T = any> {
  type: string
  data: T
  timestamp: string
}

/**
 * Question event types for real-time sync
 */
export type QuestionEventType = 'question.created' | 'question.updated' | 'question.deleted' | 'question.reordered'

/**
 * Question event data payload
 */
export interface QuestionEventData {
  type: QuestionEventType
  question: EventQuestion
  timestamp: string
  actor?: {
    id: number
    email: string
    name?: string
  }
}

/**
 * Question reordered event data
 */
export interface QuestionReorderedData {
  type: 'question.reordered'
  question_ids: string[]
  timestamp: string
  actor?: {
    id: number
    email: string
    name?: string
  }
}

/**
 * Question deleted event data
 */
export interface QuestionDeletedData {
  type: 'question.deleted'
  question_id: string
  timestamp: string
  actor?: {
    id: number
    email: string
    name?: string
  }
}

/**
 * Connection success message
 */
export interface ConnectionMessage {
  type: 'connected'
  user: {
    id: number
    email: string
    name?: string
  }
}

/**
 * Error message from server
 */
export interface ErrorMessage {
  type: 'error'
  code: string
  message: string
  details?: Record<string, any>
}

/**
 * Heartbeat ping message
 */
export interface PingMessage {
  type: 'ping'
  timestamp: string
}

/**
 * Heartbeat pong response
 */
export interface PongMessage {
  type: 'pong'
  timestamp: string
}

/**
 * Union of all possible WebSocket message types
 */
export type WSMessageUnion =
  | ConnectionMessage
  | ErrorMessage
  | PingMessage
  | PongMessage
  | WSMessage<QuestionEventData>
  | WSMessage<QuestionReorderedData>
  | WSMessage<QuestionDeletedData>

/**
 * Message handler function type
 */
export type WSMessageHandler<T = any> = (data: T) => void

/**
 * Unsubscribe function returned by event listeners
 */
export type WSUnsubscribe = () => void
