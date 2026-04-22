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
        <div class="p-6 space-y-4">
          <!-- Payment Info -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Original Amount:</span>
              <span class="text-lg font-bold text-gray-900">{{ payment?.amount }}</span>
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
                      Refund entire amount: {{ payment?.amount || '0' }}
                    </div>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    v-model="refundType"
                    type="radio"
                    value="partial"
                    name="refundType"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-900">Partial Refund</div>
                    <div class="text-xs text-gray-600">Specify custom refund amount</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Item Selection for Partial Refunds -->
            <div v-if="refundType === 'partial' && selectableItems.length > 0" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Select Items to Refund
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                <div v-for="item in selectableItems" :key="item.id" class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                  <div class="flex items-center">
                    <input
                      :id="`item-${item.id}`"
                      type="checkbox"
                      :checked="!!selectedItems[item.id]"
                      @change="toggleItemSelection(item)"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label :for="`item-${item.id}`" class="ml-3 text-sm text-gray-800 cursor-pointer">
                      <span class="font-semibold">{{ item.name }}</span>
                      <span class="text-gray-600 ml-2">({{ formatCurrency(item.price) }})</span>
                    </label>
                  </div>
                  <div v-if="item.type === 'order_item' && selectedItems[item.id]" class="flex items-center gap-2">
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
              <div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-right">
                <span class="text-sm text-gray-600">Total Refund Amount: </span>
                <span class="text-lg font-bold text-primary">{{ formatCurrency(partialRefundAmount) }}</span>
              </div>
            </div>

            <!-- Partial Refund Amount (Fallback) -->
            <div v-if="refundType === 'partial' && selectableItems.length === 0" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Refund Amount (£)
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="refundAmount"
                type="number"
                step="0.01"
                min="0.01"
                :max="parseFloat(payment?.amount || '0')"
                placeholder="0.00"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p class="text-xs text-gray-500 mt-1">
                Maximum refundable: {{ payment?.amount }}
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
import { parseAmount } from '~/utils/money'
import type { AttendeeList } from '~/api/types.gen'

interface Props {
  payment?: any
  mode?: 'payment' | 'attendee'
  attendee?: AttendeeList | null
  paymentId?: string | null
  bookingId?: number | null
  bookingAttendees?: Array<{ id: string; full_name: string }> | null
  open: boolean
  isBookingPayment?: boolean
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
const selectedItems = ref<Record<string, { quantity: number; price: number }>>({})

const selectableItems = computed(() => {
  const descriptor = payment.value?.descriptor
  const metadata = payment.value?.metadata as any

  if (descriptor === 'booking' && metadata?.attendee_selections) {
    return metadata.attendee_selections.map((item: any) => ({
      id: item.attendee_id,
      name: `${item.attendee_name} - ${item.package_name}`,
      price: parseFloat(item.frozen_price),
      quantity: 1, // Bookings have a quantity of 1 per attendee
      type: 'attendee',
    }))
  }
  if (descriptor === 'order' && metadata?.order?.order_items) {
    return metadata.order.order_items.map((item: any) => ({
      id: item.order_item_id,
      name: item.product_title,
      price: parseFloat(item.unit_price),
      quantity: item.quantity,
      type: 'order_item',
    }))
  }
  return []
})

const partialRefundAmount = computed(() => {
  return Object.values(selectedItems.value).reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const createRefundMutation = useCreatePaymentRefund()
const createAttendeeRefundMutation = useRequestAttendeeCancellationRefund()

const isFormValid = computed(() => {
  const hasValidReason = reason.value.length >= 10 && reason.value.length <= 1000
  
  if (refundType.value === 'full') {
    return hasValidReason
  }
  
  if (refundType.value === 'partial') {
    const maxAmount = parseFloat(String(payment.value?.amount || props.payment?.amount || '0').replace("£", ""))
    
    // For bookings and orders, check if at least one item is selected
    if (selectableItems.value.length > 0) {
      return hasValidReason && Object.keys(selectedItems.value).length > 0
    }

    // Fallback for other payment types
    const hasValidAmount = refundAmount.value !== null && 
           refundAmount.value > 0 && 
           refundAmount.value <= maxAmount
    
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
    let amount: string | undefined;
    if (refundType.value === 'full') {
      amount = payment.value?.amount || props.payment?.amount
    } else if (selectableItems.value.length > 0) {
      amount = partialRefundAmount.value.toString()
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

      // For partial booking refunds, use selected attendees; otherwise use current attendee
      const attendeeIds = (refundType.value === 'partial' && props.isBookingPayment && selectableItems.value.length > 0)
        ? Object.keys(selectedItems.value)
        : [String(props.attendee.attendee_id)]

      await createAttendeeRefundMutation.mutateAsync({
        attendeeId: String(props.attendee.attendee_id),
        body: {
          payment_id: selectedPaymentId.value,
          amount: parseAmount(amount).toFixed(2),
          reason: reason.value.trim(),
          attendee_ids: attendeeIds,
          ...(payment.value?.descriptor === 'order' && {
            refund_items: Object.entries(selectedItems.value).map(([id, item]) => ({
              order_item_id: id,
              quantity: item.quantity,
            })),
          }),
        },
      })
    } else {
      await createRefundMutation.mutateAsync({
        payment: props.payment?.payment_id,
        amount: parseAmount(amount) as any,
        reason: reason.value.trim(),
        ...(payment.value?.descriptor === 'order' && {
          refund_items: Object.entries(selectedItems.value).map(([id, item]) => ({
            order_item_id: id,
            quantity: item.quantity,
          })),
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

function toggleItemSelection(item: any) {
  if (selectedItems.value[item.id]) {
    delete selectedItems.value[item.id]
  } else {
    selectedItems.value[item.id] = { quantity: item.quantity, price: item.price }
  }
}

function updateItemQuantity(item: any, quantity: number) {
  if (quantity > 0) {
    selectedItems.value[item.id] = { ...selectedItems.value[item.id], quantity, price: item.price }
  } else {
    delete selectedItems.value[item.id]
  }
}
</script>
