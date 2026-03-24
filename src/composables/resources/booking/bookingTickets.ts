import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsTicketsList,
  bookingsTicketsRetrieve,
} from '~/api/sdk.gen'
import { client } from '~/api/client.gen'
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

// Manual SDK wrapper for ticket partial update (endpoint not present in generated SDK methods)
const bookingsTicketsPartialUpdate = (options: {
  path: { ticket_id: string }
  body: {
    status?: 'ACTIVE' | 'CANCELLED' | 'USED'
    uses?: number
  }
}) => client.patch({
  url: '/api/bookings/tickets/{ticket_id}/',
  ...options,
})

/**
 * Partially update a booking ticket (e.g. disable/cancel ticket)
 */
export function usePartialUpdateBookingTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, body }: { ticketId: string; body: { status?: 'ACTIVE' | 'CANCELLED' | 'USED'; uses?: number } }) =>
      bookingsTicketsPartialUpdate({
        path: { ticket_id: ticketId },
        body,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.ticketId] })
    },
  })
}
