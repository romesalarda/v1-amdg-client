import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productVariantsAvailabilityWindowsList,
  productVariantsAddAvailabilityWindow,
  productVariantsUpdateAvailabilityWindow,
  productVariantsUpdateAvailabilityWindowFull,
  productVariantsRemoveAvailabilityWindow,
} from '~/api/sdk.gen'
import type {
  ProductVariantsAvailabilityWindowsListData,
  ProductVariantsAddAvailabilityWindowData,
  ProductVariantsUpdateAvailabilityWindowData,
  ProductVariantsUpdateAvailabilityWindowFullData,
  ProductVariantsRemoveAvailabilityWindowData,
} from '~/api/types.gen'

const QUERY_KEY = ['product-variants', 'availability-windows'] as const

/**
 * List all availability windows for a product variant
 */
export function useProductVariantAvailabilityWindows(
  productId: MaybeRefOrGetter<string | undefined>,
  variantId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', productId, variantId] as const,
    queryFn: () => {
      const pId = toValue(productId)
      const vId = toValue(variantId)
      if (!pId || !vId) throw new Error('Product ID and Variant ID are required')
      return productVariantsAvailabilityWindowsList({ 
        path: { product_product_id: pId, variant_id: vId } 
      })
    },
    enabled: () => !!toValue(productId) && !!toValue(variantId),
  })
}

/**
 * Add an availability window to a product variant
 */
export function useAddProductVariantAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      body 
    }: { 
      productId: string; 
      variantId: string;
      body: ProductVariantsAddAvailabilityWindowData['body'] 
    }) =>
      productVariantsAddAvailabilityWindow({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEY, 'list', variables.productId, variables.variantId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', 'detail', variables.variantId] 
      })
    },
  })
}

/**
 * Update an availability window (partial - PATCH)
 */
export function useUpdateProductVariantAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      windowId, 
      body 
    }: { 
      productId: string; 
      variantId: string;
      windowId: string;
      body: ProductVariantsUpdateAvailabilityWindowData['body'] 
    }) =>
      productVariantsUpdateAvailabilityWindow({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEY, 'list', variables.productId, variables.variantId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', 'detail', variables.variantId] 
      })
    },
  })
}

/**
 * Update an availability window (full - PUT)
 */
export function useUpdateProductVariantAvailabilityWindowFull() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      windowId, 
      body 
    }: { 
      productId: string; 
      variantId: string;
      windowId: string;
      body: ProductVariantsUpdateAvailabilityWindowFullData['body'] 
    }) =>
      productVariantsUpdateAvailabilityWindowFull({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEY, 'list', variables.productId, variables.variantId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', 'detail', variables.variantId] 
      })
    },
  })
}

/**
 * Remove an availability window from a product variant
 */
export function useRemoveProductVariantAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      windowId 
    }: { 
      productId: string; 
      variantId: string;
      windowId: string 
    }) =>
      productVariantsRemoveAvailabilityWindow({ 
        path: { product_product_id: productId, variant_id: variantId }, 
        query: { window_id: windowId }
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEY, 'list', variables.productId, variables.variantId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['product-variants', 'detail', variables.variantId] 
      })
    },
  })
}
