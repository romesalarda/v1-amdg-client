<template>
	<div class="space-y-6">
		<!-- Summary table -->
		<div class="rounded-2xl border-2 border-deep-navy/10 divide-y-2 divide-deep-navy/10 overflow-hidden">
			<div class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Package</span>
				<span class="text-sm font-black text-deep-navy text-right max-w-[60%]">{{ selectedPackage?.package_name ?? '—' }}</span>
			</div>
			<div class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Amount</span>
				<span class="text-sm font-black text-deep-navy">{{ selectedPackageAmount }}</span>
			</div>
			<div class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Payment</span>
				<span class="text-sm font-black text-deep-navy text-right max-w-[60%]">{{ selectedPaymentMethod?.title ?? '—' }}</span>
			</div>
			<div v-if="organisationName" class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Organisation</span>
				<span class="text-sm font-black text-deep-navy text-right max-w-[60%]">{{ organisationName }}</span>
			</div>
			<div v-if="sponsorName" class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Display Name</span>
				<span class="text-sm font-black text-deep-navy text-right max-w-[60%]">{{ sponsorName }}</span>
			</div>
		</div>

		<!-- Stripe card form -->
		<div v-if="isStripeMethod">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40 mb-3">Card Details</p>
			<div
				ref="stripeMount"
				class="px-4 py-4 border-2 border-deep-navy/30 rounded-xl bg-white"
			/>
			<p v-if="stripeCardError" class="mt-2 text-sm text-red-600 font-bold">{{ stripeCardError }}</p>
			<p v-if="stripePaymentAttemptError" class="mt-2 text-sm text-red-600 font-bold">{{ stripePaymentAttemptError }}</p>
		</div>

		<!-- Bank transfer notice -->
		<div v-else-if="selectedPaymentMethod?.method_type === 'BANK_TRANSFER'" class="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 space-y-1">
			<p class="text-[11px] font-black uppercase tracking-wider text-amber-700">Bank Transfer</p>
			<p class="text-sm text-amber-800 font-medium">
				After clicking Confirm, you will receive bank transfer instructions to complete payment.
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { TokenFlowPaymentMethod } from '~/composables/communities/sponsors/useTokenSponsorFlow'

const props = defineProps<{
	selectedPackage: { package_name: string } | null
	selectedPackageAmount: string
	selectedPaymentMethod: TokenFlowPaymentMethod | null
	organisationName: string
	sponsorName: string
	isStripeMethod: boolean
	stripeCardError: string
	stripePaymentAttemptError: string
}>()

const emit = defineEmits<{
	(e: 'stripe-mount-ready', el: HTMLElement): void
}>()

const stripeMount = ref<HTMLElement | null>(null)

watch(stripeMount, (el) => {
	if (el) emit('stripe-mount-ready', el)
})
</script>
