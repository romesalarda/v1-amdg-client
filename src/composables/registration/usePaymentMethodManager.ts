import { computed, reactive, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { uploadMultipart } from '~/utils/upload'

export interface UsePaymentMethodManagerOptions {
	eventUuid: ComputedRef<string>
	bookingIntentId: ComputedRef<string | null>
}

export function usePaymentMethodManager(options: UsePaymentMethodManagerOptions) {
	const { eventUuid, bookingIntentId } = options

	const requestFetch = useRequestFetch()

	// ── Payment methods ──────────────────────────────────────────────────────────

	const paymentMethodsQuery = usePaymentMethods(
		computed(() => ({ event_id: eventUuid.value, page_size: 100 }))
	)
	const paymentMethods = computed(() => paymentMethodsQuery.data.value?.data?.results || [])
	const selectedPaymentMethodId = ref<number | undefined>(undefined)
	const selectedPaymentMethod = computed(() =>
		paymentMethods.value.find((method) => method.id === selectedPaymentMethodId.value)
	)

	const getMethodIcon = (methodType?: string) => {
		if (methodType === 'STRIPE') return 'i-heroicons-credit-card'
		if (methodType === 'BANK_TRANSFER') return 'i-heroicons-building-library'
		if (methodType === 'CASH') return 'i-heroicons-banknotes'
		return 'i-heroicons-wallet'
	}

	const paymentMethodTypeLabel = computed(() => {
		if (!selectedPaymentMethod.value?.method_type) return 'Method'
		if (selectedPaymentMethod.value.method_type === 'BANK_TRANSFER') return 'Bank transfer'
		if (selectedPaymentMethod.value.method_type === 'STRIPE') return 'Card payment'
		if (selectedPaymentMethod.value.method_type === 'CASH') return 'Cash'
		return selectedPaymentMethod.value.method_type
	})

	const isBankTransferMethod = computed(() => selectedPaymentMethod.value?.method_type === 'BANK_TRANSFER')
	const isStripeMethod = computed(() => selectedPaymentMethod.value?.method_type === 'STRIPE')
	const isBankTransferEvidenceRequiredImmediately = computed(
		() => isBankTransferMethod.value && !!selectedPaymentMethod.value?.bank_transfer_required_immediately
	)

	const bankDetails = computed(() => {
		const details = selectedPaymentMethod.value?.provided_details as Record<string, unknown> | undefined
		return {
			account_name: typeof details?.account_name === 'string' ? details.account_name : '',
			sort_code: typeof details?.sort_code === 'string' ? details.sort_code : '',
			account_number: typeof details?.account_number === 'string' ? details.account_number : '',
		}
	})

	// ── Bank transfer reservation ────────────────────────────────────────────────

	const reservedBankTransferPaymentId = ref('')
	const reservedBankTransferPaymentReference = ref('')
	const reservedBankTransferReference = ref('')
	const reservedBankTransferIntentId = ref('')
	const reservedBankTransferMethodId = ref<number | null>(null)
	const reservedBankTransferLoading = ref(false)
	const reservedBankTransferError = ref('')

	const clearReservedBankTransferPayment = () => {
		reservedBankTransferPaymentId.value = ''
		reservedBankTransferPaymentReference.value = ''
		reservedBankTransferReference.value = ''
		reservedBankTransferIntentId.value = ''
		reservedBankTransferMethodId.value = null
		reservedBankTransferError.value = ''
	}

	const reserveBankTransferPayment = async () => {
		if (!isBankTransferMethod.value || !bookingIntentId.value || !selectedPaymentMethodId.value) {
			return
		}

		const intentId = bookingIntentId.value
		if (
			reservedBankTransferIntentId.value === intentId &&
			reservedBankTransferMethodId.value === selectedPaymentMethodId.value &&
			reservedBankTransferReference.value
		) {
			return
		}

		reservedBankTransferLoading.value = true
		reservedBankTransferError.value = ''

		try {
			const response = (await requestFetch('/api/bookings/list/reserve-bank-transfer-payment/', {
				method: 'POST',
				body: {
					booking_intent_id: intentId,
					payment_method_id: selectedPaymentMethodId.value,
				},
			})) as Record<string, unknown>

			const paymentId = typeof response.payment_id === 'string' ? response.payment_id : ''
			const paymentReference = typeof response.payment_reference === 'string' ? response.payment_reference : ''
			const bankTransferReference =
				typeof response.bank_transfer_reference === 'string' ? response.bank_transfer_reference : ''

			if (!paymentId || !paymentReference || !bankTransferReference) {
				throw new Error('Reservation response was incomplete.')
			}

			reservedBankTransferPaymentId.value = paymentId
			reservedBankTransferPaymentReference.value = paymentReference
			reservedBankTransferReference.value = bankTransferReference
			reservedBankTransferIntentId.value = intentId
			reservedBankTransferMethodId.value = selectedPaymentMethodId.value
		} catch (error) {
			reservedBankTransferError.value = 'Unable to reserve your bank transfer reference right now.'
			console.error('Failed to reserve bank transfer payment', error)
		} finally {
			reservedBankTransferLoading.value = false
		}
	}

	watch(
		[() => bookingIntentId.value, () => selectedPaymentMethodId.value],
		() => {
			if (!isBankTransferMethod.value) {
				clearReservedBankTransferPayment()
				return
			}

			if (!bookingIntentId.value || !selectedPaymentMethodId.value) {
				clearReservedBankTransferPayment()
				return
			}

			void reserveBankTransferPayment()
		},
		{ immediate: true }
	)

	// ── Bank transfer evidence ───────────────────────────────────────────────────

	const asTrimmedString = (value: unknown) => String(value ?? '').trim()

	const bankTransferEvidence = reactive({
		transfer_id: '',
		bank_transfer_evidence_id: '' as string,
		evidence_file: null as File | null,
		payer_name: '',
		payer_account_last4: '',
		amount_on_evidence: null as number | null,
	})

	const bankTransferEvidenceErrors = reactive({
		evidence_file: '',
		payer_name: '',
		payer_account_last4: '',
		amount_on_evidence: '',
	})

	const clearBankTransferEvidenceErrors = () => {
		bankTransferEvidenceErrors.evidence_file = ''
		bankTransferEvidenceErrors.payer_name = ''
		bankTransferEvidenceErrors.payer_account_last4 = ''
		bankTransferEvidenceErrors.amount_on_evidence = ''
	}

	const clearBankTransferEvidenceForm = () => {
		bankTransferEvidence.transfer_id = ''
		bankTransferEvidence.bank_transfer_evidence_id = ''
		bankTransferEvidence.evidence_file = null
		bankTransferEvidence.payer_name = ''
		bankTransferEvidence.payer_account_last4 = ''
		bankTransferEvidence.amount_on_evidence = null
		clearBankTransferEvidenceErrors()
	}

	const onBankTransferEvidenceFileChange = (file: File | null) => {
		bankTransferEvidence.evidence_file = file
		bankTransferEvidence.bank_transfer_evidence_id = ''
		bankTransferEvidenceErrors.evidence_file = ''
	}

	const isBankTransferEvidenceFormReady = computed(() => {
		if (!isBankTransferEvidenceRequiredImmediately.value) return true
		if (!bankTransferEvidence.evidence_file) return false
		if (!asTrimmedString(bankTransferEvidence.payer_name)) return false
		if (bankTransferEvidence.payer_account_last4 && !/^\d{4}$/.test(bankTransferEvidence.payer_account_last4))
			return false
		if (bankTransferEvidence.amount_on_evidence === null || Number(bankTransferEvidence.amount_on_evidence) <= 0)
			return false
		return true
	})

	const validateBankTransferEvidenceForm = () => {
		clearBankTransferEvidenceErrors()
		if (!isBankTransferEvidenceRequiredImmediately.value) return true

		let valid = true
		if (!bankTransferEvidence.evidence_file) {
			bankTransferEvidenceErrors.evidence_file = 'Evidence file is required.'
			valid = false
		}
		if (!asTrimmedString(bankTransferEvidence.payer_name)) {
			bankTransferEvidenceErrors.payer_name = 'Payer name is required.'
			valid = false
		}
		if (bankTransferEvidence.amount_on_evidence === null || Number(bankTransferEvidence.amount_on_evidence) <= 0) {
			bankTransferEvidenceErrors.amount_on_evidence = 'Amount on evidence must be greater than zero.'
			valid = false
		}
		if (bankTransferEvidence.payer_account_last4 && !/^\d{4}$/.test(bankTransferEvidence.payer_account_last4)) {
			bankTransferEvidenceErrors.payer_account_last4 = 'Use exactly 4 digits.'
			valid = false
		}

		return valid
	}

	const uploadBankTransferEvidenceForCheckout = async (): Promise<string> => {
		if (bankTransferEvidence.bank_transfer_evidence_id) {
			return bankTransferEvidence.bank_transfer_evidence_id
		}

		const currentIntentId = bookingIntentId.value
		if (!currentIntentId) {
			throw new Error('Booking intent is missing. Refresh and try again.')
		}

		const formData = new FormData()
		formData.append('booking_intent_id', currentIntentId)
		formData.append('evidence_file', bankTransferEvidence.evidence_file as File)
		formData.append('payer_name', asTrimmedString(bankTransferEvidence.payer_name))
		formData.append('payer_account_last4', asTrimmedString(bankTransferEvidence.payer_account_last4))
		formData.append('amount_on_evidence', String(Number(bankTransferEvidence.amount_on_evidence)))

		const uploadResponse = (await uploadMultipart(
			'/api/bookings/list/upload-bank-transfer-evidence/',
			formData,
			{ method: 'POST' }
		)) as Record<string, unknown>
		const evidenceId =
			typeof uploadResponse.bank_transfer_evidence_id === 'string'
				? uploadResponse.bank_transfer_evidence_id
				: ''

		if (!evidenceId) {
			throw new Error('Evidence uploaded but no evidence ID was returned.')
		}

		bankTransferEvidence.bank_transfer_evidence_id = evidenceId
		return evidenceId
	}

	watch(
		() => selectedPaymentMethodId.value,
		() => {
			if (!isBankTransferEvidenceRequiredImmediately.value) {
				clearBankTransferEvidenceForm()
			} else {
				clearBankTransferEvidenceErrors()
			}
		}
	)

	return {
		// Payment method selection
		paymentMethods,
		selectedPaymentMethodId,
		selectedPaymentMethod,
		getMethodIcon,
		paymentMethodTypeLabel,
		isBankTransferMethod,
		isStripeMethod,
		isBankTransferEvidenceRequiredImmediately,
		bankDetails,
		// Bank transfer reservation
		reservedBankTransferPaymentId,
		reservedBankTransferPaymentReference,
		reservedBankTransferReference,
		reservedBankTransferIntentId,
		reservedBankTransferMethodId,
		reservedBankTransferLoading,
		reservedBankTransferError,
		clearReservedBankTransferPayment,
		reserveBankTransferPayment, // exposed for checkout flow
		// Bank transfer evidence
		bankTransferEvidence,
		bankTransferEvidenceErrors,
		clearBankTransferEvidenceErrors,
		clearBankTransferEvidenceForm,
		onBankTransferEvidenceFileChange,
		isBankTransferEvidenceFormReady,
		validateBankTransferEvidenceForm,
		uploadBankTransferEvidenceForCheckout,
	}
}
