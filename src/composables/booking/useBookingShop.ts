import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventMyBooking } from '~/composables/resources/events/eventMyBooking'
import { useAttendee } from '~/composables/resources/attendee/attendees'
import {
  useAddProductOrderItem,
  useCreateProductOrder,
  useProductOrder,
  useProductOrders,
} from '~/composables/resources/products/productOrders'
import { useBookingShopStore } from '~/stores/bookingShop'

export function useBookingShop() {
  const route = useRoute()
  const store = useBookingShopStore()

  const eventId = computed(() => String(route.params.id || ''))
  const bookingReference = computed(() => String(route.params.booking_id || ''))

  watch(
    () => [eventId.value, bookingReference.value] as const,
    ([nextEventId, nextBookingReference]) => {
      if (!nextEventId || !nextBookingReference) return
      store.setScope(nextEventId, nextBookingReference)
    },
    { immediate: true }
  )

  const bookingQuery = useEventMyBooking(
    eventId,
    computed(() => ({ booking_reference: bookingReference.value, page_size: 50 }))
  )

  const bookingItem = computed(() => {
    const items = bookingQuery.data.value?.bookings || []
    if (!items.length) return null

    const exact = items.find((item) => item.booking.booking_reference === bookingReference.value)
    return exact || items[0] || null
  })

  const booking = computed(() => bookingItem.value?.booking || null)
  const attendees = computed(() => booking.value?.attendees || [])
  const eventNumericId = computed(() => booking.value?.event || undefined)

  watch(
    attendees,
    (nextAttendees) => {
      if (!nextAttendees.length) {
        store.setSelectedAttendee(null)
        return
      }

      const currentlySelected = store.selectedAttendeeId
      const exists = !!nextAttendees.find((item) => item.id === currentlySelected)

      if (!exists) {
        store.setSelectedAttendee(nextAttendees[0]?.id || null)
      }
    },
    { immediate: true }
  )

  const selectedAttendeeId = computed(() => store.selectedAttendeeId)
  const attendeeQuery = useAttendee(computed(() => selectedAttendeeId.value || ''))

  const draftOrdersQuery = useProductOrders(
    computed(() => {
      if (!selectedAttendeeId.value || !eventNumericId.value) return undefined

      return {
        attendee_id: selectedAttendeeId.value,
        event: eventNumericId.value,
        ordering: '-created_at',
        page_size: 20,
      }
    })
  )

  const latestDraftOrder = computed(() => {
    const results = draftOrdersQuery.data.value?.data?.results || []
    if (!Array.isArray(results)) return null
    const openStatuses = new Set(['draft', 'pending'])
    return results.find((order) => openStatuses.has(String(order.status || '').toLowerCase())) || null
  })

  const latestBlockingOrder = computed(() => {
    const results = draftOrdersQuery.data.value?.data?.results || []
    if (!Array.isArray(results)) return null
    const blockedStatuses = new Set(['pending', 'processing'])
    return results.find((order) => blockedStatuses.has(String(order.status || '').toLowerCase())) || null
  })

  const orderCreationBlockedReason = computed(() => {
    const blocked = latestBlockingOrder.value
    if (!blocked) return ''

    const reference = blocked.order_reference_id || blocked.order_id
    const status = String(blocked.status || 'pending')
    return `Product selection is disabled until your current purchase has been verified.`
  })

  const isOrderCreationBlocked = computed(() => !!orderCreationBlockedReason.value)

  watch(
    latestDraftOrder,
    (order) => {
      if (order?.order_id) {
        store.setActiveOrder(order.order_id)
      }
    },
    { immediate: true }
  )

  const activeOrderId = computed(() => store.activeOrderId)
  const activeOrderQuery = useProductOrder(computed(() => activeOrderId.value || ''))
  const createOrderMutation = useCreateProductOrder()
  const addOrderItemMutation = useAddProductOrderItem()

  async function addVariantToCart(variantId: string, quantity: number) {
    if (!selectedAttendeeId.value) {
      throw new Error('Select an attendee before adding products.')
    }

    if (isOrderCreationBlocked.value) {
      throw new Error(orderCreationBlockedReason.value)
    }

    if (store.activeOrderId) {
      await addOrderItemMutation.mutateAsync({
        orderId: store.activeOrderId,
        body: {
          product_variant_id: variantId,
          quantity,
        },
      })
      return store.activeOrderId
    }

    const attendeePrimaryId = attendeeQuery.data.value?.data?.attendee_id
    if (!attendeePrimaryId) {
      throw new Error('Unable to resolve attendee details for order creation.')
    }

    let createResponse: any
    try {
      createResponse = await createOrderMutation.mutateAsync({
        attendee: attendeePrimaryId,
        items: [
          {
            product_variant_id: variantId,
            quantity,
          },
        ],
      } as any)
    } catch (error: any) {
      const payload = error?.body || error?.response?.data || error?.data || {}
      const existingOrderId = payload?.existing_order_id
      const existingOrderReference = payload?.existing_order_reference

      if (typeof existingOrderId === 'string' && existingOrderId.length > 0) {
        store.setActiveOrder(existingOrderId)
        throw new Error(
          existingOrderReference
            ? `An open order (${existingOrderReference}) already exists for this attendee. Complete payment before creating another.`
            : 'An open order already exists for this attendee. Complete payment before creating another.'
        )
      }

      throw error
    }

    const createdOrderId = createResponse.data?.order_id
    if (!createdOrderId) {
      throw new Error('Unable to create order.')
    }

    store.setActiveOrder(createdOrderId)
    return createdOrderId
  }

  return {
    store,
    eventId,
    bookingReference,
    eventNumericId,
    bookingQuery,
    booking,
    attendees,
    selectedAttendeeId,
    attendeeQuery,
    draftOrdersQuery,
    latestDraftOrder,
    latestBlockingOrder,
    isOrderCreationBlocked,
    orderCreationBlockedReason,
    activeOrderId,
    activeOrderQuery,
    createOrderMutation,
    addOrderItemMutation,
    addVariantToCart,
  }
}
