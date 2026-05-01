<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-black uppercase tracking-wide text-deep-navy">Payments</p>
        <p class="mt-1 text-xs text-deep-navy/60">{{ props.selectedAttendee?.name || 'Attendee' }}</p>
      </div>
    </div>

    <div v-if="props.paymentSummary?.isLoading?.value" class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/70">
      Loading payments...
    </div>
    <div v-else-if="props.paymentSummary?.error?.value" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Unable to load payment summary right now.
    </div>
    <template v-else>
      <section class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm" v-if="props.paymentSummaryData?.totals?.outstanding_payments">
        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700">Outstanding now</p>
        <p class="mt-3 text-4xl font-black text-blue-900">{{ props.paymentSummaryData?.totals?.outstanding_payments || props.outstandingPayments.length }}</p>
        <p class="mt-1 text-sm text-blue-900/80">{{ props.paymentSummaryData?.totals?.total_outstanding_amount || '0.00' }} outstanding</p>
      </section>

      <section class="space-y-4">
        <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Attendee payments</p>
        <div v-if="props.attendeeLevelPayments.length" class="space-y-4">
          <article v-for="payment in props.attendeeLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                <p class="mt-1 truncate text-sm font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="mt-1 text-xs text-deep-navy/65">{{ props.paymentContextSummary(payment) }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="payment.is_outstanding ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                {{ payment.status || (payment.is_outstanding ? 'PENDING' : 'COMPLETED') }}
              </span>
            </div>

            <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Current amount</p>
              <p class="mt-2 text-2xl font-black text-deep-navy">{{ props.formatCurrencyAmount(props.paymentCurrentAmount(payment)) }}</p>

              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span class="font-semibold text-slate-500">Before refunds:</span>
                <span class="font-black text-slate-500 line-through">{{ props.formatCurrencyAmount(props.paymentOriginalAmount(payment)) }}</span>
                <span v-if="props.paymentRefundedAmount(payment) > 0" class="font-black text-rose-700">- {{ props.formatCurrencyAmount(props.paymentRefundedAmount(payment)) }}</span>
              </div>
            </div>

            <div class="rounded-xl border border-deep-navy/10 bg-blue-50 p-3">
              <p class="text-[10px] font-black uppercase tracking-wide text-blue-700">Method</p>
              <p class="mt-1 text-sm font-semibold text-blue-900">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
              <p class="mt-1 text-[11px] text-blue-800/80">{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</p>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">{{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}</span>
              <button
                v-if="payment.order_reference"
                type="button"
                class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                @click="props.onOpenOrderFromPayment(payment.order_reference || '')"
              >
                View {{ payment.order_reference }}
              </button>
            </div>

            <div v-if="props.isOutstandingBankTransfer(payment) && props.hasSummaryBankMetadata(payment)" class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bank transfer details</p>
                <button
                  v-if="props.getRequiredTransferReference(payment)"
                  type="button"
                  class="rounded-full border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-white"
                  @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')"
                >
                  Copy ref
                </button>
              </div>
              <div class="space-y-2">
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account name</p>
                  <p class="mt-1 break-words text-sm font-black text-blue-900">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Sort code</p>
                  <p class="mt-1 text-lg font-black text-blue-900">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account number</p>
                  <p class="mt-1 text-lg font-black text-blue-900">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                </div>
                <div v-if="props.getRequiredTransferReference(payment)" class="rounded-xl border border-blue-300 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">Transfer reference</p>
                  <p class="mt-1 break-all text-sm font-black text-blue-900">{{ props.getRequiredTransferReference(payment) }}</p>
                </div>
              </div>
            </div>

            <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="label in props.getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
              </div>
            </div>
          </article>
        </div>
        <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/65">No attendee-level payments yet.</p>
      </section>

      <section class="space-y-4 pt-2 border-t border-deep-navy/10">
        <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Booking-wide payments</p>
        <div v-if="props.bookingLevelPayments.length" class="space-y-4">
          <article v-for="payment in props.bookingLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                <p class="mt-1 truncate text-sm font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="mt-1 text-xs text-deep-navy/65">{{ props.paymentContextSummary(payment) }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="payment.is_outstanding ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                {{ payment.status || (payment.is_outstanding ? 'PENDING' : 'COMPLETED') }}
              </span>
            </div>

            <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Current amount</p>
              <p class="mt-2 text-2xl font-black text-deep-navy">{{ props.formatCurrencyAmount(props.paymentCurrentAmount(payment)) }}</p>

              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span class="font-semibold text-slate-500">Before refunds:</span>
                <span class="font-black text-slate-500 line-through">{{ props.formatCurrencyAmount(props.paymentOriginalAmount(payment)) }}</span>
                <span v-if="props.paymentRefundedAmount(payment) > 0" class="font-black text-rose-700">- {{ props.formatCurrencyAmount(props.paymentRefundedAmount(payment)) }}</span>
              </div>
            </div>

            <div class="rounded-xl border border-deep-navy/10 bg-blue-50 p-3 mt-4">
              <p class="text-[10px] font-black uppercase tracking-wide text-blue-700">Method</p>
              <p class="mt-1 text-sm font-semibold text-blue-900">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
              <p class="mt-1 text-[11px] text-blue-800/80">{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</p>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">{{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}</span>
              <button
                v-if="payment.order_reference"
                type="button"
                class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                @click="props.onOpenOrderFromPayment(payment.order_reference || '')"
              >
                View {{ payment.order_reference }}
              </button>
            </div>

            <div v-if="props.isOutstandingBankTransfer(payment) && props.hasSummaryBankMetadata(payment)" class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bank transfer details</p>
                <button
                  v-if="props.getRequiredTransferReference(payment)"
                  type="button"
                  class="rounded-full border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-white"
                  @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')"
                >
                  Copy ref
                </button>
              </div>
              <div class="space-y-2">
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account name</p>
                  <p class="mt-1 break-words text-sm font-black text-blue-900">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Sort code</p>
                  <p class="mt-1 text-lg font-black text-blue-900">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account number</p>
                  <p class="mt-1 text-lg font-black text-blue-900">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                </div>
                <div v-if="props.getRequiredTransferReference(payment)" class="rounded-xl border border-blue-300 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">Transfer reference</p>
                  <p class="mt-1 break-all text-sm font-black text-blue-900">{{ props.getRequiredTransferReference(payment) }}</p>
                </div>
              </div>
            </div>

            <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="label in props.getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
              </div>
            </div>
          </article>
        </div>
        <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/65">No booking-level payments found.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedAttendee?: any
  paymentSummary: any
  paymentSummaryData: any
  selectedAttendeeId?: string
  outstandingPayments: any[]
  bookingLevelPayments: any[]
  attendeeLevelPayments: any[]
  paymentContextSummary: (payment: any) => string
  paymentCurrentAmount: (payment: any) => number
  paymentOriginalAmount: (payment: any) => number
  paymentRefundedAmount: (payment: any) => number
  formatCurrencyAmount: (value: number) => string
  onOpenOrderFromPayment: (orderReference: string) => void
  isOutstandingBankTransfer: (payment: any) => boolean
  hasSummaryBankMetadata: (payment: any) => boolean
  getRequiredTransferReference: (payment: any) => string | null
  getProvidedDetail: (payment: any, key: 'account_name' | 'sort_code' | 'account_number') => string | null
  onCopyTransferReference: (reference: string) => void | Promise<void>
  getRelatedOrderLabels: (payment: any) => string[]
}>()
</script>
