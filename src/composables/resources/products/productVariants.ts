import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsListVariantsList,
  productsListVariantsRetrieve,
  productsListVariantsCreate,
  productsListVariantsUpdate,
  productsListVariantsPartialUpdate,
  productsListVariantsDestroy,
} from '~/api/sdk.gen'
import type {
  ProductsListVariantsListData,
  ProductsListVariantsCreateData,
  ProductsListVariantsUpdateData,
  ProductsListVariantsPartialUpdateData,
  ProductsListVariantsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['product-variants'] as const

/**
 * List all variants for a product
 */
export function useProductVariants(productId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', productId] as const,
    queryFn: () => {
      const id = toValue(productId)
      if (!id) throw new Error('Product ID is required')
      return productsListVariantsList({ path: { product_product_id: id } })
    },
    enabled: () => !!toValue(productId),
  })
}

/**
 * Retrieve a single variant by ID
 */
export function useProductVariant(productId: MaybeRefOrGetter<string>, variantId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', productId, variantId] as const,
    queryFn: () => {
      const pId = toValue(productId)
      const vId = toValue(variantId)
      return productsListVariantsRetrieve({ 
        path: { product_product_id: pId, variant_id: vId } 
      })
    },
    enabled: () => !!toValue(productId) && !!toValue(variantId),
  })
}

/**
 * Create a new variant for a product
 */
export function useCreateProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: ProductsListVariantsCreateData['body'] }) =>
      productsListVariantsCreate({ path: { product_product_id: productId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Update an existing variant (full update)
 */
export function useUpdateProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      body 
    }: { 
      productId: string; 
      variantId: string; 
      body: ProductsListVariantsUpdateData['body'] 
    }) =>
      productsListVariantsUpdate({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Partially update an existing variant
 */
export function usePartialUpdateProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      body 
    }: { 
      productId: string; 
      variantId: string; 
      body?: ProductsListVariantsPartialUpdateData['body'] 
    }) =>
      productsListVariantsPartialUpdate({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Delete a variant
 */
export function useDeleteProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productsListVariantsDestroy({ 
        path: { product_product_id: productId, variant_id: variantId } 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
