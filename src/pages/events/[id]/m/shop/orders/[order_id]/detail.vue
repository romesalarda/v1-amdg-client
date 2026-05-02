<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="space-y-6 pb-8">
      <div class="flex items-center justify-between gap-3">
        <UButton
          variant="ghost"
          color="gray"
          icon="i-heroicons-arrow-left"
          @click="navigateTo(`/events/${eventId}/m/shop/orders`)"
        >
          Back to Orders
        </UButton>
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div class="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        <div class="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>

      <div v-else-if="!order" class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 h-16 w-16 text-amber-500" />
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Order Not Found</h3>
        <p class="mb-4 text-sm text-slate-500">The order you're looking for doesn't exist or you don't have access to it.</p>
        <UButton color="primary" @click="navigateTo(`/events/${eventId}/m/shop/orders`)">Back to Orders</UButton>
      </div>

      <template v-else>
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="mb-2 flex items-center gap-3">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Order detail</p>
                  <UBadge :color="getOrderStatusColor(order.status!) as any" variant="soft" size="md">
                    {{ order.status_display }}
                  </UBadge>
                  <UBadge v-if="order.payment" color="green" variant="soft" size="xs">Payment linked</UBadge>
                </div>
                <h1 class="text-2xl font-black tracking-tight">{{ order.order_reference_id }}</h1>
                <p class="mt-1 font-mono text-xs text-white/70">{{ order.order_id }}</p>
                <p class="mt-2 text-sm text-white/80">Created {{ formatRelativeTime(order.created_at) }} • {{ formatDate(order.created_at, 'MMM d, yyyy h:mm a') }}</p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  v-if="canTransitionStatus(order.status!)"
                  size="sm"
                  variant="solid"
                  color="blue"
                  icon="i-heroicons-arrow-right"
                  :loading="isTransitioning"
                  :disabled="isTransitioning"
                  @click="handleStatusTransition"
                >
                  {{ getNextStatusLabel(order.status!) }}
                </UButton>
                <UButton
                  v-if="canCancelOrder(order.status!)"
                  size="sm"
                  variant="outline"
                  color="red"
                  icon="i-heroicons-x-mark"
                  :disabled="isTransitioning"
                  @click="handleCancelOrder"
                >
                  Cancel Order
                </UButton>
              </div>
            </div>
          </div>

          <div class="grid gap-3 border-t border-slate-100 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Customer</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.customer_name || 'N/A' }}</p>
              <p class="mt-1 text-xs text-slate-500">ID: {{ order.customer || 'N/A' }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Attendee</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.attendee_name || 'N/A' }}</p>
              <p class="mt-1 text-xs text-slate-500">ID: {{ order.attendee || 'N/A' }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Items</p>
              <p class="mt-1 text-2xl font-black text-slate-900">{{ order.item_count }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Order total</p>
              <p class="mt-1 text-2xl font-black text-primary">{{ order.total_amount }}</p>
            </div>
          </div>
        </section>

        <section class="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <div class="space-y-6">
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 class="text-sm font-black uppercase tracking-[0.14em] text-slate-800">Order Items</h2>
                  <p class="text-xs text-slate-500">{{ order.order_items.length }} item{{ order.order_items.length !== 1 ? 's' : '' }} in this order</p>
                </div>
              </div>

              <div v-if="order.order_items.length === 0" class="p-10 text-center text-slate-500">
                <UIcon name="i-heroicons-shopping-cart" class="mx-auto mb-2 h-12 w-12 text-slate-300" />
                No items in this order.
              </div>

              <div v-else class="space-y-3 p-4">
                <article
                  v-for="(item, index) in order.order_items"
                  :key="item.id"
                  class="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="flex items-start gap-3">
                      <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img
                          v-if="getProductVariantDetails(item)?.image_url"
                          :src="getProductVariantDetails(item)?.image_url || ''"
                          :alt="getProductVariantDetails(item)?.product_title || 'Product variant image'"
                          class="h-full w-full object-cover"
                        />
                        <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
                          <UIcon name="i-heroicons-photo" class="h-5 w-5" />
                        </div>
                      </div>

                      <div>
                      <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Line {{ index + 1 }}</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">
                        {{ getProductVariantDetails(item)?.product_title || `Product Variant #${item.product_variant || 'N/A'}` }}
                      </p>
                      <p class="text-xs text-slate-500">
                        Variant: {{ getProductVariantDetails(item)?.variant_id || item.product_variant || 'N/A' }}
                        <span v-if="getProductVariantDetails(item)?.size"> • Size {{ getProductVariantDetails(item)?.size }}</span>
                        <span v-if="getProductVariantDetails(item)?.color"> • Color {{ getProductVariantDetails(item)?.color }}</span>
                      </p>
                      <p class="mt-1 text-xs text-slate-500">Item ID: {{ item.id }}</p>
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-right text-xs sm:min-w-[230px]">
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Qty</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ item.quantity }}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Unit</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ item.unit_price}}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Total</p>
                        <p class="mt-1 text-sm font-black text-primary">{{ item.total_price }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div class="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div class="flex items-center justify-end gap-3">
                  <p class="text-sm font-semibold text-slate-700">Order Total</p>
                  <p class="text-xl font-black text-primary">{{ order.total_amount }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 px-5 py-4">
                <h3 class="text-sm font-black uppercase tracking-[0.14em] text-slate-800">Order Timeline</h3>
              </div>
              <div class="space-y-4 p-5">
                <div class="flex gap-3">
                  <div class="mt-0.5 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-plus" class="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Order Created</p>
                    <p class="text-xs text-slate-500">{{ formatDate(order.created_at, 'MMM d, yyyy h:mm a') }}</p>
                    <p v-if="order.created_by_name" class="text-xs text-slate-400">By {{ order.created_by_name }}</p>
                  </div>
                </div>

                <div v-if="order.updated_at !== order.created_at" class="flex gap-3">
                  <div class="mt-0.5 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-pencil" class="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Last Updated</p>
                    <p class="text-xs text-slate-500">{{ formatDate(order.updated_at, 'MMM d, yyyy h:mm a') }}</p>
                    <p v-if="order.updated_by_name" class="text-xs text-slate-400">By {{ order.updated_by_name }}</p>
                  </div>
                </div>

                <div v-if="order.status === 'completed'" class="flex gap-3">
                  <div class="mt-0.5 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-check" class="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Order Completed</p>
                    <p class="text-xs text-slate-500">{{ formatDate(order.updated_at, 'MMM d, yyyy h:mm a') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 px-5 py-4">
                <h3 class="text-sm font-black uppercase tracking-[0.14em] text-slate-800">Additional Information</h3>
              </div>
              <div class="space-y-4 p-5">
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Payment</p>
                  <div v-if="order.payment" class="mt-1 space-y-2 text-sm text-slate-900">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-credit-card" class="h-4 w-4 text-emerald-600" />
                      Payment Link ID: {{ order.payment }}
                    </div>
                    <div v-if="paymentDetails?.payment_id" class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                      <p class="text-slate-500">Payment UUID</p>
                      <p class="font-mono text-slate-900 break-all">{{ paymentDetails.payment_id }}</p>
                    </div>
                    <div v-if="paymentDetails?.payment_reference" class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                      <p class="text-slate-500">Payment Reference</p>
                      <p class="font-mono text-slate-900">{{ paymentDetails.payment_reference }}</p>
                    </div>
                    <div v-if="paymentDetails?.status" class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                      <p class="text-slate-500">Payment Status</p>
                      <p class="font-semibold uppercase tracking-wide text-slate-900">{{ paymentDetails.status }}</p>
                    </div>
                    <UButton
                      size="xs"
                      variant="soft"
                      color="blue"
                      icon="i-heroicons-arrow-top-right-on-square"
                      @click="goToLinkedPayment"
                    >
                      Open in Payments List
                    </UButton>
                  </div>
                  <p v-else class="mt-1 text-sm text-slate-500">No payment linked</p>
                </div>

                <div class="space-y-2">
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Identifiers</p>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                    <p class="text-slate-500">Reference</p>
                    <p class="font-mono text-slate-900">{{ order.order_reference_id }}</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                    <p class="text-slate-500">Tag</p>
                    <p class="font-mono text-slate-900 break-all">{{ order.order_id }}</p>
                  </div>
                </div>

                <div v-if="order._links?.customer || order._links?.attendee" class="space-y-2">
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Related</p>
                  <a
                    v-if="order._links.customer"
                    :href="order._links.customer"
                    target="_blank"
                    class="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    <UIcon name="i-heroicons-user" class="h-4 w-4" />
                    View Customer
                  </a>
                  <a
                    v-if="order.attendee"
                    :href="`/events/${eventId}/m/participants/dashboard/?search=${order.attendee_name}`"
                    class="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
                  >
                    <UIcon name="i-heroicons-ticket" class="h-4 w-4" />
                    View Attendee
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import type { OrderDetail, OrderItem } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useProductOrder, useCancelProductOrder, useCompleteProductOrder, useUpdateProductOrderStatus } from '~/composables/resources/products/productOrders'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { orderStatusColors } from '~/schemas/events/productConstants'
import { formatMoney } from '~/utils/money'
import { formatDate } from '~/utils/time'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const eventId = computed(() => route.params.id as string)
const orderId = computed(() => route.params.order_id as string)
const toast = useToast()
type OrderStatus = NonNullable<OrderDetail['status']>

type VariantDetails = {
  variant_id?: string
  product_title?: string
  size?: string | null
  color?: string | null
  image_url?: string | null
}

type PaymentDetails = {
  payment_id?: string
  payment_reference?: string
  status?: string
}

// Event Data
const { data: event } = useEvent(eventId)

// Order Data
const { data: orderData, isLoading, refetch } = useProductOrder({"event": event.value?.data.url_safe_title || event.value?.data.event_id}, computed(() => orderId.value))
const order = computed(() => orderData.value?.data)

// Mutations
const { mutateAsync: cancelOrderMutation } = useCancelProductOrder()
const { mutateAsync: completeOrderMutation } = useCompleteProductOrder()
const { mutateAsync: updateOrderStatusMutation } = useUpdateProductOrderStatus()
const isTransitioning = ref(false)

const paymentDetails = computed<PaymentDetails | null>(() => {
  const raw = orderData.value?.data as unknown
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const maybeDetails = (raw as { payment_details?: unknown }).payment_details
  if (!maybeDetails || typeof maybeDetails !== 'object') {
    return null
  }

  const details = maybeDetails as Record<string, unknown>
  return {
    payment_id: typeof details.payment_id === 'string' ? details.payment_id : undefined,
    payment_reference: typeof details.payment_reference === 'string' ? details.payment_reference : undefined,
    status: typeof details.status === 'string' ? details.status : undefined,
  }
})

// Helpers
function getOrderStatusColor(status: string): string {
  return orderStatusColors[status as keyof typeof orderStatusColors] || 'gray'
}

function formatRelativeTime(dateString: string): string {
  const dt = DateTime.fromISO(dateString)
  const now = DateTime.now()
  const diff = now.diff(dt, ['days', 'hours', 'minutes']).toObject()

  if (diff.days! >= 1) {
    return `${Math.floor(diff.days!)} day${Math.floor(diff.days!) !== 1 ? 's' : ''} ago`
  } else if (diff.hours! >= 1) {
    return `${Math.floor(diff.hours!)} hour${Math.floor(diff.hours!) !== 1 ? 's' : ''} ago`
  } else {
    return `${Math.floor(diff.minutes!)} minute${Math.floor(diff.minutes!) !== 1 ? 's' : ''} ago`
  }
}

function canTransitionStatus(status: OrderStatus | undefined): boolean {
  if (!status) return false
  return ['pending', 'processing'].includes(status)
}

function canCancelOrder(status: OrderStatus | undefined): boolean {
  if (!status) return false
  return ['draft', 'pending', 'processing'].includes(status)
}

function getNextStatusLabel(status: OrderStatus | undefined): string {
  if (status === 'pending') return 'Mark as Processing'
  if (status === 'processing') return 'Mark as Completed'
  return 'Update Status'
}

function getProductVariantDetails(item: OrderItem): VariantDetails | null {
  const maybeDetails = (item as unknown as { product_variant_details?: unknown }).product_variant_details
  if (!maybeDetails || typeof maybeDetails !== 'object') {
    return null
  }

  const details = maybeDetails as Record<string, unknown>
  return {
    variant_id: typeof details.variant_id === 'string' ? details.variant_id : undefined,
    product_title: typeof details.product_title === 'string' ? details.product_title : undefined,
    size: typeof details.size === 'string' ? details.size : null,
    color: typeof details.color === 'string' ? details.color : null,
    image_url: typeof details.image_url === 'string' ? details.image_url : null,
  }
}

function goToLinkedPayment() {
  const linkedPaymentId = paymentDetails.value?.payment_id
  const linkedPaymentReference = paymentDetails.value?.payment_reference

  if (linkedPaymentReference) {
    navigateTo(`/events/${eventId.value}/m/payments/list?search=${encodeURIComponent(linkedPaymentReference)}`)
    return
  }

  if (order.value?.payment) {
    navigateTo(`/events/${eventId.value}/m/payments/list?search=${encodeURIComponent(String(order.value.payment))}`)
  }
}

// Actions
async function handleStatusTransition() {
  if (!order.value || isTransitioning.value) return

  const status = order.value.status
  
  try {
    isTransitioning.value = true

    if (status === 'processing') {
      // Transition to completed
      await completeOrderMutation(order.value.order_id)
      toast.add({
        title: 'Order completed',
        description: `Order ${order.value.order_reference_id} has been marked as completed.`,
        color: 'green',
      })
    } else if (status === 'pending') {
      await updateOrderStatusMutation({
        orderId: order.value.order_id,
        status: 'processing',
      })
      toast.add({
        title: 'Order updated',
        description: `Order ${order.value.order_reference_id} has been marked as processing.`,
        color: 'green',
      })
    } else {
      toast.add({
        title: 'Status transition',
        description: 'This order status cannot be transitioned from this screen.',
        color: 'amber',
      })
    }
    
    await refetch()
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to update order status. Please try again.',
      color: 'red',
    })
  } finally {
    isTransitioning.value = false
  }
}

async function handleCancelOrder() {
  if (!order.value) return

  if (!confirm(`Are you sure you want to cancel order ${order.value.order_reference_id}? This action cannot be undone.`)) {
    return
  }

  try {
    await cancelOrderMutation(order.value.order_id)
    toast.add({
      title: 'Order cancelled',
      description: `Order ${order.value.order_reference_id} has been cancelled.`,
      color: 'green',
    })
    refetch()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to cancel order. Please try again.',
      color: 'red',
    })
  }
}
</script>
