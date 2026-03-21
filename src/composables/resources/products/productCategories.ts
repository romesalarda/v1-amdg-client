import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsCategoriesList,
  productsCategoriesRetrieve,
} from '~/api/sdk.gen'
import type {
  ProductsCategoriesListData,
  ProductsCategoriesRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['productCategories'] as const

/**
 * List all product categories
 */
export function useProductCategories(params?: MaybeRefOrGetter<ProductsCategoriesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsCategoriesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single product category by ID
 */
export function useProductCategory(categoryId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', categoryId] as const,
    queryFn: () => {
      const id = toValue(categoryId)
      return productsCategoriesRetrieve({ path: { id } as ProductsCategoriesRetrieveData['path'] })
    },
    enabled: () => !!toValue(categoryId),
  })
}
