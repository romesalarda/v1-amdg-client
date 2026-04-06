import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { isFormData, uploadMultipart } from '~/utils/upload'
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
  OrderUpdateRequest,
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
export function useProductOrder(orderId: MaybeRefOrGetter<string>) {
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
 * Update only order status using partial update
 */
export function useUpdateProductOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string | number
      status: NonNullable<OrderUpdateRequest['status']>
    }) =>
      productsOrdersPartialUpdate({
        path: { order_id: String(orderId) },
        body: { status },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
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
    mutationFn: ({ orderId, body }: { orderId: string | number; body: ProductsOrdersUpdateData['body'] }) =>
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
    mutationFn: ({ orderId, body }: { orderId: string | number; body: ProductsOrdersPartialUpdateData['body'] }) =>
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
    mutationFn: (orderId: string | number) => productsOrdersDestroy({ path: { order_id: String(orderId) } }),
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
    mutationFn: ({ orderId, body }: { orderId: string | number; body: ProductsOrdersAddItemCreateData['body'] }) =>
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
 * Update quantity for an item in a draft order
 */
export function useUpdateProductOrderItem() {
  const queryClient = useQueryClient()
  const requestFetch = useRequestFetch()

  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
      quantity,
    }: {
      orderId: string | number
      orderItemId: number
      quantity: number
    }) =>
      requestFetch(`/api/products/orders/${String(orderId)}/update-item/`, {
        method: 'POST',
        body: {
          order_item_id: orderItemId,
          quantity,
        },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.orderId],
      })
    },
  })
}

/**
 * Remove an item from a draft order
 */
export function useRemoveProductOrderItem() {
  const queryClient = useQueryClient()
  const requestFetch = useRequestFetch()

  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
    }: {
      orderId: string | number
      orderItemId: number
    }) =>
      requestFetch(`/api/products/orders/${String(orderId)}/remove-item/`, {
        method: 'POST',
        body: {
          order_item_id: orderItemId,
        },
      }),
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
    mutationFn: (orderId: string | number) => productsOrdersCancelCreate({ path: { order_id: String(orderId) } }),
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
    mutationFn: ({
      orderId,
      body,
    }: {
      orderId: string | number
      body: ProductsOrdersCheckoutCreateData['body'] | FormData
    }) => {
      if (isFormData(body)) {
        return uploadMultipart(`/api/products/orders/${String(orderId)}/checkout/`, body, { method: 'POST' })
      }

      return productsOrdersCheckoutCreate({ path: { order_id: String(orderId) }, body })
    },
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
    mutationFn: (orderId: string | number) => productsOrdersCompleteCreate({ path: { order_id: String(orderId) } }),
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
    mutationFn: (orderId: string | number) => productsOrdersSubmitCreate({ path: { order_id: String(orderId) } }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', orderId],
      })
    },
  })
}
