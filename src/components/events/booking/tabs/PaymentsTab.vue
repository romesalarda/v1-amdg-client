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
      <section
        v-for="group in paymentGroups"
        :key="group.key"
        class="space-y-3"
        :class="{ 'border-t border-deep-navy/10 pt-3': group.title }"
      >
        <p v-if="group.title" class="text-label-bold font-label-bold uppercase tracking-[0.22em] text-deep-navy">
          {{ group.title }}
        </p>

        <div v-if="group.payments.length" class="space-y-3">
          <article
            v-for="payment in group.payments"
            :key="payment.payment_id || payment.payment_reference"
            class="rounded-lg border border-deep-navy/10 bg-white px-3.5 py-3 font-mono text-xs text-deep-navy shadow-sm"
          >
            <!-- Header -->
            <header class="flex items-start justify-between gap-3 pb-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-bold">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="mt-0.5 text-[11px] text-deep-navy/60">{{ props.paymentContextSummary(payment) }}</p>
              </div>
              <span
                class="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="paymentStatusClass(payment)"
              >
                {{ paymentStatusLabel(payment) }}
              </span>
            </header>

            <!-- Details -->
            <dl class="space-y-1 border-t border-dashed border-slate-300 py-2">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-deep-navy/60">Method</dt>
                <dd class="flex min-w-0 items-center gap-1.5 text-right">
                  <span class="material-symbols-outlined text-base" style="font-size:14px;line-height:1">{{ paymentMethodIcon(payment) }}</span>
                  <span class="truncate">{{ payment.method_title || payment.method_type || 'Unavailable' }}</span>
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-deep-navy/60">Type</dt>
                <dd class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base" style="font-size:14px;line-height:1">{{ paymentSourceIcon(payment) }}</span>
                  {{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}
                </dd>
              </div>
              <div v-if="payment.order_reference" class="flex items-center justify-between gap-3">
                <dt class="text-deep-navy/60">Order</dt>
                <dd>
                  <button
                    type="button"
                    class="font-bold text-blue-700 underline-offset-2 hover:underline"
                    @click="props.onOpenOrderFromPayment(payment.order_reference || '')"
                  >
                    {{ payment.order_reference }}
                  </button>
                </dd>
              </div>
              <div v-if="props.getRelatedOrderLabels(payment).length" class="flex items-start justify-between gap-3">
                <dt class="shrink-0 text-deep-navy/60">Orders</dt>
                <dd class="text-right">{{ props.getRelatedOrderLabels(payment).join(', ') }}</dd>
              </div>
            </dl>

            <!-- Price breakdown (only when refunded) -->
            <dl
              v-if="props.paymentRefundedAmount(payment) > 0"
              class="space-y-1 border-t border-dashed border-slate-300 py-2"
            >
              <div class="flex justify-between gap-3">
                <dt class="text-deep-navy/60">Original</dt>
                <dd class="tabular-nums">{{ props.formatCurrencyAmount(props.paymentOriginalAmount(payment)) }}</dd>
              </div>
              <div class="flex justify-between gap-3 text-rose-700">
                <dt>Refunded</dt>
                <dd class="tabular-nums">− {{ props.formatCurrencyAmount(props.paymentRefundedAmount(payment)) }}</dd>
              </div>
            </dl>

            <!-- Total -->
            <div class="flex items-baseline justify-between gap-3 border-t border-dashed border-slate-300 pt-2">
              <span class="text-[10px] font-bold uppercase tracking-widest">Total</span>
              <span class="text-lg font-black tabular-nums">{{ props.formatCurrencyAmount(props.paymentCurrentAmount(payment)) }}</span>
            </div>

            <!-- Bank transfer -->
            <div
              v-if="props.isOutstandingBankTransfer(payment) && props.hasSummaryBankMetadata(payment)"
              class="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-blue-900"
            >
              <p class="text-[10px] font-bold uppercase tracking-widest text-blue-700">Bank transfer</p>
              <dl class="mt-1.5 space-y-1">
                <div class="flex justify-between gap-3">
                  <dt class="text-blue-700/70">Pay exactly</dt>
                  <dd class="font-bold">{{ payment.amount || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-blue-700/70">Account name</dt>
                  <dd class="break-words text-right">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-blue-700/70">Sort code</dt>
                  <dd class="font-bold">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-blue-700/70">Account no.</dt>
                  <dd class="font-bold">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</dd>
                </div>
                <div v-if="props.getRequiredTransferReference(payment)" class="flex items-center justify-between gap-3">
                  <dt class="text-blue-700/70">Reference</dt>
                  <dd class="flex min-w-0 items-center gap-1.5">
                    <span class="break-all font-bold">{{ props.getRequiredTransferReference(payment) }}</span>
                    <button
                      type="button"
                      class="shrink-0 rounded border border-blue-300 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 hover:bg-white"
                      @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')"
                    >
                      Copy
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </div>

        <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-body-sm font-body-sm text-deep-navy/65">
          {{ group.empty }}
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
function normalizedPaymentStatus(payment: any): string {
  const fallback = payment?.is_outstanding ? 'PENDING' : 'COMPLETED ✓'
  return String(payment?.status || fallback).trim().toUpperCase()
}

const paymentGroups = computed(() => [
  { key: 'attendee', title: null, payments: props.attendeeLevelPayments, empty: 'No attendee-level payments yet.' },
  { key: 'booking', title: 'Booking-wide payments', payments: props.bookingLevelPayments, empty: 'No booking-level payments found.' },
])

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
