import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsAvailabilityWindowsList,
  productsAddAvailabilityWindow,
  productsUpdateAvailabilityWindow,
  productsUpdateAvailabilityWindowFull,
  productsRemoveAvailabilityWindow,
} from '~/api/sdk.gen'
import type {
  ProductsAvailabilityWindowsListData,
  ProductsAddAvailabilityWindowData,
  ProductsUpdateAvailabilityWindowData,
  ProductsUpdateAvailabilityWindowFullData,
  ProductsRemoveAvailabilityWindowData,
} from '~/api/types.gen'

const QUERY_KEY = ['products', 'availability-windows'] as const

/**
 * List all availability windows for a product
 */
export function useProductAvailabilityWindows(productId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', productId] as const,
    queryFn: () => {
      const id = toValue(productId)
      if (!id) throw new Error('Product ID is required')
      return productsAvailabilityWindowsList({ path: { product_id: id } })
    },
    enabled: () => !!toValue(productId),
  })
}

/**
 * Add an availability window to a product
 */
export function useAddProductAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: ProductsAddAvailabilityWindowData['body'] }) =>
      productsAddAvailabilityWindow({ path: { product_id: productId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
    },
  })
}

/**
 * Update an availability window (partial - PATCH)
 */
export function useUpdateProductAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, windowId, body }: { 
      productId: string; 
      windowId: string;
      body: ProductsUpdateAvailabilityWindowData['body'] 
    }) =>
      productsUpdateAvailabilityWindow({ 
        path: { product_id: productId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
    },
  })
}

/**
 * Update an availability window (full - PUT)
 */
export function useUpdateProductAvailabilityWindowFull() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, windowId, body }: { 
      productId: string; 
      windowId: string;
      body: ProductsUpdateAvailabilityWindowFullData['body'] 
    }) =>
      productsUpdateAvailabilityWindowFull({ 
        path: { product_id: productId }, 
        query: { window_id: windowId },
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
    },
  })
}

/**
 * Remove an availability window from a product
 */
export function useRemoveProductAvailabilityWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, windowId }: { productId: string; windowId: string }) =>
      productsRemoveAvailabilityWindow({ 
        path: { product_id: productId }, 
        query: { window_id: windowId }
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] })
    },
  })
}
