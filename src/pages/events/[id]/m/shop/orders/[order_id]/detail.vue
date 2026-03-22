<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="space-y-6">
      <!-- Back Button -->
      <div>
        <UButton
          variant="ghost"
          color="gray"
          icon="i-heroicons-arrow-left"
          @click="navigateTo(`/events/${eventId}/m/shop/orders`)"
        >
          Back to Orders
        </UButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div class="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>

      <!-- Order Not Found -->
      <div v-else-if="!order" class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-12 text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
        <p class="text-sm text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
        <UButton
          color="primary"
          @click="navigateTo(`/events/${eventId}/m/shop/orders`)"
        >
          Back to Orders
        </UButton>
      </div>

      <!-- Order Details -->
      <template v-else>
        <!-- Order Header -->
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-2xl font-black text-deep-navy">Order {{ order.order_reference_id }}</h1>
                  <UBadge 
                    :color="getOrderStatusColor(order.status!) as any"
                    variant="soft"
                    size="lg"
                  >
                    {{ order.status_display }}
                  </UBadge>
                  <UIcon 
                    v-if="order.payment"
                    name="i-heroicons-credit-card"
                    class="w-5 h-5 text-green-600"
                    title="Payment linked"
                  />
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span class="font-mono">{{ order.order_id }}</span>
                  <span>•</span>
                  <span>Created {{ formatRelativeTime(order.created_at) }}</span>
                  <span>•</span>
                  <span>{{ formatDate(order.created_at, 'MMM d, yyyy h:mm a') }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  v-if="canTransitionStatus(order.status!)"
                  size="sm"
                  variant="solid"
                  color="blue"
                  icon="i-heroicons-arrow-right"
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
                  @click="handleCancelOrder"
                >
                  Cancel Order
                </UButton>
                <UButton
                  size="sm"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-ellipsis-horizontal"
                >
                  More
                </UButton>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <!-- Customer Information -->
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer</h3>
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div class="font-semibold text-gray-900">{{ order.customer_name || 'N/A' }}</div>
                    <div v-if="order.customer" class="text-xs text-gray-500">Customer ID: {{ order.customer }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attendee Information -->
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Attendee</h3>
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-ticket" class="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div class="font-semibold text-gray-900">{{ order.attendee_name || 'N/A' }}</div>
                    <div v-if="order.attendee" class="text-xs text-gray-500">Attendee ID: {{ order.attendee }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Summary</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Items:</span>
                  <span class="font-semibold text-gray-900">{{ order.item_count }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Total:</span>
                  <span class="text-lg font-black text-primary">{{ formatMoney(order.total_amount, 'GBP') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 text-primary" />
              <div>
                <h2 class="text-sm font-black text-primary uppercase tracking-widest">Order Items</h2>
                <p class="text-xs text-gray-500">{{ order.order_items.length }} item{{ order.order_items.length !== 1 ? 's' : '' }} in this order</p>
              </div>
            </div>
          </div>

          <div v-if="order.order_items.length === 0" class="p-12 text-center">
            <UIcon name="i-heroicons-shopping-cart" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No items in this order</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="py-3 px-4 font-semibold text-gray-700">#</th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Product Variant</th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-center">Quantity</th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-right">Unit Price</th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in order.order_items"
                  :key="item.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4 text-gray-500">{{ index + 1 }}</td>
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-semibold text-gray-900">
                        Product Variant #{{ item.product_variant || 'N/A' }}
                      </div>
                      <div class="text-xs text-gray-500">Item ID: {{ item.id }}</div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <UBadge color="gray" variant="soft">
                      {{ item.quantity }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4 text-right font-semibold text-gray-900">
                    {{ formatMoney(item.unit_price, 'GBP') }}
                  </td>
                  <td class="py-3 px-4 text-right font-black text-primary">
                    {{ formatMoney(item.total_price, 'GBP') }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-gray-200 bg-gray-50">
                  <td colspan="4" class="py-4 px-4 text-right font-semibold text-gray-900">
                    Order Total:
                  </td>
                  <td class="py-4 px-4 text-right text-xl font-black text-primary">
                    {{ formatMoney(order.total_amount, 'GBP') }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Order Timeline & Metadata -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Timeline -->
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Order Timeline</h2>
                  <p class="text-xs text-gray-500">History of order events</p>
                </div>
              </div>
            </div>

            <div class="p-6 space-y-4">
              <div class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4 text-blue-600" />
                  </div>
                  <div v-if="order.updated_at !== order.created_at" class="w-px h-full bg-gray-200 my-1" />
                </div>
                <div class="flex-1 pb-4">
                  <div class="font-semibold text-gray-900">Order Created</div>
                  <div class="text-sm text-gray-500">{{ formatDate(order.created_at, 'MMM d, yyyy h:mm a') }}</div>
                  <div v-if="order.created_by_name" class="text-xs text-gray-400 mt-1">
                    By {{ order.created_by_name }}
                  </div>
                </div>
              </div>

              <div v-if="order.updated_at !== order.created_at" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">Last Updated</div>
                  <div class="text-sm text-gray-500">{{ formatDate(order.updated_at, 'MMM d, yyyy h:mm a') }}</div>
                  <div v-if="order.updated_by_name" class="text-xs text-gray-400 mt-1">
                    By {{ order.updated_by_name }}
                  </div>
                </div>
              </div>

              <div v-if="order.status === 'completed'" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-check" class="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">Order Completed</div>
                  <div class="text-sm text-gray-500">{{ formatDate(order.updated_at, 'MMM d, yyyy h:mm a') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata & Payment Info -->
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Additional Information</h2>
                  <p class="text-xs text-gray-500">Order metadata</p>
                </div>
              </div>
            </div>

            <div class="p-6 space-y-4">
              <!-- Payment Information -->
              <div>
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</h3>
                <div v-if="order.payment" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-credit-card" class="w-4 h-4 text-green-600" />
                  <span class="text-sm text-gray-900">Payment ID: {{ order.payment }}</span>
                  <UBadge color="green" variant="soft" size="xs">Linked</UBadge>
                </div>
                <div v-else class="flex items-center gap-2">
                  <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-500">No payment linked</span>
                </div>
              </div>

              <!-- Order IDs -->
              <div>
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identifiers</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">Reference ID:</span>
                    <code class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{{ order.order_reference_id }}</code>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">UUID:</span>
                    <code class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-[10px]">{{ order.order_id }}</code>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">Database ID:</span>
                    <code class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{{ order.id }}</code>
                  </div>
                </div>
              </div>

              <!-- Links -->
              <div v-if="order._links">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Related Links</h3>
                <div class="space-y-2">
                  <a
                    v-if="order._links.customer"
                    :href="order._links.customer"
                    target="_blank"
                    class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <UIcon name="i-heroicons-user" class="w-4 h-4" />
                    View Customer
                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                  </a>
                  <a
                    v-if="order._links.attendee"
                    :href="order._links.attendee"
                    target="_blank"
                    class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <UIcon name="i-heroicons-ticket" class="w-4 h-4" />
                    View Attendee
                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { useEvent } from '~/composables/resources/events/events'
import { useProductOrder, useCancelProductOrder, useCompleteProductOrder } from '~/composables/resources/products/productOrders'
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

// Event Data
const { data: event } = useEvent(eventId)

// Order Data
const { data: orderData, isLoading, refetch } = useProductOrder(computed(() => orderId.value))
const order = computed(() => orderData.value?.data)

// Mutations
const { mutateAsync: cancelOrderMutation } = useCancelProductOrder()
const { mutateAsync: completeOrderMutation } = useCompleteProductOrder()

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

function canTransitionStatus(status: string): boolean {
  return ['pending', 'processing'].includes(status)
}

function canCancelOrder(status: string): boolean {
  return ['draft', 'pending', 'processing'].includes(status)
}

function getNextStatusLabel(status: string): string {
  if (status === 'pending') return 'Mark as Processing'
  if (status === 'processing') return 'Mark as Completed'
  return 'Update Status'
}

// Actions
async function handleStatusTransition() {
  if (!order.value) return

  const status = order.value.status
  
  try {
    if (status === 'processing') {
      // Transition to completed
      await completeOrderMutation(Number(order.value.id))
      toast.add({
        title: 'Order completed',
        description: `Order ${order.value.order_reference_id} has been marked as completed.`,
        color: 'green',
      })
    } else {
      // For pending -> processing, we'd need a different mutation
      // For now, show a message
      toast.add({
        title: 'Status transition',
        description: 'Backend endpoint for this transition needs to be implemented.',
        color: 'blue',
      })
    }
    
    refetch()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update order status. Please try again.',
      color: 'red',
    })
  }
}

async function handleCancelOrder() {
  if (!order.value) return

  if (!confirm(`Are you sure you want to cancel order ${order.value.order_reference_id}? This action cannot be undone.`)) {
    return
  }

  try {
    await cancelOrderMutation(Number(order.value.id))
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
