import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsOrderItemsList,
  productsOrderItemsRetrieve,
} from '~/api/sdk.gen'
import type {
  ProductsOrderItemsListData,
} from '~/api/types.gen'

const QUERY_KEY = ['productOrderItems'] as const

/**
 * List all order items
 */
export function useProductOrderItems(params?: MaybeRefOrGetter<ProductsOrderItemsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsOrderItemsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single order item by ID
 */
export function useProductOrderItem(itemId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', itemId] as const,
    queryFn: () => {
      const id = toValue(itemId)
      return productsOrderItemsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(itemId),
  })
}
