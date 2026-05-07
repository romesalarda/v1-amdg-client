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
              <p
                class="mt-1 text-2xl font-black"
                :class="isOrderRefunded ? 'text-slate-400 line-through decoration-2' : 'text-primary'"
              >
                {{ order.total_amount }}
              </p>
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
                  class="rounded-xl border p-4"
                  :class="isItemRefundedOrZero(item) ? 'border-slate-300 bg-slate-100/80 opacity-80' : 'border-slate-200 bg-slate-50'"
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
                      <p class="mt-1 text-sm font-semibold" :class="isItemRefundedOrZero(item) ? 'text-slate-500 line-through decoration-2' : 'text-slate-900'">
                        {{ getProductVariantDetails(item)?.product_title || `Product Variant #${item.product_variant || 'N/A'}` }}
                      </p>
                      <p class="text-xs text-slate-500">
                        Variant: {{ getProductVariantDetails(item)?.variant_id || item.product_variant || 'N/A' }}
                        <span v-if="getProductVariantDetails(item)?.size"> • Size {{ getProductVariantDetails(item)?.size }}</span>
                        <span v-if="getProductVariantDetails(item)?.color"> • Color {{ getProductVariantDetails(item)?.color }}</span>
                      </p>
                      <UBadge
                        v-if="isItemRefundedOrZero(item)"
                        color="gray"
                        variant="soft"
                        size="xs"
                        class="mt-1"
                      >
                        {{ isOrderRefunded ? 'Order Refunded' : 'Zero Value Item' }}
                      </UBadge>
                      <p class="mt-1 text-xs text-slate-500">Item ID: {{ item.id }}</p>
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-right text-xs sm:min-w-[230px]">
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Qty</p>
                        <p
                          class="mt-1 text-sm font-semibold"
                          :class="isItemRefundedOrZero(item) ? 'text-slate-500 line-through decoration-2' : 'text-slate-900'"
                        >
                          {{ item.quantity }}
                        </p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Unit</p>
                        <p
                          class="mt-1 text-sm font-semibold"
                          :class="isItemRefundedOrZero(item) ? 'text-slate-500 line-through decoration-2' : 'text-slate-900'"
                        >
                          {{ item.unit_price}}
                        </p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Total</p>
                        <p
                          class="mt-1 text-sm font-black"
                          :class="isItemRefundedOrZero(item) ? 'text-slate-500 line-through decoration-2' : 'text-primary'"
                        >
                          {{ item.total_price }}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div class="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div class="flex items-center justify-end gap-3">
                  <p class="text-sm font-semibold text-slate-700">Order Total</p>
                  <p
                    class="text-xl font-black"
                    :class="isOrderRefunded ? 'text-slate-400 line-through decoration-2' : 'text-primary'"
                  >
                    {{ order.total_amount }}
                  </p>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 class="text-sm font-black uppercase tracking-[0.14em] text-slate-800">Stock Audit History</h2>
                  <p class="text-xs text-slate-500">Inventory actions linked to this order</p>
                </div>
              </div>

              <div v-if="isLoadingStockAudit" class="space-y-3 p-4">
                <div class="h-16 rounded-xl bg-slate-100 animate-pulse" />
                <div class="h-16 rounded-xl bg-slate-100 animate-pulse" />
              </div>

              <div v-else-if="stockAuditActions.length === 0" class="p-10 text-center text-slate-500">
                <UIcon name="i-heroicons-archive-box" class="mx-auto mb-2 h-12 w-12 text-slate-300" />
                No stock audit actions found for this order.
              </div>

              <div v-else class="space-y-3 p-4">
                <article
                  v-for="action in stockAuditActions"
                  :key="action.id"
                  class="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div class="flex items-start gap-3">
                      <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img
                          v-if="getStockAuditActionContext(action).image_url"
                          :src="getStockAuditActionContext(action).image_url || ''"
                          :alt="getStockAuditActionContext(action).product_title || action.product_title"
                          class="h-full w-full object-cover"
                        />
                        <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
                          <UIcon name="i-heroicons-cube" class="h-5 w-5" />
                        </div>
                      </div>

                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="text-sm font-semibold text-slate-900">
                            {{ getStockAuditActionContext(action).product_title || action.product_title }}
                          </p>
                          <UBadge :color="getStockAuditReasonColor(action.change_reason) as any" variant="solid" size="xs">
                            {{ getStockAuditReasonLabel(action.change_reason) }}
                          </UBadge>
                          <UBadge :color="action.change_amount >= 0 ? 'green' : 'red'" variant="soft" size="xs">
                            {{ action.change_amount >= 0 ? 'Stock Increased' : 'Stock Decreased' }}
                          </UBadge>
                        </div>
                        <p class="text-xs text-slate-500">
                          <span v-if="getStockAuditActionContext(action).size"> • Size {{ getStockAuditActionContext(action).size }}</span>
                          <span v-if="getStockAuditActionContext(action).color"> • Color {{ getStockAuditActionContext(action).color }}</span>
                        </p>
                        <div class="mt-2 space-y-1 text-xs text-slate-600">
                          <p class="flex items-center gap-1.5">
                            <UIcon name="i-heroicons-user-circle" class="h-3.5 w-3.5 text-slate-400" />
                            <span class="font-semibold text-slate-700">Performed by:</span>
                            <span>{{ action.actor_name || 'System' }}</span>
                          </p>
                          <p class="flex items-center gap-1.5">
                            <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5 text-slate-400" />
                            <span class="font-semibold text-slate-700">When:</span>
                            <span>{{ formatRelativeTime(action.created_at) }}</span>
                            <span class="text-slate-400">({{ formatDate(action.created_at, 'MMM d, yyyy h:mm a') }})</span>
                          </p>
                        </div>
                        <p v-if="action.notes" class="mt-1 text-xs text-slate-600">{{ action.notes }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-right text-xs lg:min-w-[250px]">
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Before</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ action.old_quantity }}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">After</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ action.new_quantity }}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p class="font-bold uppercase tracking-wide text-slate-400">Change</p>
                        <p
                          class="mt-1 text-sm font-black"
                          :class="action.change_amount >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                        >
                          {{ formatSignedChange(action.change_amount) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
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
import type { OrderDetail, OrderItem, StockAuditLog } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useProductOrder, useCancelProductOrder, useCompleteProductOrder, useUpdateProductOrderStatus } from '~/composables/resources/products/productOrders'
import { usePaymentStockAudit } from '~/composables/resources/payments/paymentStockAudit'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { orderStatusColors } from '~/schemas/events/productConstants'
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
  product_id?: string
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

const stockAuditParams = computed(() => ({
  order_id: orderId.value,
  event_id: event.value?.data.url_safe_title || undefined,
  ordering: '-created_at',
  page_size: 100,
}))
const { data: stockAuditData, isLoading: isLoadingStockAudit } = usePaymentStockAudit(stockAuditParams, {
  enabled: computed(() => Boolean(orderId.value)),
})

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

type StockAuditActionContext = {
  product_id?: string
  variant_id?: string
  product_title?: string
  size?: string | null
  color?: string | null
  image_url?: string | null
}

const stockAuditActions = computed<StockAuditLog[]>(() => {
  const listedActions = Array.isArray(stockAuditData.value?.data?.results)
    ? stockAuditData.value.data.results
    : []
  const orderActions = Array.isArray(order.value?.actions)
    ? order.value.actions
    : []

  // Merge both sources to avoid dropping initial actions when one endpoint is partial.
  const byId = new Map<string, StockAuditLog>()
  for (const action of listedActions) {
    byId.set(action.id, action)
  }
  for (const action of orderActions) {
    if (!byId.has(action.id)) {
      byId.set(action.id, action)
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    DateTime.fromISO(b.created_at).toMillis() - DateTime.fromISO(a.created_at).toMillis(),
  )
})

const stockAuditActionContextById = computed<Record<string, StockAuditActionContext>>(() => {
  const orderItems = order.value?.order_items || []
  const context: Record<string, StockAuditActionContext> = {}

  for (const action of stockAuditActions.value) {
    const matchedItem = orderItems.find((item) => {
      if (item.product_variant === action.product_variant) {
        return true
      }

      const itemVariant = getProductVariantDetails(item)
      return !!itemVariant?.variant_id && itemVariant.variant_id === action.product_variant_code
    })

    const matchedDetails = matchedItem ? getProductVariantDetails(matchedItem) : null
    context[action.id] = {
      product_id: matchedDetails?.product_id,
      variant_id: matchedDetails?.variant_id || action.product_variant_code,
      product_title: matchedDetails?.product_title || action.product_title,
      size: matchedDetails?.size,
      color: matchedDetails?.color,
      image_url: matchedDetails?.image_url,
    }
  }

  return context
})

const isOrderRefunded = computed(() => {
  const currentOrder = order.value as (OrderDetail & { is_refunded?: boolean }) | undefined
  return currentOrder?.status === 'refunded' || currentOrder?.is_refunded === true
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

function isZeroMoney(value: string | null | undefined): boolean {
  if (!value) {
    return false
  }

  const numericValue = Number(value.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(numericValue) && numericValue === 0
}

function isItemRefundedOrZero(item: OrderItem): boolean {
  const itemStatus = (item as OrderItem & { status?: string }).status
  return isOrderRefunded.value || itemStatus === 'refunded' || isZeroMoney(item.total_price) || isZeroMoney(item.unit_price)
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
    product_id: typeof details.product_id === 'string' ? details.product_id : undefined,
    product_title: typeof details.product_title === 'string' ? details.product_title : undefined,
    size: typeof details.size === 'string' ? details.size : null,
    color: typeof details.color === 'string' ? details.color : null,
    image_url: typeof details.image_url === 'string' ? details.image_url : null,
  }
}

function getStockAuditActionContext(action: StockAuditLog): StockAuditActionContext {
  return stockAuditActionContextById.value[action.id] || {}
}

function getStockAuditReasonLabel(reason: StockAuditLog['change_reason']): string {
  const labels: Record<StockAuditLog['change_reason'], string> = {
    initial_order_deduction: 'Initial Deduction',
    order_cancellation_restore: 'Order Cancellation Restore',
    payment_failure_restore: 'Payment Failure Restore',
    refund_restoration: 'Refund Restoration',
    partial_refund_restoration: 'Partial Refund Restore',
    manual_adjustment: 'Manual Adjustment',
    admin_action: 'Admin Action',
    stock_restoration_safety_net: 'Safety Net Restore',
  }

  return labels[reason]
}

function getStockAuditReasonColor(reason: StockAuditLog['change_reason']): string {
  const colors: Record<StockAuditLog['change_reason'], string> = {
    initial_order_deduction: 'red',
    order_cancellation_restore: 'orange',
    payment_failure_restore: 'yellow',
    refund_restoration: 'green',
    partial_refund_restoration: 'emerald',
    manual_adjustment: 'blue',
    admin_action: 'violet',
    stock_restoration_safety_net: 'teal',
  }

  return colors[reason] || 'gray'
}

function formatSignedChange(amount: number): string {
  if (amount > 0) {
    return `+${amount}`
  }

  return String(amount)
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
