import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsPackageProductsList,
  bookingsPackageProductsCreate,
  bookingsPackageProductsPartialUpdate,
  bookingsPackageProductsDestroy,
} from '~/api/sdk.gen'
import type {
  PackageProduct as BookingPackageProduct,
  PackageProductCreateUpdateRequest as BookingPackageProductCreateUpdateRequest,
  PatchedPackageProductCreateUpdateRequest,
} from '~/api/types.gen'

const QUERY_KEY = ['bookingPackageProducts'] as const
const BOOKING_PACKAGES_QUERY_KEY = ['bookingPackages'] as const

export type { BookingPackageProduct, BookingPackageProductCreateUpdateRequest }

export function useBookingPackageProducts(packageId: MaybeRefOrGetter<number | null | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', packageId] as const,
    queryFn: () => {
      const id = toValue(packageId)
      return bookingsPackageProductsList({ path: { id: Number(id) } })
    },
    enabled: () => !!toValue(packageId),
  })
}

export function useCreateBookingPackageProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      packageId,
      body,
    }: {
      packageId: number | string
      body: BookingPackageProductCreateUpdateRequest
    }) => bookingsPackageProductsCreate({ path: { id: Number(packageId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: BOOKING_PACKAGES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...BOOKING_PACKAGES_QUERY_KEY, 'detail', variables.packageId] })
    },
  })
}

export function useUpdateBookingPackageProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      packageId,
      packageProductId,
      body,
    }: {
      packageId: number | string
      packageProductId: number | string
      body: PatchedPackageProductCreateUpdateRequest
    }) => bookingsPackageProductsPartialUpdate({
      path: { id: Number(packageId), package_product_id: Number(packageProductId) },
      body,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: BOOKING_PACKAGES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...BOOKING_PACKAGES_QUERY_KEY, 'detail', variables.packageId] })
    },
  })
}

export function useDeleteBookingPackageProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      packageId,
      packageProductId,
    }: {
      packageId: number | string
      packageProductId: number | string
    }) => bookingsPackageProductsDestroy({
      path: { id: Number(packageId), package_product_id: Number(packageProductId) },
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.packageId] })
      queryClient.invalidateQueries({ queryKey: BOOKING_PACKAGES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...BOOKING_PACKAGES_QUERY_KEY, 'detail', variables.packageId] })
    },
  })
}
