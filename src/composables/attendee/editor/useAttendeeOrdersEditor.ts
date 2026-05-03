import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import {
  useProductOrders,
  useCreateProductOrder,
  useDeleteProductOrder,
  useAddProductOrderItem,
  useCancelProductOrder,
} from '~/composables/resources/products/productOrders'

export const useAttendeeOrdersEditor = (attendeeId: Ref<string>, attendeeResourceId: Ref<string | undefined>, eventId: Ref<string>) => {
  const toast = useToast()

  const attendeeOrders = useProductOrders(computed(() => ({
    attendee_id: attendeeResourceId.value,
    event: eventId.value,
  })))

  const createOrderMutation = useCreateProductOrder()
  const deleteOrderMutation = useDeleteProductOrder()
  const addOrderItemMutation = useAddProductOrderItem()
  const cancelOrderMutation = useCancelProductOrder()

  const showCreateOrderForm = ref(false)
  const showAddItemFormForOrder = ref<number | null>(null)
  const newOrderItem = ref({
    product_variant_id: '',
    quantity: 1,
  })

  const resetOrderItemForm = () => {
    newOrderItem.value = {
      product_variant_id: '',
      quantity: 1,
    }
  }

  const handleCreateOrder = async () => {
    try {
      await createOrderMutation.mutateAsync({
        attendee: attendeeId.value,
        items: [],
      })
      showCreateOrderForm.value = false
      toast.add({ title: 'Success', description: 'Order created', color: 'green' })
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.add({ title: 'Error', description: 'Failed to create order', color: 'red' })
    }
  }

  const toggleAddItemForm = (orderId: number) => {
    showAddItemFormForOrder.value = showAddItemFormForOrder.value === orderId ? null : orderId
    resetOrderItemForm()
  }

  const handleAddOrderItem = async (orderId: number) => {
    if (!newOrderItem.value.product_variant_id || !newOrderItem.value.quantity) {
      toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'red' })
      return
    }

    try {
      await addOrderItemMutation.mutateAsync({
        orderId,
        body: {
          product_variant_id: newOrderItem.value.product_variant_id,
          quantity: newOrderItem.value.quantity,
        },
      })
      showAddItemFormForOrder.value = null
      resetOrderItemForm()
      toast.add({ title: 'Success', description: 'Item added to order', color: 'green' })
    } catch (error) {
      console.error('Failed to add order item:', error)
      toast.add({ title: 'Error', description: 'Failed to add item', color: 'red' })
    }
  }

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      await cancelOrderMutation.mutateAsync(orderId)
      toast.add({ title: 'Success', description: 'Order cancelled', color: 'green' })
    } catch (error) {
      console.error('Failed to cancel order:', error)
      toast.add({ title: 'Error', description: 'Failed to cancel order', color: 'red' })
    }
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return

    try {
      await deleteOrderMutation.mutateAsync(orderId)
      toast.add({ title: 'Success', description: 'Order deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.add({ title: 'Error', description: 'Failed to delete order', color: 'red' })
    }
  }

  const getOrderItemDetails = (item: any): Record<string, any> | null => {
    const details = item?.product_variant_details
    if (!details || typeof details !== 'object') return null
    return details as Record<string, any>
  }

  const getOrderItemTitle = (item: any): string => {
    const details = getOrderItemDetails(item)
    return details?.product_title || `Variant ${details?.variant_id || item?.product_variant || 'N/A'}`
  }

  const getOrderItemCode = (item: any): string => {
    const details = getOrderItemDetails(item)
    if (details?.product_display_code) return String(details.product_display_code)
    if (details?.variant_id) return `Variant ${details.variant_id}`
    return `Variant ${item?.product_variant || 'N/A'}`
  }

  const getOrderItemImageUrl = (item: any): string | null => {
    const details = getOrderItemDetails(item)
    return details?.image_url || details?.variant_image_url || details?.product_image_url || null
  }

  const getOrderItemSize = (item: any): string | null => {
    const details = getOrderItemDetails(item)
    return details?.size || null
  }

  const getOrderItemColor = (item: any): string | null => {
    const details = getOrderItemDetails(item)
    return details?.color || null
  }

  const getOrderItemColorStyle = (item: any): Record<string, string> | undefined => {
    const color = getOrderItemColor(item)
    if (!color) return undefined
    return { backgroundColor: color }
  }

  const getOrderStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      draft: 'gray',
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      cancelled: 'red',
      pending_refund: 'orange',
      refunded: 'purple',
    }
    return colorMap[status] || 'gray'
  }

  return {
    attendeeOrders,
    createOrderMutation,
    deleteOrderMutation,
    addOrderItemMutation,
    cancelOrderMutation,
    showCreateOrderForm,
    showAddItemFormForOrder,
    newOrderItem,
    handleCreateOrder,
    toggleAddItemForm,
    handleAddOrderItem,
    cancelOrder,
    deleteOrder,
    resetOrderItemForm,
    getOrderItemDetails,
    getOrderItemTitle,
    getOrderItemCode,
    getOrderItemImageUrl,
    getOrderItemSize,
    getOrderItemColor,
    getOrderItemColorStyle,
    getOrderStatusColor,
  }
}