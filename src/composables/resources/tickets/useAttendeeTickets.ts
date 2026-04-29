/**
 * Composable for fetching tickets for a specific attendee
 *
 * Provides Vue Query-based data fetching for attendee tickets
 * with reactive parameters and caching
 */

import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { bookingsTicketsList, bookingsTicketsRetrieve } from '~/api/sdk.gen'
import type { BookingsTicketsListData } from '~/api/types.gen'

const QUERY_KEY = ['bookings', 'tickets'] as const

/**
 * Fetch all tickets for a specific attendee
 *
 * @param attendeeId - UUID of the attendee to fetch tickets for
 * @param filters - Optional additional filters (status, ordering, etc.)
 * @returns Vue Query result with ticket data, loading states, and refetch
 *
 * @example
 * const attendeeId = computed(() => selectedAttendee.value?.id || '')
 * const { data, isLoading, error } = useAttendeeTickets(attendeeId)
 *
 * // data.value will be: { count, next, previous, results: [...] }
 */
export function useAttendeeTickets(
  attendeeId: MaybeRefOrGetter<string | undefined>,
  filters?: MaybeRefOrGetter<Omit<BookingsTicketsListData['query'], 'attendee'> | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'attendee', attendeeId, filters] as const,
    queryFn: async () => {
      const id = toValue(attendeeId)
      const additionalFilters = toValue(filters)

      const query: BookingsTicketsListData['query'] = {
        attendee: id,
        page_size: 100, // Fetch up to 100 tickets per attendee
        ...additionalFilters,
      }

      return bookingsTicketsList({ query })
    },
    enabled: () => {
      const id = toValue(attendeeId)
      return !!id
    },
  })
}

/**
 * Fetch all tickets for a booking (all attendees)
 *
 * @param bookingReference - Booking reference code (e.g., 'BKG-EURO26WAO-...')
 * @param filters - Optional additional filters (status, ordering, etc.)
 * @returns Vue Query result with ticket data
 *
 * @example
 * const { data: tickets } = useBookingTicketsForReference('BKG-EURO26WAO-3C266E290DEB48288DF64F79A2DB0659')
 */
export function useBookingTicketsForReference(
  bookingReference: MaybeRefOrGetter<string | undefined>,
  filters?: MaybeRefOrGetter<Omit<BookingsTicketsListData['query'], 'booking__reference'> | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking', 'reference', bookingReference, filters] as const,
    queryFn: async () => {
      const reference = toValue(bookingReference)
      const additionalFilters = toValue(filters)

      const query: BookingsTicketsListData['query'] = {
        booking__reference: reference,
        page_size: 100,
        ...additionalFilters,
      }

      return bookingsTicketsList({ query })
    },
    enabled: () => {
      const reference = toValue(bookingReference)
      return !!reference
    },
  })
}

/**
 * Fetch active tickets only for an attendee
 *
 * Convenience wrapper that automatically filters for ACTIVE status
 *
 * @param attendeeId - UUID of the attendee
 * @param orderBy - Field to order results by (default: '-issued_at')
 * @returns Vue Query result
 *
 * @example
 * const { data: activeTickets } = useAttendeeActiveTickets(attendeeId)
 */
export function useAttendeeActiveTickets(
  attendeeId: MaybeRefOrGetter<string | undefined>,
  orderBy: MaybeRefOrGetter<string> = '-issued_at'
) {
  return useAttendeeTickets(attendeeId, {
    status: ['ACTIVE'],
    ordering: toValue(orderBy),
  })
}

/**
 * Fetch a single ticket with full details
 *
 * @param ticketId - UUID of the ticket to fetch
 * @returns Vue Query result with single ticket data
 *
 * @example
 * const { data: ticket } = useTicketDetail(ticketId)
 * // data.value will be TicketDetail object with all fields
 */
export function useTicketDetail(ticketId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', ticketId] as const,
    queryFn: async () => {
      const id = toValue(ticketId)
      if (!id) {
        throw new Error('ticketId is required')
      }
      return bookingsTicketsRetrieve({ path: { ticket_id: id } })
    },
    enabled: () => {
      const id = toValue(ticketId)
      return !!id
    },
  })
}
