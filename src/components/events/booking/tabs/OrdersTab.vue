<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-headline-sm font-headline text-deep-navy">Orders</p>
      <p class="text-xs text-deep-navy/60">{{ props.selectedAttendee?.name || 'Attendee' }}</p>
    </div>

    <div v-if="props.attendeeOrders?.isLoading?.value" class="text-sm text-deep-navy/60">Loading orders...</div>
    <div v-else-if="props.attendeeOrders?.error?.value" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      Unable to load orders right now.
    </div>
    <template v-else>
      <div v-if="props.attendeeOrderList?.length" class="space-y-3">
        <section class="rounded-xl border border-blue-200 bg-blue-50 p-4 mt-3 space-y-2" v-if="props.outstandingPayments?.length">
          <div
            v-for="payment in props.outstandingPayments"
            :key="payment.payment_id || payment.payment_reference"
            :class="props.paymentAttentionCardClass(payment)"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                <p class="text-sm font-semibold text-deep-navy">{{ payment.amount || '-' }}</p>
                <p class="text-xs" :class="props.needsEvidenceUpload(payment) ? 'text-red-700' : 'text-blue-700'">
                  {{ props.paymentAttentionLabel(payment) }}
                </p>
                <p class="text-[11px] text-deep-navy/75 mt-1">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
              </div>
              <button
                type="button"
                class="rounded-lg border border-blue-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                @click="props.onTogglePaymentExpand(payment)"
              >
                {{ props.isPaymentExpanded(payment.payment_id || '') ? 'Hide details' : 'View method' }}
              </button>
            </div>

            <p v-if="props.isOutstandingBankTransfer(payment) && props.hasUploadedEvidence(String(payment.payment_id || ''))" class="mt-2 rounded-md border border-blue-200 bg-white px-2 py-2 text-[11px] text-blue-800">
              Evidence uploaded. Waiting for verification.
            </p>

            <div v-if="props.isOutstandingBankTransfer(payment) && props.needsEvidenceUpload(payment)" class="mt-2 rounded-md border border-red-200 bg-white p-3 text-[12px] text-red-900 space-y-2">
              <p class="font-black uppercase tracking-wide text-[10px] text-red-700">Upload payment evidence</p>
              <div>
                <label class="mb-1 block text-[11px] font-semibold">Evidence file <span class="text-red-600">*</span></label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" @change="props.onEvidenceUploadFileChange(String(payment.payment_id || ''), $event)">
              </div>
              <div class="space-y-2">
                <div>
                  <label class="mb-1 block text-[11px] font-semibold">Payer name <span class="text-red-600">*</span></label>
                  <input v-model="props.evidenceUploadForm[String(payment.payment_id || '')].payer_name" type="text" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="Full name">
                </div>
                <div>
                  <label class="mb-1 block text-[11px] font-semibold">Payer account last 4 <span class="text-red-600">*</span></label>
                  <input v-model="props.evidenceUploadForm[String(payment.payment_id || '')].payer_account_last4" type="text" maxlength="4" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="1234">
                </div>
              </div>
              <div>
                <label class="mb-1 block text-[11px] font-semibold">Amount on evidence <span class="text-red-600">*</span></label>
                <input v-model="props.evidenceUploadForm[String(payment.payment_id || '')].amount_on_evidence" type="number" min="0" step="0.01" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="0.00">
              </div>
              <p v-if="props.evidenceUploadError[String(payment.payment_id || '')]" class="text-xs font-semibold text-red-700">{{ props.evidenceUploadError[String(payment.payment_id || '')] }}</p>
              <p v-if="props.evidenceUploadSuccess[String(payment.payment_id || '')]" class="text-xs font-semibold text-blue-700">{{ props.evidenceUploadSuccess[String(payment.payment_id || '')] }}</p>
              <div class="flex justify-end">
                <button type="button" class="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60" :disabled="!!props.evidenceUploadPending[String(payment.payment_id || '')]" @click="props.onUploadOutstandingEvidence(payment)">
                  {{ props.evidenceUploadPending[String(payment.payment_id || '')] ? 'Uploading...' : 'Upload evidence' }}
                </button>
              </div>
            </div>

            <div v-if="props.isPaymentExpanded(payment.payment_id || '')" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/40 p-3 text-xs text-deep-navy/80 space-y-2">
              <p v-if="props.paymentDetailLoading[payment.payment_id || '']">Loading payment method...</p>
              <template v-else>
                <p><span class="font-black text-deep-navy">Method:</span> {{ props.getPaymentMethodType(payment.payment_id || '') }}</p>
                <div v-if="props.isOutstandingBankTransfer(payment)" class="rounded-md border border-blue-200 bg-white p-3 space-y-2">
                  <p class="font-black uppercase tracking-wide text-[10px] text-blue-700">Bank transfer instructions</p>
                  <ol class="space-y-2 text-[12px] text-deep-navy/90">
                    <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                      <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">1. Pay this exact amount</p>
                      <p class="mt-1 text-xl font-black text-deep-navy">{{ payment.amount || '-' }}</p>
                    </li>
                    <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                      <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">2. Use these account details</p>
                      <div class="mt-1 space-y-2">
                        <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                          <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account name</p>
                          <p class="mt-1 text-sm font-black text-deep-navy break-words">{{ props.getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                          <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Sort code</p>
                          <p class="mt-1 text-lg font-black text-deep-navy">{{ props.getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                          <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account number</p>
                          <p class="mt-1 text-lg font-black text-deep-navy">{{ props.getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                        </div>
                      </div>
                    </li>
                    <li v-if="props.getRequiredTransferReference(payment)" class="rounded-md border border-blue-300 bg-blue-50 p-2">
                      <p class="text-[10px] font-black uppercase tracking-wide text-blue-800">3. Add this exact transfer reference</p>
                      <div class="mt-1 flex items-center justify-between gap-2">
                        <p class="text-sm font-black text-blue-900 break-all">{{ props.getRequiredTransferReference(payment) }}</p>
                        <button type="button" class="shrink-0 rounded-md border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100" @click="props.onCopyTransferReference(props.getRequiredTransferReference(payment) || '')">
                          Copy
                        </button>
                      </div>
                    </li>
                  </ol>
                </div>
                <p v-if="!props.isOutstandingBankTransfer(payment)" class="text-[11px] text-deep-navy/70">This payment is {{ payment.method_title || payment.method_type || 'not bank transfer' }}.</p>
                <p v-if="props.getBankTransferReference(payment.payment_id || '')"><span class="font-black text-deep-navy">Bank transfer reference:</span> {{ props.getBankTransferReference(payment.payment_id || '') }}</p>
                <p v-if="props.getBankTransferInstructions(payment.payment_id || '')" class="whitespace-pre-line"><span class="font-black text-deep-navy">Instructions:</span> {{ props.getBankTransferInstructions(payment.payment_id || '') }}</p>
              </template>
            </div>

            <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="label in props.getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
              </div>
            </div>
          </div>
        </section>

        <article v-for="order in props.attendeeOrderList" :key="order.order_id || order.id" class="rounded-xl border border-deep-navy/10 overflow-hidden">
          <div class="px-4 py-3 bg-gray-50 border-b border-deep-navy/10 flex flex-wrap items-center justify-between gap-3" v-if="order.status !== 'draft'">
            <div>
              <p class="mt-1 truncate text-headline-sm font-headline text-deep-navy">{{ order.order_reference_id || order.order_id }}</p>
              <p class="text-xs text-deep-navy/60">{{ formatDateTime(order.created_at) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="props.getOrderStatusBadgeClass(order.status)">
                {{ order.status_display || order.status || 'Unknown' }}
              </span>
              <span class="text-xs text-deep-navy/70">{{ order.item_count }} item(s)</span>
              <span class="text-sm font-bold text-deep-navy">{{ order.total_amount }}</span>
              <button
                v-if="props.canCancelOrder(order.status)"
                type="button"
                class="rounded-lg border border-red-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50"
                @click="props.onCancelOrder(order.order_id)"
              >
                Cancel
              </button>
            </div>
          </div>

          <div class="p-4 space-y-3" v-if="order.status !== 'draft'">
            <div
              v-for="item in order.order_items || []"
              :key="item.id"
              class="rounded-lg border border-deep-navy/10 p-3"
            >
              <div class="flex items-start gap-3">
                <img
                  v-if="props.getOrderItemImageUrl(item)"
                  :src="resolveImageUrl(props.getOrderItemImageUrl(item) || '')"
                  alt="Order item"
                  class="h-14 w-14 rounded-lg object-cover border border-deep-navy/10"
                  @error="onImageError"
                >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-deep-navy truncate">{{ props.getOrderItemTitle(item) }}</p>
                  <p class="text-xs text-deep-navy/60">{{ props.getOrderItemCode(item) }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <span class="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold">Qty {{ item.quantity }}</span>
                    <span class="rounded-full bg-mist-blue text-deep-navy px-2 py-0.5 font-semibold">Unit {{ item.unit_price }}</span>
                    <span class="rounded-full bg-deep-navy text-white px-2 py-0.5 font-semibold">Total {{ item.total_price }}</span>
                    <span v-if="props.getOrderItemSize(item)" class="rounded-full border border-deep-navy/20 px-2 py-0.5">{{ props.getOrderItemSize(item) }}</span>
                    <span v-if="props.getOrderItemColor(item)" class="inline-flex items-center gap-1 rounded-full border border-deep-navy/20 px-2 py-0.5">
                      <span class="h-3 w-3 rounded-full border border-deep-navy/20" :style="props.getOrderItemColorStyle(item)"></span>
                      {{ props.getOrderItemColor(item) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <UIcon name="i-heroicons-inbox" class="h-7 w-7" />
        </div>
        <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No orders yet</p>
        <p class="mt-2 text-sm text-slate-500">This attendee does not have any linked orders, so there are no outstanding payment actions to show here.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'

const props = defineProps<{
  selectedAttendeeId: string
  selectedAttendee?: any
  booking?: any
  attendeeOrderList: any[]
  attendeeOrders: any
  outstandingPayments: any[]
  evidenceUploadForm: Record<string, {
    evidence_file: File | null
    payer_name: string
    payer_account_last4: string
    amount_on_evidence: string
  }>
  evidenceUploadPending: Record<string, boolean>
  evidenceUploadError: Record<string, string>
  evidenceUploadSuccess: Record<string, string>
  paymentDetailLoading: Record<string, boolean>
  needsEvidenceUpload: (payment: any) => boolean
  paymentAttentionCardClass: (payment: any) => string
  paymentAttentionLabel: (payment: any) => string
  onTogglePaymentExpand: (payment: any) => void | Promise<void>
  isPaymentExpanded: (paymentId: string) => boolean
  isOutstandingBankTransfer: (payment: any) => boolean
  hasUploadedEvidence: (paymentId: string) => boolean
  onEvidenceUploadFileChange: (paymentId: string, event: Event) => void
  onUploadOutstandingEvidence: (payment: any) => void | Promise<void>
  getPaymentMethodType: (paymentId: string) => string
  getProvidedDetail: (payment: any, key: 'account_name' | 'sort_code' | 'account_number') => string | null
  getRequiredTransferReference: (payment: any) => string | null
  onCopyTransferReference: (reference: string) => void | Promise<void>
  getBankTransferReference: (paymentId: string) => string | null
  getBankTransferInstructions: (paymentId: string) => string | null
  getRelatedOrderLabels: (payment: any) => string[]
  getOrderStatusBadgeClass: (status?: string) => string
  canCancelOrder: (status?: string) => boolean
  onCancelOrder: (orderId: number | string) => void | Promise<void>
  getOrderItemImageUrl: (item: any) => string | null
  getOrderItemTitle: (item: any) => string
  getOrderItemCode: (item: any) => string
  getOrderItemSize: (item: any) => string | null
  getOrderItemColor: (item: any) => string | null
  getOrderItemColorStyle: (item: any) => Record<string, string> | undefined
}>()
</script>
