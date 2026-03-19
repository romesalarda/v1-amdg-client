import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsIntentsList,
  bookingsIntentsRetrieve,
  bookingsIntentsCreate,
  bookingsIntentsUpdate,
  bookingsIntentsPartialUpdate,
  bookingsIntentsDestroy,
  bookingsIntentCancel,
  bookingsListPingIntentRetrieve,
} from '~/api/sdk.gen'
import type {
  BookingsIntentsListData,
  BookingsIntentsCreateData,
  BookingsIntentsUpdateData,
  BookingsIntentsPartialUpdateData,
  BookingsIntentsDestroyData,
  BookingsIntentCancelData,
  BookingsListPingIntentRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookingIntents'] as const

/**
 * List all booking intents
 */
export function useBookingIntents(params?: MaybeRefOrGetter<BookingsIntentsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsIntentsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single booking intent by ID
 */
export function useBookingIntent(intentId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', intentId] as const,
    queryFn: () => {
      const id = toValue(intentId)
      return bookingsIntentsRetrieve({ path: { booking_intent_id: id } })
    },
    enabled: () => !!toValue(intentId),
  })
}

/**
 * Create a new booking intent
 */
export function useCreateBookingIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BookingsIntentsCreateData['body']) => bookingsIntentsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing booking intent (full update)
 */
export function useUpdateBookingIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ intentId, body }: { intentId: string; body: BookingsIntentsUpdateData['body'] }) =>
      bookingsIntentsUpdate({ path: { booking_intent_id: intentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.intentId],
      })
    },
  })
}

/**
 * Partially update an existing booking intent
 */
export function usePartialUpdateBookingIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ intentId, body }: { intentId: string; body?: BookingsIntentsPartialUpdateData['body'] }) =>
      bookingsIntentsPartialUpdate({ path: { booking_intent_id: intentId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.intentId],
      })
    },
  })
}

/**
 * Delete a booking intent
 */
export function useDeleteBookingIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (intentId: string) => bookingsIntentsDestroy({ path: { booking_intent_id: intentId } }),
    onSuccess: (_, intentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', intentId],
      })
    },
  })
}

/**
 * Cancel a booking intent
 */
export function useCancelBookingIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (intentId: string) => bookingsIntentCancel({ path: { booking_intent_id: intentId } }),
    onSuccess: (_, intentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', intentId],
      })
    },
  })
}

/**
 * Ping booking intent to retrieve latest status and keep expiry alive.
 */
export function usePingBookingIntent() {
  return useMutation({
    mutationFn: (query: BookingsListPingIntentRetrieveData['query']) =>
      bookingsListPingIntentRetrieve({ query }),
  })
}
