import { useQuery, type QueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { client } from '~/api/client.gen'

const EVENT_QUERY_KEY = ['events'] as const

type UnknownRecord = Record<string, unknown>

export interface OutstandingPaymentsApiErrorLike {
  statusCode: number
  message: string
  data?: unknown
}

export interface OutstandingPaymentBookingSummary {
  booking_reference?: string
  booked_at?: string
  attendee_count?: number
}

export interface OutstandingPaymentItem {
  payment_reference?: string
  status?: string
  amount?: string
  currency?: string
  created_at?: string
  payment_method?: string
  payment_method_title?: string
  payment_instructions?: string
  payment_method_details?: Record<string, unknown> | null
  has_booking?: boolean
  checkout_intent_id?: string | null
  metadata_attendees?: string[]
  booking?: {
    booking?: OutstandingPaymentBookingSummary & Record<string, unknown>
    is_booking_owner?: boolean
    selection_reason?: 'made_by' | 'attendee_linked'
    can_manage_all_attendees?: boolean
  } | null
}

export interface OutstandingPaymentsPagination {
  count: number
  next: string | null
  previous: string | null
}

export interface EventMyOutstandingPaymentsResponse {
  items: OutstandingPaymentItem[]
  pagination: OutstandingPaymentsPagination
}

export interface EventMyOutstandingPaymentsQuery {
  page?: number
  attendee_name?: string
  booked_after?: string
  booked_before?: string
  booked_in_days?: number
  payment_status?: string
}

const AUTH_SECURITY = [
  { scheme: 'bearer', type: 'http' as const },
  { in: 'cookie', name: 'sessionid', type: 'apiKey' as const },
] as const

function toApiError(statusCode: number, data: unknown): OutstandingPaymentsApiErrorLike {
  if (typeof data === 'string') {
    return {
      statusCode,
      message: data,
      data,
    }
  }

  if (data && typeof data === 'object' && 'detail' in data) {
    return {
      statusCode,
      message: String((data as { detail?: unknown }).detail || 'Request failed'),
      data,
    }
  }

  return {
    statusCode,
    message: 'Request failed',
    data,
  }
}

function isObject(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeOutstandingPaymentsPayload(payload: unknown): EventMyOutstandingPaymentsResponse {
  if (!isObject(payload)) {
    return {
      items: [],
      pagination: {
        count: 0,
        next: null,
        previous: null,
      },
    }
  }

  const results = Array.isArray(payload.results)
    ? (payload.results as OutstandingPaymentItem[])
    : []

  return {
    items: results,
    pagination: {
      count: Number(payload.count || 0),
      next: (payload.next as string | null) || null,
      previous: (payload.previous as string | null) || null,
    },
  }
}

export function eventMyOutstandingPaymentsQueryKey(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventMyOutstandingPaymentsQuery | undefined>
) {
  return [...EVENT_QUERY_KEY, 'my-outstanding-booking-payments', eventId, params] as const
}

export function invalidateEventMyOutstandingPaymentsQuery(queryClient: QueryClient, eventId: string) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-outstanding-booking-payments', eventId],
    }),
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-outstanding-booking-payments'],
    }),
  ])
}

export function useEventMyOutstandingBookingPayments(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventMyOutstandingPaymentsQuery | undefined>
) {
  return useQuery({
    queryKey: eventMyOutstandingPaymentsQueryKey(eventId, params),
    queryFn: async () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)

      const response = await client.get<unknown>({
        url: '/api/event/list/{event_id}/my-outstanding-booking-payments/',
        path: { event_id: id },
        query: queryParams as Record<string, unknown> | undefined,
        security: AUTH_SECURITY,
        responseStyle: 'fields',
      })

      if (!response || response.error || !response.data) {
        const statusCode = response?.response?.status || 500
        throw toApiError(statusCode, response?.error)
      }

      return normalizeOutstandingPaymentsPayload(response.data)
    },
    enabled: () => !!toValue(eventId),
  })
}
