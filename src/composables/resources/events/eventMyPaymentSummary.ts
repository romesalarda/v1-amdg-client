import { useQuery, type QueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { client } from '~/api/client.gen'

const EVENT_QUERY_KEY = ['events'] as const

type UnknownRecord = Record<string, unknown>

export interface EventMyPaymentSummaryApiErrorLike {
  statusCode: number
  message: string
  data?: unknown
}

export interface EventMyPaymentSummaryItem {
  payment_id?: string
  payment_reference?: string
  status?: string
  amount?: string
  currency?: string | null
  created_at?: string | null
  method_type?: string | null
  method_title?: string | null
  provided_details?: Record<string, unknown> | null
  bank_reference?: string | null
  source?: 'BOOKING' | 'SHOP_ORDER' | string
  is_outstanding?: boolean
  descriptor?: string | null
  order_id?: string | null
  order_reference?: string | null
  order_status?: string | null
  attendee_id?: string | null
  attendee_display_id?: string | null
  attendee_name?: string | null
}

export interface EventMyPaymentSummaryTotals {
  total_payments: number
  outstanding_payments: number
  booking_outstanding_payments: number
  shop_outstanding_payments: number
  total_outstanding_amount: string
}

export interface EventMyPaymentSummaryResponse {
  booking_reference: string
  attendee_filter: string | null
  totals: EventMyPaymentSummaryTotals
  booking_payments: EventMyPaymentSummaryItem[]
  shop_payments: EventMyPaymentSummaryItem[]
  attendee_payments: EventMyPaymentSummaryItem[]
  outstanding_payments: EventMyPaymentSummaryItem[]
}

export interface EventMyPaymentSummaryQuery {
  booking_reference?: string
  attendee_id?: string
}

const AUTH_SECURITY = [
  { scheme: 'bearer', type: 'http' as const },
  { in: 'cookie', name: 'sessionid', type: 'apiKey' as const },
] as const

function toApiError(statusCode: number, data: unknown): EventMyPaymentSummaryApiErrorLike {
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

function toPaymentItems(value: unknown): EventMyPaymentSummaryItem[] {
  return Array.isArray(value) ? (value as EventMyPaymentSummaryItem[]) : []
}

function normalizeMyPaymentSummaryPayload(payload: unknown): EventMyPaymentSummaryResponse {
  if (!isObject(payload)) {
    return {
      booking_reference: '',
      attendee_filter: null,
      totals: {
        total_payments: 0,
        outstanding_payments: 0,
        booking_outstanding_payments: 0,
        shop_outstanding_payments: 0,
        total_outstanding_amount: '0.00',
      },
      booking_payments: [],
      shop_payments: [],
      attendee_payments: [],
      outstanding_payments: [],
    }
  }

  const totals = isObject(payload.totals) ? payload.totals : {}

  return {
    booking_reference: String(payload.booking_reference || ''),
    attendee_filter: payload.attendee_filter ? String(payload.attendee_filter) : null,
    totals: {
      total_payments: Number((totals as UnknownRecord).total_payments || 0),
      outstanding_payments: Number((totals as UnknownRecord).outstanding_payments || 0),
      booking_outstanding_payments: Number((totals as UnknownRecord).booking_outstanding_payments || 0),
      shop_outstanding_payments: Number((totals as UnknownRecord).shop_outstanding_payments || 0),
      total_outstanding_amount: String((totals as UnknownRecord).total_outstanding_amount || '0.00'),
    },
    booking_payments: toPaymentItems(payload.booking_payments),
    shop_payments: toPaymentItems(payload.shop_payments),
    attendee_payments: toPaymentItems(payload.attendee_payments),
    outstanding_payments: toPaymentItems(payload.outstanding_payments),
  }
}

export function eventMyPaymentSummaryQueryKey(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventMyPaymentSummaryQuery | undefined>
) {
  return [...EVENT_QUERY_KEY, 'my-payment-summary', eventId, params] as const
}

export function invalidateEventMyPaymentSummaryQuery(queryClient: QueryClient, eventId: string) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-payment-summary', eventId],
    }),
    queryClient.invalidateQueries({
      queryKey: [...EVENT_QUERY_KEY, 'my-payment-summary'],
    }),
  ])
}

export function useEventMyPaymentSummary(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventMyPaymentSummaryQuery | undefined>
) {
  return useQuery({
    queryKey: eventMyPaymentSummaryQueryKey(eventId, params),
    queryFn: async () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)

      const response = await client.get<unknown>({
        url: '/api/event/list/{event_id}/my-payment-summary/',
        path: { event_id: id },
        query: queryParams as Record<string, unknown> | undefined,
        security: AUTH_SECURITY,
        responseStyle: 'fields',
      })

      if (!response || response.error || !response.data) {
        const statusCode = response?.response?.status || 500
        throw toApiError(statusCode, response?.error)
      }

      return normalizeMyPaymentSummaryPayload(response.data)
    },
    enabled: () => !!toValue(eventId),
  })
}
