import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsOrdersList,
  productsOrdersRetrieve,
  productsOrdersCreate,
  productsOrdersUpdate,
  productsOrdersPartialUpdate,
  productsOrdersDestroy,
  productsOrdersAddItemCreate,
  productsOrdersCancelCreate,
  productsOrdersCheckoutCreate,
  productsOrdersCompleteCreate,
  productsOrdersSubmitCreate,
} from '~/api/sdk.gen'
import type {
  ProductsOrdersListData,
  ProductsOrdersCreateData,
  ProductsOrdersUpdateData,
  ProductsOrdersPartialUpdateData,
  ProductsOrdersDestroyData,
  ProductsOrdersAddItemCreateData,
  ProductsOrdersCancelCreateData,
  ProductsOrdersCheckoutCreateData,
  ProductsOrdersCompleteCreateData,
  ProductsOrdersSubmitCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['productOrders'] as const

/**
 * List all orders
 */
export function useProductOrders(params?: MaybeRefOrGetter<ProductsOrdersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsOrdersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single order by ID
 */
export function useProductOrder(orderId: MaybeRefOrGetter<String>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', orderId] as const,
    queryFn: () => {
      const id = toValue(orderId)
      return productsOrdersRetrieve({ path: { order_id: String(id) } })
    },
    enabled: () => !!toValue(orderId),
  })
}

/**
 * Create a new order
 */
export function useCreateProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductsOrdersCreateData['body']) => productsOrdersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an order (full update)
 */
export function useUpdateProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: ProductsOrdersUpdateData['body'] }) =>
      productsOrdersUpdate({ path: { order_id: String(orderId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
  })
}

/**
 * Partially update an order
 */
export function usePartialUpdateProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: ProductsOrdersPartialUpdateData['body'] }) =>
      productsOrdersPartialUpdate({ path: { order_id: String(orderId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
  })
}

/**
 * Delete an order
 */
export function useDeleteProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => productsOrdersDestroy({ path: { order_id: String(orderId) } }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', orderId],
      })
    },
  })
}

/**
 * Add an item to a draft order
 */
export function useAddProductOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: ProductsOrdersAddItemCreateData['body'] }) =>
      productsOrdersAddItemCreate({ path: { order_id: String(orderId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
  })
}

/**
 * Cancel an order
 */
export function useCancelProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => productsOrdersCancelCreate({ path: { order_id: String(orderId) } }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', orderId],
      })
    },
  })
}

/**
 * Checkout an order with payment
 */
export function useCheckoutProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: ProductsOrdersCheckoutCreateData['body'] }) =>
      productsOrdersCheckoutCreate({ path: { order_id: String(orderId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
  })
}

/**
 * Mark an order as completed
 */
export function useCompleteProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => productsOrdersCompleteCreate({ path: { order_id: String(orderId) } }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', orderId],
      })
    },
  })
}

/**
 * Submit an order
 */
export function useSubmitProductOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => productsOrdersSubmitCreate({ path: { order_id: String(orderId) } }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', orderId],
      })
    },
  })
}
