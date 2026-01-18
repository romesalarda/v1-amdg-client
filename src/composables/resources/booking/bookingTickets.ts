import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsTicketsList,
  bookingsTicketsRetrieve,
} from '~/api/sdk.gen'
import type {
  BookingsTicketsListData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookingTickets'] as const

/**
 * List all booking tickets
 */
export function useBookingTickets(params?: MaybeRefOrGetter<BookingsTicketsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsTicketsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single booking ticket by ID
 */
export function useBookingTicket(ticketId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', ticketId] as const,
    queryFn: () => {
      const id = toValue(ticketId)
      return bookingsTicketsRetrieve({ path: { ticket_id: id } })
    },
    enabled: () => !!toValue(ticketId),
  })
}
