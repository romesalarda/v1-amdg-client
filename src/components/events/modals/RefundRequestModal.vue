<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-blue-600">undo</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Initiate Refund Request</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">
              {{ props.mode === 'attendee' ? selectedPaymentId : payment?.payment_reference }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[80vh] overflow-y-auto">
          <!-- Payment Info -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Original Amount:</span>
              <span class="text-lg font-bold text-gray-900">{{ payment?.final_amount }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Payment Date:</span>
              <span class="font-medium text-gray-900">{{ formatDate(payment?.created_at || '') }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-600">{{ props.mode === 'attendee' ? 'Attendee:' : 'User:' }}</span>
              <span class="font-medium text-gray-900">{{ props.mode === 'attendee' ? props.attendee?.full_name : payment?.user_name }}</span>
            </div>
          </div>

          <!-- Refund Form -->
          <form @submit.prevent="handleSubmit">
            <!-- Refund Type -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Refund Type</label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    v-model="refundType"
                    type="radio"
                    value="full"
                    name="refundType"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-900">Full Refund</div>
                    <div class="text-xs text-gray-600">
                      Refund entire amount: {{ payment?.final_amount || '0' }}
                    </div>
                  </div>
                </label>

                <label
                  class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                  :class="canSelectPartialRefund ? 'cursor-pointer hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'"
                >
                  <input
                    v-model="refundType"
                    type="radio"
                    value="partial"
                    name="refundType"
                    :disabled="!canSelectPartialRefund"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary disabled:cursor-not-allowed"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-900">Partial Refund</div>
                    <div class="text-xs text-gray-600">
                      <template v-if="!canSelectPartialRefund">Not available — only one item exists with a fixed quantity</template>
                      <template v-else>Specify custom refund amount</template>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Item Preview / Selection -->
            <div v-if="isItemsLoading || selectableItems.length > 0" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ refundType === 'full' ? 'Refund Items (view only)' : 'Select Items to Refund' }}
              </label>
              <div class="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-72 overflow-y-auto">
                <!-- Skeleton items while data is loading -->
                <template v-if="isItemsLoading">
                  <div
                    v-for="n in skeletonItemCount"
                    :key="`skeleton-${n}`"
                    class="rounded-lg border border-gray-200 bg-white p-3 animate-pulse"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-3 min-w-0 flex-1">
                        <div class="mt-1 h-4 w-4 rounded bg-gray-200 flex-shrink-0" />
                        <div class="h-14 w-14 rounded-md bg-gray-200 flex-shrink-0" />
                        <div class="flex-1 space-y-2 min-w-0">
                          <div class="h-4 w-2/3 rounded bg-gray-200" />
                          <div class="h-3 w-1/3 rounded bg-gray-200" />
                          <div class="h-3 w-1/4 rounded bg-gray-200" />
                          <div class="flex gap-1.5 mt-1">
                            <div class="h-4 w-16 rounded-full bg-gray-200" />
                            <div class="h-4 w-20 rounded-full bg-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Actual items once fully loaded -->
                <template v-else>
                <div v-for="item in selectableItems" :key="item.id" class="rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-200 transition-colors" :class="{ 'opacity-60': item.type === 'attendee' && isAttendeeLoading(item.attendeeId) }">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 min-w-0">
                      <input
                        :disabled="refundType === 'full' || item?.is_refunded || item.quantity <= 0 || requiresLiveOrderResolution(item) || (item.type === 'attendee' && isAttendeeLoading(item.attendeeId))"
                        :id="`item-${item.id}`"
                        type="checkbox"
                        :checked="refundType === 'partial' && !!selectedItems[item.id]"
                        @change="toggleItemSelection(item)"
                        class="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />

                      <label
                        :for="`item-${item.id}`"
                        class="flex items-start gap-3 min-w-0"
                        :class="refundType === 'full' ? 'cursor-not-allowed' : 'cursor-pointer'"
                      >
                        <div class="h-14 w-14 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                          <img
                            v-if="getVariantImageUrl(item)"
                            :src="resolveImageUrl(getVariantImageUrl(item))"
                            alt="Variant preview"
                            class="h-full w-full object-cover"
                          >
                          <div
                            v-else
                            class="h-full w-full flex items-center justify-center text-sm font-black uppercase tracking-wide text-gray-500"
                          >
                            {{ getItemPlaceholderLetter(item) }}
                          </div>
                        </div>

                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <div class="text-sm font-semibold text-gray-900 truncate">{{ item.name }}</div>
                            <span
                              v-if="item.type === 'attendee' && item.is_cancelled && !item.is_refunded"
                              class="material-symbols-outlined text-base leading-none text-amber-600"
                              :title="'This user status is set to CANCELLED even though a refund has not occured for this specific PACKAGE.'"
                            >
                              warning
                            </span>
                          </div>
                          <div class="mt-1 text-xs text-gray-600">{{ formatCurrency(item.price) }} per unit</div>
                          <div class="mt-1 text-xs text-gray-500">Available quantity: {{ item.quantity }}</div>

                          <div class="mt-2 flex flex-wrap gap-1.5">
                            <span
                              v-for="meta in getVariantMetadata(item)"
                              :key="`${item.id}-${meta}`"
                              class="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800"
                            >
                              {{ meta }}
                            </span>
                            <span
                              v-if="item.variantId && isVariantLoading(item)"
                              class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                            >
                              Loading variant
                            </span>
                            <span
                              v-if="item.variantId && !isVariantLoading(item) && !hasVariantData(item)"
                              class="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                            >
                              Variant metadata unavailable
                            </span>
                            <span
                              v-if="!item.variantId"
                              class="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                            >
                              Non-variant item
                            </span>
                            <span
                              v-if="requiresLiveOrderResolution(item)"
                              class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                            >
                              Waiting for live order sync
                            </span>
                            <span
                              v-if="item.type === 'attendee' && isAttendeeLoading(item.attendeeId)"
                              class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                            >
                              Checking attendee status
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div class="flex flex-col items-end gap-2">
                      <span v-if="item.is_refunded" class="text-xs font-semibold text-red-600">Refunded</span>
                      <span
                        v-else-if="item.type === 'attendee' && item.is_cancelled"
                        class="text-xs font-semibold text-amber-700"
                      >
                        Cancelled status
                      </span>
                      <div v-if="refundType === 'partial' && item.type === 'order_item' && selectedItems[item.id]" class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          :max="item.quantity"
                          :value="selectedItems[item.id]?.quantity"
                          @input="updateItemQuantity(item, parseInt(($event.target as HTMLInputElement).value))"
                          class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                </template>
              </div>
              <div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-right">
                <span class="text-sm text-gray-600">
                  {{ refundType === 'full' ? 'Items Total:' : 'Selected Items Total (suggested):' }}
                </span>
                <span class="text-lg font-bold text-primary">
                  {{ formatCurrency(refundType === 'full' ? selectableItemsAmount : selectedItemsAmount) }}
                </span>
              </div>
              <p v-if="refundType === 'full'" class="text-xs text-gray-500 mt-1">
                Item selection is disabled for full refunds.
              </p>
            </div>

            <!-- Partial Refund Amount -->
            <div v-if="refundType === 'partial'" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Refund Amount (£)
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="refundAmount"
                type="number"
                step="0.01"
                min="0.01"
                :max="maxRefundableAmount"
                placeholder="0.00"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p class="text-xs text-gray-500 mt-1">
                Maximum refundable: {{ formatCurrency(maxRefundableAmount) }}
              </p>
              <p v-if="selectableItems.length > 0" class="text-xs text-blue-700 mt-1">
                Shortcut tip: selecting items auto-fills this amount, but you can edit it manually.
              </p>
            </div>

            <!-- Attendee Selection for Partial Booking Refunds (Legacy - can be removed if new UI is sufficient) -->
            <div v-if="refundType === 'partial' && props.isBookingPayment && props.mode === 'attendee' && props.bookingAttendees && props.bookingAttendees.length > 0 && selectableItems.length === 0" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Select Attendees to Refund
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                <div v-for="bookingAttendee in props.bookingAttendees" :key="bookingAttendee.id" class="flex items-center">
                  <input
                    :id="`attendee-${bookingAttendee.id}`"
                    type="checkbox"
                    :value="bookingAttendee.id"
                    v-model="selectedAttendeeIds"
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    :for="`attendee-${bookingAttendee.id}`"
                    class="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {{ bookingAttendee.full_name }}
                  </label>
                </div>
              </div>
              <p v-if="selectedAttendeeIds.length === 0" class="text-xs text-amber-600 mt-1">
                ⚠ Select at least one attendee to refund
              </p>
            </div>

            <!-- Reason -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Refund Reason
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="reason"
                rows="4"
                placeholder="Enter the reason for this refund (required, 10-1000 characters)"
                required
                minlength="10"
                maxlength="1000"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ reason.length }}/1000 characters (minimum 10 required)
              </p>
            </div>

            <!-- Warning Box -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-amber-600 text-sm">info</span>
                <div class="text-xs text-amber-800">
                  <p class="font-semibold mb-1">Refund Request Process</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>This will create a refund request for review</li>
                    <li>The request must be verified before processing</li>
                    <li>Once approved, the refund will be processed automatically</li>
                    <li v-if="payment?.method_title === 'STRIPE'">Stripe refunds are processed immediately upon verification</li>
                    <li v-else>Manual refund coordination required for non-Stripe payments</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!isFormValid || isLoading"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span v-else>Create Refund Request</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreatePaymentRefund } from '~/composables/resources/payments/paymentRefunds'
import { useRequestAttendeeCancellationRefund } from '~/composables/resources/attendee/attendees'
import { usePayment } from '~/composables/resources/payments/payments'
import { productsListVariantsRetrieve, productsOrdersRetrieve, attendeesRetrieve } from '~/api/sdk.gen'
import { parseAmount } from '~/utils/money'
import { resolveImageUrl } from '~/utils/image'
import type { AttendeeList, EventDetail, ProductVariantDetail } from '~/api/types.gen'

interface Props {
  payment?: any
  mode?: 'payment' | 'attendee'
  attendee?: AttendeeList | null
  paymentId?: string | null
  bookingId?: number | null
  bookingAttendees?: Array<{ id: string; full_name: string }> | null
  open: boolean
  isBookingPayment?: boolean
  eventDetail: EventDetail | null | undefined
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'created'])

const toast = useToast()

const selectedPaymentId = computed(() => {
  if (props.mode === 'attendee') {
    return props.paymentId || ''
  }
  return props.payment?.payment_id || ''
})

const { data: paymentData } = usePayment(selectedPaymentId)

const payment = computed(() => paymentData.value?.data)

const refundType = ref<'full' | 'partial'>('full')
const refundAmount = ref<number | null>(null)
const reason = ref('')
const isLoading = ref(false)
const selectedAttendeeIds = ref<string[]>([])

// New state for item selection
type SelectableItem = {
  id: string
  name: string
  price: number
  quantity: number
  type: 'attendee' | 'order_item' | 'attendee_product_line'
  productId?: string
  attendeeId?: string
  orderItemId?: string | number
  orderId?: string
  variantId?: string
  packageProductId?: number
  is_cancelled?: boolean | null
  is_refunded: boolean | undefined | null
}

type SelectedItem = {
  quantity: number
  price: number
  type: SelectableItem['type']
  productId?: string
  attendeeId?: string
  orderItemId?: string | number
  orderId?: string
  variantId?: string
  packageProductId?: number
}

const selectedItems = ref<Record<string, SelectedItem>>({})
const variantDetailsByLookupKey = ref<Record<string, ProductVariantDetail>>({})
const variantLookupLoading = ref<Record<string, boolean>>({})

const orderDetailsById = ref<Record<string, any>>({})
const orderRefundState = ref<Record<string, boolean | null>>({})
const fetchedOrderIds = new Set<string>()
const loadingOrderIds = new Set<string>()
const pendingOrderCount = ref(0)

const attendeeDetailsById = ref<Record<string, any>>({})
const attendeeCancelledState = ref<Record<string, boolean | null>>({})
const attendeeRefundState = ref<Record<string, boolean | null>>({})
const fetchedAttendeeIds = new Set<string>()
const loadingAttendeeIds = new Set<string>()
const pendingAttendeeCount = ref(0)

const eventSlugOrId = computed(() => {
  const eventIdentifier = props.eventDetail?.url_safe_title || props.eventDetail?.event_id
  return eventIdentifier ? String(eventIdentifier) : ''
})

const paymentOrderId = computed(() => {
  const metadata = payment.value?.metadata as any
  const rawOrderId = metadata?.order_id || metadata?.order?.order_id
  return rawOrderId ? String(rawOrderId) : ''
})

const bookingOrderIds = computed(() => {
  const metadata = payment.value?.metadata as any
  const selections = metadata?.attendee_selections

  if (!Array.isArray(selections)) {
    return [] as string[]
  }

  return Array.from(
    new Set(
      selections
        .map((item: any) => item?.order_id)
        .filter((orderId: unknown): orderId is string => typeof orderId === 'string' && orderId.length > 0),
    ),
  )
})

async function fetchOrderIsRefunded(orderId: string) {
  if (!orderId || fetchedOrderIds.has(orderId) || loadingOrderIds.has(orderId)) {
    return
  }

  loadingOrderIds.add(orderId)
  pendingOrderCount.value++

  try {
    const response = await productsOrdersRetrieve({
      path: { order_id: orderId },
      query: eventSlugOrId.value ? { event: eventSlugOrId.value } : undefined,
    })

    orderDetailsById.value[orderId] = response.data ?? null
    orderRefundState.value[orderId] = response.data?.is_refunded ?? null
    fetchedOrderIds.add(orderId)
  } catch {
    orderDetailsById.value[orderId] = null
    orderRefundState.value[orderId] = null
  } finally {
    loadingOrderIds.delete(orderId)
    pendingOrderCount.value--
  }
}

async function fetchAttendeeIsCancelled(attendeeId: string) {
  if (!attendeeId || fetchedAttendeeIds.has(attendeeId) || loadingAttendeeIds.has(attendeeId)) {
    return
  }

  loadingAttendeeIds.add(attendeeId)
  pendingAttendeeCount.value++

  try {
    const response = await attendeesRetrieve({
      path: { attendee_id: attendeeId },
    })

    attendeeDetailsById.value[attendeeId] = response.data ?? null
    attendeeCancelledState.value[attendeeId] = response.data?.is_cancelled ?? null
    attendeeRefundState.value[attendeeId] = response.data?.is_refunded ?? null
    fetchedAttendeeIds.add(attendeeId)
  } catch {
    attendeeDetailsById.value[attendeeId] = null
    attendeeCancelledState.value[attendeeId] = null
    attendeeRefundState.value[attendeeId] = null
  } finally {
    loadingAttendeeIds.delete(attendeeId)
    pendingAttendeeCount.value--
  }
}

function getLiveOrderDetail(orderId?: string) {
  if (!orderId) {
    return null
  }

  return orderDetailsById.value[orderId] ?? null
}

function getOrderIsRefunded(orderId?: string) {
  if (!orderId) {
    return null
  }

  return orderRefundState.value[orderId] ?? null
}

function getAttendeeDetail(attendeeId?: string) {
  if (!attendeeId) {
    return null
  }

  return attendeeDetailsById.value[attendeeId] ?? null
}

function getAttendeeIsCancelled(attendeeId?: string) {
  if (!attendeeId) {
    return null
  }

  return attendeeCancelledState.value[attendeeId] ?? null
}

function getAttendeeIsRefunded(attendeeId?: string) {
  if (!attendeeId) {
    return null
  }

  return attendeeRefundState.value[attendeeId] ?? null
}

function isAttendeeLoading(attendeeId?: string) {
  if (!attendeeId) {
    return false
  }

  return loadingAttendeeIds.has(attendeeId)
}

watch(
  () => Array.from(new Set([...bookingOrderIds.value, paymentOrderId.value].filter(Boolean))),
  (ids) => {
    ids.forEach((orderId) => {
      if (!(orderId in orderRefundState.value)) {
        orderRefundState.value[orderId] = null
      }
      void fetchOrderIsRefunded(orderId)
    })
  },
  { immediate: true },
)

watch(
  (): string[] => {
    const metadata = payment.value?.metadata as any
    const selections = metadata?.attendee_selections || []
    return Array.from(
      new Set(
        selections
          .map((item: any) => item?.attendee_id)
          .filter((attendeeId: unknown): attendeeId is string => typeof attendeeId === 'string' && attendeeId.length > 0),
      ),
    )
  },
  (attendeeIds: string[]) => {
    attendeeIds.forEach((attendeeId: string) => {
      if (!(attendeeId in attendeeCancelledState.value)) {
        attendeeCancelledState.value[attendeeId] = null
      }
      if (!(attendeeId in attendeeRefundState.value)) {
        attendeeRefundState.value[attendeeId] = null
      }
      void fetchAttendeeIsCancelled(attendeeId)
    })
  },
  { immediate: true },
)

const selectableItems = computed<SelectableItem[]>(() => {
  const descriptor = payment.value?.descriptor
  const metadata = payment.value?.metadata as any

  if (descriptor === 'booking' && metadata?.attendee_selections) {
    return metadata.attendee_selections.flatMap((item: any) => {
      const liveOrder = getLiveOrderDetail(item.order_id)
      const attendeeEntry: SelectableItem = {
        id: `attendee-${item.attendee_id}-package`,
        name: `${item.attendee_name} - ${item.package_name}`,
        price: parseFloat(item.frozen_price),
        quantity: 1,
        type: 'attendee',
        attendeeId: item.attendee_id,
        is_cancelled: getAttendeeIsCancelled(item.attendee_id),
        is_refunded: getAttendeeIsRefunded(item.attendee_id),
      }

      const productLineEntries: SelectableItem[] = (item.product_lines || []).map((line: any, index: number) => {
        const liveOrderItem = findLiveOrderItemForLine(liveOrder, line, index)
        const liveProductDetails = getLiveOrderItemProductDetails(liveOrderItem)

        return {
          id: String(liveOrderItem?.id ?? `attendee-${item.attendee_id}-product-${line.variant_id}-${index}`),
          name: String(
            liveProductDetails?.product_title ||
            line?.product_title ||
            `${item.attendee_name} - Package Product`,
          ),
          price: getItemUnitPrice(liveOrderItem?.unit_price, line.unit_final_amount),
          quantity: getLiveOrderItemQuantity(liveOrderItem, line.quantity || 1),
          type: 'attendee_product_line',
          productId: String(liveProductDetails?.product_id || getProductIdFromUnknown(line) || '').trim() || undefined,
          attendeeId: item.attendee_id,
          orderId: item.order_id,
          orderItemId: liveOrderItem?.id,
          variantId: String(liveProductDetails?.variant_id || liveOrderItem?.product_variant || line.variant_id || '').trim() || undefined,
          packageProductId: line.package_product_id,
          is_refunded: getLiveOrderItemRefunded(liveOrder, liveOrderItem),
        }
      })

      return [attendeeEntry, ...productLineEntries]
    })
  }

  if (descriptor === 'order' && metadata?.order?.order_items) {
    const liveOrder = getLiveOrderDetail(paymentOrderId.value)
    const liveOrderItems = Array.isArray(liveOrder?.order_items) ? liveOrder.order_items : []

    if (liveOrderItems.length > 0) {
      return liveOrderItems
        .map((item: any, index: number) => {
          const liveProductDetails = getLiveOrderItemProductDetails(item)
          const fallbackMetadataItem = metadata.order.order_items.find((metadataItem: any) => {
            const metadataOrderItemId = String(metadataItem?.order_item_id ?? '').trim()
            return metadataOrderItemId && metadataOrderItemId === String(item?.id ?? '').trim()
          })

          return {
            id: String(item?.id ?? `live-order-item-${index}`),
            name: String(
              liveProductDetails?.product_title ||
              fallbackMetadataItem?.product_title ||
              `Order Item ${index + 1}`,
            ),
            price: getItemUnitPrice(item?.unit_price, fallbackMetadataItem?.unit_price),
            quantity: getLiveOrderItemQuantity(item, fallbackMetadataItem?.quantity),
            type: 'order_item' as const,
            productId: String(liveProductDetails?.product_id || getProductIdFromUnknown(fallbackMetadataItem) || '').trim() || undefined,
            orderItemId: item?.id,
            variantId: String(liveProductDetails?.variant_id || item?.product_variant || fallbackMetadataItem?.product_variant_id || '').trim() || undefined,
            is_refunded: getLiveOrderItemRefunded(liveOrder, item),
          }
        })
        .filter((item: SelectableItem) => item.quantity > 0)
    }

    return metadata.order.order_items.map((item: any) => ({
      id: String(item.order_item_id),
      name: item.product_title,
      price: parseAmount(item.unit_price),
      quantity: item.quantity,
      type: 'order_item',
      productId: getProductIdFromUnknown(item),
      orderItemId: item.order_item_id,
      variantId: String(item.product_variant_id || '').trim() || undefined,
      is_refunded: item.is_refunded ?? metadata.order?.is_refunded ?? null,
    }))
  }
  return []
})

const variantLookupTargets = computed(() => {
  const seen = new Set<string>()
  const targets: Array<{ productId: string; variantId: string }> = []

  selectableItems.value.forEach((item) => {
    const productId = String(item.productId || '').trim()
    const variantId = String(item.variantId || '').trim()
    if (!productId || !variantId) return

    const key = toVariantLookupKey(productId, variantId)
    if (seen.has(key)) return

    seen.add(key)
    targets.push({ productId, variantId })
  })

  return targets
})

watch(
  variantLookupTargets,
  async (targets) => {
    if (!targets.length) return

    await Promise.all(
      targets.map(async ({ productId, variantId }) => {
        const lookupKey = toVariantLookupKey(productId, variantId)
        if (variantDetailsByLookupKey.value[lookupKey] || variantLookupLoading.value[lookupKey]) {
          return
        }

        variantLookupLoading.value[lookupKey] = true
        try {
          const response = await productsListVariantsRetrieve({
            path: {
              product_product_id: productId,
              variant_id: variantId,
            },
          })

          if (response.data) {
            variantDetailsByLookupKey.value[lookupKey] = response.data as ProductVariantDetail
          }
        } catch {
          // Best effort metadata fetch; UI gracefully falls back to placeholder chips.
        } finally {
          variantLookupLoading.value[lookupKey] = false
        }
      }),
    )
  },
  { immediate: true },
)

const selectedItemsAmount = computed(() => {
  return Object.values(selectedItems.value).reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const selectableItemsAmount = computed(() => {
  return selectableItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const paymentRemainingAmount = computed(() => {
  return parseAmount(
    payment.value?.final_amount ||
    props.payment?.final_amount ||
    payment.value?.amount ||
    props.payment?.amount ||
    0,
  )
})

const maxRefundableAmount = computed(() => {
  if (selectableItems.value.length > 0) {
    return Number(Math.min(paymentRemainingAmount.value, selectableItemsAmount.value).toFixed(2))
  }

  return Number(paymentRemainingAmount.value.toFixed(2))
})

const selectedBookingAttendeeIds = computed(() => {
  return Array.from(
    new Set(
      Object.values(selectedItems.value)
        .filter(item => item.type === 'attendee')
        .map(item => item.attendeeId)
        .filter((attendeeId): attendeeId is string => Boolean(attendeeId)),
    ),
  )
})

const selectedBookingProductRefundItems = computed(() => {
  return Object.values(selectedItems.value)
    .filter(item => item.type === 'attendee_product_line' && !!item.attendeeId && !!item.orderItemId)
    .map(item => ({
      attendee_id: item.attendeeId,
      order_item_id: item.orderItemId,
      variant_id: item.variantId,
      package_product_id: item.packageProductId,
      quantity: item.quantity,
    }))
})

const selectedOrderRefundItems = computed(() => {
  return Object.values(selectedItems.value)
    .filter(item => item.type === 'order_item' && !!item.orderItemId)
    .map(item => ({
      order_item_id: item.orderItemId,
      quantity: item.quantity,
    }))
})

watch(selectedItemsAmount, (total) => {
  if (refundType.value === 'partial' && selectableItems.value.length > 0) {
    refundAmount.value = Number(Math.min(total, maxRefundableAmount.value).toFixed(2))
  }
})

const isItemsLoading = computed(() => {
  const descriptor = payment.value?.descriptor
  if (!descriptor || (descriptor !== 'order' && descriptor !== 'booking')) return false
  if (pendingOrderCount.value > 0) return true
  if (pendingAttendeeCount.value > 0) return true
  if (Object.values(variantLookupLoading.value).some(Boolean)) return true
  return false
})

const skeletonItemCount = computed(() => {
  const metadata = payment.value?.metadata as any
  if (!metadata) return 3
  if (payment.value?.descriptor === 'order') {
    return Math.max(1, metadata.order?.order_items?.length ?? 1)
  }
  if (payment.value?.descriptor === 'booking') {
    const selections: any[] = metadata.attendee_selections ?? []
    return Math.max(1, selections.reduce((n: number, s: any) => n + 1 + (s.product_lines?.length ?? 0), 0))
  }
  return 3
})

// Partial refund is only meaningful if there are multiple refundable items,
// OR if the single refundable item is an order_item with qty > 1 (so user can refund a subset).
const canSelectPartialRefund = computed(() => {
  if (selectableItems.value.length === 0) return true

  const refundable = selectableItems.value.filter(i => !i.is_refunded && i.quantity > 0)
  if (refundable.length > 1) return true
  if (refundable.length === 1) {
    const item = refundable[0]
    return item.type === 'order_item' && item.quantity > 1
  }
  return false
})

watch(canSelectPartialRefund, (allowed) => {
  if (!allowed && refundType.value === 'partial') {
    refundType.value = 'full'
  }
})

const createRefundMutation = useCreatePaymentRefund()
const createAttendeeRefundMutation = useRequestAttendeeCancellationRefund()

const isFormValid = computed(() => {
  const hasValidReason = reason.value.length >= 10 && reason.value.length <= 1000
  
  if (refundType.value === 'full') {
    return hasValidReason
  }
  
  if (refundType.value === 'partial') {
    const maxAmount = maxRefundableAmount.value
    const hasValidAmount = refundAmount.value !== null && 
           refundAmount.value > 0 && 
           refundAmount.value <= maxAmount
    const descriptor = payment.value?.descriptor

    if (descriptor === 'booking') {
      const hasBookingAttendeeSelection = selectedBookingAttendeeIds.value.length > 0 || (selectableItems.value.length === 0 && selectedAttendeeIds.value.length > 0)
      const hasBookingOrderItemSelection = selectedBookingProductRefundItems.value.length > 0
      return hasValidReason && hasValidAmount && (hasBookingAttendeeSelection || hasBookingOrderItemSelection)
    }

    if (descriptor === 'order') {
      return hasValidReason && hasValidAmount && selectedOrderRefundItems.value.length > 0
    }
    
    return hasValidReason && hasValidAmount
  }
  
  return false
})

async function handleSubmit() {
  if (!isFormValid.value) {
    toast.add({
      title: 'Invalid Form',
      description: 'Please fill in all required fields correctly',
      color: 'red',
    })
    return
  }

  isLoading.value = true

  try {
    let amount: string | undefined
    if (refundType.value === 'full') {
      amount = maxRefundableAmount.value.toFixed(2)
    } else {
      amount = refundAmount.value?.toString()
    }

    if (!amount) {
      throw new Error('Refund amount is required')
    }

    if (props.mode === 'attendee') {
      if (!props.attendee?.attendee_id || !selectedPaymentId.value) {
        throw new Error('Attendee and payment are required for attendee refund mode')
      }

      const isPartialBookingPayment = refundType.value === 'partial' && payment.value?.descriptor === 'booking'
      // For partial booking refunds, selected shortcut items suggest attendee scope.
      // If no shortcut was selected, fallback to explicit attendee selection (legacy) or current attendee.
      const attendeeIds = (isPartialBookingPayment && props.isBookingPayment)
        ? (selectedBookingAttendeeIds.value.length > 0
          ? selectedBookingAttendeeIds.value
          : (selectedAttendeeIds.value.length > 0
            ? selectedAttendeeIds.value
            : []))
        : [String(props.attendee.attendee_id)]

      const isPartialOrderPayment = refundType.value === 'partial' && payment.value?.descriptor === 'order'
      const hasTargetedBookingProductItems = isPartialBookingPayment && selectedBookingProductRefundItems.value.length > 0

      if (isPartialBookingPayment && attendeeIds.length === 0 && !hasTargetedBookingProductItems) {
        throw new Error('Select at least one attendee or attendee product item for partial booking refunds.')
      }

      await createAttendeeRefundMutation.mutateAsync({
        attendeeId: String(props.attendee.attendee_id),
        body: {
          payment_id: selectedPaymentId.value,
          amount: parseAmount(amount).toFixed(2),
          reason: reason.value.trim(),
          ...(props.isBookingPayment && attendeeIds.length > 0 && {
            attendee_ids: attendeeIds,
          }),
          ...(hasTargetedBookingProductItems && {
            refund_items: selectedBookingProductRefundItems.value,
          }),
          ...(isPartialOrderPayment && selectedOrderRefundItems.value.length > 0 && {
            refund_items: selectedOrderRefundItems.value,
          }),
        },
      })
    } else {
      const isPartialBookingPayment = refundType.value === 'partial' && payment.value?.descriptor === 'booking'
      const isPartialOrderPayment = refundType.value === 'partial' && payment.value?.descriptor === 'order'
      const hasTargetedBookingProductItems = isPartialBookingPayment && selectedBookingProductRefundItems.value.length > 0
      const selectedBookingAttendeeEntityIds = selectedBookingAttendeeIds.value

      if (isPartialBookingPayment && selectedBookingAttendeeEntityIds.length === 0 && !hasTargetedBookingProductItems) {
        throw new Error('Select at least one attendee or attendee product item for partial booking refunds.')
      }

      await createRefundMutation.mutateAsync({
        payment: props.payment?.payment_id,
        amount: parseAmount(amount) as any,
        reason: reason.value.trim(),
        ...(isPartialBookingPayment && selectedBookingAttendeeEntityIds.length > 0 && {
          attendee_ids: selectedBookingAttendeeEntityIds,
        }),
        ...(hasTargetedBookingProductItems && {
          refund_items: selectedBookingProductRefundItems.value,
        }),
        ...(isPartialOrderPayment && selectedOrderRefundItems.value.length > 0 && {
          refund_items: selectedOrderRefundItems.value,
        }),
      })
    }

    toast.add({
      title: 'Refund Request Created',
      description: 'The refund request has been submitted for review',
      color: 'green',
    })

    emit('created')
  } catch (error: any) {
    toast.add({
      title: 'Failed to Create Refund',
      description: error?.message || 'An error occurred while creating the refund request',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    refundType.value = 'full'
    refundAmount.value = null
    reason.value = ''
    selectedAttendeeIds.value = []
    selectedItems.value = {}
  }
})

function toggleItemSelection(item: SelectableItem) {
  if (refundType.value === 'full' || item.is_refunded || item.quantity <= 0 || requiresLiveOrderResolution(item)) {
    return
  }

  if (selectedItems.value[item.id]) {
    delete selectedItems.value[item.id]
  } else {
    selectedItems.value[item.id] = {
      quantity: item.quantity,
      price: item.price,
      type: item.type,
      productId: item.productId,
      attendeeId: item.attendeeId,
      orderItemId: item.orderItemId,
      orderId: item.orderId,
      variantId: item.variantId,
      packageProductId: item.packageProductId,
    }
  }
}

function updateItemQuantity(item: SelectableItem, quantity: number) {
  if (refundType.value === 'full') {
    return
  }

  const normalizedQuantity = Math.max(1, Math.min(Number.isFinite(quantity) ? quantity : 1, item.quantity))

  if (item.quantity > 0) {
    selectedItems.value[item.id] = {
      ...selectedItems.value[item.id],
      quantity: normalizedQuantity,
      price: item.price,
      type: item.type,
      productId: item.productId,
      attendeeId: item.attendeeId,
      orderItemId: item.orderItemId,
      orderId: item.orderId,
      variantId: item.variantId,
      packageProductId: item.packageProductId,
    }
  } else {
    delete selectedItems.value[item.id]
  }
}

function toVariantLookupKey(productId: string, variantId: string): string {
  return `${productId}::${variantId}`
}

function getProductIdFromUnknown(item: any): string {
  const candidates = [
    item?.product_id,
    item?.product_public_id,
    item?.product?.product_id,
    item?.product?.product_public_id,
    item?.product?.id,
    item?.product,
  ]

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue
    const normalized = String(candidate).trim()
    if (normalized) return normalized
  }

  throw new Error('Unable to determine product ID from item: ' + JSON.stringify(item))
}

function getLiveOrderItemProductDetails(item: any): Record<string, any> | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const details = item.product_variant_details
  return details && typeof details === 'object' ? details : null
}

function findLiveOrderItemForLine(order: any, line: any, fallbackIndex: number) {
  const orderItems = Array.isArray(order?.order_items) ? order.order_items : []
  if (!orderItems.length) {
    return null
  }

  const lineVariantId = String(line?.variant_id || '').trim()
  if (lineVariantId) {
    const matchedByVariant = orderItems.find((item: any) => {
      const details = getLiveOrderItemProductDetails(item)
      const candidateIds = [
        details?.variant_id,
        details?.variant_db_id,
        item?.product_variant,
      ]

      return candidateIds.some(candidate => String(candidate ?? '').trim() === lineVariantId)
    })

    if (matchedByVariant) {
      return matchedByVariant
    }
  }

  return orderItems[fallbackIndex] ?? null
}

function getLiveOrderItemQuantity(item: any, fallbackQuantity?: number) {
  const quantity = Number(item?.quantity ?? fallbackQuantity ?? 0)
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0
}

function getLiveOrderItemRefunded(order: any, item: any) {
  if (item?.status === 'refunded') {
    return true
  }

  return order?.is_refunded ?? false
}

function getItemUnitPrice(primaryAmount: unknown, fallbackAmount?: unknown) {
  const primary = parseAmount(String(primaryAmount ?? ''))
  if (primary > 0) {
    return primary
  }

  return parseAmount(String(fallbackAmount ?? 0))
}

function requiresLiveOrderResolution(item: SelectableItem) {
  return item.type === 'attendee_product_line' && !!item.orderId && !item.orderItemId
}

function getVariantDetail(item: SelectableItem): ProductVariantDetail | null {
  const productId = String(item.productId || '').trim()
  const variantId = String(item.variantId || '').trim()
  if (!productId || !variantId) return null

  const lookupKey = toVariantLookupKey(productId, variantId)
  return variantDetailsByLookupKey.value[lookupKey] || null
}

function getVariantImageUrl(item: SelectableItem): string | null {
  const variant = getVariantDetail(item)
  const imageUrl = variant?.images?.main?.url
  if (!imageUrl) return null
  return resolveImageUrl(imageUrl)
}

function getVariantMetadata(item: SelectableItem): string[] {
  const variant = getVariantDetail(item)
  if (!variant) return []

  const labels: string[] = []
  if (variant.size_display) labels.push(`Size: ${variant.size_display}`)
  if (variant.color) labels.push(`Color: ${variant.color}`)
  return labels
}

function isVariantLoading(item: SelectableItem): boolean {
  const productId = String(item.productId || '').trim()
  const variantId = String(item.variantId || '').trim()
  if (!productId || !variantId) return false
  return !!variantLookupLoading.value[toVariantLookupKey(productId, variantId)]
}

function hasVariantData(item: SelectableItem): boolean {
  return !!getVariantDetail(item)
}

function getItemPlaceholderLetter(item: SelectableItem): string {
  const label = String(item.name || '').trim()
  return label ? label.charAt(0).toUpperCase() : 'I'
}
</script>
