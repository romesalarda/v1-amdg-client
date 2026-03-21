<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-4xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50 flex-shrink-0">
          <span class="material-symbols-outlined text-primary">receipt_long</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Payment Details</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ paymentData.payment_reference }}</p>
          </div>
          <div class="text-right mr-2">
            <div class="text-xs text-gray-500">Amount</div>
            <div class="text-lg font-bold text-gray-900">{{ formatAmount(paymentData.modified_amount || paymentData.amount) }}</div>
          </div>
          <UBadge :color="getPaymentStatusColor(paymentData.status || 'PENDING') as any" variant="soft" size="lg">
            {{ getPaymentStatusLabel(paymentData.status || 'PENDING') }}
          </UBadge>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p class="text-sm text-gray-500">Loading payment details...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">Failed to load payment details. Please try again.</p>
          </div>

          <!-- Basic Info -->
          <template v-else>
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">info</span>
              Basic Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Payment ID</div>
                <div class="font-mono text-sm font-semibold">{{ paymentData.payment_id }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Reference</div>
                <div class="font-mono text-sm font-semibold">{{ paymentData.payment_reference }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Created</div>
                <div class="text-sm font-semibold">{{ formatDateTime(paymentData.created_at) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Updated</div>
                <div class="text-sm font-semibold">{{ formatDateTime(paymentData.updated_at) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">User</div>
                <div class="text-sm font-semibold">{{ paymentData.user_name || 'N/A' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Payment Method</div>
                <div class="text-sm font-semibold">{{ paymentData.method?.title || paymentData.method_title || 'N/A' }}</div>
                <div class="text-xs text-gray-500">{{ getMethodTypeLabel(paymentData.method?.code) || 'N/A' }}</div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 mt-4">
                <div class="text-xs text-gray-500 mb-1">Description</div>
                <div class="text-sm font-semibold">{{ paymentData.description }}</div>
              </div>
          </section>

          <!-- Amount Breakdown -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">calculate</span>
              Amount Breakdown
            </h4>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Base Amount:</span>
                  <span class="font-semibold">{{ formatAmount(paymentData.base_amount) }}</span>
                </div>
                <div v-if="parseAmount(paymentData.percentage_modifier) !== 0" class="flex justify-between items-center text-amber-700">
                  <span class="text-sm">Modifier ({{ parseAmount(paymentData.percentage_modifier) }}%):</span>
                  <span class="font-semibold">
                    {{ parseAmount(paymentData.percentage_modifier) > 0 ? '+' : '' }}{{ formatAmount(calculateModifier(paymentData.base_amount, paymentData.percentage_modifier)) }}
                  </span>
                </div>
                <div v-if="hasDiscounts" class="flex justify-between items-center text-blue-700">
                  <span class="text-sm">Discounts Applied:</span>
                  <span class="font-semibold">-{{ formatAmount(calculateDiscounts()) }}</span>
                </div>
                <div class="border-t border-green-300 pt-2 mt-2">
                  <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-gray-900">Final Amount:</span>
                    <span class="text-xl font-black text-green-700">{{ formatAmount(paymentData.modified_amount || paymentData.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Stripe Information -->
          <section v-if="paymentData.method?.method_type === 'STRIPE' && paymentData.stripe_payment_intent">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">credit_card</span>
              Stripe Information
            </h4>
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Payment Intent ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_payment_intent }}</div>
              </div>
              <div v-if="paymentData.stripe_charge_id" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Charge ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_charge_id }}</div>
              </div>
              <div v-if="paymentData.stripe_customer_id" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Customer ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_customer_id }}</div>
              </div>
            </div>
          </section>

          <!-- Bank Transfer Information -->
          <section v-if="paymentData.method?.method_type === 'BANK_TRANSFER' && paymentData.bank_transfer_reference">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">account_balance</span>
              Bank Transfer Information
            </h4>
            <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div class="text-xs text-amber-700 mb-1">Bank Reference</div>
              <div class="font-mono text-lg font-bold text-amber-900">{{ paymentData.bank_transfer_reference }}</div>
              <div v-if="paymentData.status === 'PENDING'" class="mt-3 pt-3 border-t border-amber-200">
                <p class="text-xs text-amber-800 mb-2">
                  This payment is awaiting verification. Please verify the bank transfer before proceeding.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre class="text-xs text-gray-700 whitespace-pre-wrap font-mono">{{ JSON.stringify(paymentData.metadata, null, 2) }}</pre>
            </div>
          </section>

          <!-- Tickets -->
          <section v-if="paymentData.tickets && paymentData.tickets.length > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">confirmation_number</span>
              Associated Tickets ({{ paymentData.tickets.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="ticket in paymentData.tickets"
                :key="ticket.ticket_id"
                class="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div class="font-mono text-sm font-semibold">{{ ticket.ticket_code }}</div>
                  <div class="text-xs text-gray-500">{{ ticket.attendee?.first_name }} {{ ticket.attendee?.last_name }}</div>
                </div>
                <UBadge :color="ticket.status === 'ACTIVE' ? 'green' : 'gray'" variant="soft" size="xs">
                  {{ ticket.status }}
                </UBadge>
              </div>
            </div>
          </section>

          <!-- Refunds -->
          <section v-if="paymentData.refund_requests_summary && paymentData.refund_requests_summary.total_refunded > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">undo</span>
              Refund Requests ({{ paymentData.refund_requests_summary.total_refunded }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="refund in paymentData.refund_requests_summary.refunds"
                :key="refund.refund_id"
                class="bg-blue-50 rounded-lg p-3 border border-blue-200"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-mono text-sm font-semibold text-blue-900">{{ refund.tracking_reference }}</div>
                    <div class="text-xs text-blue-700 mt-1">Amount: {{ formatAmount(refund.amount) }}</div>
                    <div class="text-xs text-gray-500">{{ refund.reason || 'No reason provided' }}</div>
                  </div>
                  <UBadge :color="getRefundStatusColor(refund.verification_status || 'pending') as any" variant="soft" size="xs">
                    {{ getRefundStatusLabel(refund.verification_status || 'pending') }}
                  </UBadge>
                </div>
              </div>
            </div>
          </section>

          <!-- Payment History / Audit Trail -->
          <section v-if="paymentData.history_actions && paymentData.history_actions.length > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">history</span>
              Payment History
            </h4>
            <div class="space-y-2">
              <div
                v-for="action in paymentData.history_actions"
                :key="action.action_id"
                class="flex gap-3 items-start"
              >
                <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div class="flex-1 pb-3">
                  <div class="text-sm font-semibold">{{ action.action.replace(/_/g, ' ') }}</div>
                  <div class="text-xs text-gray-500">{{ action.description }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ formatDateTime(action.timestamp) }}
                    <span v-if="action.performed_by"> by {{ action.performed_by }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </template>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-navy-50 flex items-center justify-between gap-3 flex-shrink-0">
          <div class="flex items-center gap-2">
            <button
              v-if="!isLoading && paymentData.status === 'PENDING' && paymentData.method?.method_type === 'BANK_TRANSFER'"
              @click="$emit('verify', paymentData)"
              class="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">verified</span>
              Verify Bank Transfer
            </button>
            <button
              v-if="!isLoading && paymentData.status === 'COMPLETED'"
              @click="$emit('refund', paymentData)"
              class="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">undo</span>
              Initiate Refund
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('close')"
              class="px-6 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import { usePayment } from '~/composables/resources/payments/payments'
import { usePaymentMethod } from '~/composables/resources/payments/paymentMethods'
import { parseAmount } from '~/utils/money'

interface Props {
  payment: any
  open: boolean
}

const props = defineProps<Props>()
defineEmits(['close', 'refund', 'verify'])

// Fetch full payment details
const { data: fullPaymentData, isLoading: isLoadingPayment, error: paymentError } = usePayment(computed(() => props.payment?.payment_id))

// Fetch payment method details
const methodId = computed(() => {
  const payment = fullPaymentData.value?.data || props.payment
  return payment?.method
})
const { data: methodData, isLoading: isLoadingMethod, error: methodError } = usePaymentMethod(methodId)

// Combine loading and error states
const isLoading = computed(() => isLoadingPayment.value || isLoadingMethod.value)
const error = computed(() => paymentError.value || methodError.value)

// Use full payment data with method details merged
const paymentData = computed(() => {
  const payment = fullPaymentData.value?.data || props.payment
  const method = methodData.value?.data
  
  return {
    ...payment,
    method: method || payment.method
  }
})

const hasDiscounts = computed(() => {
  // Check if there are discounts in metadata
  return false // TODO: implement discount checking from metadata
})

function formatAmount(amount: string | number): string {
  return `£${parseAmount(amount).toFixed(2)}`
}

function calculateModifier(baseAmount: string | number, percentage: string | number): number {
  const base = parseAmount(baseAmount)
  const percent = typeof percentage === 'string' ? parseFloat(percentage) : percentage
  return (base * percent) / 100
}

function calculateDiscounts(): number {
  // TODO: calculate discounts from metadata
  return 0
}

function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'N/A'
  
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getMethodTypeLabel(methodType: string | undefined): string {
  if (!methodType) return 'N/A'
  return paymentMethodTypeLabels[methodType as keyof typeof paymentMethodTypeLabels] || methodType
}
</script>
