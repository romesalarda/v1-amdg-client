import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsAlternativeSigninsList,
  bookingsAlternativeSigninsRetrieve,
  bookingsAlternativeSigninsCreate,
  bookingsAlternativeSigninsUpdate,
  bookingsAlternativeSigninsPartialUpdate,
  bookingsAlternativeSigninsDestroy,
  bookingsAttendeeAlternativeSigninsList,
  bookingsAttendeeAlternativeSigninsRetrieve,
  bookingsAttendeeAlternativeSigninsCreate,
  bookingsAttendeeAlternativeSigninsUpdate,
  bookingsAttendeeAlternativeSigninsPartialUpdate,
  bookingsAttendeeAlternativeSigninsDestroy,
} from '~/api/sdk.gen'
import type {
  BookingsAlternativeSigninsListData,
  BookingsAlternativeSigninsCreateData,
  BookingsAlternativeSigninsUpdateData,
  BookingsAlternativeSigninsPartialUpdateData,
  BookingsAlternativeSigninsDestroyData,
  BookingsAttendeeAlternativeSigninsListData,
  BookingsAttendeeAlternativeSigninsCreateData,
  BookingsAttendeeAlternativeSigninsUpdateData,
  BookingsAttendeeAlternativeSigninsPartialUpdateData,
  BookingsAttendeeAlternativeSigninsDestroyData,
} from '~/api/types.gen'

const BOOKING_QUERY_KEY = ['bookingAlternativeSignins'] as const
const ATTENDEE_QUERY_KEY = ['attendeeAlternativeSignins'] as const

/**
 * List all alternative signins for bookings
 */
export function useBookingAlternativeSignins(params?: MaybeRefOrGetter<BookingsAlternativeSigninsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...BOOKING_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsAlternativeSigninsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single booking alternative signin by ID
 */
export function useBookingAlternativeSignin(signinId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...BOOKING_QUERY_KEY, 'detail', signinId] as const,
    queryFn: () => {
      const id = toValue(signinId)
      return bookingsAlternativeSigninsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(signinId),
  })
}

/**
 * Create a new booking alternative signin
 */
export function useCreateBookingAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BookingsAlternativeSigninsCreateData['body']) => bookingsAlternativeSigninsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY })
    },
  })
}

/**
 * Update an existing booking alternative signin (full update)
 */
export function useUpdateBookingAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ signinId, body }: { signinId: string; body: BookingsAlternativeSigninsUpdateData['body'] }) =>
      bookingsAlternativeSigninsUpdate({ path: { id: signinId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...BOOKING_QUERY_KEY, 'detail', variables.signinId],
      })
    },
  })
}

/**
 * Partially update an existing booking alternative signin
 */
export function usePartialUpdateBookingAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ signinId, body }: { signinId: string; body?: BookingsAlternativeSigninsPartialUpdateData['body'] }) =>
      bookingsAlternativeSigninsPartialUpdate({ path: { id: signinId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...BOOKING_QUERY_KEY, 'detail', variables.signinId],
      })
    },
  })
}

/**
 * Delete a booking alternative signin
 */
export function useDeleteBookingAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (signinId: string) => bookingsAlternativeSigninsDestroy({ path: { id: signinId } }),
    onSuccess: (_, signinId) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...BOOKING_QUERY_KEY, 'detail', signinId],
      })
    },
  })
}

/**
 * List all attendee alternative signins
 */
export function useAttendeeAlternativeSignins(params?: MaybeRefOrGetter<BookingsAttendeeAlternativeSigninsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...ATTENDEE_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsAttendeeAlternativeSigninsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single attendee alternative signin by ID
 */
export function useAttendeeAlternativeSignin(signId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...ATTENDEE_QUERY_KEY, 'detail', signId] as const,
    queryFn: () => {
      const id = toValue(signId)
      return bookingsAttendeeAlternativeSigninsRetrieve({ path: { sign_id: id } })
    },
    enabled: () => !!toValue(signId),
  })
}

/**
 * Create a new attendee alternative signin
 */
export function useCreateAttendeeAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BookingsAttendeeAlternativeSigninsCreateData['body']) => bookingsAttendeeAlternativeSigninsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDEE_QUERY_KEY })
    },
  })
}

/**
 * Update an existing attendee alternative signin (full update)
 */
export function useUpdateAttendeeAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ signId, body }: { signId: string; body: BookingsAttendeeAlternativeSigninsUpdateData['body'] }) =>
      bookingsAttendeeAlternativeSigninsUpdate({ path: { sign_id: signId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ATTENDEE_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...ATTENDEE_QUERY_KEY, 'detail', variables.signId],
      })
    },
  })
}

/**
 * Partially update an existing attendee alternative signin
 */
export function usePartialUpdateAttendeeAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ signId, body }: { signId: string; body?: BookingsAttendeeAlternativeSigninsPartialUpdateData['body'] }) =>
      bookingsAttendeeAlternativeSigninsPartialUpdate({ path: { sign_id: signId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ATTENDEE_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...ATTENDEE_QUERY_KEY, 'detail', variables.signId],
      })
    },
  })
}

/**
 * Delete an attendee alternative signin
 */
export function useDeleteAttendeeAlternativeSignin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (signId: string) => bookingsAttendeeAlternativeSigninsDestroy({ path: { sign_id: signId } }),
    onSuccess: (_, signId) => {
      queryClient.invalidateQueries({ queryKey: ATTENDEE_QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...ATTENDEE_QUERY_KEY, 'detail', signId],
      })
    },
  })
}
