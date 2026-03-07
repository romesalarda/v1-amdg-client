<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-2xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50 flex-shrink-0">
          <span class="material-symbols-outlined text-pink-600">favorite</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Donation Details</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ donation.tracking_reference }}</p>
          </div>
          <UBadge :color="getDonationStatusColor(donation.verification_status || 'pending') as any" variant="soft" size="lg">
            {{ getDonationStatusLabel(donation.verification_status || 'pending') }}
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
          <!-- Basic Info -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">info</span>
              Donation Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Donation ID</div>
                <div class="font-mono text-sm font-semibold">{{ donation.donation_id }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Tracking Reference</div>
                <div class="font-mono text-sm font-semibold">{{ donation.tracking_reference }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Amount</div>
                <div class="text-lg font-bold text-pink-600">£{{ parseFloat(donation.amount || '0').toFixed(2) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Donated At</div>
                <div class="text-sm font-semibold">{{ formatDateTime(donation.donated_at) }}</div>
              </div>
            </div>
          </section>

          <!-- Donor Info -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">person</span>
              Donor Information
            </h4>
            <div v-if="donation.donated_by" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div class="text-sm font-semibold text-gray-900 mb-1">
                {{ donation.donated_by.username }}
              </div>
              <div class="text-sm text-gray-600">
                {{ donation.donated_by.email }}
              </div>
              <div v-if="donation.donated_by.first_name || donation.donated_by.last_name" class="text-xs text-gray-500 mt-1">
                {{ donation.donated_by.first_name }} {{ donation.donated_by.last_name }}
              </div>
            </div>
            <div v-else class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="text-sm text-gray-500">Anonymous Donor</div>
            </div>
          </section>

          <!-- Linked Payment -->
          <section v-if="donation.payment">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">payments</span>
              Linked Payment
            </h4>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs text-green-700 mb-1">Payment Reference</div>
                  <div class="font-mono text-sm font-semibold text-green-900">
                    {{ donation.payment.payment_reference }}
                  </div>
                  <div class="text-xs text-gray-600 mt-2">
                    Amount: £{{ parseFloat(donation.payment.modified_amount || '0').toFixed(2) }}
                  </div>
                  <div class="text-xs text-gray-600">
                    Method: {{ donation.payment.method?.title }}
                  </div>
                </div>
                <UBadge :color="getPaymentStatusColor(donation.payment.status || 'PENDING') as any" variant="soft" size="sm">
                  {{ getPaymentStatusLabel(donation.payment.status || 'PENDING') }}
                </UBadge>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-navy-50 flex justify-end gap-2 flex-shrink-0">
          <button
            @click="$emit('close')"
            class="px-6 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  getDonationStatusLabel,
  getDonationStatusColor,
} from '~/schemas/events/paymentConstants'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '~/schemas/events/paymentConstants'

interface Props {
  donation: any
  open: boolean
}

defineProps<Props>()
defineEmits(['close'])

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
