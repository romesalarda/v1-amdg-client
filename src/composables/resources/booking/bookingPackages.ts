import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsPackagesList,
  bookingsPackagesRetrieve,
  bookingsPackagesCreate,
  bookingsPackagesUpdate,
  bookingsPackagesPartialUpdate,
  bookingsPackagesDestroy,
} from '~/api/sdk.gen'
import type {
  BookingsPackagesListData,
  BookingsPackagesCreateData,
  BookingsPackagesUpdateData,
  BookingsPackagesPartialUpdateData,
  BookingsPackagesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookingPackages'] as const

/**
 * List all booking packages
 */
export function useBookingPackages(params?: MaybeRefOrGetter<BookingsPackagesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsPackagesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single booking package by ID
 */
export function useBookingPackage(packageId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', packageId] as const,
    queryFn: () => {
      const id = toValue(packageId)
      return bookingsPackagesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(packageId),
  })
}

/**
 * Create a new booking package
 */
export function useCreateBookingPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BookingsPackagesCreateData['body']) => bookingsPackagesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing booking package (full update)
 */
export function useUpdateBookingPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, body }: { packageId: number; body: BookingsPackagesUpdateData['body'] }) =>
      bookingsPackagesUpdate({ path: { id: packageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.packageId],
      })
    },
  })
}

/**
 * Partially update an existing booking package
 */
export function usePartialUpdateBookingPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, body }: { packageId: number; body?: BookingsPackagesPartialUpdateData['body'] }) =>
      bookingsPackagesPartialUpdate({ path: { id: packageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.packageId],
      })
    },
  })
}

/**
 * Delete a booking package
 */
export function useDeleteBookingPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (packageId: number) => bookingsPackagesDestroy({ path: { id: packageId } }),
    onSuccess: (_, packageId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', packageId],
      })
    },
  })
}
