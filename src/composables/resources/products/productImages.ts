import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { productsListAddImageCreate, productsListRemoveImageCreate } from '~/api/sdk.gen'
import type { ProductsListAddImageCreateData, ProductsListRemoveImageCreateData } from '~/api/types.gen'

/**
 * Add an image to a product
 */
export function useAddProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      image, 
      isMain 
    }: { 
      productId: string; 
      image: File; 
      isMain?: boolean 
    }) => {
      return productsListAddImageCreate({
        path: { product_id: productId },
        body: {
          image,
          is_main: isMain ? 'true' : 'false',
        },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}

/**
 * Remove an image from a product
 */
export function useRemoveProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      productId, 
      resourceId 
    }: { 
      productId: string; 
      resourceId: number 
    }) => {
      return productsListRemoveImageCreate({
        path: { product_id: productId },
        body: {
          resource_id: resourceId,
        },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}
