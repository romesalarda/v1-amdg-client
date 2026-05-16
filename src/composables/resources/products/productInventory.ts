import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { productsInventoryBreakdown, productsInventoryAttendees } from '~/api/sdk.gen'
import type { ProductsInventoryBreakdownData, ProductsInventoryAttendeesData } from '~/api/types.gen'

const QUERY_KEY = ['products-inventory'] as const

/**
 * Fetch inventory breakdown for an event, grouped by product → variant.
 */
export function useInventoryBreakdown(
  params: MaybeRefOrGetter<ProductsInventoryBreakdownData['query'] | null>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'breakdown', params] as const,
    queryFn: () => {
      const query = toValue(params)!
      return productsInventoryBreakdown({ query })
    },
    enabled: () => !!toValue(params)?.event,
  })
}

/**
 * Fetch paginated attendees for a specific product variant.
 */
export function useInventoryAttendees(
  params: MaybeRefOrGetter<ProductsInventoryAttendeesData['query'] | null>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'attendees', params] as const,
    queryFn: () => {
      const query = toValue(params)!
      return productsInventoryAttendees({ query })
    },
    enabled: () => {
      const p = toValue(params)
      return !!(p?.event && p?.product_variant)
    },
  })
}
