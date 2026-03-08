import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsPackageAvailabilityWindowsList,
  bookingsPackageAddAvailabilityWindow,
  bookingsPackageUpdateAvailabilityWindow,
  bookingsPackageUpdateAvailabilityWindowFull,
  bookingsPackageRemoveAvailabilityWindow,
} from '~/api/sdk.gen'
import type {
  BookingsPackageAvailabilityWindowsListData,
  BookingsPackageAddAvailabilityWindowData,
  BookingsPackageUpdateAvailabilityWindowData,
  BookingsPackageUpdateAvailabilityWindowFullData,
  BookingsPackageRemoveAvailabilityWindowData,
} from '~/api/types.gen'

const QUERY_KEY = ['booking-packages', 'availability-windows'] as const

/**
 * List all availability windows for a booking package
 */
export function useBookingPackageAvailabilityWindows(packageId: MaybeRefOrGetter<number | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', packageId] as const,
    queryFn: () => {
      const id = toValue(packageId)
      if (!id) throw new Error('Package ID is required')
      return bookingsPackageAvailabilityWindowsList({ path: { id } })
    },
    enabled: () => !!toValue(packageId),
  })
}

/**
 * Add an availability window to a booking package
 */
export function useAddBookingPackageAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, body }: { packageId: number; body: BookingsPackageAddAvailabilityWindowData['body'] }) =>
      bookingsPackageAddAvailabilityWindow({ path: { id: packageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: ['booking-packages', 'detail', variables.packageId] })
    },
  })
}

/**
 * Update an availability window (partial - PATCH)
 */
export function useUpdateBookingPackageAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, windowId, body }: { 
      packageId: number; 
      windowId: string;
      body: BookingsPackageUpdateAvailabilityWindowData['body'] 
    }) =>
      bookingsPackageUpdateAvailabilityWindow({ 
        path: { id: packageId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: ['booking-packages', 'detail', variables.packageId] })
    },
  })
}

/**
 * Update an availability window (full - PUT)
 */
export function useUpdateBookingPackageAvailabilityWindowFull() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, windowId, body }: { 
      packageId: number; 
      windowId: string;
      body: BookingsPackageUpdateAvailabilityWindowFullData['body'] 
    }) =>
      bookingsPackageUpdateAvailabilityWindowFull({ 
        path: { id: packageId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: ['booking-packages', 'detail', variables.packageId] })
    },
  })
}

/**
 * Remove an availability window from a booking package
 */
export function useRemoveBookingPackageAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, windowId }: { packageId: number; windowId: string }) =>
      bookingsPackageRemoveAvailabilityWindow({ 
        path: { id: packageId }, 
        query: { window_id: windowId }
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: ['booking-packages', 'detail', variables.packageId] })
    },
  })
}
