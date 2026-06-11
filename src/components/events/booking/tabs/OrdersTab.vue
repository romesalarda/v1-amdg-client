<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-headline-sm font-headline text-deep-navy">Orders</h2>
        <p class="mt-1 text-body-sm font-body-sm text-deep-navy/60">View your order details and status</p>
      </div>
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
            :class="[
              'rounded-r-xl border-l-2 border border-l-[2.5px] bg-white p-4 mb-3',
              props.needsEvidenceUpload(payment)
                ? 'border-l-red-500 border-gray-200'
                : props.hasUploadedEvidence(String(payment.payment_id || ''))
                  ? 'border-l-blue-400 border-gray-200'
                  : 'border-l-transparent border-gray-200'
            ]"
          >
            <!-- Header row -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-[12px] text-deep-navy/60">{{ payment.payment_reference || 'Payment' }}</span>

                  <!-- Needs evidence badge -->
                  <span v-if="props.needsEvidenceUpload(payment)" class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                    <i-heroicons-exclamation-circle class="w-3 h-3" />
                    Evidence needed
                  </span>

                  <!-- Waiting badge -->
                  <span v-else-if="props.hasUploadedEvidence(String(payment.payment_id || ''))" class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                    Awaiting verification
                  </span>

                  <!-- Generic pending badge -->
                  <span v-else class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                    <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" />
                    Awaiting payment
                  </span>
                </div>

                <p class="text-[17px] font-semibold text-deep-navy">{{ payment.amount || '-' }}</p>

                <div class="mt-0.5 flex items-center gap-1 text-[12px] text-deep-navy/60">
                  <UIcon name="i-heroicons-building-library" v-if="props.isOutstandingBankTransfer(payment)" class="w-3.5 h-3.5" />
                  <UIcon name="i-heroicons-credit-card" v-else class="w-3.5 h-3.5" />
                  {{ payment.method_title || payment.method_type || 'Method unavailable' }}
                </div>
              </div>

              <button
                type="button"
                class="shrink-0 flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] text-deep-navy/60 hover:bg-gray-50"
                @click="props.onTogglePaymentExpand(payment)"
              >
                <UIcon name="i-heroicons-chevron-up" v-if="props.isPaymentExpanded(payment.payment_id || '')" class="w-3.5 h-3.5" />
                <UIcon name="i-heroicons-chevron-down" v-else class="w-3.5 h-3.5" />
                {{ props.isPaymentExpanded(payment.payment_id || '') ? 'Hide' : 'Details' }}
              </button>
            </div>

            <!-- Waiting notice — always visible, no action required -->
            <div
              v-if="props.isOutstandingBankTransfer(payment) && props.hasUploadedEvidence(String(payment.payment_id || ''))"
              class="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[12px] text-blue-700"
            >
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 shrink-0" />
              Evidence uploaded — no action needed. Waiting for verification.
            </div>

            <!-- Evidence upload form — only when action is required -->
            <div
              v-if="props.isOutstandingBankTransfer(payment) && props.needsEvidenceUpload(payment)"
              class="mt-3 rounded-lg border border-red-100 bg-gray-50 p-3 space-y-2"
            >
              <div class="flex items-center gap-1.5 mb-1">
                <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 text-red-600" />
                <span class="text-[12px] font-medium text-red-700">Upload payment evidence</span>
              </div>

              <div>
                <label class="mb-1 block text-[11px] text-deep-navy/60">Evidence file <span class="text-red-500">*</span></label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px]"
                  @change="props.onEvidenceUploadFileChange(String(payment.payment_id || ''), $event)"
                >
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-[11px] text-deep-navy/60">Payer name <span class="text-red-500">*</span></label>
                  <input
                    v-model="props.evidenceUploadForm[String(payment.payment_id || '')].payer_name"
                    type="text"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px]"
                    placeholder="Full name"
                  >
                </div>
                <div>
                  <label class="mb-1 block text-[11px] text-deep-navy/60">Account last 4 <span class="text-red-500">*</span></label>
                  <input
                    v-model="props.evidenceUploadForm[String(payment.payment_id || '')].payer_account_last4"
                    type="text"
                    maxlength="4"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px]"
                    placeholder="1234"
                  >
                </div>
              </div>

              <div>
                <label class="mb-1 block text-[11px] text-deep-navy/60">Amount on evidence <span class="text-red-500">*</span></label>
                <input
                  v-model="props.evidenceUploadForm[String(payment.payment_id || '')].amount_on_evidence"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px]"
                  placeholder="0.00"
                >
              </div>

              <p v-if="props.evidenceUploadError[String(payment.payment_id || '')]" class="text-[12px] text-red-600">
                {{ props.evidenceUploadError[String(payment.payment_id || '')] }}
              </p>
              <p v-if="props.evidenceUploadSuccess[String(payment.payment_id || '')]" class="text-[12px] text-blue-600">
                {{ props.evidenceUploadSuccess[String(payment.payment_id || '')] }}
              </p>

              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  :disabled="!!props.evidenceUploadPending[String(payment.payment_id || '')]"
                  @click="props.onUploadOutstandingEvidence(payment)"
                >
                  <UIcon name="i-heroicons-arrow-up-tray" class="w-3.5 h-3.5" />
                  {{ props.evidenceUploadPending[String(payment.payment_id || '')] ? 'Uploading...' : 'Upload evidence' }}
                </button>
              </div>
            </div>

            <!-- Expanded details -->
            <div v-if="props.isPaymentExpanded(payment.payment_id || '')" class="mt-3 space-y-3">
              <div class="h-px bg-gray-100" />

              <p v-if="props.paymentDetailLoading[payment.payment_id || '']" class="text-[12px] text-deep-navy/50">
                Loading payment method...
              </p>

              <template v-else>
                <!-- Bank transfer instructions -->
                <div v-if="props.isOutstandingBankTransfer(payment)" class="space-y-3">
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

                <!-- Non-bank transfer method note -->
                <p v-if="!props.isOutstandingBankTransfer(payment)" class="text-[12px] text-deep-navy/50">
                  This payment is via {{ payment.method_title || payment.method_type || 'an unknown method' }}. No bank transfer instructions apply.
                </p>

                <template v-if="props.getBankTransferReference(payment.payment_id || '')">
                  <div class="h-px bg-gray-100" />
                  <p class="text-[12px] text-deep-navy/60">
                    <span class="font-medium text-deep-navy">Bank transfer reference:</span>
                    {{ props.getBankTransferReference(payment.payment_id || '') }}
                  </p>
                </template>

                <template v-if="props.getBankTransferInstructions(payment.payment_id || '')">
                  <div class="h-px bg-gray-100" />
                  <p class="whitespace-pre-line text-[12px] text-deep-navy/60">
                    <span class="font-medium text-deep-navy">Instructions:</span>
                    {{ props.getBankTransferInstructions(payment.payment_id || '') }}
                  </p>
                </template>
              </template>
            </div>

            <!-- Related orders -->
            <div v-if="props.getRelatedOrderLabels(payment).length" class="mt-3">
              <div class="h-px bg-gray-100 mb-3" />
              <p class="text-[10px] text-deep-navy/50 mb-2">Related orders</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="label in props.getRelatedOrderLabels(payment)"
                  :key="label"
                  class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-deep-navy/70"
                >
                  {{ label }}
                </span>
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
              <!-- <button
                v-if="props.canCancelOrder(order.status)"
                type="button"
                class="rounded-lg border border-red-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50"
                @click="props.onCancelOrder(order.order_id)"
              >
                Cancel
              </button> -->
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
