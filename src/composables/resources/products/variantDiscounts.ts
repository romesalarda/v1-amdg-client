/**
 * Product Variant Discount Management Composables
 * 
 * Provides Vue composables for managing discounts at the product variant level using
 * the specialized variant discount endpoints. These properly handle ContentType
 * associations unlike the generic payment discount API.
 * 
 * @module composables/products/variantDiscounts
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/vue-query'
import { 
  productsListVariantsDiscountsRetrieve,
  productsListVariantsAddDiscountCreate,
  productsListVariantsUpdateDiscountPartialUpdate,
  productsListVariantsRemoveDiscountDestroy,
  type ProductsListVariantsDiscountsRetrieveData,
  type ProductsListVariantsAddDiscountCreateData,
  type ProductsListVariantsUpdateDiscountPartialUpdateData,
  type ProductsListVariantsRemoveDiscountDestroyData
} from '~/api'
import type { Ref } from 'vue'

/**
 * Fetch discounts for a specific product variant
 * 
 * @param productId - Product UUID
 * @param variantId - Variant UUID
 * @param options - Optional query parameters (active filter, etc.)
 * @param queryOptions - TanStack Query options
 * @returns Query result with variant discounts
 */
export function useVariantDiscounts(
  productId: Ref<string> | string,
  variantId: Ref<string> | string,
  options?: Ref<{ active?: boolean }> | { active?: boolean },
  queryOptions?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  const productIdValue = computed(() => unref(productId))
  const variantIdValue = computed(() => unref(variantId))
  const optionsValue = computed(() => unref(options))

  return useQuery({
    queryKey: computed(() => ['products', productIdValue.value, 'variants', variantIdValue.value, 'discounts', optionsValue.value]),
    queryFn: async () => {
      const data: ProductsListVariantsDiscountsRetrieveData = {
        path: {
          product_product_id: productIdValue.value,
          variant_id: variantIdValue.value
        },
        query: optionsValue.value,
        url: '/api/products/list/{product_product_id}/variants/{variant_id}/discounts/'
      }
      const response = await productsListVariantsDiscountsRetrieve(data)
      return response.data
    },
    enabled: computed(() => !!productIdValue.value && !!variantIdValue.value),
    ...queryOptions
  })
}

/**
 * Create a new discount for a product variant
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for creating variant discounts
 */
export function useCreateVariantDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; variantId: string; data: any }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, variantId, data }: { productId: string; variantId: string; data: any }) => {
      const requestData: ProductsListVariantsAddDiscountCreateData = {
        path: {
          product_product_id: productId,
          variant_id: variantId
        },
        body: data,
        url: '/api/products/list/{product_product_id}/variants/{variant_id}/add-discount/'
      }
      const response = await productsListVariantsAddDiscountCreate(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate variant discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'variants', variables.variantId, 'discounts']
      })
      // Also invalidate the variant detail query to refresh discount count
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'variants', variables.variantId]
      })
    },
    ...mutationOptions
  })
}

/**
 * Update an existing variant discount
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for updating variant discounts
 */
export function useUpdateVariantDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; variantId: string; discountId: string; data: any }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, variantId, discountId, data }: { productId: string; variantId: string; discountId: string; data: any }) => {
      const requestData: ProductsListVariantsUpdateDiscountPartialUpdateData = {
        path: {
          product_product_id: productId,
          variant_id: variantId,
          discount_id: discountId
        },
        body: data,
        url: '/api/products/list/{product_product_id}/variants/{variant_id}/update-discount/{discount_id}/'
      }
      const response = await productsListVariantsUpdateDiscountPartialUpdate(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate variant discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'variants', variables.variantId, 'discounts']
      })
    },
    ...mutationOptions
  })
}

/**
 * Delete a variant discount
 * 
 * @param mutationOptions - TanStack Mutation options
 * @returns Mutation for deleting variant discounts
 */
export function useDeleteVariantDiscount(
  mutationOptions?: UseMutationOptions<any, Error, { productId: string; variantId: string; discountId: string }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, variantId, discountId }: { productId: string; variantId: string; discountId: string }) => {
      const requestData: ProductsListVariantsRemoveDiscountDestroyData = {
        path: {
          product_product_id: productId,
          variant_id: variantId,
          discount_id: discountId
        },
        url: '/api/products/list/{product_product_id}/variants/{variant_id}/remove-discount/{discount_id}/'
      }
      const response = await productsListVariantsRemoveDiscountDestroy(requestData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate variant discounts query
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'variants', variables.variantId, 'discounts']
      })
      // Also invalidate the variant detail query to refresh discount count
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId, 'variants', variables.variantId]
      })
    },
    ...mutationOptions
  })
}
