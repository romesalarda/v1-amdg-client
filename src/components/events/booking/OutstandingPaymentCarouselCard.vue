<template>
  <div>
    <p class="text-label-bold font-label-bold uppercase text-deep-navy">Outstanding Payments</p>

    <div v-if="payments.length" class="mt-3 space-y-3">
      <!-- Carousel header -->
      <div class="rounded-lg border border-outline-variant bg-white p-md">
        <div class="flex items-center justify-between gap-2 p-5">
          <div>
            <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">
              Payment {{ currentIndex + 1 }} of {{ payments.length }}
            </p>
            <p class="text-body-md font-body-md font-bold text-on-surface font-mono mt-2">{{ currentPayment?.descriptor?.toUpperCase() || 'Outstanding payment' }}</p>
            <p class="text-body-sm font-body-md text-on-surface font-mono">{{ currentPayment?.payment_reference || 'Outstanding payment' }}</p>

          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded border border-outline-variant px-3 py-1 text-label-bold font-label-bold uppercase text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="payments.length <= 1"
              @click="goPrevious"
            >
              PREV
            </button>
            <button
              type="button"
              class="rounded border border-outline-variant px-3 py-1 text-label-bold font-label-bold uppercase text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="payments.length <= 1"
              @click="goNext"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      <!-- Payment detail -->
      <div v-if="currentPayment" class="space-y-4">
        <!-- Method + Amount -->
        <div class="grid grid-cols-2 gap-md items-end">
          <div>
            <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60 mb-1">Method</p>
            <p class="text-headline-sm font-headline text-on-surface">{{ currentPayment.method_title || currentPayment.method_type || 'Unknown method' }}</p>
          </div>
          <div class="text-right">
            <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60 mb-1">Outstanding Amount</p>
            <p class="text-headline-md font-headline text-on-surface">{{ currentPayment.amount || '-' }}</p>
          </div>
        </div>

        <div v-if="isCurrentLoading" class="rounded-lg border border-outline-variant bg-surface px-3 py-3 text-body-sm font-body-sm text-on-surface-variant">
          Loading payment details...
        </div>

        <div v-else-if="currentError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-body-sm font-body-sm text-red-700">
          <p>Unable to load payment details.</p>
          <button
            type="button"
            class="mt-2 rounded-lg border border-red-300 px-2.5 py-1 text-label-bold font-label-bold uppercase text-red-700 hover:bg-red-100"
            @click="fetchCurrentPaymentDetail(true)"
          >
            Retry
          </button>
        </div>

        <template v-else>
          <div
            v-if="isCurrentBankTransfer && !hasCompleteBankDetails"
            class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-body-sm font-body-sm text-amber-800"
          >
            Bank details are unavailable for this payment. Check back later.
          </div>

          <!-- Bank transfer steps -->
          <div v-else-if="isCurrentBankTransfer" class="mt-md space-y-md border-outline-variant pt-">
            <!-- Step 1: Account details — hidden if evidence already uploaded -->
            <div v-if="!currentEvidenceUploaded" class="relative pl-8">
              <div class="absolute left-0 top-0 w-6 h-6 rounded-full border border-primary text-primary bg-white flex items-center justify-center text-label-bold font-label-bold">1</div>
              <p class="text-label-bold font-label-bold uppercase tracking-tighter text-on-surface-variant mb-sm">First: Use these account details</p>
              <div class="rounded-lg border border-outline-variant bg-white p-sm">
                <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60 mb-1">Account Name</p>
                <p class="text-body-lg font-body-lg font-bold text-on-surface break-words">{{ currentAccountName }}</p>
              </div>
              <div class="grid grid-cols-2 gap-sm mt-sm">
                <div class="rounded-lg border border-outline-variant bg-white p-sm">
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60 mb-1">Sort Code</p>
                  <p class="text-body-lg font-body-lg font-bold text-on-surface">{{ currentSortCode }}</p>
                </div>
                <div class="rounded-lg border border-outline-variant bg-white p-sm">
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60 mb-1">Account Number</p>
                  <p class="text-body-lg font-body-lg font-bold text-on-surface">{{ currentAccountNumber }}</p>
                </div>
              </div>
            </div>

            <!-- Step 2: Amount to pay — hidden if evidence already uploaded -->
            <div v-if="!currentEvidenceUploaded" class="relative pl-8">
              <div class="absolute left-0 top-0 w-6 h-6 rounded-full border border-primary text-primary bg-white flex items-center justify-center text-label-bold font-label-bold">2</div>
              <p class="text-label-bold font-label-bold uppercase tracking-tighter text-on-surface-variant mb-sm">Second: Pay this amount</p>
              <div class="rounded-lg border border-outline-variant bg-white p-md">
                <p class="text-headline-md font-headline text-on-surface">{{ currentPayment.amount || '-' }}</p>
              </div>
            </div>

            <!-- Step 3: Upload evidence -->
            <div class="relative pl-8">
              <div
                class="absolute left-0 top-0 w-6 h-6 rounded-full border flex items-center justify-center text-label-bold font-label-bold"
                :class="currentEvidenceUploaded ? 'border-green-500 bg-green-500 text-white' : 'border-primary text-primary bg-white'"
              >
                <span v-if="currentEvidenceUploaded" class="material-symbols-outlined" style="font-size:14px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">check</span>
                <span v-else>{{ currentEvidenceUploaded ? '' : (payments.length > 1 || !currentEvidenceUploaded ? '3' : '1') }}</span>
              </div>
              <p class="text-label-bold font-label-bold uppercase tracking-tighter text-on-surface-variant mb-sm">
                {{ currentEvidenceUploaded ? 'Evidence uploaded' : 'Third: Upload a screenshot of payment' }}
              </p>

              <div v-if="currentEvidenceUploaded" class="rounded-lg border border-green-200 bg-green-50 p-3 mt-3">
                <p class="text-body-sm font-body-sm font-semibold text-green-800">You have successfully uploaded the bank transfer evidence. Our team will review it shortly.</p>
              </div>

              <div v-else class="space-y-2 rounded-lg border border-outline-variant bg-white p-3">
                <p class="text-label-bold font-label-bold uppercase text-on-surface-variant">Upload evidence</p>

                <div>
                  <label class="mb-1 block text-label-bold font-label-bold text-on-surface-variant">Evidence file <span class="text-red-600">*</span></label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm font-body-sm"
                    @change="onEvidenceFileChange"
                  >
                </div>

                <div class="grid grid-cols-1 gap-2">
                  <input
                    v-model="uploadForm.payer_name"
                    type="text"
                    class="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm font-body-sm"
                    placeholder="Payer name"
                  >
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="uploadForm.payer_account_last4"
                      type="text"
                      maxlength="4"
                      class="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm font-body-sm"
                      placeholder="Last 4"
                    >
                    <input
                      v-model="uploadForm.amount_on_evidence"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm font-body-sm"
                      placeholder="Amount"
                    >
                  </div>
                </div>

                <p v-if="uploadError" class="text-body-sm font-body-sm font-semibold text-red-700">{{ uploadError }}</p>
                <p v-if="uploadSuccess" class="text-body-sm font-body-sm font-semibold text-primary">{{ uploadSuccess }}</p>

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="rounded-lg bg-primary px-4 py-2 text-label-bold font-label-bold uppercase text-white hover:bg-primary/90 disabled:opacity-60"
                    :disabled="uploadPending"
                    @click="uploadEvidence"
                  >
                    {{ uploadPending ? 'Uploading...' : 'Upload evidence' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="rounded-lg border border-outline-variant bg-surface px-3 py-3 text-body-sm font-body-sm text-on-surface-variant">
            This payment is not a bank transfer. Please complete payment via the assigned method.
          </div>

          <div v-if="hasRenderableMetadata && false" class="rounded-lg border border-outline-variant bg-white p-3 space-y-3">
            <p class="text-label-bold font-label-bold uppercase text-on-surface-variant">Payment metadata</p>

            <div v-if="metadataType === 'ORDER'" class="rounded-md border border-blue-200 bg-blue-50 p-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Order reference</p>
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ metadata.order_reference }}</p>
                </div>
                <div>
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Status</p>
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ metadata.status }}</p>
                </div>
              </div>
              <div v-if="orderItems.length" class="mt-2 space-y-1">
                <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Items</p>
                <div
                  v-for="(item, index) in orderItems"
                  :key="String(item.order_item_id || index)"
                  class="rounded border border-outline-variant bg-white px-2 py-1.5"
                >
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ String(item.product_title || 'Product') }}</p>
                  <p class="text-body-sm font-body-sm text-on-surface-variant">Qty {{ Number(item.quantity || 1) }} x {{ formatDisplayAmount(item.unit_price, item.currency) }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="metadataType === 'BOOKING'" class="rounded-md border border-outline-variant bg-surface p-3">
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Booking reference</p>
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ bookingReference }}</p>
                </div>
              </div>
              <div v-if="bookingAttendees.length" class="mt-2">
                <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Attendees ({{ bookingAttendees.length }})</p>
                <div class="mt-1 space-y-1">
                  <p v-for="(name, index) in bookingAttendees" :key="`${name}-${index}`" class="rounded border border-outline-variant bg-white px-2 py-1 text-body-sm font-body-sm font-semibold text-on-surface">
                    {{ name }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else-if="metadataType === 'DONATION'" class="rounded-md border border-outline-variant bg-surface p-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Event</p>
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ donationEvent }}</p>
                </div>
                <div>
                  <p class="text-label-bold font-label-bold uppercase text-on-surface-variant opacity-60">Donated by</p>
                  <p class="text-body-sm font-body-sm font-semibold text-on-surface">{{ donationBy }}</p>
                </div>
              </div>
              <p class="mt-2 text-body-sm font-body-sm text-on-surface">Amount: {{ formatDisplayAmount(donationAmount, donationCurrency) }}</p>
              <p v-if="donationMessage" class="mt-1 text-body-sm font-body-sm text-on-surface">{{ donationMessage }}</p>
            </div>

          </div>
        </template>
      </div>
    </div>

    <p v-else class="mt-3 text-body-sm font-body-sm text-on-surface-variant">No outstanding payments.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { uploadMultipart } from '~/utils/upload'

interface OutstandingPayment {
  payment_id?: string | number
  payment_reference?: string
  amount?: string
  method_title?: string | null
  method_type?: string | null
  metadata?: Record<string, unknown>
  provided_details?: Record<string, unknown> | null
  descriptor?: string | null
}

interface PaymentEvidence {
  bank_transfer_id?: string | number
}

interface PaymentMethod {
  method_type?: string | null
}

interface PaymentDetail {
  id?: string | number
  metadata?: Record<string, unknown>
  provided_details?: Record<string, unknown> | null
  method?: PaymentMethod
  method_title?: string | null
  method_type?: string | null
  bank_transfer_evidence?: PaymentEvidence
}

type MetadataType = 'ORDER' | 'BOOKING' | 'DONATION' | 'UNKNOWN'

const props = defineProps<{
  payments: OutstandingPayment[]
}>()

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const requestFetch = useRequestFetch()
const { $notyf } = useNuxtApp()

const currentIndex = ref(0)
const detailCache = ref<Record<string, PaymentDetail>>({})
const detailLoading = ref<Record<string, boolean>>({})
const detailErrors = ref<Record<string, string>>({})

const uploadPending = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const uploadForm = reactive({
  evidence_file: null as File | null,
  payer_name: '',
  payer_account_last4: '',
  amount_on_evidence: '',
})

const currentPayment = computed(() => props.payments[currentIndex.value] || null)
const currentPaymentId = computed(() => String(currentPayment.value?.payment_id || '').trim())
const currentDetail = computed(() => detailCache.value[currentPaymentId.value] || null)
const isCurrentLoading = computed(() => !!detailLoading.value[currentPaymentId.value])
const currentError = computed(() => detailErrors.value[currentPaymentId.value] || '')

watch(
  () => props.payments.length,
  () => {
    if (!props.payments.length) {
      currentIndex.value = 0
      return
    }
    if (currentIndex.value >= props.payments.length) {
      currentIndex.value = props.payments.length - 1
    }
  },
  { immediate: true }
)

watch(
  currentPaymentId,
  () => {
    uploadError.value = ''
    uploadSuccess.value = ''
    uploadForm.evidence_file = null
    uploadForm.payer_name = ''
    uploadForm.payer_account_last4 = ''
    uploadForm.amount_on_evidence = ''
    void fetchCurrentPaymentDetail(false)
  },
  { immediate: true }
)

function goTo(index: number) {
  if (index < 0 || index >= props.payments.length) return
  currentIndex.value = index
}

function goPrevious() {
  if (!props.payments.length) return
  currentIndex.value = (currentIndex.value - 1 + props.payments.length) % props.payments.length
}

function goNext() {
  if (!props.payments.length) return
  currentIndex.value = (currentIndex.value + 1) % props.payments.length
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

function readString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function getDetailValue(key: 'account_name' | 'sort_code' | 'account_number'): string {
  const summary = asRecord(currentPayment.value?.provided_details)
  const summaryMetadata = asRecord(currentPayment.value?.metadata)
  const detailProvided = asRecord(currentDetail.value?.provided_details)
  const detailMetadata = asRecord(currentDetail.value?.metadata)

  const found =
    readString(summary[key]) ||
    readString(asRecord(summaryMetadata.provided_details)[key]) ||
    readString(summaryMetadata[key]) ||
    readString(detailProvided[key]) ||
    readString(asRecord(detailMetadata.provided_details)[key]) ||
    readString(detailMetadata[key])

  return found
}

const currentAccountName = computed(() => getDetailValue('account_name') || 'Unavailable')
const currentSortCode = computed(() => getDetailValue('sort_code') || 'Unavailable')
const currentAccountNumber = computed(() => getDetailValue('account_number') || 'Unavailable')

const isCurrentBankTransfer = computed(() => {
  const summaryType = readString(currentPayment.value?.method_type).toUpperCase().replace(/-/g, '_')
  const summaryTitle = readString(currentPayment.value?.method_title).toUpperCase()
  const detailMethodType = readString(currentDetail.value?.method?.method_type).toUpperCase().replace(/-/g, '_')
  const detailType = readString(currentDetail.value?.method_type).toUpperCase().replace(/-/g, '_')
  const detailTitle = readString(currentDetail.value?.method_title).toUpperCase()

  return (
    summaryType === 'BANK_TRANSFER' ||
    summaryTitle.includes('BANK TRANSFER') ||
    detailMethodType === 'BANK_TRANSFER' ||
    detailType === 'BANK_TRANSFER' ||
    detailTitle.includes('BANK TRANSFER')
  )
})

const hasCompleteBankDetails = computed(() => {
  return Boolean(
    readString(currentAccountName.value) &&
    readString(currentSortCode.value) &&
    readString(currentAccountNumber.value) &&
    currentAccountName.value !== 'Unavailable' &&
    currentSortCode.value !== 'Unavailable' &&
    currentAccountNumber.value !== 'Unavailable'
  )
})

const currentEvidenceUploaded = computed(() => {
  return Boolean(currentDetail.value?.bank_transfer_evidence?.bank_transfer_id)
})

async function fetchCurrentPaymentDetail(force: boolean) {
  const paymentId = currentPaymentId.value
  if (!paymentId) return

  if (!force && (detailCache.value[paymentId] || detailLoading.value[paymentId])) {
    return
  }

  detailErrors.value[paymentId] = ''
  detailLoading.value[paymentId] = true

  try {
    const response = await requestFetch(`/api/payments/list/${paymentId}/`)
    detailCache.value[paymentId] = response as PaymentDetail
  } catch (error) {
    const message = (error as { message?: string })?.message || 'Failed to fetch payment details.'
    detailErrors.value[paymentId] = message
  } finally {
    detailLoading.value[paymentId] = false
  }
}

function onEvidenceFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  uploadForm.evidence_file = input.files?.[0] || null
}

function extractErrorMessage(error: unknown): string {
  const base = error as {
    data?: unknown
    response?: { _data?: unknown; data?: unknown }
    message?: string
  }

  const payload = base.data || base.response?._data || base.response?.data
  if (!payload) return base.message || 'Could not upload evidence.'

  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) return payload.map(item => String(item)).join(' ')

  if (typeof payload === 'object') {
    const firstValue = Object.values(payload as Record<string, unknown>)[0]
    if (Array.isArray(firstValue)) return firstValue.map(item => String(item)).join(' ')
    if (typeof firstValue === 'string') return firstValue
  }

  return base.message || 'Could not upload evidence.'
}

async function uploadEvidence() {
  uploadError.value = ''
  uploadSuccess.value = ''

  const paymentId = currentPaymentId.value
  const detail = currentDetail.value

  if (!paymentId || !detail?.id) {
    uploadError.value = 'Unable to resolve payment details for evidence upload.'
    return
  }

  if (!uploadForm.evidence_file) {
    uploadError.value = 'Evidence file is required.'
    return
  }

  const payerName = readString(uploadForm.payer_name)
  const payerLast4 = readString(uploadForm.payer_account_last4)
  const amountOnEvidence = readString(uploadForm.amount_on_evidence)

  if (!payerName) {
    uploadError.value = 'Payer name is required.'
    return
  }

  if (!/^\d{4}$/.test(payerLast4)) {
    uploadError.value = 'Payer account last 4 must be exactly 4 digits.'
    return
  }

  const amountNumber = Number(amountOnEvidence)
  if (!amountOnEvidence || !Number.isFinite(amountNumber) || amountNumber <= 0) {
    uploadError.value = 'Amount on evidence must be greater than zero.'
    return
  }

  const transferRef = `BT-${paymentId.slice(0, 8)}-${Date.now()}`

  const formData = new FormData()
  formData.append('transfer_id', transferRef)
  formData.append('evidence_file', uploadForm.evidence_file)
  formData.append('payment', String(detail.id))
  formData.append('payer_name', payerName)
  formData.append('payer_account_last4', payerLast4)
  formData.append('amount_on_evidence', amountOnEvidence)

  uploadPending.value = true
  try {
    await uploadMultipart('/api/payments/bank-transfer-evidence/', formData, { method: 'POST' })
    uploadSuccess.value = 'Evidence uploaded. Awaiting verification.'
    $notyf?.success('Evidence uploaded. Awaiting verification.')

    uploadForm.evidence_file = null
    uploadForm.payer_name = ''
    uploadForm.payer_account_last4 = ''
    uploadForm.amount_on_evidence = ''

    await fetchCurrentPaymentDetail(true)
    emit('refresh')
  } catch (error) {
    uploadError.value = extractErrorMessage(error)
  } finally {
    uploadPending.value = false
  }
}

const metadata = computed<Record<string, unknown>>(() => {
  return asRecord(currentDetail.value?.metadata)
})

const hasRenderableMetadata = computed(() => Object.keys(metadata.value).length > 0)

const metadataType = computed<MetadataType>(() => {
  const value = metadata.value
  const order = asRecord(value.order)
  const donation = asRecord(value.donation)

  if (Array.isArray(order.order_items)) return 'ORDER'
  if (Object.keys(donation).length > 0) return 'DONATION'
  if (
    readString(value.booking_id) ||
    readString(value.payment_type) ||
    Array.isArray(value.attendee_selections) ||
    Array.isArray(value.checkout_attendees)
  ) {
    return 'BOOKING'
  }

  return 'UNKNOWN'
})

const orderMetadata = computed(() => asRecord(metadata.value.order))
const orderItems = computed<Array<Record<string, unknown>>>(() => {
  const items = orderMetadata.value.order_items
  return Array.isArray(items) ? (items as Array<Record<string, unknown>>) : []
})
const orderReference = computed(() => readString(orderMetadata.value.order_reference) || 'N/A')
const orderStatus = computed(() => readString(orderMetadata.value.order_status) || 'N/A')

const bookingMetadata = computed(() => metadata.value)
const bookingReference = computed(() => readString(bookingMetadata.value.booking_reference) || 'N/A')
const bookingPaymentType = computed(() => readString(bookingMetadata.value.payment_type) || 'N/A')

function attendeeDisplayName(attendee: Record<string, unknown>): string {
  const attendeeName = readString(attendee.attendee_name)
  if (attendeeName) return attendeeName

  const attendeeDraft = asRecord(attendee.attendee_draft)
  const first = readString(attendeeDraft.first_name)
  const last = readString(attendeeDraft.last_name)
  const combined = `${first} ${last}`.trim()
  if (combined) return combined

  return 'Attendee'
}

const bookingAttendees = computed<string[]>(() => {
  const selections = bookingMetadata.value.attendee_selections
  if (Array.isArray(selections) && selections.length > 0) {
    return selections.map(item => attendeeDisplayName(asRecord(item)))
  }

  const checkout = bookingMetadata.value.checkout_attendees
  if (Array.isArray(checkout) && checkout.length > 0) {
    return checkout.map(item => attendeeDisplayName(asRecord(item)))
  }

  return []
})

const donationMetadata = computed(() => asRecord(metadata.value.donation))
const donationEvent = computed(() => readString(donationMetadata.value.event) || 'N/A')
const donationBy = computed(() => readString(donationMetadata.value.donated_by) || 'N/A')
const donationAmount = computed(() => donationMetadata.value.amount)
const donationCurrency = computed(() => readString(donationMetadata.value.currency) || 'GBP')
const donationMessage = computed(() => readString(donationMetadata.value.message))

function formatDisplayAmount(amount: unknown, currency?: unknown): string {
  if (amount === null || amount === undefined || amount === '') return 'N/A'
  const textAmount = String(amount)
  if (textAmount.includes('£')) return textAmount
  if (/^\s*[A-Z]{3}\s+/.test(textAmount)) return textAmount

  const parsed = Number.parseFloat(textAmount.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(parsed)) return textAmount

  const currencyCode = readString(currency || 'GBP').toUpperCase() || 'GBP'
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(parsed)
  } catch {
    return `${currencyCode} ${parsed.toFixed(2)}`
  }
}

const formattedMetadata = computed(() => JSON.stringify(metadata.value, null, 2))
</script>
