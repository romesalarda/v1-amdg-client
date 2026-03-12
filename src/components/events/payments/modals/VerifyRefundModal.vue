<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-md bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50">
          <span :class="[
            'material-symbols-outlined',
            approve ? 'text-green-600' : 'text-red-600'
          ]">
            {{ approve ? 'check_circle' : 'cancel' }}
          </span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">
              {{ approve ? 'Verify & Approve Refund' : 'Reject Refund Request' }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ refund.tracking_reference }}</p>
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
          <!-- Refund Info -->
          <div :class="[
            'rounded-lg p-4 border',
            approve ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          ]">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Refund Amount:</span>
              <span class="text-lg font-bold text-gray-900">£{{ parseFloat(refund.amount || '0').toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Payment:</span>
              <span class="font-mono font-medium text-gray-900">{{ refund.payment_reference }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Requested By:</span>
              <span class="font-medium text-gray-900">{{ refund.requested_by_name }}</span>
            </div>
            <div class="mt-3 pt-3 border-t" :class="approve ? 'border-green-300' : 'border-red-300'">
              <div class="text-xs text-gray-600 mb-1">Reason:</div>
              <div class="text-sm text-gray-900">{{ refund.reason }}</div>
            </div>
          </div>

          <!-- Verification Form -->
          <form @submit.prevent="handleSubmit">
            <!-- Notes -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ approve ? 'Approval Notes' : 'Rejection Reason' }}
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="notes"
                rows="4"
                :placeholder="approve 
                  ? 'Enter notes about the approval (e.g., verified with bank statement, approved per policy...)' 
                  : 'Enter reason for rejection (e.g., outside refund policy window, invalid reason...)'"
                required
                minlength="10"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ notes.length }}/500 characters (minimum 10 required)
              </p>
            </div>

            <!-- Warning/Info Box -->
            <div v-if="approve" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-green-600 text-sm">info</span>
                <div class="text-xs text-green-800">
                  <p class="font-semibold mb-1">Approval Process</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>Refund will be marked as VERIFIED</li>
                    <li>Must be manually processed afterward</li>
                    <li v-if="refund.payment?.method?.method_type === 'STRIPE'">Stripe refunds can be processed automatically</li>
                    <li v-else>Manual refund coordination required</li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-else class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-red-600 text-sm">warning</span>
                <div class="text-xs text-red-800">
                  <p class="font-semibold mb-1">Rejection Process</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>Refund will be marked as REJECTED</li>
                    <li>User will be notified of the rejection</li>
                    <li>Action cannot be undone</li>
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
                :disabled="notes.length < 10 || isLoading"
                :class="[
                  'flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors flex items-center justify-center gap-2',
                  approve 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span v-else>{{ approve ? 'Approve Refund' : 'Reject Refund' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { 
  useVerifyPaymentRefund, 
  useRejectPaymentRefund 
} from '~/composables/resources/payments/paymentRefunds'

import { usePaymentRefund } from '~/composables/resources/payments/paymentRefunds'

interface Props {
  refund: any
  approve: boolean
  open: boolean
}
const props = defineProps<Props>()

const { data: refundData } = usePaymentRefund(props.refund.refund_id)
const refund = computed(() => refundData.value?.data || props.refund)

const emit = defineEmits(['close', 'completed'])

const toast = useToast()

const notes = ref('')
const isLoading = ref(false)

const verifyMutation = useVerifyPaymentRefund()
const rejectMutation = useRejectPaymentRefund()

async function handleSubmit() {
  if (notes.value.length < 10) {
    toast.add({
      title: 'Invalid Notes',
      description: 'Please provide at least 10 characters of notes',
      color: 'red',
    })
    return
  }

  isLoading.value = true

  try {
    if (props.approve) {
      await verifyMutation.mutateAsync({
        refundId: props.refund.refund_id,
        body: {
          verification_status: 'verified',
          metadata: { notes: notes.value.trim() },
        },
      })
    } else {
      await rejectMutation.mutateAsync({
        refundId: props.refund.refund_id,
        body: {
          verification_status: 'rejected',
          metadata: { notes: notes.value.trim() },
        },
      })
    }

    emit('completed')
  } catch (error: any) {
    toast.add({
      title: props.approve ? 'Approval Failed' : 'Rejection Failed',
      description: error?.message || 'An error occurred',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    notes.value = ''
  }
})
</script>
