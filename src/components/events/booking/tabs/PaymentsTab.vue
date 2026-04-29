<template>
  <div class="space-y-4">
    <!-- Payments content goes here -->
    <div class="rounded-2xl border border-deep-navy/10 bg-white p-5">
      <p class="text-sm text-deep-navy/60">Payments list and management will be populated here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  bookingData?: any
  selectedAttendeeId?: string
  outstandingPayments?: any[]
  completedSummaryPayments?: any[]
  currencySymbol?: string
  spentSoFarTotal?: number
  refundedTotalAmount?: number
  allSummaryPayments?: any[]
}>()

defineEmits<{
  'toggle-payment-expand': [payment: any]
  'upload-evidence': [payment: any]
  'refresh-payments': []
}>()
</script>
