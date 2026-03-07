<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-3xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50 flex-shrink-0">
          <span class="material-symbols-outlined text-blue-600">undo</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Refund Request Details</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ refund.tracking_reference }}</p>
          </div>
          <UBadge :color="getRefundStatusColor(refund.verification_status || 'pending') as any" variant="soft" size="lg">
            {{ getRefundStatusLabel(refund.verification_status || 'pending') }}
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
              Refund Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Refund ID</div>
                <div class="font-mono text-sm font-semibold">{{ refund.refund_id }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Tracking Reference</div>
                <div class="font-mono text-sm font-semibold">{{ refund.tracking_reference }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Amount</div>
                <div class="text-lg font-bold text-blue-600">£{{ parseFloat(refund.amount || '0').toFixed(2) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Request Type</div>
                <UBadge :color="refund.is_partial ? 'amber' : 'blue'" variant="soft" size="sm">
                  {{ refund.is_partial ? 'Partial Refund' : 'Full Refund' }}
                </UBadge>
              </div>
            </div>
          </section>

          <!-- Reason -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">description</span>
              Refund Reason
            </h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p class="text-sm text-gray-900">{{ refund.reason || 'No reason provided' }}</p>
            </div>
          </section>

          <!-- Related Payment -->
          <section v-if="refund.payment">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">payments</span>
              Related Payment
            </h4>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs text-green-700 mb-1">Payment Reference</div>
                  <div class="font-mono text-sm font-semibold text-green-900">
                    {{ refund.payment_reference }}
                  </div>
                  <div class="text-xs text-gray-600 mt-2">
                    Amount: £{{ parseFloat(refund.amount || '0').toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Request Details -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">person</span>
              Request Details
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Requested By</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ refund.requested_by?.username || 'N/A' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ refund.requested_by?.email || 'N/A' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Requested At</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(refund.requested_at) }}
                </div>
              </div>
              <div v-if="refund.processed_by" class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Processed By</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ refund.processed_by.username }}
                </div>
              </div>
              <div v-if="refund.processed_at" class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Processed At</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(refund.processed_at) }}
                </div>
              </div>
            </div>
          </section>

          <!-- Metadata / Notes -->
          <section v-if="refund.metadata">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">note</span>
              Processing Notes
            </h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre class="text-xs text-gray-700 whitespace-pre-wrap font-mono">{{ JSON.stringify(refund.metadata, null, 2) }}</pre>
            </div>
          </section>

          <!-- Associations -->
          <section v-if="refund.associations && refund.associations.length > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">link</span>
              Refund Associations
            </h4>
            <div class="space-y-2">
              <div
                v-for="assoc in refund.associations"
                :key="assoc.id"
                class="bg-purple-50 rounded-lg p-3 border border-purple-200"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-sm font-semibold text-purple-900">
                      {{ assoc.description || 'Refund association' }}
                    </div>
                    <div class="text-xs text-purple-700 mt-1">
                      Amount: £{{ parseFloat(assoc.amount || '0').toFixed(2) }}
                    </div>
                  </div>
                </div>
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
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '~/schemas/events/paymentConstants'

interface Props {
  refund: any
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
