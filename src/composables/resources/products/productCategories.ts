import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsCategoriesList,
  productsCategoriesRetrieve,
  productsCategoriesCreate,
  productsCategoriesUpdate,
  productsCategoriesPartialUpdate,
  productsCategoriesDestroy,
} from '~/api/sdk.gen'
import type {
  ProductsCategoriesListData,
  ProductsCategoriesCreateData,
  ProductsCategoriesUpdateData,
  ProductsCategoriesPartialUpdateData,
  ProductsCategoriesDestroyData,
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
      return productsCategoriesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(categoryId),
  })
}

/**
 * Create a new product category
 */
export function useCreateProductCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductsCategoriesCreateData['body']) => productsCategoriesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a product category (full update)
 */
export function useUpdateProductCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, body }: { categoryId: number; body: ProductsCategoriesUpdateData['body'] }) =>
      productsCategoriesUpdate({ path: { id: categoryId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.categoryId],
      })
    },
  })
}

/**
 * Partially update a product category
 */
export function usePartialUpdateProductCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, body }: { categoryId: number; body?: ProductsCategoriesPartialUpdateData['body'] }) =>
      productsCategoriesPartialUpdate({ path: { id: categoryId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.categoryId],
      })
    },
  })
}

/**
 * Delete a product category
 */
export function useDeleteProductCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: number) => productsCategoriesDestroy({ path: { id: categoryId } }),
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', categoryId],
      })
    },
  })
}
