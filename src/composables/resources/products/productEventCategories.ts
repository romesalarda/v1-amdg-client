import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsEventCategoriesList,
  productsEventCategoriesRetrieve,
  productsEventCategoriesCreate,
  productsEventCategoriesDestroy,
} from '~/api/sdk.gen'
import type {
  ProductsEventCategoriesListData,
  ProductsEventCategoriesCreateData,
  ProductsEventCategoriesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['productEventCategories'] as const

/**
 * List all event-category associations
 */
export function useProductEventCategories(params?: MaybeRefOrGetter<ProductsEventCategoriesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsEventCategoriesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event-category association by ID
 */
export function useProductEventCategory(associationId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', associationId] as const,
    queryFn: () => {
      const id = toValue(associationId)
      return productsEventCategoriesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(associationId),
  })
}

/**
 * Associate a category with an event
 */
export function useCreateProductEventCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductsEventCategoriesCreateData['body']) => productsEventCategoriesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Remove a category from an event
 */
export function useDeleteProductEventCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (associationId: string) => productsEventCategoriesDestroy({ path: { id: associationId } }),
    onSuccess: (_, associationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', associationId],
      })
    },
  })
}
