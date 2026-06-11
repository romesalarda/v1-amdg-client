<template>
  <div class="space-y-4 rounded-xl border border-deep-navy/10 bg-white/95 p-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-headline-sm font-headline text-deep-navy">Payments</h2>
        <p class="mt-1 text-body-sm font-body-sm text-deep-navy/60">View your payment details and status</p>
      </div>
      <p class="text-xs text-deep-navy/60">{{ props.selectedAttendee?.name || 'Attendee' }}</p>
    </div>

    <div v-if="props.paymentSummary?.isLoading?.value" class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/70">
      Loading payments...
    </div>
    <div v-else-if="props.paymentSummary?.error?.value" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Unable to load payment summary right now.
    </div>
    <template v-else>
      <!-- <section class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-mist-blue/40 p-4 shadow-sm" v-if="props.paymentSummaryData?.totals?.outstanding_payments">
        <p class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-blue-700">Outstanding now</p>
        <div class="mt-3 flex items-end justify-between gap-4">
          <div>
            <p class="text-4xl font-black text-blue-900">{{ props.paymentSummaryData?.totals?.outstanding_payments || props.outstandingPayments.length }}</p>
            <p class="mt-1 text-body-sm font-body-sm text-blue-900/80">{{ props.paymentSummaryData?.totals?.total_outstanding_amount || '0.00' }} outstanding</p>
          </div>
          <span class="rounded-lg bg-white/80 px-3 py-1 text-label-bold font-label-bold uppercase tracking-wide text-blue-700">Needs attention</span>
        </div>
      </section> -->

      <section class="space-y-4">
        <!-- <p class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-deep-navy">Attendee payments</p> -->
        <div v-if="props.attendeeLevelPayments.length" class="space-y-4">
          <article v-for="payment in props.attendeeLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-xl border border-deep-navy/10 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                <p class="mt-1 truncate text-headline-sm font-headline text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="mt-1 text-body-sm font-body-sm text-deep-navy/65">{{ props.paymentContextSummary(payment) }}</p>
              </div>
              <span class="shrink-0 rounded p-2 text-label-bold font-label-bold uppercase" :class="paymentStatusClass(payment)">
                {{ paymentStatusLabel(payment) }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined rounded-lg bg-white p-2 text-deep-navy shadow-sm" style="font-size:18px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">payments</span>
                  <div class="min-w-0">
                    <p class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-slate-500">Current amount</p>
                    <p class="mt-2 text-2xl font-black text-deep-navy">{{ props.formatCurrencyAmount(props.paymentCurrentAmount(payment)) }}</p>
                    <div v-if="props.paymentRefundedAmount(payment) > 0" class="mt-3 flex flex-wrap items-center gap-2 text-body-sm font-body-sm text-slate-500">
                      <span class="font-semibold">Before refunds:</span>
                      <span class="font-black line-through">{{ props.formatCurrencyAmount(props.paymentOriginalAmount(payment)) }}</span>
                      <span class="font-black text-rose-700">- {{ props.formatCurrencyAmount(props.paymentRefundedAmount(payment)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined rounded-lg bg-white p-2 text-primary shadow-sm" style="font-size:18px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">{{ paymentMethodIcon(payment) }}</span>
                  <div class="min-w-0">
                    <p class="text-label-bold font-label-bold uppercase tracking-wide text-deep-navy/60">Method</p>
                    <p class="mt-1 text-body-sm font-label-bold text-deep-navy">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                    <div class="mt-2 flex items-center gap-2 text-body-sm font-body-sm text-deep-navy/70">
                      <span class="material-symbols-outlined text-base" style="font-size:16px;line-height:1">{{ paymentSourceIcon(payment) }}</span>
                      <span>{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-label-bold font-label-bold uppercase tracking-wide text-slate-700">
                <span class="material-symbols-outlined text-[14px] leading-none">{{ paymentSourceIcon(payment) }}</span>
                {{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}
              </span>
              <button
                v-if="payment.order_reference"
                type="button"
                class="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-label-bold font-label-bold uppercase tracking-wide text-blue-700 transition-colors hover:bg-blue-100"
                @click="props.onOpenOrderFromPayment(payment.order_reference || '')"
              >
                View {{ payment.order_reference }}
              </button>
            </div>

            <div v-if="props.isOutstandingBankTransfer(payment) && props.hasSummaryBankMetadata(payment)" class="mt-4 space-y-3 rounded-xl  p-4">
                  <p class="text-[11px] text-deep-navy/50">Bank transfer instructions</p>

                  <!-- Step 1: Amount -->
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[11px] text-deep-navy/50">1</span>
                    <div>
                      <p class="text-[11px] text-deep-navy/50 mb-0.5">Pay exact amount</p>
                      <p class="text-[18px] font-semibold text-deep-navy">{{ payment.amount || '-' }}</p>
                    </div>
                  </div>

                  <!-- Step 2: Account details -->
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[11px] text-deep-navy/50">2</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] text-deep-navy/50 mb-2">Account details</p>
                      <div class="grid grid-cols-3 gap-2">
                        <div class="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
                          <p class="text-[10px] text-deep-navy/50 mb-0.5">Account name</p>
                          <p class="text-[12px] font-medium text-deep-navy break-words">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
                          <p class="text-[10px] text-deep-navy/50 mb-0.5">Sort code</p>
                          <p class="text-[13px] font-semibold text-deep-navy">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
                          <p class="text-[10px] text-deep-navy/50 mb-0.5">Account no.</p>
                          <p class="text-[13px] font-semibold text-deep-navy">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 3: Transfer reference -->
                  <div v-if="props.getRequiredTransferReference(payment)" class="flex items-start gap-2">
                    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[11px] text-deep-navy/50">3</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] text-deep-navy/50 mb-2">Transfer reference (required)</p>
                      <div class="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                        <span class="font-mono text-[12px] font-medium text-blue-800 break-all">{{ props.getRequiredTransferReference(payment) }}</span>
                        <button
                          type="button"
                          class="shrink-0 flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-100"
                          @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')"
                        >
                          <UIcon name="i-heroicons-document-duplicate" class="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

            <!-- <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-4 rounded-xl border border-deep-navy/10 bg-mist-blue/25 p-3">
              <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="label in props.getRelatedOrderLabels(payment)" :key="label" class="rounded-lg border border-deep-navy/10 bg-white px-2.5 py-1 text-body-sm font-body-sm text-deep-navy">{{ label }}</span>
              </div>
            </div> -->
          </article>
        </div>
        <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-body-sm font-body-sm text-deep-navy/65">No attendee-level payments yet.</p>
      </section>

      <section class="space-y-4 border-t border-deep-navy/10 pt-2">
        <p class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-deep-navy">Booking-wide payments</p>
        <div v-if="props.bookingLevelPayments.length" class="space-y-4">
          <article v-for="payment in props.bookingLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-xl border border-deep-navy/10 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                <p class="mt-1 truncate text-headline-sm font-headline text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="mt-1 text-body-sm font-body-sm text-deep-navy/65">{{ props.paymentContextSummary(payment) }}</p>
              </div>
              <span class="shrink-0 rounded px-2 py-0.5 text-label-bold font-label-bold uppercase" :class="paymentStatusClass(payment)">
                {{ paymentStatusLabel(payment) }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined rounded-lg bg-white p-2 text-deep-navy shadow-sm" style="font-size:18px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">payments</span>
                  <div class="min-w-0">
                    <p class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-slate-500">Current amount</p>
                    <p class="mt-2 text-2xl font-black text-deep-navy">{{ props.formatCurrencyAmount(props.paymentCurrentAmount(payment)) }}</p>
                    <div v-if="props.paymentRefundedAmount(payment) > 0" class="mt-3 flex flex-wrap items-center gap-2 text-body-sm font-body-sm text-slate-500">
                      <span class="font-semibold">Before refunds:</span>
                      <span class="font-black line-through">{{ props.formatCurrencyAmount(props.paymentOriginalAmount(payment)) }}</span>
                      <span class="font-black text-rose-700">- {{ props.formatCurrencyAmount(props.paymentRefundedAmount(payment)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-deep-navy/10 bg-mist-blue/20 p-4">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined rounded-lg bg-white p-2 text-primary shadow-sm" style="font-size:18px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">{{ paymentMethodIcon(payment) }}</span>
                  <div class="min-w-0">
                    <p class="text-label-bold font-label-bold uppercase tracking-wide text-deep-navy/60">Method</p>
                    <p class="mt-1 text-body-sm font-label-bold text-deep-navy">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                    <div class="mt-2 flex items-center gap-2 text-body-sm font-body-sm text-deep-navy/70">
                      <span class="material-symbols-outlined text-base" style="font-size:16px;line-height:1">{{ paymentSourceIcon(payment) }}</span>
                      <span>{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-label-bold font-label-bold uppercase tracking-wide text-slate-700">
                <span class="material-symbols-outlined text-[14px] leading-none">{{ paymentSourceIcon(payment) }}</span>
                {{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}
              </span>
              <button
                v-if="payment.order_reference"
                type="button"
                class="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-label-bold font-label-bold uppercase tracking-wide text-blue-700 transition-colors hover:bg-blue-100"
                @click="props.onOpenOrderFromPayment(payment.order_reference || '')"
              >
                View {{ payment.order_reference }}
              </button>
            </div>

            <div v-if="props.isOutstandingBankTransfer(payment) && props.hasSummaryBankMetadata(payment)" class="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              

              <div class="flex items-center justify-between gap-2">
                <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-blue-700">Bank transfer details</p>
                <button
                  v-if="props.getRequiredTransferReference(payment)"
                  type="button"
                  class="rounded-lg border border-blue-300 px-2 py-1 text-label-bold font-label-bold uppercase tracking-wide text-blue-700 transition-colors hover:bg-white"
                  @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')"
                >
                  Copy ref
                </button>
              </div>
              <div class="grid gap-2 md:grid-cols-2">
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-label-bold font-label-bold uppercase tracking-wide text-blue-700/70">Account name</p>
                  <p class="mt-1 break-words text-body-sm font-label-bold text-blue-900">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-label-bold font-label-bold uppercase tracking-wide text-blue-700/70">Sort code</p>
                  <p class="mt-1 text-headline-sm font-headline text-blue-900">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                </div>
                <div class="rounded-xl border border-white bg-white/90 p-3">
                  <p class="text-label-bold font-label-bold uppercase tracking-wide text-blue-700/70">Account number</p>
                  <p class="mt-1 text-headline-sm font-headline text-blue-900">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                </div>
                <div v-if="props.getRequiredTransferReference(payment)" class="rounded-xl border border-blue-300 bg-white p-3 md:col-span-2">
                  <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-blue-800">Transfer reference</p>
                  <p class="mt-1 break-all text-body-sm font-label-bold text-blue-900">{{ props.getRequiredTransferReference(payment) }}</p>
                </div>
              </div>
            </div>

            <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-4 rounded-xl border border-deep-navy/10 bg-mist-blue/25 p-3">
              <p class="text-label-bold font-label-bold uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="label in props.getRelatedOrderLabels(payment)" :key="label" class="rounded-lg border border-deep-navy/10 bg-white px-2.5 py-1 text-body-sm font-body-sm text-deep-navy">{{ label }}</span>
              </div>
            </div>
          </article>
        </div>
        <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-body-sm font-body-sm text-deep-navy/65">No booking-level payments found.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
function normalizedPaymentStatus(payment: any): string {
  const fallback = payment?.is_outstanding ? 'PENDING' : 'COMPLETED'
  return String(payment?.status || fallback).trim().toUpperCase()
}

function paymentStatusLabel(payment: any): string {
  return normalizedPaymentStatus(payment).replaceAll('_', ' ')
}

function paymentStatusClass(payment: any): string {
  const status = normalizedPaymentStatus(payment)
  if (status === 'PARTIALLY_REFUNDED') return 'bg-amber-100 text-amber-800'
  if (status === 'REFUNDED' || status === 'PENDING_REFUND') return 'bg-rose-100 text-rose-700'
  if (status === 'COMPLETED' || status === 'PAID') return 'bg-green-100 text-green-700'
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800'
  if (status === 'FAILED' || status === 'CANCELLED') return 'bg-slate-200 text-slate-700'
  return 'bg-primary/10 text-primary'
}

function paymentMethodIcon(payment: any): string {
  const method = String(payment?.method_type || payment?.method_title || '').toLowerCase()
  if (method.includes('bank')) return 'account_balance'
  if (method.includes('cash')) return 'payments'
  if (method.includes('card') || method.includes('stripe')) return 'credit_card'
  return 'receipt_long'
}

function paymentSourceIcon(payment: any): string {
  return payment?.source === 'SHOP_ORDER' ? 'shopping_bag' : 'event_note'
}

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
