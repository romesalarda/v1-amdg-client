import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsTicketTypesList,
  bookingsTicketTypesRetrieve,
  bookingsTicketTypesCreate,
  bookingsTicketTypesUpdate,
  bookingsTicketTypesPartialUpdate,
  bookingsTicketTypesDestroy,
} from '~/api/sdk.gen'
import type {
  BookingsTicketTypesListData,
  BookingsTicketTypesCreateData,
  BookingsTicketTypesUpdateData,
  BookingsTicketTypesPartialUpdateData,
  BookingsTicketTypesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookingTicketTypes'] as const

/**
 * List all booking ticket types
 */
export function useBookingTicketTypes(params?: MaybeRefOrGetter<BookingsTicketTypesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsTicketTypesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single booking ticket type by ID
 */
export function useBookingTicketType(ticketTypeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', ticketTypeId] as const,
    queryFn: () => {
      const id = toValue(ticketTypeId)
      return bookingsTicketTypesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(ticketTypeId),
  })
}

/**
 * Create a new booking ticket type
 */
export function useCreateBookingTicketType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BookingsTicketTypesCreateData['body']) => bookingsTicketTypesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing booking ticket type (full update)
 */
export function useUpdateBookingTicketType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketTypeId, body }: { ticketTypeId: number; body: BookingsTicketTypesUpdateData['body'] }) =>
      bookingsTicketTypesUpdate({ path: { id: ticketTypeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.ticketTypeId],
      })
    },
  })
}

/**
 * Partially update an existing booking ticket type
 */
export function usePartialUpdateBookingTicketType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketTypeId, body }: { ticketTypeId: number; body?: BookingsTicketTypesPartialUpdateData['body'] }) =>
      bookingsTicketTypesPartialUpdate({ path: { id: ticketTypeId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.ticketTypeId],
      })
    },
  })
}

/**
 * Delete a booking ticket type
 */
export function useDeleteBookingTicketType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketTypeId: number) => bookingsTicketTypesDestroy({ path: { id: ticketTypeId } }),
    onSuccess: (_, ticketTypeId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', ticketTypeId],
      })
    },
  })
}
