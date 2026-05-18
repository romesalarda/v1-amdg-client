<template>
	<div class="min-h-screen bg-white font-display text-deep-navy">
		<div class="relative z-10 flex min-h-screen flex-col">
			<Navbar />
			<main class="flex-1 flex flex-col">
				<!-- Full-height error: no token -->
				<div v-if="!token" class="flex flex-1 items-center justify-center px-4 py-16">
					<div class="text-center space-y-6 max-w-sm">
						<div class="mx-auto w-20 h-20 rounded-full bg-deep-navy/5 flex items-center justify-center">
							<span class="material-symbols-outlined text-4xl text-deep-navy/30">link_off</span>
						</div>
						<div class="space-y-2">
							<h1 class="text-2xl font-black uppercase tracking-tight">Invalid Link</h1>
							<p class="text-sm font-medium text-deep-navy/60">This sponsorship link is missing a token. Please use the original invite link sent to your email.</p>
						</div>
						<NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-deep-navy/20 text-sm font-black uppercase tracking-wider text-deep-navy hover:border-deep-navy/40 transition-colors">
							<span class="material-symbols-outlined text-base">home</span>
							Go Home
						</NuxtLink>
					</div>
				</div>

				<!-- Full-height loading -->
				<div v-else-if="isLoadingInvite" class="flex flex-1 items-center justify-center">
					<div class="text-center space-y-4">
						<div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-deep-navy/20 border-t-deep-navy" />
						<p class="text-[11px] font-black uppercase tracking-[0.2em] text-deep-navy/40">Loading invite…</p>
					</div>
				</div>

				<!-- Full-height success -->
				<div v-else-if="checkoutResult" class="flex flex-1 items-center justify-center px-4 py-16">
					<ExternalSponsorSuccess
						:result="checkoutResult"
						@done="navigateTo('/')"
					/>
				</div>

				<!-- Full-height invite error -->
				<div v-else-if="isInviteError || (invite && !invite.is_valid && !checkoutResult)" class="flex flex-1 items-center justify-center px-4 py-16">
					<div class="text-center space-y-6 max-w-sm">
						<div class="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
							<span class="material-symbols-outlined text-4xl text-red-400">error</span>
						</div>
						<div class="space-y-2">
							<h1 class="text-2xl font-black uppercase tracking-tight">Invite Not Valid</h1>
							<p class="text-sm font-medium text-deep-navy/60">{{ inviteErrorMessage }}</p>
						</div>
						<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
							<NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-wider hover:bg-deep-navy/80 transition-colors">
								<span class="material-symbols-outlined text-base">home</span>
								Go Home
							</NuxtLink>
							<NuxtLink :to="`/events/${id}/`" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-deep-navy/20 text-sm font-black uppercase tracking-wider text-deep-navy hover:border-deep-navy/40 transition-colors">
								<span class="material-symbols-outlined text-base">event</span>
								View Event
							</NuxtLink>
						</div>
					</div>
				</div>

				<!-- Stepper content -->
				<div v-else-if="invite" class="flex-1 py-10 px-4">
				<div class="mx-auto w-full max-w-2xl">

					<div class="mb-8 text-center space-y-1">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40">Sponsorship Checkout</p>
						<h1 class="text-3xl font-black uppercase tracking-tight leading-tight">
							{{ invite.event_title || invite.event_name || 'Event' }}
						</h1>
					</div>

						<UStepper
							:model-value="activeStep"
							:items="(steps as unknown as any[])"
							:connector-width="64"
							class="mb-10"
							@update:model-value="val => activeStep = val"
						/>

						<!-- Step panels -->
						<div class="min-h-[300px]">
							<ExternalSponsorInviteStep
								v-if="activeStep === 0"
								:invite="invite"
								:has-org="inviteHasOrg"
								:organisation-name="checkoutForm.organisationName"
								:sponsor-name="checkoutForm.sponsorName"
								@update:organisation-name="checkoutForm.organisationName = $event"
								@update:sponsor-name="checkoutForm.sponsorName = $event"
							/>

							<ExternalSponsorPackageStep
								v-else-if="activeStep === 1"
								:styled-packages="styledPackages"
								:payment-methods="paymentMethods"
								:selected-package-id="checkoutForm.packageId"
								:selected-payment-method-id="checkoutForm.paymentMethodId"
								:is-loading-packages="isLoadingPackages"
								:is-loading-payment-methods="isLoadingPaymentMethods"
								@update:selected-package-id="checkoutForm.packageId = $event"
								@update:selected-payment-method-id="checkoutForm.paymentMethodId = $event"
							/>

							<ExternalSponsorReviewStep
								v-else-if="activeStep === 2"
								:selected-package="selectedPackage"
								:selected-package-amount="selectedPackageAmount"
								:selected-payment-method="selectedPaymentMethod"
								:organisation-name="checkoutForm.organisationName"
								:sponsor-name="checkoutForm.sponsorName"
								:is-stripe-method="isStripeMethod"
								:stripe-card-error="stripeCardError"
								:stripe-payment-attempt-error="stripePaymentAttemptError"
								@stripe-mount-ready="onStripeMountReady"
							/>
						</div>

						<!-- Navigation buttons -->
						<div class="mt-8 flex items-center justify-between">
							<button
								v-if="activeStep > 0"
								type="button"
								class="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-deep-navy/20 text-sm font-black uppercase tracking-wider text-deep-navy hover:border-deep-navy/40 transition-colors"
								@click="goBack"
							>
								<span class="material-symbols-outlined text-base">chevron_left</span>
								Back
							</button>
							<div v-else />

							<button
								v-if="activeStep < steps.length - 1"
								type="button"
								:disabled="!canGoNext()"
								class="flex items-center gap-2 px-6 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deep-navy/80 transition-colors"
								@click="goNext"
							>
								Next
								<span class="material-symbols-outlined text-base">chevron_right</span>
							</button>

							<button
								v-else
								type="button"
								:disabled="!canSubmit || isCheckingOut || isConfirmingStripePayment"
								class="flex items-center gap-2 px-6 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deep-navy/80 transition-colors"
								@click="submitCheckout"
							>
								<span
									v-if="isCheckingOut || isConfirmingStripePayment"
									class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
								/>
								<template v-else>
									Confirm Sponsorship
									<span class="material-symbols-outlined text-base">check</span>
								</template>
							</button>
						</div>
				</div>
				</div>
			</main>
			<Footer />
		</div>
	</div>
</template>

<script lang="ts" setup>
import Navbar from '~/components/common/Navbar.vue'
import Footer from '~/components/common/Footer.vue'
import UStepper from '~/components/UStepper.vue'
import ExternalSponsorInviteStep from '~/components/communities/sponsors/ExternalSponsorInviteStep.vue'
import ExternalSponsorPackageStep from '~/components/communities/sponsors/ExternalSponsorPackageStep.vue'
import ExternalSponsorReviewStep from '~/components/communities/sponsors/ExternalSponsorReviewStep.vue'
import ExternalSponsorSuccess from '~/components/communities/sponsors/ExternalSponsorSuccess.vue'
import { useTokenSponsorFlow } from '~/composables/communities/sponsors/useTokenSponsorFlow'

definePageMeta({ middleware: 'auth', layout: false })

const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const id = computed(() => String(route.params.id || ''))

function onStripeMountReady(el: HTMLElement) {
	stripeCardMountRef.value = el
}

const {
	activeStep,
	checkoutForm,
	checkoutResult,
	steps,
	invite,
	isLoadingInvite,
	isInviteError,
	inviteError,
	inviteHasOrg,
	styledPackages,
	paymentMethods,
	isLoadingPackages,
	isLoadingPaymentMethods,
	selectedPackage,
	selectedPaymentMethod,
	selectedPackageAmount,
	canGoNext,
	goNext,
	goBack,
	canSubmit,
	isCheckingOut,
	submitCheckout,
	stripeCardMountRef,
	stripeCardError,
	stripePaymentAttemptError,
	isConfirmingStripePayment,
	isStripeMethod,
} = useTokenSponsorFlow(token, id)

const inviteErrorMessage = computed(() => {
	if (!isInviteError.value) {
		// invite loaded but is no longer valid
		if (invite.value?.accepted) return 'This invite has already been accepted.'
		return 'This invite has expired or been declined.'
	}
	// determine message from HTTP status embedded in thrown error object
	const status = (inviteError.value as any)?.status ?? (inviteError.value as any)?.statusCode
	if (status === 400) return 'This invite link is invalid. Please check the URL and try again.'
	if (status === 404) return 'This invite could not be found. It may have been removed.'
	return 'There was a problem loading this invite. Please check the link and try again.'
})
</script>
