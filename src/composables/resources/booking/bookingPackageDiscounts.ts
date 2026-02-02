import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { client } from '~/api/client.gen'

// Manual SDK function for the add_discount action (not yet in auto-generated SDK)
export const bookingsPackagesAddDiscount = (options: {
  body: {
    name: string
    description?: string
    discount_type: 'PERCENTAGE' | 'FIXED'
    percentage?: string
    amount?: string
    active?: boolean
  }
  path: {
    id: number | string
  }
}) => client.post({
  url: '/api/bookings/packages/{id}/discounts/',
  ...options,
})

/**
 * Create a discount specifically for a booking package.
 * This endpoint automatically links the discount to the package.
 */
export function useCreateBookingPackageDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      packageId, 
      discount 
    }: { 
      packageId: number | string
      discount: {
        name: string
        description?: string
        discount_type: 'PERCENTAGE' | 'FIXED'
        percentage?: string
        amount?: string
        active?: boolean
      }
    }) => bookingsPackagesAddDiscount({ 
      path: { id: packageId },
      body: discount
    }),
    onSuccess: (_, variables) => {
      // Invalidate payment discounts queries
      queryClient.invalidateQueries({ queryKey: ['paymentDiscounts'] })
      // Invalidate the specific booking package query
      queryClient.invalidateQueries({ 
        queryKey: ['bookingPackages', 'detail', variables.packageId] 
      })
    },
  })
}
