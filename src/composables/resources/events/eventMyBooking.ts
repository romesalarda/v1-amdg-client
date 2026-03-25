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

export function eventMyBookingQueryKey(eventId: MaybeRefOrGetter<string>) {
  return [...EVENT_QUERY_KEY, 'my-booking', eventId] as const
}

export function invalidateEventMyBookingQuery(queryClient: QueryClient, eventId: string) {
  return queryClient.invalidateQueries({
    queryKey: [...EVENT_QUERY_KEY, 'my-booking', eventId],
  })
}

export function useEventMyBooking(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: eventMyBookingQueryKey(eventId),
    queryFn: async () => {
      const id = toValue(eventId)
      const response = await client.get<EventMyBookingResponse>({
        url: '/api/event/list/{event_id}/my-booking/',
        path: { event_id: id },
        security: AUTH_SECURITY,
        responseStyle: 'fields',
      })

      if (!response || response.error || !response.data) {
        const statusCode = response?.response?.status || 500
        throw toApiError(statusCode, response?.error)
      }

      return response.data
    },
    enabled: () => !!toValue(eventId),
  })
}
