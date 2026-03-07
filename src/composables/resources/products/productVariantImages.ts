import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  productsListVariantsAddImageCreate,
  productsListVariantsRemoveImageCreate,
} from '~/api/sdk.gen'

/**
 * Add an image to a product variant
 */
export function useAddVariantImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      image, 
      isMain = false 
    }: { 
      productId: string
      variantId: string
      image: File
      isMain?: boolean 
    }) => {
      return productsListVariantsAddImageCreate({
        path: { product_product_id: productId, variant_id: variantId },
        body: {
          image,
          is_main: isMain ? 'true' : 'false',
        },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['product-variants', 'detail', variables.productId, variables.variantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Remove an image from a product variant
 */
export function useRemoveVariantImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      variantId, 
      resourceId 
    }: { 
      productId: string
      variantId: string
      resourceId: number 
    }) =>
      productsListVariantsRemoveImageCreate({
        path: { product_product_id: productId, variant_id: variantId },
        body: { resource_id: resourceId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['product-variants', 'detail', variables.productId, variables.variantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
