<template>
	<div class="min-h-screen bg-mist-blue">
		<div class="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-6">
			<section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout for {{ selectedAttendeeLabel }}</p>
						<h1 class="mt-1 text-2xl font-black text-deep-navy">Checkout</h1>
						<p class="mt-1 text-sm text-deep-navy/65">Choose payment method and place your order.</p>
						<p class="mt-1 text-[11px] text-deep-navy/45">Booking ref {{ bookingReference }}</p>
					</div>
					<div class="flex items-center gap-2">
						<NuxtLink
							:to="bookingWorkspaceHref"
							class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
						>
							Booking
						</NuxtLink>
						<NuxtLink
							:to="cartHref"
							class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
						>
							Back to Cart
						</NuxtLink>
					</div>
				</div>
			</section>

			<section v-if="!order" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				No draft cart found. Add items before checkout.
			</section>

			<section v-else class="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div class="space-y-4 lg:col-span-8">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Order items</p>
						<div class="mt-3 space-y-2">
							<article
								v-for="item in checkoutDisplayItems"
								:key="item.id"
								class="rounded-xl border border-deep-navy/10 bg-mist-blue/60 p-3"
							>
								<div class="flex items-start gap-3">
									<img
										:src="item.imageUrl"
										:alt="item.title"
										class="h-14 w-14 rounded-lg border border-deep-navy/10 bg-white object-cover"
									>
									<div class="min-w-0 flex-1">
										<p class="text-xs font-black text-deep-navy">{{ item.title }}</p>
										<p class="text-[11px] text-deep-navy/65">{{ item.subtitle }}</p>
										<p class="text-[11px] text-deep-navy/65">Qty {{ item.quantity }}</p>
									</div>
									<div class="text-right">
										<p class="text-[11px] text-deep-navy/65">Unit {{ item.unitPrice }}</p>
										<p class="text-xs font-black text-deep-navy">{{ item.totalPrice}}</p>
									</div>
								</div>
							</article>
						</div>
					</article>

					<article
						v-if="isCheckoutLocked"
						class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
					>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Checkout unavailable</p>
						<p class="mt-2 text-sm text-amber-900">
							This order is {{ order?.status }}. Checkout is only available for draft orders.
						</p>
					</article>

					<article
						v-if="paymentSuccessMessage"
						class="rounded-2xl border border-green-200 bg-green-50 p-4"
					>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">Payment successful</p>
						<p class="mt-2 text-sm font-semibold text-green-900">{{ paymentSuccessMessage }}</p>
					</article>

					<article v-if="!isCheckoutLocked" class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Payment methods</p>

						<div v-if="paymentMethodsQuery.isLoading.value" class="mt-3 text-sm text-deep-navy/65">Loading payment methods...</div>

						<div v-else-if="paymentMethods.length === 0" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
							No active payment methods are configured for this event.
						</div>

						<div v-else class="mt-3 space-y-2">
							<label
								v-for="method in paymentMethods"
								:key="method.id"
								class="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3"
								:class="selectedPaymentMethodId === method.id ? 'border-deep-navy bg-mist-blue' : 'border-deep-navy/10 bg-white hover:border-blue-300'"
							>
								<input v-model="selectedPaymentMethodId" :value="method.id" type="radio" class="mt-1">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-black text-deep-navy">{{ method.title }}</p>
									<p class="text-xs text-deep-navy/65">{{ method.method_type.replace('_', ' ') }}</p>
									<p
										v-if="method.method_type === 'BANK_TRANSFER' && method.provided_details"
										class="mt-2 rounded border border-blue-200 bg-blue-50 px-2 py-2 text-xs text-blue-800"
									>
										Bank details are available after checkout confirmation.
									</p>
								</div>
							</label>
						</div>

						<div
							v-if="isStripeMethod"
							class="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4"
						>
							<p class="text-xs font-black uppercase tracking-wide text-blue-900">Card payment</p>
							<p class="mt-1 text-xs text-blue-900/85">Your card details are handled by Stripe and never stored on our servers.</p>
							<div class="mt-3 rounded-lg border border-blue-200 bg-white px-3 py-3">
								<div ref="stripeCardMountRef" class="min-h-[24px]" />
							</div>
							<p v-if="stripeCardError" class="mt-2 text-xs text-red-700">{{ stripeCardError }}</p>
						</div>

						<div
							v-if="isBankTransferMethod"
							class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
						>
							<p class="text-xs font-black uppercase tracking-wide text-amber-900">Bank transfer details</p>
							<p class="mt-1 text-xs text-amber-900/80">Pay using the account below. Final transfer reference is generated after checkout submission.</p>

							<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
								<div class="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-900">
									<p class="font-black">Account name</p>
									<p class="mt-1 break-all">{{ bankDetails.account_name || 'Not provided' }}</p>
								</div>
								<div class="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-900">
									<p class="font-black">Sort code</p>
									<p class="mt-1 break-all">{{ bankDetails.sort_code || 'Not provided' }}</p>
								</div>
								<div class="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-900">
									<p class="font-black">Account number</p>
									<p class="mt-1 break-all">{{ bankDetails.account_number || 'Not provided' }}</p>
								</div>
							</div>
						</div>
					</article>

					<article v-if="checkoutResult" class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout response</p>
						<p class="mt-2 text-sm text-deep-navy/80">Order {{ checkoutResult.order_reference || checkoutResult.order_id }}</p>
						<p class="mt-1 text-sm text-deep-navy/80">Status {{ checkoutResult.status || 'pending' }}</p>

						<div v-if="checkoutResult.stripe_client_secret" class="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-xs text-blue-900">
							Stripe payment intent created. Complete the inline card step to finish payment.
						</div>

						<div v-if="checkoutResult.bank_transfer_reference" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
							<p class="font-black">Reference: {{ checkoutResult.bank_transfer_reference }}</p>
							<p class="mt-1">{{ checkoutResult.bank_transfer_instructions || 'Use this reference when making the transfer.' }}</p>
						</div>

						<div v-if="checkoutResult.message" class="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-900">
							{{ checkoutResult.message }}
						</div>
					</article>
				</div>

				<aside class="space-y-3 lg:col-span-4">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Order summary</p>
						<dl class="mt-3 space-y-2 text-sm text-deep-navy/85">
							<div class="flex items-center justify-between">
								<dt>Items</dt>
								<dd class="font-semibold">{{ itemCount }}</dd>
							</div>
							<div class="flex items-center justify-between">
								<dt>Status</dt>
								<dd class="font-semibold capitalize">{{ order.status }}</dd>
							</div>
							<div class="flex items-center justify-between border-t border-deep-navy/10 pt-2">
								<dt class="font-black">Total</dt>
								<dd class="font-black">{{ order.total_amount }}</dd>
							</div>
						</dl>

						<button
							type="button"
							class="mt-4 w-full rounded-xl bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							:disabled="!canSubmitCheckout || checkoutMutation.isPending.value || isConfirmingStripePayment"
							@click="submitCheckout"
						>
							{{ ctaLabel }}
						</button>
					</article>
				</aside>
			</section>
		</div>

		<Transition
			enter-active-class="transition duration-300 ease-out"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition duration-200 ease-in"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="showSuccessModal"
				class="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/55 px-4 backdrop-blur-sm"
			>
				<div class="relative w-full max-w-md overflow-hidden rounded-3xl border border-green-200 bg-white p-6 shadow-2xl">
					<div class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 pt-3">
						<span class="h-2 w-2 rounded-full bg-green-400 animate-bounce" />
						<span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
						<span class="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
					</div>

					<div class="mt-4 text-center">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">Purchase complete</p>
						<h3 class="mt-2 text-2xl font-black text-deep-navy">{{ successModalTitle }}</h3>
						<p class="mt-2 text-sm text-deep-navy/75">{{ successModalMessage }}</p>
					</div>

					<div class="mt-5 flex justify-center">
						<button
							type="button"
							class="rounded-xl bg-deep-navy px-5 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
							@click="showSuccessModal = false"
						>
							Awesome
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import type { PaymentMethod } from '~/api/types.gen'
import { useBookingShop } from '~/composables/booking/useBookingShop'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import { useCheckoutProductOrder } from '~/composables/resources/products/productOrders'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { formatMoney } from '~/utils/money'

definePageMeta({
	layout: 'booking',
})

const toast = useToast()

const {
	store,
	eventId,
	bookingReference,
	attendees,
	selectedAttendeeId,
	eventNumericId,
	activeOrderId,
	activeOrderQuery,
} = useBookingShop()

const order = computed(() => activeOrderQuery.data.value?.data || null)
const lockedCheckoutStatuses = new Set(['pending', 'processing', 'completed'])
const isCheckoutLocked = computed(() => lockedCheckoutStatuses.has(String(order.value?.status || '').toLowerCase()))
const itemCount = computed(() => {
	const rows = order.value?.order_items || []
	return rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
})

const checkoutDisplayItems = computed(() => {
	const rows = order.value?.order_items || []
	return rows.map((item: any) => {
		const details = item?.product_variant_details || {}
		const color = typeof details?.color === 'string' ? details.color.trim() : ''
		const size = typeof details?.size === 'string' ? details.size.trim() : ''
		const subtitle = [color, size].filter(Boolean).join(' · ') || 'Variant details unavailable'
		const imageUrl = typeof details?.image_url === 'string' && details.image_url
			? details.image_url
			: 'https://placehold.co/120x120?text=Variant'

		return {
			id: item.id,
			title: details?.product_title || `Variant #${item.product_variant || '-'}`,
			subtitle,
			imageUrl,
			quantity: Number(item.quantity || 0),
			unitPrice: item.unit_price,
			totalPrice: item.total_price,
		}
	})
})

const currencyCode = computed(() => 'GBP')

const paymentMethodsQuery = usePaymentMethods(
	computed(() => {
		if (!eventNumericId.value) return undefined
		return {
			event: eventId.value,
			is_active: true,
			page_size: 20,
		}
	})
)

const paymentMethods = computed<PaymentMethod[]>(() => {
	const rows = paymentMethodsQuery.data.value?.data?.results
	return Array.isArray(rows) ? (rows as PaymentMethod[]) : []
})

const selectedPaymentMethod = computed(() => {
	if (!selectedPaymentMethodId.value) return null
	return paymentMethods.value.find((item) => item.id === selectedPaymentMethodId.value) || null
})

const isStripeMethod = computed(() => selectedPaymentMethod.value?.method_type === 'STRIPE')
const isBankTransferMethod = computed(() => selectedPaymentMethod.value?.method_type === 'BANK_TRANSFER')

const bankDetails = computed(() => {
	const details = selectedPaymentMethod.value?.provided_details as Record<string, unknown> | undefined
	return {
		account_name: typeof details?.account_name === 'string' ? details.account_name : '',
		sort_code: typeof details?.sort_code === 'string' ? details.sort_code : '',
		account_number: typeof details?.account_number === 'string' ? details.account_number : '',
	}
})

watch(
	paymentMethods,
	(rows) => {
		if (!rows.length) {
			store.setSelectedPaymentMethod(null)
			return
		}

		if (!store.selectedPaymentMethodId || !rows.find((item) => item.id === store.selectedPaymentMethodId)) {
			store.setSelectedPaymentMethod(rows[0].id)
		}
	},
	{ immediate: true }
)

const selectedPaymentMethodId = computed({
	get: () => store.selectedPaymentMethodId,
	set: (next: number | null) => store.setSelectedPaymentMethod(next),
})

const checkoutMutation = useCheckoutProductOrder()
const checkoutResult = ref<Record<string, any> | null>(null)
const paymentSuccessMessage = ref('')
const stripeConfigQuery = useStripeConfig()

const stripeCardMountRef = ref<HTMLElement | null>(null)
const stripeInstance = ref<Stripe | null>(null)
const stripeElements = ref<StripeElements | null>(null)
const stripeCardElement = ref<StripeCardElement | null>(null)
const stripeCardReady = ref(false)
const stripeCardError = ref('')
const isConfirmingStripePayment = ref(false)
const showSuccessModal = ref(false)
const successModalTitle = ref('Payment successful')
const successModalMessage = ref('Your purchase has been confirmed.')

const canSubmitCheckout = computed(() => {
	if (isCheckoutLocked.value) return false
	const baseReady = !!activeOrderId.value && !!selectedPaymentMethodId.value && itemCount.value > 0
	if (!baseReady) return false
	if (isStripeMethod.value) return stripeCardReady.value
	return true
})

const ctaLabel = computed(() => {
	if (checkoutMutation.isPending.value) return 'Initializing payment...'
	if (isConfirmingStripePayment.value) return 'Confirming card payment...'
	if (isStripeMethod.value) return 'Pay now'
	return 'Checkout now'
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isPurchaseSuccessfulStatus = (status: string) => {
	return status === 'processing' || status === 'completed'
}

const openSuccessModal = (title: string, message: string) => {
	successModalTitle.value = title
	successModalMessage.value = message
	showSuccessModal.value = true
}

const waitForOrderStatusAfterStripePayment = async () => {
	const maxAttempts = 8
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		await activeOrderQuery.refetch()
		const latestStatus = String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
		if (latestStatus && latestStatus !== 'pending') return latestStatus
		if (attempt < maxAttempts - 1) {
			await sleep(1200)
		}
	}

	return String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
}

const cartHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/cart`)
const bookingWorkspaceHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}`)

const selectedAttendeeLabel = computed(() => {
	const attendee = attendees.value.find((item) => item.id === selectedAttendeeId.value)
	if (!attendee) return 'selected attendee'
	return attendee.name || attendee.display_id || 'selected attendee'
})

watch(
	isCheckoutLocked,
	(locked) => {
		if (!locked) return
		void navigateTo(cartHref.value)
	},
	{ immediate: true }
)

const stripePublishableKey = computed(() => {
	return String(stripeConfigQuery.data.value?.data?.publishable_key || '').trim()
})

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
	if (!isStripeMethod.value) return
	if (stripeCardElement.value) return

	const key = stripePublishableKey.value
	if (!key) {
		stripeCardError.value = 'Stripe is not configured yet for this event.'
		return
	}

	await nextTick()
	if (!stripeCardMountRef.value) return

	const stripe = await loadStripe(key)
	if (!stripe) {
		stripeCardError.value = 'Unable to initialize Stripe card form.'
		return
	}

	stripeInstance.value = stripe
	stripeElements.value = stripe.elements()
	stripeCardElement.value = stripeElements.value.create('card', { hidePostalCode: true })
	stripeCardElement.value.mount(stripeCardMountRef.value)
	stripeCardElement.value.on('change', (event) => {
		stripeCardError.value = event.error?.message || ''
		stripeCardReady.value = !!event.complete && !event.error
	})
}

watch(
	[isStripeMethod, stripePublishableKey],
	([stripeSelected, key], [wasStripeSelected, previousKey]) => {
		if (!stripeSelected) {
			teardownStripeElements()
			return
		}

		if (!wasStripeSelected || key !== previousKey) {
			teardownStripeElements()
		}

		void ensureStripeCardMounted()
	},
	{ immediate: true }
)

onBeforeUnmount(() => {
	teardownStripeElements()
})

async function submitCheckout() {
	if (!canSubmitCheckout.value || !activeOrderId.value || !selectedPaymentMethodId.value) return
	if (isStripeMethod.value) {
		await ensureStripeCardMounted()
		if (!stripeCardElement.value || !stripeInstance.value) {
			toast.add({
				title: 'Stripe unavailable',
				description: stripeCardError.value || 'Card form could not be initialized.',
				color: 'red',
				timeout: 4500,
			})
			return
		}
	}

	try {
		paymentSuccessMessage.value = ''
		let checkoutToastTitle = 'Checkout submitted'
		let checkoutToastDescription = isStripeMethod.value
			? 'Payment has been initialized and card confirmation was attempted.'
			: 'Payment has been initialized for this order.'
		let checkoutToastColor: 'green' | 'amber' = 'green'

		const response = await checkoutMutation.mutateAsync({
			orderId: activeOrderId.value,
			body: {
				payment_method_id: selectedPaymentMethodId.value,
			},
		})

		checkoutResult.value = (response.data || null) as Record<string, any> | null

		if (isStripeMethod.value) {
			const clientSecret = checkoutResult.value?.stripe_client_secret
			if (!clientSecret) {
				const backendStatus = String(checkoutResult.value?.status || 'unknown')
				const selectedTitle = selectedPaymentMethod.value?.title || 'Selected method'
				toast.add({
					title: 'Unable to start card payment',
					description: `${selectedTitle} returned status "${backendStatus}" without Stripe client secret. Verify this method is configured as STRIPE and try again.`,
					color: 'red',
					timeout: 5000,
				})
				return
			}

			await ensureStripeCardMounted()
			if (!stripeInstance.value || !stripeCardElement.value) {
				toast.add({
					title: 'Card form unavailable',
					description: stripeCardError.value || 'Unable to initialize the Stripe card form. Please refresh and try again.',
					color: 'red',
					timeout: 5000,
				})
				return
			}

			isConfirmingStripePayment.value = true
			const result = await stripeInstance.value.confirmCardPayment(clientSecret, {
				payment_method: {
					card: stripeCardElement.value,
				},
			})
			isConfirmingStripePayment.value = false

			if (result.error) {
				stripeCardError.value = result.error.message || 'Card payment could not be confirmed.'
				toast.add({
					title: 'Card payment failed',
					description: stripeCardError.value,
					color: 'red',
					timeout: 4500,
				})
				return
			}

			const statusValue = result.paymentIntent?.status || 'processing'
			toast.add({
				title: statusValue === 'succeeded' ? 'Payment confirmed' : 'Payment processing',
				description: statusValue === 'succeeded'
					? 'Card payment completed successfully.'
					: 'Card payment is being processed by Stripe.',
				color: statusValue === 'succeeded' ? 'green' : 'amber',
				timeout: 2600,
			})

			const orderStatus = await waitForOrderStatusAfterStripePayment()
			if (isPurchaseSuccessfulStatus(orderStatus)) {
				checkoutToastTitle = 'Order payment recorded'
				checkoutToastDescription = 'Your order moved to processing after Stripe confirmation.'
				checkoutToastColor = 'green'
				paymentSuccessMessage.value = 'Your card payment was confirmed and your order is now being processed.'
				openSuccessModal(
					'Payment received',
					'Your order is now being processed. You can safely close this page or continue browsing.'
				)
			} else {
				checkoutToastTitle = 'Payment confirmed, awaiting sync'
				checkoutToastDescription = 'Stripe confirmed your payment. Order status update may take a few seconds.'
				checkoutToastColor = 'amber'
			}
		} else {
			await activeOrderQuery.refetch()
			const orderStatus = String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
			if (isPurchaseSuccessfulStatus(orderStatus)) {
				openSuccessModal(
					'Order confirmed',
					'Your checkout was successful and your order has been recorded.'
				)
			}
		}

		toast.add({
			title: checkoutToastTitle,
			description: checkoutToastDescription,
			color: checkoutToastColor,
			timeout: 2200,
		})
	} catch (error: unknown) {
		isConfirmingStripePayment.value = false
		const description = error instanceof Error ? error.message : 'Unable to complete checkout.'
		toast.add({
			title: 'Checkout failed',
			description,
			color: 'red',
			timeout: 4500,
		})
	}
}
</script>