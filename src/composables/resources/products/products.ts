import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsListList,
  productsListRetrieve,
  productsListCreate,
  productsListUpdate,
  productsListPartialUpdate,
  productsListDestroy,
} from '~/api/sdk.gen'
import type {
  ProductsListListData,
  ProductsListCreateData,
  ProductsListUpdateData,
  ProductsListPartialUpdateData,
  ProductsListDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['products'] as const

/**
 * List all products
 */
export function useProducts(params?: MaybeRefOrGetter<ProductsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single product by ID
 */
export function useProduct(productId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', productId] as const,
    queryFn: () => {
      const id = toValue(productId)
      return productsListRetrieve({ path: { product_id: String(id) } })
    },
    enabled: () => !!toValue(productId),
  })
}

/**
 * Create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductsListCreateData['body']) => productsListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing product (full update)
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: ProductsListUpdateData['body'] }) =>
      productsListUpdate({ path: { product_id: productId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.productId],
      })
    },
  })
}

/**
 * Partially update an existing product
 */
export function usePartialUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body?: ProductsListPartialUpdateData['body'] }) =>
      productsListPartialUpdate({ path: { product_id: productId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.productId],
      })
    },
  })
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productsListDestroy({ path: { product_id: productId } }),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', productId],
      })
    },
  })
}
