<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-pink-600">favorite</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Record Donation</h3>
            <p class="text-xs text-gray-500 mt-0.5">Create a donation linked to a payment</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Donation Amount (£)
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <!-- Payment Lookup -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Link to Payment
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  v-model="paymentSearchQuery"
                  type="text"
                  placeholder="Search by payment reference..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  @input="searchPayments"
                />
              </div>

              <!-- Payment Results -->
              <div v-if="paymentResults.length > 0" class="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                <button
                  v-for="payment in paymentResults"
                  :key="payment.payment_id"
                  type="button"
                  @click="selectPayment(payment)"
                  class="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-mono text-sm font-semibold text-gray-900">
                        {{ payment.payment_reference }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ payment.user?.username }} - £{{ parseFloat(payment.modified_amount || '0').toFixed(2) }}
                      </div>
                    </div>
                    <UBadge :color="getPaymentStatusColor(payment.status || 'PENDING') as any" variant="soft" size="xs">
                      {{ getPaymentStatusLabel(payment.status || 'PENDING') }}
                    </UBadge>
                  </div>
                </button>
              </div>

              <!-- Selected Payment -->
              <div v-if="selectedPayment" class="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-mono text-sm font-semibold text-blue-900">
                      {{ selectedPayment.payment_reference }}
                    </div>
                    <div class="text-xs text-blue-700 mt-1">
                      {{ selectedPayment.user?.username }} - £{{ parseFloat(selectedPayment.modified_amount || '0').toFixed(2) }}
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="clearPaymentSelection"
                    class="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <p class="text-xs text-gray-500 mt-1">
                Required: Donations must be linked to a completed payment
              </p>
            </div>

            <!-- Donor (Auto-filled from payment) -->
            <div v-if="selectedPayment">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Donor</label>
              <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div class="text-sm font-medium text-gray-900">
                  {{ selectedPayment.user?.username }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ selectedPayment.user?.email }}
                </div>
              </div>
            </div>

            <!-- Info Box -->
            <div class="bg-pink-50 border border-pink-200 rounded-lg p-3">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-pink-600 text-sm">info</span>
                <div class="text-xs text-pink-800">
                  <p class="font-semibold mb-1">About Donations</p>
                  <p>Donations are always tied to a payment record. Select a completed payment to record the donation against.</p>
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
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span v-else>Record Donation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreatePaymentDonation } from '~/composables/resources/payments/paymentDonations'
import { usePayments } from '~/composables/resources/payments/payments'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '~/schemas/events/paymentConstants'

interface Props {
  eventId: string
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'created'])

const toast = useToast()

// Form state
const form = reactive({
  amount: null as number | null,
})

const paymentSearchQuery = ref('')
const selectedPayment = ref<any>(null)
const paymentResults = ref<any[]>([])
const isLoading = ref(false)

// Payment search params
const paymentSearchParams = computed(() => ({
  event__event_id: props.eventId,
  status: ['COMPLETED' as const], // Only show completed payments
  search: paymentSearchQuery.value,
  page_size: 10,
}))

// Fetch payments for search
const { data: paymentsData } = usePayments(paymentSearchParams)

// Mutation
const createMutation = useCreatePaymentDonation()

// Form validation
const isFormValid = computed(() => {
  return form.amount !== null && 
         form.amount > 0 && 
         selectedPayment.value !== null
})

// Search payments
function searchPayments() {
  if (paymentSearchQuery.value.length >= 2) {
    paymentResults.value = paymentsData.value?.data?.results || []
  } else {
    paymentResults.value = []
  }
}

function selectPayment(payment: any) {
  selectedPayment.value = payment
  paymentSearchQuery.value = payment.payment_reference
  paymentResults.value = []
}

function clearPaymentSelection() {
  selectedPayment.value = null
  paymentSearchQuery.value = ''
}

async function handleSubmit() {
  if (!isFormValid.value) {
    toast.add({
      title: 'Invalid Form',
      description: 'Please fill in all required fields',
      color: 'red',
    })
    return
  }

  isLoading.value = true

  try {
    await createMutation.mutateAsync({
      amount: form.amount!.toFixed(2),
      payment: Number(selectedPayment.value.payment_id),
    })

    emit('created')
  } catch (error: any) {
    toast.add({
      title: 'Failed to Create Donation',
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
    form.amount = null
    paymentSearchQuery.value = ''
    selectedPayment.value = null
    paymentResults.value = []
  }
})

// Watch payments data for search results
watch(() => paymentsData.value, (data) => {
  if (paymentSearchQuery.value.length >= 2 && data) {
    paymentResults.value = data.data?.results || []
  }
})
</script>
