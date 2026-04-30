import { nextTick, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import { bookingsListRetrieve, paymentsListRetrieve } from '~/api/sdk.gen'
import type { PaymentMethod } from '~/api/types.gen'
import type { AttendeeDraft } from '~/stores/registration'

export interface UseStripeCheckoutFlowOptions {
	isStripeMethod: ComputedRef<boolean>
	selectedPaymentMethod: ComputedRef<PaymentMethod | undefined>
	effectiveStripePublishableKey: ComputedRef<string>
	reviewStepIndex: number
	activeStepIndex: Ref<number>
	attendeeDisplayName: (attendee: AttendeeDraft, index: number) => string
	firstAttendee: ComputedRef<AttendeeDraft | undefined>
	checkoutResult: Ref<any>
	showCheckoutSuccessModal: Ref<boolean>
	onToast: (opts: { title: string; description: string; color: string }) => void
}

export function useStripeCheckoutFlow(options: UseStripeCheckoutFlowOptions) {
	const {
		isStripeMethod,
		selectedPaymentMethod,
		effectiveStripePublishableKey,
		reviewStepIndex,
		activeStepIndex,
		attendeeDisplayName,
		firstAttendee,
		checkoutResult,
		showCheckoutSuccessModal,
		onToast,
	} = options

	// ── Stripe element refs ──────────────────────────────────────────────────────

	const stripeCardMountRef = ref<HTMLElement | null>(null)
	const stripeInstance = ref<Stripe | null>(null)
	const stripeElements = ref<StripeElements | null>(null)
	const stripeCardElement = ref<StripeCardElement | null>(null)
	const stripeCardReady = ref(false)
	const stripeCardError = ref('')
	const stripePaymentAttemptError = ref('')
	const stripeClientSecret = ref<string | null>(null)

	// ── Stripe account ID helpers ────────────────────────────────────────────────

	const getStripeAccountIdFromPaymentMethod = (paymentMethod: PaymentMethod | undefined): string | null => {
		const details = paymentMethod?.provided_details
		if (!details || typeof details !== 'object' || Array.isArray(details)) return null
		const stripeAccountId = (details as Record<string, unknown>).stripe_account_id
		return typeof stripeAccountId === 'string' && stripeAccountId.trim().length ? stripeAccountId.trim() : null
	}

	const requireStripeAccountIdFromPaymentMethod = (paymentMethod: PaymentMethod | undefined, context: string): string => {
		const stripeAccountId = getStripeAccountIdFromPaymentMethod(paymentMethod)
		console.debug(`[${context}] Stripe payment method inspection`, {
			paymentMethodId: paymentMethod?.id || null,
			paymentMethodTitle: paymentMethod?.title || null,
			methodType: paymentMethod?.method_type || null,
			hasProvidedDetails: !!paymentMethod?.provided_details,
			stripeAccountId,
		})

		if (!stripeAccountId) {
			const error = new Error(
				`Stripe checkout requires provided_details.stripe_account_id on the selected payment method (${paymentMethod?.id || 'unknown'}).`
			)
			console.error(`[${context}] ${error.message}`, {
				paymentMethod,
				providedDetails: paymentMethod?.provided_details ?? null,
			})
			throw error
		}

		return stripeAccountId
	}

	// ── Stripe element mount/teardown ────────────────────────────────────────────

	const teardownStripeElements = () => {
		if (stripeCardElement.value) {
			stripeCardElement.value.unmount()
			stripeCardElement.value = null
		}
		stripeElements.value = null
		stripeInstance.value = null
		stripeCardReady.value = false
		stripeCardError.value = ''
	}

	const ensureStripeCardMounted = async () => {
		if (!isStripeMethod.value || activeStepIndex.value !== reviewStepIndex) return
		if (stripeCardElement.value) return

		const publishableKey = effectiveStripePublishableKey.value
		if (!publishableKey) return

		const stripeAccountId = requireStripeAccountIdFromPaymentMethod(
			selectedPaymentMethod.value,
			'register checkout stripe init'
		)
		console.debug('[register checkout stripe init] loading Stripe.js', {
			paymentMethodId: selectedPaymentMethod.value?.id || null,
			paymentMethodTitle: selectedPaymentMethod.value?.title || null,
			stripeAccountId,
		})

		await nextTick()
		if (!stripeCardMountRef.value) return

		const stripe = await loadStripe(publishableKey, { stripeAccount: stripeAccountId } as any)
		if (!stripe) {
			stripeCardError.value = 'Could not initialize Stripe card form.'
			return
		}

		stripeInstance.value = stripe
		stripeElements.value = stripe.elements()
		stripeCardElement.value = stripeElements.value.create('card', {
			hidePostalCode: true,
		})
		stripeCardElement.value.mount(stripeCardMountRef.value)
		stripeCardElement.value.on('change', (event) => {
			stripeCardError.value = event.error?.message || ''
			stripeCardReady.value = !!event.complete && !event.error
			if (stripePaymentAttemptError.value) {
				stripePaymentAttemptError.value = ''
			}
		})
	}

	watch(
		[() => isStripeMethod.value, () => activeStepIndex.value, () => effectiveStripePublishableKey.value],
		([stripeSelected, step, key], [, , previousKey]) => {
			if (!stripeSelected || step !== reviewStepIndex) {
				teardownStripeElements()
				return
			}
			if (key !== previousKey) {
				teardownStripeElements()
			}
			void ensureStripeCardMounted().catch((error) => {
				console.error('[register checkout stripe init] Stripe card mount failed', error)
			})
		},
		{ immediate: true }
	)

	// ── Payment status polling ───────────────────────────────────────────────────

	const isPollingPaymentStatus = ref(false)
	const paymentProcessingMessage = ref('')
	let paymentPollingTimer: ReturnType<typeof setInterval> | null = null

	const stopPaymentStatusPolling = () => {
		if (!paymentPollingTimer) return
		clearInterval(paymentPollingTimer)
		paymentPollingTimer = null
		isPollingPaymentStatus.value = false
	}

	const startPaymentStatusPolling = (paymentId: string, bookingId?: number) => {
		stopPaymentStatusPolling()
		isPollingPaymentStatus.value = true
		paymentProcessingMessage.value = 'Processing your card payment and issuing tickets...'

		let attempts = 0
		const maxAttempts = 20

		paymentPollingTimer = setInterval(async () => {
			attempts += 1
			try {
				const paymentResponse = await paymentsListRetrieve({ path: { payment_id: paymentId } })
				const paymentData = paymentResponse.data as any
				const hasCompletedPayment = paymentData?.status === 'COMPLETED'
				const finalizedBookingId = Number(paymentData?.metadata?.booking_id || bookingId || 0)

				if (hasCompletedPayment) {
					if (finalizedBookingId > 0) {
						try {
							await bookingsListRetrieve({ path: { id: finalizedBookingId } })
						} catch {
							// Booking finalization may still be committing. Keep polling.
							return
						}
					}
					stopPaymentStatusPolling()
					checkoutResult.value = {
						...checkoutResult.value,
						status: 'confirmed',
						booking_id: finalizedBookingId > 0 ? finalizedBookingId : checkoutResult.value?.booking_id,
						booking_reference: paymentData?.metadata?.booking_reference || checkoutResult.value?.booking_reference,
					}
					showCheckoutSuccessModal.value = true
					onToast({
						title: 'Payment confirmed',
						description: 'Your card payment was confirmed and registration is complete.',
						color: 'green',
					})
				}
			} catch (error) {
				console.error('Payment status polling failed', error)
			}

			if (attempts >= maxAttempts) {
				stopPaymentStatusPolling()
				paymentProcessingMessage.value = 'Payment is still processing. You can safely refresh this page later.'
				showCheckoutSuccessModal.value = true
				onToast({
					title: 'Payment processing',
					description: 'Stripe confirmation completed. Ticket issuance may take a little longer.',
					color: 'amber',
				})
			}
		}, 3000)
	}

	return {
		// Template ref
		stripeCardMountRef,
		// Stripe state
		stripeInstance,
		stripeElements,
		stripeCardElement,
		stripeCardReady,
		stripeCardError,
		stripePaymentAttemptError,
		stripeClientSecret,
		// Helpers
		requireStripeAccountIdFromPaymentMethod,
		// Actions
		teardownStripeElements,
		ensureStripeCardMounted,
		// Polling
		isPollingPaymentStatus,
		paymentProcessingMessage,
		stopPaymentStatusPolling,
		startPaymentStatusPolling,
	}
}
