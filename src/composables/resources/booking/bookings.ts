import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsListList,
  bookingsListRetrieve,
  bookingsListCreate,
  bookingsListUpdate,
  bookingsListDestroy,
  bookingsCheckout,
} from '~/api/sdk.gen'
import type {
  BookingsListListData,
  BookingsListCreateData,
  BookingsListUpdateData,
  BookingsListDestroyData,
  BookingsCheckoutData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookings'] as const

/**
 * List all bookings
 */
export function useBookings(params?: MaybeRefOrGetter<BookingsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single booking by ID
 */
export function useBooking(bookingId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', bookingId] as const,
    queryFn: () => {
      const id = toValue(bookingId)
      return bookingsListRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(bookingId),
  })
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, query }: { body?: BookingsListCreateData['body']; query?: BookingsListCreateData['query'] }) =>
      bookingsListCreate({ body, query }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing booking
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, body }: { bookingId: number; body?: BookingsListUpdateData['body'] }) =>
      bookingsListUpdate({ path: { id: bookingId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.bookingId],
      })
    },
  })
}

/**
 * Delete a booking
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: number) => bookingsListDestroy({ path: { id: bookingId } }),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', bookingId],
      })
    },
  })
}

/**
 * Checkout a booking
 */
export function useCheckoutBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BookingsCheckoutData['body'] | { body: BookingsCheckoutData['body']; idempotencyKey?: string }) => {
      if ('body' in input) {
        return bookingsCheckout({
          body: input.body,
          headers: input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : undefined,
        })
      }

      return bookingsCheckout({ body: input })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
