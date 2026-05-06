<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-4xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50 flex-shrink-0">
          <span class="material-symbols-outlined text-primary">receipt_long</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Payment Details</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ paymentData.payment_reference }}</p>
          </div>
          <div class="text-right mr-2">
            <div class="text-xs text-gray-500">Amount</div>
            <div class="text-lg font-bold text-gray-900">{{ formatAmount(paymentData.final_amount || paymentData.modified_amount || paymentData.amount) }}</div>
          </div>
          <UBadge :color="getPaymentStatusColor(paymentData.status || 'PENDING') as any" variant="soft" size="lg">
            {{ getPaymentStatusLabel(paymentData.status || 'PENDING') }}
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
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p class="text-sm text-gray-500">Loading payment details...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">Failed to load payment details. Please try again.</p>
          </div>

          <!-- Financial Snapshot -->
          <template v-else>
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">calculate</span>
              Receipt Snapshot
            </h4>
            <div class="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dashed border-gray-200">
                <div class="text-xs text-gray-500">{{ formatDateTime(paymentData.updated_at || paymentData.created_at) }}</div>
                <div class="flex items-center gap-2">
                  <UBadge :color="getPaymentStatusColor(paymentData.status || 'PENDING') as any" variant="soft" size="xs">
                    {{ getPaymentStatusLabel(paymentData.status || 'PENDING') }}
                  </UBadge>
                  <UBadge color="gray" variant="soft" size="xs">
                    {{ paymentData.method?.title || paymentData.method_title || 'N/A' }}
                  </UBadge>
                </div>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <div class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2.5 text-gray-700">
                  <span class="font-medium">Original amount</span>
                  <span class="font-black text-gray-900">{{ formatAmount(paymentData.original_amount) }}</span>
                </div>

                <div
                  v-for="refund in refundTimelineEntries"
                  :key="refund.refundId"
                  class="flex items-center justify-between rounded-md px-3 py-2.5"
                  :class="isFailedRefund(refund.status) ? 'bg-red-50 text-red-700 line-through decoration-red-400' : 'bg-rose-50 text-rose-700'"
                >
                  <div class="min-w-0 pr-3">
                    <div class="font-medium">{{ refundTimelineLabel(refund) }}</div>
                    <div class="text-xs opacity-80">{{ formatDateTime(refund.timestamp) }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-black">- {{ formatAmount(refund.amount) }}</div>
                    <div class="text-[11px] uppercase tracking-wide opacity-80">{{ getRefundRequestStatusLabel(refund.status) }}</div>
                  </div>
                </div>

                <div v-if="parseAmount(paymentData.percentage_modifier) !== 0" class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2.5 text-gray-700">
                  <span>Modifier ({{ parseAmount(paymentData.percentage_modifier) }}%)</span>
                  <span class="font-semibold text-gray-900">
                    {{ parseAmount(paymentData.percentage_modifier) > 0 ? '+' : '' }}{{ formatAmount(calculateModifier(paymentData.modified_amount, paymentData.percentage_modifier)) }}
                  </span>
                </div>

                <div class="border-t border-dashed border-gray-200 pt-3 mt-3">
                  <div class="flex items-end justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3">
                    <div>
                      <div class="text-[11px] uppercase tracking-wide text-slate-300">Current Amount</div>
                      <div class="text-xs text-slate-400 mt-1">Remaining after processed refunds</div>
                    </div>
                    <div class="text-2xl font-black text-white">{{ formatAmount(paymentData.final_amount || paymentData.modified_amount || paymentData.amount) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="paymentData.description" class="mt-3 rounded-lg bg-slate-50 px-4 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Payment Narrative</p>
              <p class="mt-1 text-sm leading-relaxed text-slate-800">{{ paymentData.description }}</p>
            </div>

            <details class="mt-3 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
              <summary class="cursor-pointer px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-700 select-none">
                View Payment Metadata
              </summary>
              <div class="border-t border-gray-200 px-4 py-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                <div><span class="font-semibold text-gray-800">Reference:</span> {{ paymentData.payment_reference || 'N/A' }}</div>
                <div><span class="font-semibold text-gray-800">Payment ID:</span> <span class="font-mono">{{ paymentData.payment_id || 'N/A' }}</span></div>
                <div><span class="font-semibold text-gray-800">Created:</span> {{ formatDateTime(paymentData.created_at) }}</div>
                <div><span class="font-semibold text-gray-800">Updated:</span> {{ formatDateTime(paymentData.updated_at) }}</div>
                <div><span class="font-semibold text-gray-800">User:</span> {{ paymentData.user_name || 'N/A' }}</div>
                <div><span class="font-semibold text-gray-800">Method Type:</span> {{ getMethodTypeLabel(paymentData.method?.code) || 'N/A' }}</div>
                <div v-if="paymentData.method?.method_type === 'STRIPE' && paymentData.stripe_payment_intent" class="sm:col-span-2 mt-2 border-t border-gray-200 pt-2">
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">Stripe Information</p>
                  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div><span class="font-semibold text-gray-800">Payment Intent:</span> <span class="font-mono">{{ paymentData.stripe_payment_intent }}</span></div>
                    <div v-if="paymentData.stripe_charge_id"><span class="font-semibold text-gray-800">Charge ID:</span> <span class="font-mono">{{ paymentData.stripe_charge_id }}</span></div>
                    <div v-if="paymentData.stripe_customer_id" class="sm:col-span-2"><span class="font-semibold text-gray-800">Customer ID:</span> <span class="font-mono">{{ paymentData.stripe_customer_id }}</span></div>
                  </div>
                </div>
              </div>
            </details>
          </section>

          <!-- Bank Transfer Information -->
          <section v-if="isBankTransferPayment">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">account_balance</span>
              Bank Transfer Information
            </h4>
            <div :class="bankTransferEvidenceIsVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'" class="rounded-lg p-4 border">
              <div :class="bankTransferEvidenceIsVerified ? 'text-emerald-700' : 'text-amber-700'" class="text-xs mb-1">Bank Reference</div>
              <div :class="bankTransferEvidenceIsVerified ? 'text-emerald-900' : 'text-amber-900'" class="font-mono text-lg font-bold">{{ paymentData.bank_transfer_reference || 'Not assigned yet' }}</div>
              <div :class="bankTransferEvidenceIsVerified ? 'border-emerald-200' : 'border-amber-200'" class="mt-3 pt-3 border-t">
                <div :class="bankTransferEvidenceIsVerified ? 'text-emerald-700' : 'text-amber-700'" class="text-xs mb-1">Evidence Status</div>
                <div :class="bankTransferEvidenceIsVerified ? 'text-emerald-900' : 'text-amber-900'" class="text-sm font-semibold">
                  {{ bankTransferEvidenceStatusLabel }}
                </div>
                <div v-if="bankTransferEvidence?.transfer_id" :class="bankTransferEvidenceIsVerified ? 'text-emerald-800' : 'text-amber-800'" class="mt-1 text-xs">
                  Transfer ID: <span class="font-mono">{{ bankTransferEvidence.transfer_id }}</span>
                </div>
                <div v-if="bankTransferEvidence?.uploaded_at" :class="bankTransferEvidenceIsVerified ? 'text-emerald-800' : 'text-amber-800'" class="mt-1 text-xs">
                  Uploaded: {{ formatDateTime(bankTransferEvidence.uploaded_at) }}
                </div>
                <div v-if="bankTransferEvidence?.evidence_file" class="mt-2 text-xs">
                  <a
                    :href="bankTransferEvidence.evidence_file"
                    target="_blank"
                    rel="noreferrer"
                    :class="bankTransferEvidenceIsVerified ? 'text-emerald-700 hover:text-emerald-800' : 'text-amber-700 hover:text-amber-800'"
                    class="inline-flex items-center gap-1 font-semibold underline decoration-dotted underline-offset-2"
                  >
                    <span class="material-symbols-outlined text-sm">attach_file</span>
                    View uploaded file
                  </a>
                </div>

                <div v-if="bankTransferEvidence?.evidence_file" class="mt-3 rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    @click="showEvidencePreview = !showEvidencePreview"
                  >
                    <span>{{ showEvidencePreview ? 'Hide evidence preview' : 'Show evidence preview' }}</span>
                    <span class="material-symbols-outlined text-base">{{ showEvidencePreview ? 'expand_less' : 'expand_more' }}</span>
                  </button>

                  <div v-if="showEvidencePreview" class="border-t border-gray-200 p-3">
                    <img
                      v-if="isEvidenceImage"
                      :src="bankTransferEvidence.evidence_file"
                      alt="Bank transfer evidence"
                      class="max-h-96 w-full rounded-md border border-gray-200 object-contain bg-gray-50"
                    >
                    <iframe
                      v-else-if="isEvidencePdf"
                      :src="bankTransferEvidence.evidence_file"
                      class="h-96 w-full rounded-md border border-gray-200"
                      title="Bank transfer evidence preview"
                    />
                    <div v-else class="text-xs text-gray-600">
                      Preview is not available for this file type. Use the link above to open it.
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="paymentData.status === 'PENDING'" class="mt-3 pt-3 border-t border-amber-200">
                <p class="text-xs text-amber-800 mb-2">
                  This payment is awaiting verification. Please verify the bank transfer before proceeding.
                </p>
              </div>
            </div>

            <div class="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-gray-900">Upload Bank Transfer Evidence</p>
                  <p class="mt-1 text-xs text-gray-500">
                    Upload evidence when attendee proof is missing or needs correction.
                  </p>
                </div>
                <button
                  v-if="paymentData.status === 'PENDING'"
                  type="button"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  @click="showEvidenceUploadForm = !showEvidenceUploadForm"
                >
                  {{ showEvidenceUploadForm ? 'Hide form' : 'Upload evidence' }}
                </button>
              </div>

              <div v-if="showEvidenceUploadForm" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-xs font-semibold text-gray-700">Evidence file <span class="text-red-600">*</span></label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    @change="onEvidenceFileChange"
                  >
                  <p class="mt-1 text-[11px] text-gray-500">Accepted: PDF/JPG/JPEG/PNG, up to 10MB.</p>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-semibold text-gray-700">Payer name</label>
                  <input
                    v-model="evidenceForm.payer_name"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="Optional"
                  >
                </div>
                <div>
                  <label class="mb-1 block text-xs font-semibold text-gray-700">Payer account last 4</label>
                  <input
                    v-model="evidenceForm.payer_account_last4"
                    type="text"
                    maxlength="4"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="1234"
                  >
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-xs font-semibold text-gray-700">Amount on evidence</label>
                  <input
                    v-model="evidenceForm.amount_on_evidence"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="Optional"
                  >
                </div>
              </div>

              <p v-if="evidenceUploadError" class="mt-3 text-xs font-semibold text-red-600">{{ evidenceUploadError }}</p>
              <p v-if="evidenceUploadSuccess" class="mt-3 text-xs font-semibold text-green-700">{{ evidenceUploadSuccess }}</p>

              <div v-if="bankTransferEvidence && !bankTransferEvidenceIsVerified" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-amber-900">Verification pending</p>
                    <p class="mt-1 text-xs text-amber-800">Evidence is uploaded but still needs manual verification.</p>
                  </div>
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors disabled:opacity-60"
                    :disabled="evidenceVerifyPending"
                    @click="verifyBankTransferEvidence"
                  >
                    {{ evidenceVerifyPending ? 'Verifying...' : 'Verify Evidence' }}
                  </button>
                </div>
              </div>

              <div v-else-if="bankTransferEvidenceIsVerified" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-emerald-900">Evidence verified</p>
                    <p class="mt-1 text-xs text-emerald-800">This bank transfer evidence is verified and ready for review.</p>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <button v-if="evidenceForm.evidence_file"
                  type="button"
                  class="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-60"
                  :disabled="evidenceUploadPending"
                  @click="uploadBankTransferEvidence"
                >
                  {{ evidenceUploadPending ? 'Uploading...' : 'Upload Evidence' }}
                </button>
              </div>
            </div>
          </section>

          <section v-if="showPaymentContentSection">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">inventory_2</span>
              Payment Content
            </h4>

            <div v-if="hasLiveRelation" class="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Live relation mode
              <span class="font-semibold">({{ liveRelationType }})</span>
            </div>

            <div v-if="liveRelationLoading" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div class="animate-pulse space-y-2">
                <div class="h-3 w-40 rounded bg-gray-200"></div>
                <div class="h-3 w-3/4 rounded bg-gray-200"></div>
                <div class="h-3 w-2/3 rounded bg-gray-200"></div>
              </div>
            </div>

            <template v-else>
              <PaymentLiveOrderContent
                v-if="liveRelationType === 'ORDER' && liveRelationData"
                :order="liveRelationData"
              />

              <PaymentLiveBookingContent
                v-else-if="liveRelationType === 'BOOKING' && liveRelationData"
                :booking="liveRelationData"
              />

              <PaymentLiveDonationContent
                v-else-if="liveRelationType === 'DONATION' && liveRelationData"
                :donation="liveRelationData"
              />
            </template>

            <div
              v-if="showMetadataFallback && liveRelationFallbackReason"
              class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            >
              {{ liveRelationFallbackReason }}
            </div>

            <div v-if="showMetadataFallback && metadataType === 'ORDER'" class="space-y-3 mt-3">
              <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs text-indigo-700 mb-1">Order Reference</div>
                    <div class="font-mono font-semibold text-indigo-900">{{ orderMetadata?.order_reference_id || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-indigo-700 mb-1">Status</div>
                    <div class="font-semibold text-indigo-900">{{ formatMetadataLabel(orderMetadata?.status) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-indigo-700 mb-1">Customer ID</div>
                    <div class="font-mono font-semibold text-indigo-900">{{ orderMetadata?.customer_id ?? 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-indigo-700 mb-1">Attendee ID</div>
                    <div class="font-mono font-semibold text-indigo-900">{{ orderMetadata?.attendee_id ?? 'N/A' }}</div>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-indigo-200 flex items-center justify-between">
                  <span class="text-sm text-indigo-700">Total Amount</span>
                  <span class="text-lg font-black text-indigo-900">{{ formatDisplayAmount(orderMetadata?.total_amount) }}</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Order Items ({{ orderItems.length }})</div>
                <div class="space-y-2">
                  <div
                    v-for="item in orderItems"
                    :key="item.order_item_id || `${item.product_variant_id || 'variant'}-${item.product_title || 'item'}`"
                    class="rounded-lg bg-gray-50 border border-gray-200 p-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="text-sm font-semibold text-gray-900">{{ item.product_title || 'Product' }}</div>
                        <div class="text-xs text-gray-600 mt-1">
                          Qty {{ item.quantity || 1 }} x {{ formatDisplayAmount(item.unit_price, item.currency) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-xs text-gray-500">Line Total</div>
                        <div class="text-sm font-bold text-gray-900">{{ item.final_price_for_attendee || formatDisplayAmount(item.total_price || item.total_amount, item.currency) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="showMetadataFallback && metadataType === 'BOOKING'" class="space-y-3 mt-3">
              <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs text-emerald-700 mb-1">Booking Reference</div>
                    <div class="font-mono font-semibold text-emerald-900">{{ bookingMetadata?.booking_reference}}</div>
                  </div>
                  <div>
                    <div class="text-xs text-emerald-700 mb-1">Payment Type</div>
                    <div class="font-semibold text-emerald-900">{{ formatMetadataLabel(bookingMetadata?.payment_type) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-emerald-700 mb-1">Booking Finalized</div>
                    <div class="font-semibold text-emerald-900">{{ bookingMetadata?.booking_finalized ? 'Yes' : 'No' }}</div>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
                  <span class="text-sm text-emerald-700">Total Attendees</span>
                  <span class="text-lg font-black text-emerald-900">{{ bookingMetadata?.total_attendees ?? bookingAttendees.length }}</span>
                </div>
              </div>

              <div v-if="bookingAttendees.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Attendees ({{ bookingAttendees.length }})</div>
                <div class="space-y-2">
                  <div
                    v-for="(attendee, index) in bookingAttendees"
                    :key="attendee.attendee_id || attendee.attendee_draft?.email || `${attendee.package_id || 'pkg'}-${index}`"
                    class="rounded-lg bg-gray-50 border border-gray-200 p-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="text-sm font-semibold text-gray-900">{{ attendee.attendee_name || getDraftAttendeeName(attendee.attendee_draft) || 'Attendee draft' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Package: {{ attendee.package_name || attendee.package_id || 'N/A' }}</div>
                        <div v-if="attendee.attendee_draft?.email" class="text-xs text-gray-500 mt-0.5">{{ attendee.attendee_draft.email }}</div>
                      </div>
                      <div v-if="attendee.frozen_price" class="text-right">
                        <div class="text-xs text-gray-500">Price</div>
                        <div class="text-sm font-bold text-gray-900">{{ formatDisplayAmount((Number(attendee.frozen_price) + Number(attendee.order_total ? attendee.order_total : 0)).toFixed(2), attendee.currency) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="checkoutAttendees.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Checkout Attendee Metadata ({{ checkoutAttendees.length }})
                </div>
                <div class="space-y-3">
                  <div
                    v-for="(checkoutAttendee, index) in checkoutAttendees"
                    :key="`${checkoutAttendee.package_id || 'pkg'}-${checkoutAttendee.attendee_draft?.email || index}`"
                    class="rounded-lg bg-gray-50 border border-gray-200 p-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="text-sm font-semibold text-gray-900">
                          {{ getDraftAttendeeName(checkoutAttendee.attendee_draft) || 'Attendee draft' }}
                        </div>
                        <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span class="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Package: {{ checkoutAttendee.package_id || 'N/A' }}</span>
                          <span v-if="getAttendeeAge(checkoutAttendee.attendee_draft?.date_of_birth) !== null" class="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                            Age {{ getAttendeeAge(checkoutAttendee.attendee_draft?.date_of_birth) }}
                          </span>
                          <span
                            v-if="isMinor(checkoutAttendee.attendee_draft?.date_of_birth)"
                            class="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 font-semibold"
                          >
                            Minor
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-2">
                      <div><span class="font-semibold text-gray-800">Gender:</span> {{ formatMetadataLabel(checkoutAttendee.attendee_draft?.gender) }}</div>
                      <div><span class="font-semibold text-gray-800">Date of birth:</span> {{ checkoutAttendee.attendee_draft?.date_of_birth || 'N/A' }}</div>
                      <div><span class="font-semibold text-gray-800">Email:</span> {{ checkoutAttendee.attendee_draft?.email || 'N/A' }}</div>
                      <div><span class="font-semibold text-gray-800">Phone:</span> {{ checkoutAttendee.attendee_draft?.phone_number || 'N/A' }}</div>
                      <div><span class="font-semibold text-gray-800">Relationship:</span> {{ formatMetadataLabel(checkoutAttendee.attendee_draft?.relationship_to_user) }}</div>
                    </div>

                    <div
                      v-if="Array.isArray(checkoutAttendee.product_selections) && checkoutAttendee.product_selections.length > 0"
                      class="mt-3 border-t border-gray-200 pt-3"
                    >
                      <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Product Selections</div>
                      <div class="space-y-2">
                        <div
                          v-for="(selection, selectionIndex) in checkoutAttendee.product_selections"
                          :key="`${selection.package_product_id || 'pp'}-${selection.variant_id || 'variant'}-${selectionIndex}`"
                          class="rounded-md border border-gray-200 bg-white p-2.5"
                        >
                          <div class="flex items-start justify-between gap-3">
                            <div class="flex items-start gap-3 min-w-0">
                              <img
                                :src="getResolvedProductSelectionImageUrl(selection)"
                                alt="Product variant"
                                class="h-14 w-14 rounded-md border border-gray-200 bg-gray-50 object-cover flex-shrink-0"
                              >
                              <div class="min-w-0">
                                <div class="text-sm font-semibold text-gray-900 truncate">
                                  {{ getResolvedProductSelectionLabel(checkoutAttendee.package_id, selection) }}
                                </div>
                                <div class="mt-0.5 text-xs text-gray-600">
                                  {{ getResolvedProductSelectionSubtitle(checkoutAttendee.package_id, selection) }}
                                </div>
                                <div class="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                  <div class="rounded bg-gray-50 px-2 py-1 border border-gray-200">
                                    <span class="text-gray-500">Base price:</span>
                                    <span class="ml-1 font-semibold text-gray-800">{{ getResolvedBasePriceLabel(checkoutAttendee.package_id, selection) }}</span>
                                  </div>
                                  <div class="rounded bg-emerald-50 px-2 py-1 border border-emerald-200">
                                    <span class="text-emerald-700">Checkout price:</span>
                                    <span class="ml-1 font-semibold text-emerald-900">{{ getResolvedCheckoutPriceLabel(checkoutAttendee.package_id, selection) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="text-right text-xs text-gray-600">
                              Qty {{ selection.quantity || 1 }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showBookingSupplement" class="bg-white rounded-lg p-4 border border-gray-200 mt-3">
              <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Checkout Attendee Metadata ({{ checkoutAttendees.length }})
              </div>
              <div class="space-y-3">
                <div
                  v-for="(checkoutAttendee, index) in checkoutAttendees"
                  :key="`${checkoutAttendee.package_id || 'pkg'}-${checkoutAttendee.attendee_draft?.email || index}`"
                  class="rounded-lg bg-gray-50 border border-gray-200 p-3"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ getDraftAttendeeName(checkoutAttendee.attendee_draft) || 'Attendee draft' }}
                      </div>
                      <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span class="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Package: {{ checkoutAttendee.package_id || 'N/A' }}</span>
                        <span v-if="getAttendeeAge(checkoutAttendee.attendee_draft?.date_of_birth) !== null" class="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                          Age {{ getAttendeeAge(checkoutAttendee.attendee_draft?.date_of_birth) }}
                        </span>
                        <span
                          v-if="isMinor(checkoutAttendee.attendee_draft?.date_of_birth)"
                          class="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 font-semibold"
                        >
                          Minor
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-2">
                    <div><span class="font-semibold text-gray-800">Gender:</span> {{ formatMetadataLabel(checkoutAttendee.attendee_draft?.gender) }}</div>
                    <div><span class="font-semibold text-gray-800">Date of birth:</span> {{ checkoutAttendee.attendee_draft?.date_of_birth || 'N/A' }}</div>
                    <div><span class="font-semibold text-gray-800">Email:</span> {{ checkoutAttendee.attendee_draft?.email || 'N/A' }}</div>
                    <div><span class="font-semibold text-gray-800">Phone:</span> {{ checkoutAttendee.attendee_draft?.phone_number || 'N/A' }}</div>
                    <div><span class="font-semibold text-gray-800">Relationship:</span> {{ formatMetadataLabel(checkoutAttendee.attendee_draft?.relationship_to_user) }}</div>
                  </div>

                  <div
                    v-if="Array.isArray(checkoutAttendee.product_selections) && checkoutAttendee.product_selections.length > 0"
                    class="mt-3 border-t border-gray-200 pt-3"
                  >
                    <div class="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Product Selections</div>
                    <div class="space-y-2">
                      <div
                        v-for="(selection, selectionIndex) in checkoutAttendee.product_selections"
                        :key="`${selection.package_product_id || 'pp'}-${selection.variant_id || 'variant'}-${selectionIndex}`"
                        class="rounded-md border border-gray-200 bg-white p-2.5"
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex items-start gap-3 min-w-0">
                            <img
                              :src="getResolvedProductSelectionImageUrl(selection)"
                              alt="Product variant"
                              class="h-14 w-14 rounded-md border border-gray-200 bg-gray-50 object-cover flex-shrink-0"
                              @error="onImageError"
                            >
                            <div class="min-w-0">
                              <div class="text-sm font-semibold text-gray-900 truncate">
                                {{ getResolvedProductSelectionLabel(checkoutAttendee.package_id, selection) }}
                              </div>
                              <div class="mt-0.5 text-xs text-gray-600">
                                {{ getResolvedProductSelectionSubtitle(checkoutAttendee.package_id, selection) }}
                              </div>
                              <div class="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                <div class="rounded bg-gray-50 px-2 py-1 border border-gray-200">
                                  <span class="text-gray-500">Base price:</span>
                                  <span class="ml-1 font-semibold text-gray-800">{{ getResolvedBasePriceLabel(checkoutAttendee.package_id, selection) }}</span>
                                </div>
                                <div class="rounded bg-emerald-50 px-2 py-1 border border-emerald-200">
                                  <span class="text-emerald-700">Checkout price:</span>
                                  <span class="ml-1 font-semibold text-emerald-900">{{ getResolvedCheckoutPriceLabel(checkoutAttendee.package_id, selection) }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="text-right text-xs text-gray-600">
                            Qty {{ selection.quantity || 1 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="showMetadataFallback && metadataType === 'DONATION'" class="space-y-3 mt-3">
              <div class="bg-rose-50 rounded-lg p-4 border border-rose-200">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs text-rose-700 mb-1">Event</div>
                    <div class="font-semibold text-rose-900">{{ donationMetadata?.event || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-rose-700 mb-1">Tracking Reference</div>
                    <div class="font-mono font-semibold text-rose-900">{{ donationMetadata?.tracking_reference || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-rose-700 mb-1">Donated By</div>
                    <div class="font-semibold text-rose-900">{{ donationMetadata?.donated_by || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-rose-700 mb-1">Created By</div>
                    <div class="font-semibold text-rose-900">{{ donationMetadata?.created_by || 'N/A' }}</div>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-rose-200 flex items-center justify-between">
                  <span class="text-sm text-rose-700">Donation Amount</span>
                  <span class="text-lg font-black text-rose-900">{{ formatDisplayAmount(donationMetadata?.amount, donationMetadata?.currency) }}</span>
                </div>
                <div v-if="donationMetadata?.message" class="mt-3 pt-3 border-t border-rose-200 text-sm text-rose-900">
                  {{ donationMetadata.message }}
                </div>
              </div>
            </div>

            <div v-else-if="showMetadataFallback" class="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-3">
              <div class="text-sm text-gray-700">No specialized metadata renderer found for this payment. Raw metadata is available below.</div>
            </div>

            <details v-if="hasMetadata" class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mt-3">
              <summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-700 select-none">
                View Raw Metadata JSON
              </summary>
              <div class="px-4 pb-4 border-t border-gray-200">
                <pre class="text-xs text-gray-700 whitespace-pre-wrap font-mono mt-3">{{ formattedMetadataJson }}</pre>
              </div>
            </details>
          </section>

          <!-- Tickets -->
          <section v-if="paymentData.tickets && paymentData.tickets.length > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">confirmation_number</span>
              Associated Tickets ({{ paymentData.tickets.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="ticket in paymentData.tickets"
                :key="ticket.ticket_id"
                class="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div class="font-mono text-sm font-semibold">{{ ticket.ticket_code }}</div>
                  <div class="text-xs text-gray-500">{{ ticket.attendee?.first_name }} {{ ticket.attendee?.last_name }}</div>
                </div>
                <UBadge :color="ticket.status === 'ACTIVE' ? 'green' : 'gray'" variant="soft" size="xs">
                  {{ ticket.status }}
                </UBadge>
              </div>
            </div>
          </section>

          <!-- Refunds -->
          <section v-if="relatedRefunds.length > 0 || refundDetailsLoading">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">undo</span>
              Related Refunds ({{ relatedRefunds.length }})
            </h4>
            <div v-if="refundDetailsLoading" class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              Loading refund details...
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="refund in relatedRefunds"
                :key="refund.refund_id || refund.id"
                class="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-mono text-sm font-semibold text-gray-900">{{ refund.tracking_reference || refund.refund_id || refund.id }}</div>
                    <div class="mt-1 text-xs text-gray-600">Requested: {{ formatDateTime(refund.requested_at) }}</div>
                    <div v-if="refund.processed_at" class="mt-1 text-xs text-gray-600">Processed: {{ formatDateTime(refund.processed_at) }}</div>
                    <div class="mt-1 text-xs text-gray-600">Amount: <span class="font-semibold text-gray-900">{{ formatAmount(refund.amount) }}</span></div>
                    <div class="mt-2 text-xs text-gray-500">{{ refund.reason || 'No reason provided' }}</div>
                  </div>
                  <UBadge :color="getRefundRequestStatusColor(refund.verification_status || refund.status) as any" variant="soft" size="xs">
                    {{ getRefundRequestStatusLabel(refund.verification_status || refund.status) }}
                  </UBadge>
                </div>

                <div v-if="Array.isArray(refund.associations) && refund.associations.length > 0" class="mt-3 border-t border-gray-100 pt-3">
                  <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Refunded Items</div>
                  <div class="space-y-2">
                    <div
                      v-for="association in refund.associations"
                      :key="association.id"
                      class="flex items-start justify-between gap-3 rounded-md bg-gray-50 px-3 py-2"
                    >
                      <div class="min-w-0">
                        <div class="text-xs font-medium text-gray-900">{{ getRefundAssociationLabel(association) }}</div>
                        <div v-if="association.description && association.description !== getRefundAssociationLabel(association)" class="mt-1 text-xs text-gray-500">{{ association.description }}</div>
                        <div class="text-xs font-semibold text-red-700 mt-2">-{{ formatAmount(association.amount) }}</div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Payment History / Audit Trail -->
          <section v-if="paymentData.history_actions && paymentData.history_actions.length > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">history</span>
              Payment History
            </h4>
            <div class="space-y-2">
              <div
                v-for="action in paymentData.history_actions"
                :key="action.action_id"
                class="flex gap-3 items-start"
              >
                <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div class="flex-1 pb-3">
                  <div class="text-sm font-semibold">{{ action.action.replace(/_/g, ' ') }}</div>
                  <div class="text-xs text-gray-500">{{ action.description }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ formatDateTime(action.timestamp) }}
                    <span v-if="action.performed_by"> by {{ action.performed_by }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </template>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-navy-50 flex items-center justify-between gap-3 flex-shrink-0">
          <div class="flex items-center gap-2">
            <button
              v-if="!isLoading && paymentData.status === 'PENDING' && paymentData.method?.method_type === 'BANK_TRANSFER'"
              @click="$emit('verify', paymentData)"
              :disabled="bankTransferEvidenceHasOutstandingVerification || evidenceVerifyPending"
              class="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2"
              :class="(bankTransferEvidenceHasOutstandingVerification || evidenceVerifyPending) ? 'cursor-not-allowed opacity-60 hover:bg-amber-600' : ''"
            >
              <span class="material-symbols-outlined text-lg">verified</span>
              Verify Bank Transfer
            </button>
            <button
              v-if="!isLoading && paymentData.status === 'COMPLETED'"
              @click="$emit('refund', paymentData)"
              class="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">undo</span>
              Initiate Refund
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('close')"
              class="px-6 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { bookingsPackageProductsList, paymentsRefundsRetrieve, productsListVariantsRetrieve } from '~/api/sdk.gen'
import type { PackageProduct, ProductVariantDetail } from '~/api/types.gen'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import { usePayment } from '~/composables/resources/payments/payments'
import { usePaymentMethod } from '~/composables/resources/payments/paymentMethods'
import { usePaymentLiveRelation } from '~/composables/resources/payments/paymentLiveRelation'
import PaymentLiveOrderContent from '~/components/events/modals/payment-content/PaymentLiveOrderContent.vue'
import PaymentLiveBookingContent from '~/components/events/modals/payment-content/PaymentLiveBookingContent.vue'
import PaymentLiveDonationContent from '~/components/events/modals/payment-content/PaymentLiveDonationContent.vue'
import { parseAmount } from '~/utils/money'
import { uploadMultipart } from '~/utils/upload'
import { resolveImageUrl, onImageError } from '~/utils/image'

interface Props {
  payment: any
  open: boolean
}

const props = defineProps<Props>()
defineEmits(['close', 'refund', 'verify'])
const { $notyf } = useNuxtApp()
const requestFetch = useRequestFetch()

// Fetch full payment details
const { data: fullPaymentData, isLoading: isLoadingPayment, error: paymentError, refetch: refetchPaymentDetail } = usePayment(computed(() => props.payment?.payment_id))

// Fetch payment method details
const methodId = computed(() => {
  const payment = fullPaymentData.value?.data || props.payment
  return payment?.method
})
const { data: methodData, isLoading: isLoadingMethod, error: methodError } = usePaymentMethod(methodId)

// Combine loading and error states
const isLoading = computed(() => isLoadingPayment.value || isLoadingMethod.value)
const error = computed(() => paymentError.value || methodError.value)

// Use full payment data with method details merged
const paymentData = computed(() => {
  const payment = fullPaymentData.value?.data || props.payment
  const method = methodData.value?.data
  
  return {
    ...payment,
    method: method || payment.method
  }
})

const liveRelation = usePaymentLiveRelation({ payment: paymentData })
const hasLiveRelation = computed(() => liveRelation.hasLiveRelation.value)
const liveRelationType = computed(() => liveRelation.relationType.value)
const liveRelationData = computed(() => liveRelation.liveData.value)
const liveRelationLoading = computed(() => liveRelation.isLiveLoading.value)
const liveRelationFallbackReason = computed(() => liveRelation.fallbackReason.value)

const isBankTransferPayment = computed(() => paymentData.value?.method?.method_type === 'BANK_TRANSFER')
const bankTransferEvidence = computed<any>(() => paymentData.value?.bank_transfer_evidence || null)
const bankTransferEvidenceIsVerified = computed(() => String(bankTransferEvidence.value?.verification_status || '').toLowerCase() === 'verified')
const bankTransferEvidenceHasOutstandingVerification = computed(() => !!bankTransferEvidence.value && !bankTransferEvidenceIsVerified.value)
const bankTransferEvidenceStatusLabel = computed(() => {
  const evidence = bankTransferEvidence.value
  if (!evidence) return 'No evidence uploaded'
  const status = String(evidence.verification_status || 'pending').toUpperCase()
  return `Evidence uploaded (${status})`
})

const evidenceFileUrl = computed(() => String(bankTransferEvidence.value?.evidence_file || '').toLowerCase())
const isEvidenceImage = computed(() => /\.(png|jpe?g|gif|webp)(\?|$)/.test(evidenceFileUrl.value))
const isEvidencePdf = computed(() => /\.pdf(\?|$)/.test(evidenceFileUrl.value))
const showEvidencePreview = ref(false)

const evidenceUploadPending = ref(false)
const evidenceVerifyPending = ref(false)
const evidenceUploadError = ref('')
const evidenceUploadSuccess = ref('')
const showEvidenceUploadForm = ref(true)
const evidenceForm = reactive({
  transfer_id: '',
  evidence_file: null as File | null,
  payer_name: '',
  payer_account_last4: '',
  amount_on_evidence: '',
})

const asTrimmedString = (value: unknown) => String(value ?? '').trim()

function generateBankTransferTransferId(): string {
  const paymentReference = String(paymentData.value?.payment_reference || paymentData.value?.payment_id || 'PAY')
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `BT-${paymentReference}-${timestamp}-${randomSegment}`
}

function resetEvidenceForm() {
  evidenceForm.transfer_id = generateBankTransferTransferId()
  evidenceForm.evidence_file = null
  evidenceForm.payer_name = ''
  evidenceForm.payer_account_last4 = ''
  evidenceForm.amount_on_evidence = ''
}

watch(
  () => bankTransferEvidence.value?.bank_transfer_id,
  (bankTransferId) => {
    if (bankTransferId) {
      showEvidenceUploadForm.value = false
      showEvidencePreview.value = bankTransferEvidenceHasOutstandingVerification.value
      return
    }

    showEvidenceUploadForm.value = true
    showEvidencePreview.value = false
    if (!evidenceForm.transfer_id) {
      evidenceForm.transfer_id = generateBankTransferTransferId()
    }
  },
  { immediate: true }
)

watch(
  () => paymentData.value?.payment_id,
  (paymentId) => {
    if (!paymentId) return
    if (!evidenceForm.transfer_id) {
      evidenceForm.transfer_id = generateBankTransferTransferId()
    }
  },
  { immediate: true }
)

function onEvidenceFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  evidenceForm.evidence_file = input.files?.[0] || null
}

function extractErrorMessage(error: any): string {
  const data = error?.data || error?.response?._data || error?.response?.data
  if (!data) return error?.message || 'Evidence upload failed.'

  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  if (typeof data === 'object') {
    const firstValue = Object.values(data)[0] as any
    if (Array.isArray(firstValue)) return firstValue.join(' ')
    if (typeof firstValue === 'string') return firstValue
  }

  return error?.message || 'Evidence upload failed.'
}

async function uploadBankTransferEvidence() {
  evidenceUploadError.value = ''
  evidenceUploadSuccess.value = ''

  if (!paymentData.value?.id) {
    evidenceUploadError.value = 'Unable to resolve payment record for evidence upload.'
    return
  }

  if (!asTrimmedString(evidenceForm.transfer_id)) {
    evidenceUploadError.value = 'Transfer ID is required.'
    return
  }

  if (!evidenceForm.evidence_file) {
    evidenceUploadError.value = 'Evidence file is required.'
    return
  }

  if (evidenceForm.payer_account_last4 && !/^\d{4}$/.test(evidenceForm.payer_account_last4)) {
    evidenceUploadError.value = 'Payer account last 4 must be exactly 4 digits.'
    return
  }

  const formData = new FormData()
  formData.append('transfer_id', asTrimmedString(evidenceForm.transfer_id))
  formData.append('evidence_file', evidenceForm.evidence_file)
  formData.append('payment', String(paymentData.value.id))

  if (asTrimmedString(evidenceForm.payer_name)) {
    formData.append('payer_name', asTrimmedString(evidenceForm.payer_name))
  }
  if (asTrimmedString(evidenceForm.payer_account_last4)) {
    formData.append('payer_account_last4', asTrimmedString(evidenceForm.payer_account_last4))
  }
  if (asTrimmedString(evidenceForm.amount_on_evidence)) {
    formData.append('amount_on_evidence', asTrimmedString(evidenceForm.amount_on_evidence))
  }

  evidenceUploadPending.value = true
  try {
    await uploadMultipart('/api/payments/bank-transfer-evidence/', formData, { method: 'POST' })
    evidenceUploadSuccess.value = 'Evidence uploaded successfully.'
    $notyf?.success('Evidence uploaded successfully.')
    resetEvidenceForm()
    showEvidenceUploadForm.value = false
    await refetchPaymentDetail()
  } catch (error) {
    evidenceUploadError.value = extractErrorMessage(error)
  } finally {
    evidenceUploadPending.value = false
  }
}

async function verifyBankTransferEvidence() {
  evidenceUploadError.value = ''
  const evidence = bankTransferEvidence.value

  if (!evidence?.bank_transfer_id) {
    evidenceUploadError.value = 'Unable to resolve the uploaded evidence record.'
    return
  }

  evidenceVerifyPending.value = true
  try {
    await requestFetch(`/api/payments/bank-transfer-evidence/${String(evidence.bank_transfer_id)}/confirm_payment_match/`, {
      method: 'POST',
    })
    $notyf?.success('Bank transfer evidence verified.')
    await refetchPaymentDetail()
  } catch (error) {
    evidenceUploadError.value = extractErrorMessage(error)
  } finally {
    evidenceVerifyPending.value = false
  }
}

const hasDiscounts = computed(() => {
  // Check if there are discounts in metadata
  return false // TODO: implement discount checking from metadata
})

const metadata = computed<any>(() => paymentData.value?.metadata || null)

const hasMetadata = computed(() => !!metadata.value && typeof metadata.value === 'object')
const showMetadataFallback = computed(() => hasMetadata.value && liveRelation.shouldFallbackToMetadata.value)
const showPaymentContentSection = computed(() => hasMetadata.value || hasLiveRelation.value)

const metadataType = computed<'ORDER' | 'BOOKING' | 'DONATION' | 'UNKNOWN'>(() => {
  const value = metadata.value
  if (!value || typeof value !== 'object') return 'UNKNOWN'
  if (value?.order?.order_items && Array.isArray(value.order.order_items)) return 'ORDER'
  if (value?.donation && typeof value.donation === 'object') return 'DONATION'
  if (value?.booking_id || value?.payment_type || value?.attendee_selections || value?.checkout_attendees) return 'BOOKING'
  return 'UNKNOWN'
})

const orderMetadata = computed<any>(() => (metadataType.value === 'ORDER' ? metadata.value : null))

const orderItems = computed<any[]>(() => {
  const items = orderMetadata.value?.order?.order_items
  return Array.isArray(items) ? items : []
})

const bookingMetadata = computed<any>(() => (metadataType.value === 'BOOKING' ? metadata.value : null))

const bookingAttendees = computed<any[]>(() => {
  const selected = bookingMetadata.value?.attendee_selections
  if (Array.isArray(selected) && selected.length > 0) return selected
  const checkout = bookingMetadata.value?.checkout_attendees
  return Array.isArray(checkout) ? checkout : []
})

const checkoutAttendees = computed<any[]>(() => {
  const checkout = bookingMetadata.value?.checkout_attendees
  return Array.isArray(checkout) ? checkout : []
})

const showBookingSupplement = computed(() => {
  return liveRelationType.value === 'BOOKING' && !!liveRelationData.value && checkoutAttendees.value.length > 0
})

const packageProductsByPackageId = ref<Record<number, PackageProduct[]>>({})
const variantsByVariantId = ref<Record<string, ProductVariantDetail>>({})
const refundDetailsById = ref<Record<string, any>>({})
const refundDetailsLoading = ref(false)

function getResponseData<T>(response: unknown): T | null {
  if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return ((response as Record<string, unknown>).data as T) ?? null
  }
  return (response as T) ?? null
}

function normalizeListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: T[] }).results
  }
  return []
}

const checkoutPackageIds = computed<number[]>(() => {
  const ids = new Set<number>()

  for (const attendee of checkoutAttendees.value) {
    const parsed = Number(attendee?.package_id)
    if (Number.isFinite(parsed) && parsed > 0) {
      ids.add(parsed)
    }
  }

  return [...ids]
})

watch(
  checkoutPackageIds,
  async (packageIds) => {
    if (!packageIds.length) {
      packageProductsByPackageId.value = {}
      variantsByVariantId.value = {}
      return
    }

    const packageProductsEntries = await Promise.all(
      packageIds.map(async (packageId) => {
        try {
          const response = await bookingsPackageProductsList({ path: { id: packageId } })
          const payload = getResponseData<unknown>(response)
          const products = normalizeListPayload<PackageProduct>(payload)
          return [packageId, products] as const
        } catch {
          return [packageId, [] as PackageProduct[]] as const
        }
      })
    )

    const packageProductsMap: Record<number, PackageProduct[]> = {}
    for (const [packageId, products] of packageProductsEntries) {
      packageProductsMap[packageId] = products
    }
    packageProductsByPackageId.value = packageProductsMap

    const variantLookups = new Map<string, { productId: number | string; variantId: string }>()

    for (const attendee of checkoutAttendees.value) {
      const packageId = Number(attendee?.package_id)
      if (!Number.isFinite(packageId) || packageId <= 0) continue

      const packageProducts = packageProductsMap[packageId] || []
      const selections = Array.isArray(attendee?.product_selections) ? attendee.product_selections : []

      for (const selection of selections) {
        const variantId = String(selection?.variant_id || '').trim()
        if (!variantId) continue

        const packageProductId = Number(selection?.package_product_id)
        const packageProduct = packageProducts.find((item) => Number(item.id) === packageProductId)
        if (!packageProduct) continue

        variantLookups.set(variantId, { productId: packageProduct.product_public_id, variantId })
      }
    }

    const variantEntries = await Promise.all(
      [...variantLookups.values()].map(async ({ productId, variantId }) => {
        try {
          const response = await productsListVariantsRetrieve({
            path: {
              product_product_id: String(productId),
              variant_id: variantId,
            },
          })
          const payload = getResponseData<ProductVariantDetail>(response)
          return payload ? ([variantId, payload] as const) : null
        } catch {
          return null
        }
      })
    )

    const variantsMap: Record<string, ProductVariantDetail> = {}
    for (const entry of variantEntries) {
      if (!entry) continue
      variantsMap[entry[0]] = entry[1]
    }
    variantsByVariantId.value = variantsMap
  },
  { immediate: true }
)

const donationMetadata = computed<any>(() => {
  if (metadataType.value !== 'DONATION') return null
  return metadata.value?.donation || null
})

const paymentRefundRequests = computed<any[]>(() => {
  return Array.isArray(paymentData.value?.refund_requests) ? paymentData.value.refund_requests : []
})

const refundTimelineEntries = computed(() => {
  return paymentRefundRequests.value
    .map((refund) => ({
      refundId: String(refund?.refund_id || refund?.id || '').trim(),
      amount: refund?.amount || 0,
      status: normalizeRefundRequestStatus(refund?.verification_status || refund?.status),
      timestamp: refund?.processed_at || refund?.requested_at || null,
    }))
    .filter((refund) => refund.refundId)
    .sort((left, right) => {
      const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0
      const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0
      return rightTime - leftTime
    })
})

const relatedRefunds = computed<any[]>(() => {
  return refundTimelineEntries.value.map((entry) => {
    const detail = refundDetailsById.value[entry.refundId]
    return detail || {
      refund_id: entry.refundId,
      tracking_reference: entry.refundId,
      amount: entry.amount,
      verification_status: entry.status,
      requested_at: entry.timestamp,
      associations: [],
    }
  })
})

watch(
  paymentRefundRequests,
  async (refunds) => {
    if (!refunds.length) {
      refundDetailsById.value = {}
      return
    }

    refundDetailsLoading.value = true
    try {
      const refundEntries = await Promise.all(
        refunds.map(async (refund) => {
          const refundId = String(refund?.refund_id || refund?.id || '').trim()
          if (!refundId) return null

          try {
            const response = await paymentsRefundsRetrieve({ path: { refund_id: refundId } })
            return [refundId, getResponseData<any>(response) || refund] as const
          } catch {
            return [refundId, refund] as const
          }
        })
      )

      const refundMap: Record<string, any> = {}
      for (const entry of refundEntries) {
        if (!entry) continue
        refundMap[entry[0]] = entry[1]
      }
      refundDetailsById.value = refundMap
    } finally {
      refundDetailsLoading.value = false
    }
  },
  { immediate: true }
)

const formattedMetadataJson = computed(() => {
  if (!metadata.value) return '{}'
  return JSON.stringify(metadata.value, null, 2)
})

function formatAmount(amount: string | number): string {
  return `£${parseAmount(amount).toFixed(2)}`
}

function formatDisplayAmount(amount: any, currency?: string): string {
  if (amount === null || amount === undefined || amount === '') return 'N/A'
  if (typeof amount === 'string' && amount.includes('£')) return amount
  if (typeof amount === 'string' && /^\s*[A-Z]{3}\s+/.test(amount)) return amount

  const parsed = Number.parseFloat(String(amount).replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(parsed)) return String(amount)

  const currencyCode = (currency || 'GBP').toUpperCase()
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(parsed)
  } catch {
    return `${currencyCode} ${parsed.toFixed(2)}`
  }
}

function formatMetadataLabel(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value).replace(/_/g, ' ')
}

function getDraftAttendeeName(attendeeDraft: any): string {
  if (!attendeeDraft || typeof attendeeDraft !== 'object') return ''
  const firstName = attendeeDraft.first_name || ''
  const lastName = attendeeDraft.last_name || ''
  return `${firstName} ${lastName}`.trim()
}

function getAttendeeAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDelta = today.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age >= 0 ? age : null
}

function isMinor(dateOfBirth?: string): boolean {
  const age = getAttendeeAge(dateOfBirth)
  return age !== null && age < 18
}

function getResolvedPackageProduct(packageId: unknown, packageProductId: unknown): PackageProduct | null {
  const pid = Number(packageId)
  const ppid = Number(packageProductId)
  if (!Number.isFinite(pid) || !Number.isFinite(ppid)) return null

  const products = packageProductsByPackageId.value[pid] || []
  return products.find((item) => Number(item.id) === ppid) || null
}

function getResolvedVariant(variantId: unknown): ProductVariantDetail | null {
  const id = String(variantId || '').trim()
  if (!id) return null
  return variantsByVariantId.value[id] || null
}

function getResolvedProductSelectionImageUrl(selection: any): string {
  const variant = getResolvedVariant(selection?.variant_id)
  const imageUrl = variant?.images?.main?.url || null
  return resolveImageUrl(imageUrl)
}

function getResolvedBasePriceLabel(packageId: unknown, selection: any): string {
  const packageProduct = getResolvedPackageProduct(packageId, selection?.package_product_id)
  const variant = getResolvedVariant(selection?.variant_id)

  const basePrice = variant?.base_amount || packageProduct?.base_amount
  const currency = variant?.base_amount_currency || packageProduct?.base_amount_currency
  if (!basePrice) return 'N/A'

  return formatDisplayAmount(basePrice, currency)
}

function getResolvedCheckoutPriceLabel(packageId: unknown, selection: any): string {
  const packageProduct = getResolvedPackageProduct(packageId, selection?.package_product_id)
  const variant = getResolvedVariant(selection?.variant_id)

  const checkoutPrice = packageProduct?.modified_amount || variant?.context_final_price || variant?.final_price
  const currency = packageProduct?.base_amount_currency || variant?.base_amount_currency
  if (!checkoutPrice) return 'N/A'

  return formatDisplayAmount(checkoutPrice, currency)
}

function getResolvedProductSelectionLabel(packageId: unknown, selection: any): string {
  const packageProduct = getResolvedPackageProduct(packageId, selection?.package_product_id)
  const variant = getResolvedVariant(selection?.variant_id)

  if (variant?.product_title) return variant.product_title
  if (packageProduct?.product_title) return packageProduct.product_title
  return `Package product #${selection?.package_product_id || 'N/A'}`
}

function getResolvedProductSelectionSubtitle(packageId: unknown, selection: any): string {
  const packageProduct = getResolvedPackageProduct(packageId, selection?.package_product_id)
  const variant = getResolvedVariant(selection?.variant_id)

  const details: string[] = []

  if (variant) {
    if (variant.size_display) details.push(`Size: ${variant.size_display}`)
    if (variant.color) details.push(`Color: ${variant.color}`)
  }

  if (packageProduct?.quantity_per_attendee) {
    details.push(`Units per attendee ${packageProduct.quantity_per_attendee}`)
  }

  return details.join(' • ')
}

function calculateModifier(baseAmount: string | number, percentage: string | number): number {
  const base = parseAmount(baseAmount)
  const percent = typeof percentage === 'string' ? parseFloat(percentage) : percentage
  return (base * percent) / 100
}

function calculateDiscounts(): number {
  // TODO: calculate discounts from metadata
  return 0
}

function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'N/A'
  
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getMethodTypeLabel(methodType: string | undefined): string {
  if (!methodType) return 'N/A'
  return paymentMethodTypeLabels[methodType as keyof typeof paymentMethodTypeLabels] || methodType
}

function normalizeRefundRequestStatus(status: unknown): string {
  return String(status || 'pending').toLowerCase()
}

function getRefundRequestStatusColor(status: unknown): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
  const normalized = normalizeRefundRequestStatus(status)
  if (normalized === 'processed') return 'green'
  if (normalized === 'verified') return 'blue'
  if (normalized === 'rejected' || normalized === 'failed') return 'red'
  if (normalized === 'pending') return 'amber'
  return 'gray'
}

function getRefundRequestStatusLabel(status: unknown): string {
  const normalized = normalizeRefundRequestStatus(status)
  if (!normalized) return 'Pending'
  return normalized.replace(/_/g, ' ')
}

function refundTimelineLabel(refund: any): string {
  const status = normalizeRefundRequestStatus(refund?.status)
  if (status === 'rejected' || status === 'failed') return 'Refund failed'
  if (status === 'verified') return 'Refund verified'
  if (status === 'pending') return 'Refund requested'
  return 'Refunded'
}

function isFailedRefund(status: unknown): boolean {
  const normalized = normalizeRefundRequestStatus(status)
  return normalized === 'rejected' || normalized === 'failed'
}

function getRefundAssociationLabel(association: any): string {
  if (association?.description) return association.description

  const metadata = association?.metadata
  const orderItems = metadata?.order?.order_items
  if (Array.isArray(orderItems) && orderItems.length > 0) {
    return orderItems
      .map((item: any) => `${item?.product_title || 'Product'}${item?.quantity ? ` x${item.quantity}` : ''}`)
      .join(', ')
  }

  const ticketBreakdown = metadata?.ticket_breakdown
  if (ticketBreakdown && typeof ticketBreakdown === 'object') {
    const tickets = Object.values(ticketBreakdown as Record<string, any>)
    if (tickets.length > 0) {
      return tickets
        .map((ticket: any) => `${ticket?.attendee_name || 'Attendee'}${ticket?.ticket_type ? ` - ${ticket.ticket_type}` : ''}`)
        .join(', ')
    }
  }

  return 'Refunded allocation'
}
</script>
