/**
 * Product Discount Management Composables
 * 
 * Provides Vue composables for managing discounts at the product level using
 * the specialized product discount endpoints. These properly handle ContentType
 * associations unlike the generic payment discount API.
 * 
 * @module composables/products/productDiscounts
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/vue-query'
import { 
  productsListDiscountsRetrieve,
  productsListAddDiscountCreate,
  productsListUpdateDiscountPartialUpdate,
  productsListRemoveDiscountDestroy,
  type ProductsListDiscountsRetrieveData,
  type ProductsListAddDiscountCreateData,
  type ProductsListUpdateDiscountPartialUpdateData,
  type ProductsListRemoveDiscountDestroyData
} from '~/api'
import type { Ref } from 'vue'

/**
 * Fetch discounts for a specific product
 * 
 * @param productId - Product UUID
 * @param options - Optional query parameters (active filter, etc.)
 * @param queryOptions - TanStack Query options
 * @returns Query result with product discounts
 */
export function useProductDiscounts(
  productId: Ref<string> | string,
  options?: Ref<{ active?: boolean }> | { active?: boolean },
  queryOptions?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  const productIdValue = computed(() => unref(productId))
  const optionsValue = computed(() => unref(options))

  return useQuery({
    queryKey: computed(() => ['products', productIdValue.value, 'discounts', optionsValue.value]),
    queryFn: async () => {
      const data: ProductsListDiscountsRetrieveData = {
        path: {
          product_id: productIdValue.value
        },
        query: optionsValue.value,
        url: '/api/products/list/{product_id}/discounts/'
      }
      const response = await productsListDiscountsRetrieve(data)
      return response.data
    },
    enabled: computed(() => !!productIdValue.value),
    ...queryOptions
  })
}

/**
 * Create a new discount for a product
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for creating product discounts
 */
export function useCreateProductDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; data: any }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const requestData: ProductsListAddDiscountCreateData = {
        path: {
          product_id: productId
        },
        body: data,
        url: '/api/products/list/{product_id}/add-discount/'
      }
      const response = await productsListAddDiscountCreate(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate product discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'discounts']
      })
      // Also invalidate the product detail query to refresh discount count
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId]
      })
    },
    ...mutationOptions
  })
}

/**
 * Update an existing product discount
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for updating product discounts
 */
export function useUpdateProductDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; discountId: string; data: any }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, discountId, data }: { productId: string; discountId: string; data: any }) => {
      const requestData: ProductsListUpdateDiscountPartialUpdateData = {
        path: {
          product_id: productId,
          discount_id: discountId
        },
        body: data,
        url: '/api/products/list/{product_id}/update-discount/{discount_id}/'
      }
      const response = await productsListUpdateDiscountPartialUpdate(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate product discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'discounts']
      })
    },
    ...mutationOptions
  })
}

/**
 * Delete a product discount
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for deleting product discounts
 */
export function useDeleteProductDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; discountId: string }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, discountId }: { productId: string; discountId: string }) => {
      const requestData: ProductsListRemoveDiscountDestroyData = {
        path: {
          product_id: productId,
          discount_id: discountId
        },
        url: '/api/products/list/{product_id}/remove-discount/{discount_id}/'
      }
      const response = await productsListRemoveDiscountDestroy(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate product discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'discounts']
      })
      // Also invalidate the product detail query to refresh discount count
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId]
      })
    },
    ...mutationOptions
  })
}
