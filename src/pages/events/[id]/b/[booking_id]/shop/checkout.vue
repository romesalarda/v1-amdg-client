<template>
	<div class="min-h-screen bg-mist-blue">
		<div class="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-6">
			<section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Booking {{ bookingReference }}</p>
						<h1 class="mt-1 text-2xl font-black text-deep-navy">Checkout</h1>
						<p class="mt-1 text-sm text-deep-navy/65">Choose payment method and place your order.</p>
					</div>
					<NuxtLink
						:to="cartHref"
						class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
					>
						Back to Cart
					</NuxtLink>
				</div>
			</section>

			<section v-if="!order" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				No draft cart found. Add items before checkout.
			</section>

			<section v-else class="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div class="space-y-4 lg:col-span-8">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
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
					</article>

					<article v-if="checkoutResult" class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout response</p>
						<p class="mt-2 text-sm text-deep-navy/80">Order {{ checkoutResult.order_reference || checkoutResult.order_id }}</p>
						<p class="mt-1 text-sm text-deep-navy/80">Status {{ checkoutResult.status || 'pending' }}</p>

						<div v-if="checkoutResult.stripe_client_secret" class="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-xs text-blue-900">
							Stripe payment intent created. Complete payment with the provided client secret in your payment flow.
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
								<dd class="font-black">{{ formatMoney(order.total_amount, currencyCode) }}</dd>
							</div>
						</dl>

						<button
							type="button"
							class="mt-4 w-full rounded-xl bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							:disabled="!canSubmitCheckout || checkoutMutation.isPending.value"
							@click="submitCheckout"
						>
							{{ checkoutMutation.isPending.value ? 'Processing...' : 'Checkout now' }}
						</button>
					</article>
				</aside>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '~/api/types.gen'
import { useBookingShop } from '~/composables/booking/useBookingShop'
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
	eventNumericId,
	activeOrderId,
	activeOrderQuery,
} = useBookingShop()

const order = computed(() => activeOrderQuery.data.value?.data || null)
const itemCount = computed(() => {
	const rows = order.value?.order_items || []
	return rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
})

const currencyCode = computed(() => 'GBP')

const paymentMethodsQuery = usePaymentMethods(
	computed(() => {
		if (!eventNumericId.value) return undefined
		return {
			event: eventNumericId.value,
			is_active: true,
			page_size: 20,
		}
	})
)

const paymentMethods = computed<PaymentMethod[]>(() => {
	const rows = paymentMethodsQuery.data.value?.data?.results
	return Array.isArray(rows) ? (rows as PaymentMethod[]) : []
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

const canSubmitCheckout = computed(() => {
	return !!activeOrderId.value && !!selectedPaymentMethodId.value && itemCount.value > 0
})

const cartHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/cart`)

async function submitCheckout() {
	if (!canSubmitCheckout.value || !activeOrderId.value || !selectedPaymentMethodId.value) return

	try {
		const response = await checkoutMutation.mutateAsync({
			orderId: activeOrderId.value,
			body: {
				payment_method_id: selectedPaymentMethodId.value,
			},
		})

		checkoutResult.value = (response.data || null) as Record<string, any> | null
		await activeOrderQuery.refetch()

		toast.add({
			title: 'Checkout submitted',
			description: 'Payment has been initialized for this order.',
			color: 'green',
			timeout: 2200,
		})
	} catch (error: unknown) {
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