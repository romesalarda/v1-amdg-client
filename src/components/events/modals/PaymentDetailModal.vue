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
            <div class="text-lg font-bold text-gray-900">{{ formatAmount(paymentData.modified_amount || paymentData.amount) }}</div>
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

          <!-- Basic Info -->
          <template v-else>
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">info</span>
              Basic Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Payment ID</div>
                <div class="font-mono text-sm font-semibold">{{ paymentData.payment_id }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Reference</div>
                <div class="font-mono text-sm font-semibold">{{ paymentData.payment_reference }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Created</div>
                <div class="text-sm font-semibold">{{ formatDateTime(paymentData.created_at) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Updated</div>
                <div class="text-sm font-semibold">{{ formatDateTime(paymentData.updated_at) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">User</div>
                <div class="text-sm font-semibold">{{ paymentData.user_name || 'N/A' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Payment Method</div>
                <div class="text-sm font-semibold">{{ paymentData.method?.title || paymentData.method_title || 'N/A' }}</div>
                <div class="text-xs text-gray-500">{{ getMethodTypeLabel(paymentData.method?.code) || 'N/A' }}</div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 mt-4">
                <div class="text-xs text-gray-500 mb-1">Description</div>
                <div class="text-sm font-semibold">{{ paymentData.description }}</div>
              </div>
          </section>

          <!-- Amount Breakdown -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">calculate</span>
              Amount Breakdown
            </h4>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Base Amount:</span>
                  <span class="font-semibold">{{ formatAmount(paymentData.base_amount) }}</span>
                </div>
                <div v-if="parseAmount(paymentData.percentage_modifier) !== 0" class="flex justify-between items-center text-amber-700">
                  <span class="text-sm">Modifier ({{ parseAmount(paymentData.percentage_modifier) }}%):</span>
                  <span class="font-semibold">
                    {{ parseAmount(paymentData.percentage_modifier) > 0 ? '+' : '' }}{{ formatAmount(calculateModifier(paymentData.base_amount, paymentData.percentage_modifier)) }}
                  </span>
                </div>
                <div v-if="hasDiscounts" class="flex justify-between items-center text-blue-700">
                  <span class="text-sm">Discounts Applied:</span>
                  <span class="font-semibold">-{{ formatAmount(calculateDiscounts()) }}</span>
                </div>
                <div class="border-t border-green-300 pt-2 mt-2">
                  <div class="flex justify-between items-center">
                    <span class="text-base font-bold text-gray-900">Final Amount:</span>
                    <span class="text-xl font-black text-green-700">{{ formatAmount(paymentData.modified_amount || paymentData.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Stripe Information -->
          <section v-if="paymentData.method?.method_type === 'STRIPE' && paymentData.stripe_payment_intent">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">credit_card</span>
              Stripe Information
            </h4>
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Payment Intent ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_payment_intent }}</div>
              </div>
              <div v-if="paymentData.stripe_charge_id" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Charge ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_charge_id }}</div>
              </div>
              <div v-if="paymentData.stripe_customer_id" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="text-xs text-purple-700 mb-1">Customer ID</div>
                <div class="font-mono text-sm font-semibold text-purple-900">{{ paymentData.stripe_customer_id }}</div>
              </div>
            </div>
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
                  v-if=" paymentData.status === 'PENDING'""
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

          <section v-if="hasMetadata">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">inventory_2</span>
              Payment Content
            </h4>

            <div v-if="metadataType === 'ORDER'" class="space-y-3">
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

            <div v-else-if="metadataType === 'BOOKING'" class="space-y-3">
              <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs text-emerald-700 mb-1">Booking Reference</div>
                    <div class="font-mono font-semibold text-emerald-900">{{ bookingMetadata?.booking_reference || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-emerald-700 mb-1">Booking ID</div>
                    <div class="font-mono font-semibold text-emerald-900">{{ bookingMetadata?.booking_id || 'N/A' }}</div>
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
                        <div class="text-sm font-bold text-gray-900">{{ formatDisplayAmount(attendee.frozen_price, attendee.currency) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="metadataType === 'DONATION'" class="space-y-3">
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

            <div v-else class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="text-sm text-gray-700">No specialized metadata renderer found for this payment. Raw metadata is available below.</div>
            </div>

            <details class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
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
          <section v-if="paymentData.refund_requests_summary && paymentData.refund_requests_summary.total_refunded > 0">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">undo</span>
              Refund Requests ({{ paymentData.refund_requests_summary.total_refunded }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="refund in paymentData.refund_requests_summary.refunds"
                :key="refund.refund_id"
                class="bg-blue-50 rounded-lg p-3 border border-blue-200"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-mono text-sm font-semibold text-blue-900">{{ refund.tracking_reference }}</div>
                    <div class="text-xs text-blue-700 mt-1">Amount: {{ formatAmount(refund.amount) }}</div>
                    <div class="text-xs text-gray-500">{{ refund.reason || 'No reason provided' }}</div>
                  </div>
                  <UBadge :color="getRefundStatusColor(refund.verification_status || 'pending') as any" variant="soft" size="xs">
                    {{ getRefundStatusLabel(refund.verification_status || 'pending') }}
                  </UBadge>
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
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import { usePayment } from '~/composables/resources/payments/payments'
import { usePaymentMethod } from '~/composables/resources/payments/paymentMethods'
import { parseAmount } from '~/utils/money'
import { uploadMultipart } from '~/utils/upload'

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

const donationMetadata = computed<any>(() => {
  if (metadataType.value !== 'DONATION') return null
  return metadata.value?.donation || null
})

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
</script>
