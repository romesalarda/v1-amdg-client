import { useMutation } from '@tanstack/vue-query'
import { bookingsCheckoutPreview } from '~/api/sdk.gen'
import type { BookingsCheckoutPreviewData } from '~/api/types.gen'

const QUERY_KEY = ['checkoutPreview'] as const

/**
 * Generate a read-only checkout preview (discounts, totals, and line items).
 */
export function useCheckoutPreview() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'create'] as const,
    mutationFn: (body: BookingsCheckoutPreviewData['body']) => bookingsCheckoutPreview({ body }),
  })
}
