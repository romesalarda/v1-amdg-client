<template>
	<div class="border-2 border-deep-navy/10 rounded-2xl p-8 space-y-6 bg-white">
		<!-- Header + step navigation -->
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div>
				<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Sponsor Flow</p>
				<h2 class="text-2xl font-black text-deep-navy uppercase tracking-tight">Sponsor An Event</h2>
				<p class="text-sm text-deep-navy/60 font-medium">Select the event, pick a package and payment method, then confirm checkout.</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="px-4 py-2 rounded-xl border-2 border-deep-navy text-deep-navy text-xs font-black uppercase tracking-wider"
					@click="activeStep = Math.max(1, activeStep - 1)"
					:disabled="activeStep === 1"
				>
					Back
				</button>
				<button
					type="button"
					:class="canGoNextStep() ? 'px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-black uppercase tracking-wider' : 'px-4 py-2 rounded-xl bg-gray-300 text-gray-500 text-xs font-black uppercase tracking-wider'"
					@click="goNextStep"
					:disabled="!canGoNextStep()"
				>
					Next
				</button>
			</div>
		</div>

		<!-- Step indicator -->
		<div class="grid grid-cols-3 gap-3">
			<div
				v-for="step in steps"
				:key="step.id"
				class="flex items-center gap-3 p-3 rounded-xl border-2"
				:class="activeStep >= step.id ? 'border-deep-navy bg-deep-navy text-white' : 'border-deep-navy/20 text-deep-navy'"
			>
				<div
					class="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-wider"
					:class="activeStep >= step.id ? 'bg-white/20 text-white' : 'bg-deep-navy/5 text-deep-navy'"
				>
					{{ step.id }}
				</div>
				<div>
					<p class="text-xs font-black uppercase tracking-wider">{{ step.label }}</p>
					<p class="text-[10px] uppercase tracking-wider opacity-80">{{ step.hint }}</p>
				</div>
			</div>
		</div>

		<!-- Step 1: Event selection -->
		<div v-if="activeStep === 1" class="space-y-4">
			<div class="flex flex-col md:flex-row gap-3">
				<div class="flex-1">
					<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Search Events</label>
					<input
						v-model="eventSearch"
						type="text"
						placeholder="Search by title, code, or description"
						class="w-full px-4 py-3 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
					/>
				</div>
				<div class="flex flex-col justify-end">
					<button
						type="button"
						class="px-4 py-3 rounded-xl border-2 border-deep-navy/30 text-deep-navy text-xs font-black uppercase tracking-wider"
						@click="selectFirstEvent"
					>
						Auto Select
					</button>
				</div>
			</div>

			<div v-if="isLoadingSponsorableEvents" class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<USkeleton class="h-20 w-full" />
				<USkeleton class="h-20 w-full" />
			</div>
			<div v-else-if="sponsorableEvents.length === 0" class="text-center py-8 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
				<p class="text-sm font-bold text-deep-navy/60">No sponsorable events found for your current filters.</p>
			</div>
			<div v-else class="space-y-3">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<button
						v-for="event in sponsorableEvents"
						:key="event.event_id"
						type="button"
						@click="handleSelectEvent(event)"
						class="text-left p-4 border-2 rounded-xl transition-all"
						:class="selectedEventId === event.event_id
							? 'border-deep-navy bg-deep-navy text-white'
							: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
					>
						<p class="text-sm font-black uppercase tracking-tight">{{ event.title }}</p>
						<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ formatDateSafe(event.start_datetime) }}</p>
						<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ event.active_sponsorship_packages_count }} active packages</p>
					</button>
				</div>

				<div class="flex items-center justify-between pt-2">
					<p class="text-xs font-bold text-deep-navy/55 uppercase tracking-wider">
						Page {{ eventPage }} • {{ sponsorableEventsCount }} results
					</p>
					<div class="flex items-center gap-2">
						<button
							type="button"
							@click="eventPage = Math.max(1, eventPage - 1)"
							:disabled="!hasPrevEventsPage"
							class="px-3 py-2 border-2 border-deep-navy/30 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider disabled:opacity-40"
						>
							Prev
						</button>
						<button
							type="button"
							@click="eventPage = eventPage + 1"
							:disabled="!hasNextEventsPage"
							class="px-3 py-2 border-2 border-deep-navy/30 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider disabled:opacity-40"
						>
							Next
						</button>
					</div>
				</div>
			</div>

			<!-- Payment history panel (shown on step 1 when event is selected) -->
			<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-4 bg-deep-navy/5">
				<h3 class="text-lg font-black text-deep-navy uppercase tracking-tight">Sponsorship Payments</h3>
				<div v-if="!selectedEvent" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
					<p class="text-sm font-bold text-deep-navy/60">Select an event to see payment history.</p>
				</div>
				<div v-else-if="isLoadingPaymentHistory" class="space-y-3">
					<USkeleton class="h-16 w-full" />
					<USkeleton class="h-16 w-full" />
				</div>
				<div v-else-if="!paymentHistoryData" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
					<p class="text-sm font-bold text-deep-navy/60">No sponsorship payment data available yet.</p>
				</div>
				<div v-else class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Total Payments</p>
							<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryCount }}</p>
						</div>
						<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Completed Amount</p>
							<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryAmount }}</p>
						</div>
						<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Pending</p>
							<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryPending }}</p>
						</div>
					</div>

					<div v-if="paymentTimeline.length === 0" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
						<p class="text-sm font-bold text-deep-navy/60">No payment timeline entries yet.</p>
					</div>
					<div v-else class="space-y-3">
						<div v-for="item in paymentTimeline" :key="item.payment_id" class="p-4 border-2 border-deep-navy/10 rounded-xl bg-white">
							<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<div>
									<p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ item.payment_reference }}</p>
									<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
										{{ formatMethodType(item.method_type || 'UNKNOWN') }} • {{ formatDateSafe(item.created_at) }}
									</p>
								</div>
								<div class="flex items-center gap-2">
									<span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider">{{ item.status }}</span>
									<span class="text-xs font-black text-deep-navy uppercase tracking-wider">{{ formatMoney(item.amount, item.currency) }}</span>
								</div>
							</div>
							<div v-if="item.status === 'PENDING'">
								<p class="text-xs font-bold uppercase tracking-wider text-deep-navy/70 mt-2">Payment Instructions:</p>
								<div v-if="item.method_type === 'STRIPE'">
									<p class="text-xs font-medium text-deep-navy/70">As this is via stripe, no payment actions are required</p>
								</div>
								<div v-else>
									<pre class="mt-1 text-xs text-deep-navy/70 whitespace-pre-wrap">{{ item.method_provided_details }}</pre>
									<p class="text-deep-navy/80">Ensure you use this bank transfer reference in your transfer reference otherwise your payment may not be processed.</p>
									<p class="text-deep-navy">Bank transfer reference: <b>{{ item.bank_transfer_reference }}</b></p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 2: Package + payment method -->
		<div v-else-if="activeStep === 2" class="space-y-4">
			<div v-if="checkoutBlockMessage" class="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10">
				<p class="text-xs font-bold text-deep-navy uppercase tracking-wider">{{ checkoutBlockMessage }}</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Checkout Mode</label>
					<div class="grid grid-cols-2 gap-2 bg-deep-navy/5 rounded-xl p-2 border-2 border-deep-navy/10">
						<button
							type="button"
							:disabled="selectedEvent?.requires_invite_acceptance_for_checkout && acceptedInvitesCount === 0"
							:class="checkoutForm.mode === 'direct' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
							class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
							@click="checkoutForm.mode = 'direct'"
						>
							Direct
						</button>
						<button
							type="button"
							:class="checkoutForm.mode === 'token' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
							class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
							@click="checkoutForm.mode = 'token'"
						>
							Invite Token
						</button>
					</div>
				</div>

				<div>
					<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Sponsor Name (Optional)</label>
					<input
						v-model="checkoutForm.name"
						type="text"
						placeholder="Defaults to organisation title"
						class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
					/>
				</div>
			</div>

			<div v-if="checkoutForm.mode === 'token'">
				<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Invite Token</label>
				<input
					v-model="checkoutForm.inviteToken"
					type="text"
					placeholder="Paste invite token"
					class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
				/>
			</div>

			<div>
				<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Sponsorship Package</label>
				<div v-if="isLoadingPackages" class="space-y-2">
					<USkeleton class="h-16 w-full" />
					<USkeleton class="h-16 w-full" />
				</div>
				<div v-else-if="sponsorshipPackages.length === 0" class="text-sm font-bold text-deep-navy/60">
					No active packages available for this event.
				</div>
				<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<button
						v-for="pkg in sponsorshipPackages"
						:key="pkg.package_id"
						type="button"
						class="text-left p-4 border-2 rounded-xl transition-all"
						:class="checkoutForm.packageId === pkg.package_id
							? 'border-deep-navy bg-deep-navy text-white'
							: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
						@click="checkoutForm.packageId = pkg.package_id"
					>
						<p class="text-sm font-black uppercase tracking-tight">{{ pkg.package_name }}</p>
						<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">Tier {{ pkg.tier }}</p>
						<p class="mt-2 text-sm font-black">{{ formatMoney(pkg.modified_amount, pkg.base_amount_currency) }}</p>
					</button>
				</div>
			</div>

			<div>
				<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Payment Method</label>
				<div v-if="isLoadingPaymentMethods" class="space-y-2">
					<USkeleton class="h-16 w-full" />
				</div>
				<div v-else-if="paymentMethods.length === 0" class="text-sm font-bold text-deep-navy/60">
					No active payment methods found for this event.
				</div>
				<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<button
						v-for="method in paymentMethods"
						:key="method.id"
						type="button"
						class="text-left p-4 border-2 rounded-xl transition-all"
						:class="checkoutForm.paymentMethodId === method.id
							? 'border-deep-navy bg-deep-navy text-white'
							: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
						@click="checkoutForm.paymentMethodId = method.id"
					>
						<p class="text-sm font-black uppercase tracking-tight">{{ method.title }}</p>
						<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ formatMethodType(method.method_type) }}</p>
					</button>
				</div>
			</div>

			<div>
				<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Description (Optional)</label>
				<textarea
					v-model="checkoutForm.description"
					rows="3"
					placeholder="Optional note for this sponsorship"
					class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
				/>
			</div>
		</div>

		<!-- Step 3: Review + confirm -->
		<div v-else-if="activeStep === 3" class="space-y-4">
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-deep-navy/5">
				<p class="text-xs font-black uppercase tracking-wider text-deep-navy/60">Review Sponsorship</p>
				<div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Event</p>
						<p class="text-sm font-black text-deep-navy">{{ selectedEvent?.title || 'None selected' }}</p>
					</div>
					<div>
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Package</p>
						<p class="text-sm font-black text-deep-navy">{{ selectedPackage?.package_name || 'None selected' }}</p>
					</div>
					<div>
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Payment Method</p>
						<p class="text-sm font-black text-deep-navy">{{ selectedPaymentMethod?.title || 'None selected' }}</p>
					</div>
					<div>
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Amount</p>
						<p class="text-sm font-black text-deep-navy">{{ selectedPackageAmount }}</p>
					</div>
				</div>
			</div>

			<!-- Stripe card form: shown when STRIPE method selected and no result yet -->
			<div v-if="isStripeMethod && !checkoutResult" class="space-y-2">
				<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Card Details</label>
				<div
					ref="stripeCardMountRef"
					class="px-4 py-4 bg-white border-2 border-deep-navy rounded-xl"
				/>
				<p v-if="stripeCardError" class="text-xs font-bold text-red-600">{{ stripeCardError }}</p>
				<p v-if="stripePaymentAttemptError" class="text-xs font-bold text-red-600">{{ stripePaymentAttemptError }}</p>
			</div>

			<div class="flex justify-end">
				<button
					:disabled="!canCheckout || isCheckingOut || isConfirmingStripePayment || (isStripeMethod && !checkoutResult && !stripeCardReady)"
					@click="submitCheckout"
					class="px-8 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
				>
					{{ isConfirmingStripePayment ? 'Confirming card...' : isCheckingOut ? 'Initializing...' : isStripeMethod ? 'Pay Now' : 'Confirm Sponsor Checkout' }}
				</button>
			</div>

			<div v-if="checkoutResult" class="p-5 rounded-xl border-2 border-green-600/30 bg-green-500/10 space-y-2">
				<p class="text-sm font-black text-deep-navy uppercase tracking-tight">Checkout Initialized</p>
				<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Sponsor ID: {{ checkoutResult.sponsor_id }}</p>
				<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Payment Reference: {{ checkoutResult.payment_reference }}</p>
				<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Status: {{ checkoutResult.payment_status }}</p>

				<div v-if="checkoutResult.payment_method_type === 'STRIPE'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
					<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Stripe Payment Ready</p>
					<p class="mt-1 text-xs font-medium text-deep-navy/70">Client Secret: {{ checkoutResult.client_secret || 'Unavailable in response' }}</p>
					<p class="text-xs font-medium text-deep-navy/70">Payment Intent: {{ checkoutResult.payment_intent_id || 'Unavailable in response' }}</p>
				</div>

				<div v-if="checkoutResult.payment_method_type === 'BANK_TRANSFER'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
					<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Bank Transfer Instructions</p>
					<p class="mt-1 text-xs font-medium text-deep-navy/70">Reference: {{ checkoutResult.bank_transfer_reference || 'Use payment reference above' }}</p>
					<pre class="mt-2 text-xs text-deep-navy/70 whitespace-pre-wrap">{{ stringifyDetails(checkoutResult.payment_instructions) }}</pre>
				</div>

				<div class="pt-3 flex justify-end">
					<button
						type="button"
						class="px-6 py-2 rounded-xl border-2 border-deep-navy text-deep-navy text-xs font-black uppercase tracking-wider hover:bg-deep-navy hover:text-white transition-all"
						@click="handleStartNewSponsorship"
					>
						Start New Sponsorship
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSponsorFlow } from '~/composables/communities/sponsors/useSponsorFlow'
import { formatMoney } from '~/utils/money'
import { formatDate } from '~/utils/time'
import type { SponsorableEventList } from '~/api/types.gen'

const props = defineProps<{
	organisationId: string
	organisationNumericId: number | undefined
	selectedEventId: string
}>()

const emit = defineEmits<{
	(e: 'update:selectedEventId', value: string): void
}>()

// Writable local refs that sync with the page via emit
const localSelectedEventId = ref(props.selectedEventId)
const localSelectedEventSnapshot = ref<SponsorableEventList | null>(null)

watch(() => props.selectedEventId, (val) => {
	localSelectedEventId.value = val
})

watch(localSelectedEventId, (val) => {
	emit('update:selectedEventId', val)
})

const {
	eventSearch,
	eventPage,
	activeStep,
	checkoutForm,
	checkoutResult,
	steps,
	isLoadingSponsorableEvents,
	isLoadingPackages,
	isLoadingPaymentMethods,
	isLoadingPaymentHistory,
	isCheckingOut,
	sponsorableEvents,
	sponsorableEventsCount,
	hasNextEventsPage,
	hasPrevEventsPage,
	selectedEvent,
	sponsorshipPackages,
	paymentMethods,
	selectedPackage,
	selectedPaymentMethod,
	selectedPackageAmount,
	paymentHistoryData,
	paymentSummaryCount,
	paymentSummaryPending,
	paymentSummaryAmount,
	paymentTimeline,
	canCheckout,
	checkoutBlockMessage,
	canGoNextStep,
	goNextStep,
	selectEvent,
	selectFirstEvent,
	submitCheckout,
	resetFlow,
	stripeCardMountRef,
	stripeCardReady,
	stripeCardError,
	stripePaymentAttemptError,
	isConfirmingStripePayment,
	isStripeMethod,
} = useSponsorFlow(
	computed(() => props.organisationId),
	computed(() => props.organisationNumericId),
	localSelectedEventId,
	localSelectedEventSnapshot,
)

const acceptedInvitesCount = computed(() =>
	(selectedEvent.value as any)?.accepted_invites_count ?? 0,
)

function handleStartNewSponsorship() {
	resetFlow()
	activeStep.value = 1
}

function handleSelectEvent(event: SponsorableEventList) {
	selectEvent(event)
}

function formatDateSafe(value?: string | null) {
	if (!value) return 'Unknown date'
	return formatDate(value)
}

function formatMethodType(methodType: string) {
	if (methodType === 'BANK_TRANSFER') return 'Bank Transfer'
	if (methodType === 'STRIPE') return 'Stripe'
	if (methodType === 'CASH') return 'Cash'
	return methodType
}

function stringifyDetails(value: unknown) {
	if (!value) return 'No additional instructions returned.'
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}
</script>
