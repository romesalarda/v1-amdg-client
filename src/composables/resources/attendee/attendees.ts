import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesCancelCreate,
  attendeesList,
  attendeesRetrieve,
  attendeesCreate,
  attendeesUpdate,
  attendeesDestroy,
  attendeesPreRemovalSummaryRetrieve,
  attendeesRequestCancellationRefundCreate,
} from '~/api/sdk.gen'
import type {
  AttendeesCancelCreateData,
  AttendeesListData,
  AttendeesCreateData,
  AttendeesUpdateData,
  AttendeesDestroyData,
  AttendeesRequestCancellationRefundCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendees'] as const

export interface AttendeePreRemovalRefundSummary {
  refund_id: string
  tracking_reference: string
  verification_status: string
  is_active: boolean
  amount: string
  requested_at?: string | null
  requested_by_name?: string | null
  reason?: string
}

export interface AttendeePreRemovalBlockerItem {
  type?: 'payment' | 'ticket' | 'order'

  payment_id?: string | null
  payment_reference?: string | null
  payment_type?: string | null
  payment_descriptor?: string | null
  payment_status?: string | null
  payment_status_bucket?: string | null
  amount?: string | null
  currency?: string | null
  method_type?: string | null
  method_title?: string | null
  can_request_refund?: boolean
  refund_block_reason?: string | null

  booking_id?: string | null
  booking_reference?: string | null
  booking_attendee_count?: number

  ticket_id?: string | null
  ticket_code?: string | null
  ticket_type?: string | null
  ticket_scope?: string | null

  order_id?: string | null
  order_reference?: string | null
  order_status?: string | null
  order_amount?: string | null
  order_attendee_id?: string | null
  order_attendee_name?: string | null
  status?: string | null

  event_id?: string | null
  event_title?: string | null
  check_in_time?: string | null
  check_out_time?: string | null
  attendance_id?: string | null

  active_refunds?: AttendeePreRemovalRefundSummary[]
  active_refund_count?: number

  _links?: {
    self?: string | null
    refund_requests?: string | null
    method?: string | null
  }
}

export interface AttendeePreRemovalBlockerPagination {
  count: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  next_page?: number | null
  previous_page?: number | null
}

export interface AttendeePreRemovalBlocker {
  code: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  count: number
  message: string
  items: AttendeePreRemovalBlockerItem[]
  pagination?: AttendeePreRemovalBlockerPagination
  action_hint: string
}

export interface AttendeePreRemovalSummary {
  attendee: {
    attendee_id: string
    attendee_display_id: string
    full_name: string
  }
  can_delete: boolean
  blockers: AttendeePreRemovalBlocker[]
  summary_counts: {
    active_tickets: number
    unresolved_orders: number
    total_blockers: number
    high_priority_blockers: number
    medium_priority_blockers: number
  }
  suggested_actions: Array<{
    code: string
    message: string
  }>
}

export interface AttendeePreRemovalSummaryQuery {
  page?: number
  page_size?: number
}

/**
 * List all attendees
 */
export function useAttendees(params?: MaybeRefOrGetter<AttendeesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single attendee by ID
 */
export function useAttendee(attendeeId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', attendeeId] as const,
    queryFn: () => {
      const id = toValue(attendeeId)
      return attendeesRetrieve({ path: { attendee_id: id } })
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Create a new attendee
 */
export function useCreateAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AttendeesCreateData['body']) => attendeesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing attendee
 */
export function useUpdateAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesUpdateData['body'] }) =>
      attendeesUpdate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId],
      })
    },
  })
}

/**
 * Delete an attendee
 */
export function useDeleteAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendeeId: string) => attendeesDestroy({ path: { attendee_id: attendeeId } }),
    onSuccess: (_, attendeeId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', attendeeId],
      })
    },
  })
}

/**
 * Get pre-removal summary and blockers before deleting an attendee
 */
export function useAttendeePreRemovalSummary(
  attendeeId: MaybeRefOrGetter<string>,
  query?: MaybeRefOrGetter<AttendeePreRemovalSummaryQuery | undefined>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'pre-removal-summary', attendeeId, query] as const,
    queryFn: async () => {
      const id = toValue(attendeeId)
      const queryParams = toValue(query)
      const response = await attendeesPreRemovalSummaryRetrieve({
        path: { attendee_id: id },
        ...(queryParams ? { query: queryParams as any } : {}),
      } as any)
      return response as { data: AttendeePreRemovalSummary }
    },
    enabled: () => !!toValue(attendeeId),
  })
}

/**
 * Request attendee-scoped cancellation refund
 */
export function useRequestAttendeeCancellationRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: AttendeesRequestCancellationRefundCreateData['body'] }) =>
      attendeesRequestCancellationRefundCreate({ path: { attendee_id: attendeeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId],
      })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'pre-removal-summary', variables.attendeeId],
      })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentRefunds'] })
    },
  })
}

/**
 * Cancel attendee registration without deleting attendee record
 */
export function useCancelAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body?: AttendeesCancelCreateData['body'] }) =>
      attendeesCancelCreate({
        path: { attendee_id: attendeeId },
        body: body ?? { invalidate: false },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.attendeeId],
      })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'pre-removal-summary', variables.attendeeId],
      })
    },
  })
}
