<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-md bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-amber-600">verified</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Verify Bank Transfer</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ payment.payment_reference }}</p>
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
          <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div class="text-xs text-amber-700 mb-2">Bank Transfer Reference</div>
            <div class="font-mono text-2xl font-bold text-amber-900 mb-3">
              {{ payment.bank_transfer_reference }}
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Amount:</span>
              <span class="font-bold text-gray-900">£{{ parseFloat(payment.modified_amount || '0').toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-600">User:</span>
              <span class="font-medium text-gray-900">{{ payment.user?.username }}</span>
            </div>
          </div>

          <!-- Verification Form -->
          <form @submit.prevent="handleVerify">
            <!-- Verification Notes -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Verification Notes
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="notes"
                rows="4"
                placeholder="Enter notes about the verification (e.g., bank statement reference, transaction ID, etc.)"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p class="text-xs text-gray-500 mt-1">
                These notes will be saved in the payment history for audit purposes.
              </p>
            </div>

            <!-- Verification Decision -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Decision</label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <input
                    v-model="verified"
                    type="radio"
                    :value="true"
                    name="decision"
                    class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-green-900">Verify & Complete Payment</div>
                    <div class="text-xs text-green-700">Mark payment as completed and create tickets</div>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                  <input
                    v-model="verified"
                    type="radio"
                    :value="false"
                    name="decision"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-red-900">Reject Payment</div>
                    <div class="text-xs text-red-700">Mark payment as failed (no tickets created)</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Warning Box -->
            <div v-if="verified === true" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-green-600 text-sm">info</span>
                <div class="text-xs text-green-800">
                  <p class="font-semibold mb-1">Payment will be marked as COMPLETED</p>
                  <p>Tickets will be automatically created and sent to the user.</p>
                </div>
              </div>
            </div>

            <div v-if="verified === false" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-red-600 text-sm">warning</span>
                <div class="text-xs text-red-800">
                  <p class="font-semibold mb-1">Payment will be marked as FAILED</p>
                  <p>No tickets will be created. The user will be notified.</p>
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
                :disabled="!notes.trim() || verified === null || isLoading"
                :class="[
                  'flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors flex items-center justify-center gap-2',
                  verified === true 
                    ? 'bg-green-600 hover:bg-green-700'
                    : verified === false 
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-400 cursor-not-allowed',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span v-else>{{ verified === true ? 'Verify & Complete' : verified === false ? 'Reject Payment' : 'Select Decision' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useVerifyBankTransferPayment } from '~/composables/resources/payments/payments'

interface Props {
  payment: any
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'verified'])

const toast = useToast()

const notes = ref('')
const verified = ref<boolean | null>(null)
const isLoading = ref(false)

const verifyMutation = useVerifyBankTransferPayment()

async function handleVerify() {
  if (!notes.value.trim() || verified.value === null) {
    toast.add({
      title: 'Missing Information',
      description: 'Please provide notes and select a decision',
      color: 'red',
    })
    return
  }

  isLoading.value = true

  try {
    await verifyMutation.mutateAsync({
      paymentId: props.payment.payment_id,
      body: {
        verified: verified.value,
        notes: notes.value.trim(),
      },
    })

    toast.add({
      title: verified.value ? 'Payment Verified' : 'Payment Rejected',
      description: verified.value 
        ? 'Bank transfer verified successfully. Tickets have been created.' 
        : 'Payment has been marked as failed.',
      color: verified.value ? 'green' : 'amber',
    })

    emit('verified')
  } catch (error: any) {
    toast.add({
      title: 'Verification Failed',
      description: error?.message || 'An error occurred during verification',
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
    verified.value = null
  }
})
</script>
