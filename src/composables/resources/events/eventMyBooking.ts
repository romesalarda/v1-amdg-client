import { useQuery, type QueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { client } from '~/api/client.gen'
import type { BookingDetail } from '~/api/types.gen'

const EVENT_QUERY_KEY = ['events'] as const

export type EventMyBookingSelectionReason = 'made_by' | 'attendee_linked'

export interface EventMyBookingEventSummary {
  event_id: string
  display_identifier: string
  title: string
  status: string
  start_datetime: string
  end_datetime: string
  timezone: string
}

export interface EventMyBookingResponse {
  event: EventMyBookingEventSummary
  primary_booking_reference: string
  bookings: EventMyBookingItem[]
  pagination?: EventMyBookingPagination
}

export interface EventMyBookingPagination {
  count: number
  next: string | null
  previous: string | null
}

export interface EventMyBookingQuery {
  page?: number
  attendee_name?: string
  booked_after?: string
  booked_before?: string
  booked_in_days?: number
  booking_reference?: string
  has_outstanding_payments?: boolean
}

export interface EventMyBookingItem {
  booking: BookingDetail
  is_booking_owner: boolean
  selection_reason: EventMyBookingSelectionReason
  can_manage_all_attendees: boolean
}

export interface ApiErrorLike {
  statusCode: number
  message: string
  data?: unknown
}

type UnknownRecord = Record<string, unknown>

const AUTH_SECURITY = [
  { scheme: 'bearer', type: 'http' as const },
  { in: 'cookie', name: 'sessionid', type: 'apiKey' as const },
] as const

function toApiError(statusCode: number, data: unknown): ApiErrorLike {
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

function toBookingItems(value: unknown): EventMyBookingItem[] {
  return Array.isArray(value) ? (value as EventMyBookingItem[]) : []
}

function normalizeMyBookingPayload(payload: unknown): EventMyBookingResponse {
  if (!isObject(payload)) {
    return {
      event: {
        event_id: '',
        display_identifier: '',
        title: 'My booking',
        status: '',
        start_datetime: '',
        end_datetime: '',
        timezone: '',
      },
      primary_booking_reference: '',
      bookings: [],
      pagination: {
        count: 0,
        next: null,
        previous: null,
      },
    }
  }

  // New backend shape: { count, next, previous, results: { event, primary_booking_reference, bookings } }
  if (isObject(payload.results)) {
    const results = payload.results as UnknownRecord
    return {
      event: (results.event as EventMyBookingEventSummary) || {
        event_id: '',
        display_identifier: '',
        title: 'My booking',
        status: '',
        start_datetime: '',
        end_datetime: '',
        timezone: '',
      },
      primary_booking_reference: String(results.primary_booking_reference || ''),
      bookings: toBookingItems(results.bookings),
      pagination: {
        count: Number(payload.count || 0),
        next: (payload.next as string | null) || null,
        previous: (payload.previous as string | null) || null,
      },
    }
  }

  // Legacy shape: { event, primary_booking_reference, bookings }
  return {
    event: (payload.event as EventMyBookingEventSummary) || {
      event_id: '',
      display_identifier: '',
      title: 'My booking',
      status: '',
      start_datetime: '',
      end_datetime: '',
      timezone: '',
    },
    primary_booking_reference: String(payload.primary_booking_reference || ''),
    bookings: toBookingItems(payload.bookings),
    pagination: {
      count: toBookingItems(payload.bookings).length,
      next: null,
      previous: null,
    },
  }
}

export function eventMyBookingQueryKey(eventId: MaybeRefOrGetter<string>) {
  return [...EVENT_QUERY_KEY, 'my-booking', eventId] as const
}

export function eventMyBookingListQueryKey(eventId: MaybeRefOrGetter<string>, params?: MaybeRefOrGetter<EventMyBookingQuery | undefined>) {
  return [...EVENT_QUERY_KEY, 'my-booking', eventId, params] as const
}

export function invalidateEventMyBookingQuery(queryClient: QueryClient, eventId: string) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-booking', eventId],
    }),
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-booking'],
    }),
  ])
}

export function useEventMyBooking(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventMyBookingQuery | undefined>
) {
  return useQuery({
    queryKey: eventMyBookingListQueryKey(eventId, params),
    queryFn: async () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)
      const response = await client.get<unknown>({
        url: '/api/event/list/{event_id}/my-booking/',
        path: { event_id: id },
        query: queryParams as Record<string, unknown> | undefined,
        security: AUTH_SECURITY,
        responseStyle: 'fields',
      })

      if (!response || response.error || !response.data) {
        const statusCode = response?.response?.status || 500
        throw toApiError(statusCode, response?.error)
      }

      return normalizeMyBookingPayload(response.data)
    },
    enabled: () => !!toValue(eventId),
  })
}
