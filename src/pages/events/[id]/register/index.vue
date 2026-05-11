<template>
	<div class="min-h-screen bg-slate-100 text-slate-900" :class="{ 'checkout-lock': isCheckoutUiBusy }">
<RegisterHero
		:hero-image-src="heroImageSrc"
		:active-step-index="activeStepIndex"
		:steps-length="steps.length"
		:event-title="event?.title || 'Event Registration'"
		:current-attendee-number="currentAttendeeNumber"
		:ticket-count="store.ticketCount || 1"
		:step-progress-percent="stepProgressPercent"
		@go-back="goBack"
	/>

<RegisterEventBar
		:reminder-date="reminderDate"
		:reminder-time="reminderTime"
		:reminder-location="reminderLocation"
		:current-attendee-number="currentAttendeeNumber"
		:show-intent-countdown="showIntentCountdown"
		:intent-countdown-label="intentCountdownLabel"
		:intent-timer-tone-class="intentTimerToneClass"
		:is-checkout-ui-busy="isCheckoutUiBusy"
		:checkout-processing-stage-label="checkoutProcessingStageLabel"
	/>

		<div class="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-8 lg:flex-row lg:py-10">
			<div v-if="eventLoading" class="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
				Loading event details...
			</div>
			<div v-else-if="!event" class="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
				Event not found.
			</div>
			<template v-else>
				<RegisterAttendeeSidebar
					:attendees="store.attendees"
					:current-index="store.currentIndex"
					:current-attendee="currentAttendee"
					:show-checkout-pricing-sidebar="showCheckoutPricingSidebar"
					:show-quick-review-button="showQuickReviewButton"
					:quick-review-button-label="quickReviewButtonLabel"
					:attendee-display-name="attendeeDisplayName"
					:is-attendee-minor="isAttendeeMinor"
					:minor-has-emergency-contact="minorHasEmergencyContact"
					:attendee-status-label="attendeeStatusLabel"
					:attendee-status-badge-class="attendeeStatusBadgeClass"
					:attendee-sidebar-card-class="attendeeSidebarCardClass"
					:attendee-step-summary="attendeeStepSummary"
					:package-by-id="packageById"
					:checkout-preview-loading="checkoutPreviewLoading"
					:checkout-preview-error="checkoutPreviewError"
					:breakdown-lines="breakdownLines"
					:payment-breakdown-total="paymentBreakdownTotal"
					:is-polling-payment-status="isPollingPaymentStatus"
					:payment-processing-message="paymentProcessingMessage"
					@jump-to-attendee="jumpToAttendee"
					@jump-to-review="jumpToReview"
				/>

	
				<main class="min-w-0 flex-1">
					<div class="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[10px_10px_0px_0px_rgba(15,23,42,0.2)]">
						<div class="p-6 md:p-10">
							<div class="border-b border-slate-100 pb-6">
								<h2 class="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
									Details for {{ attendeeDisplayName(currentAttendee, store.currentIndex) }}
								</h2>
								<p class="mt-2 text-sm text-slate-500">Complete each step to prepare this attendee for checkout.</p>
							</div>

							<div class="mt-6 overflow-hidden pb-2">
							<RegisterStepperHeader
							:stepper-transition-name="stepperTransitionName"
							:step-window-start="stepWindowStart"
							:visible-steps="visibleSteps"
							:active-step-index="activeStepIndex"
						/>
							</div>

							<div v-if="!currentAttendee" class="mt-8 text-sm text-slate-500">Preparing registration details...</div>

							<RegisterPrecheckErrorAlert
								v-if="currentAttendee && shouldShowStepPrecheckAlert"
								:booking-errors="precheckBookingErrors"
								:attendee-errors="precheckAttendeeErrors"
							/>

							<Transition name="step-fade" mode="out-in">
								<div v-if="currentAttendee" :key="`step-${store.currentIndex}-${activeStepIndex}`" class="mt-8 space-y-6">
									<RegisterStepAttendeeDetails
										v-if="activeStepIndex === 0"
										:values="values"
										:errors="attendeeStepErrors"
										:is-registrar-self="isRegistrarSelf"
										:show-relationship-field="showRelationshipField"
										:gender-options="genderOptions"
										:relationship-options="relationshipOptions"
										:current-attendee-age="currentAttendeeAge"
										:has-current-area-from="hasCurrentAreaFrom"
										:current-area-from="currentAttendee.area_from ?? null"
										:current-area-from-name="currentAttendee.area_from_name ?? null"
										@update-field="(field, val) => { void onAttendeeFieldChange(field, val, false) }"
										@update-field-validate="(field, val) => { void onAttendeeFieldChange(field, val, true) }"
										@select-area="(val, label) => { store.setAreaFrom(store.currentIndex, val, label) }"
										@clear-area-from="clearAreaFrom"
									/>

									<div v-else-if="activeStepIndex === 1" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Event questions</h2>
								<p class="text-sm text-gray-600">Answer any questions the organizer added.</p>
							</div>

							<AttendeeQuestionAnswers
								:event="event"
								:draft-scope-key="`${eventId}-${store.currentIndex}`"
								v-model="currentAttendee.questionAnswers"
							/>
						</div>

						<RegisterStepPersonalInfo
						v-else-if="activeStepIndex === 2"
						:current-attendee="currentAttendee"
						:is-attendee-minor="isAttendeeMinor"
						:dietary-requirements="dietaryRequirements"
						:medical-conditions="medicalConditions"
						:accessibility-requirements="accessibilityRequirements"
						:alternative-signin-options="alternativeSigninOptions"
						:alternative-signins-loading="alternativeSigninsLoading"
						:emergency-relationship-options="emergencyRelationshipOptions"
						:has-personal-info-item="hasPersonalInfoItem"
						:is-other-option="isOtherOption"
						:get-details-for-item="getDetailsForItem"
						:get-personal-info-item-validation-error="getPersonalInfoItemValidationError"
						:toggle-dietary-requirement="toggleDietaryRequirement"
						:toggle-medical-condition="toggleMedicalCondition"
						:toggle-accessibility-requirement="toggleAccessibilityRequirement"
						:update-dietary-requirement-details="updateDietaryRequirementDetails"
						:update-medical-condition-severity="updateMedicalConditionSeverity"
						:update-medical-condition-details="updateMedicalConditionDetails"
						:update-accessibility-requirement-details="updateAccessibilityRequirementDetails"
						:add-emergency-contact="addEmergencyContact"
					/>

									<RegisterStepPackage
						v-else-if="activeStepIndex === 3"
						:current-attendee="currentAttendee"
						:available-booking-packages="availableBookingPackages"
						:is-current-attendee-package-available="isCurrentAttendeePackageAvailable"
					/>

									<RegisterStepProducts
										v-else-if="activeStepIndex === 4"
										:current-attendee="currentAttendee"
										:package-products-loading="packageProductsLoading"
										:package-products-error="packageProductsError"
										:current-package-products="currentPackageProducts"
										:selected-add-ons-summary="selectedAddOnsSummary"
										:get-package-product-image-src="getPackageProductImageSrc"
										:get-unique-sizes-for-package-product="getUniqueSizesForPackageProduct"
										:get-colors-for-package-product-and-size="getColorsForPackageProductAndSize"
										:get-variant-id-for-package-product-size-color="getVariantIdForPackageProductSizeColor"
										:get-selected-size-for-product="getSelectedSizeForProduct"
										:set-selected-size-for-product="setSelectedSizeForProduct"
										:get-selection-for-package-product="getSelectionForPackageProduct"
										:set-package-product-variant-selection="setPackageProductVariantSelection"
										:set-package-product-quantity="setPackageProductQuantity"
										:remove-package-product-selection="removePackageProductSelection"
										:get-selected-variant-price-info="getSelectedVariantPriceInfo"
									/>

								<RegisterStepConsents
										v-else-if="activeStepIndex === 5"
										:consents="consents"
										:is-consent-checked="isConsentChecked"
										:toggle-consent="toggleConsent"
									/>

										<template v-else-if="activeStepIndex === reviewStepIndex">
										<RegisterStepReview
											:attendees="store.attendees"
											:package-by-id="packageById"
											:calculate-age="calculateAge"
											:attendee-review-amount="attendeeReviewAmount"
											:is-booking-free="isBookingFree"
											:payment-methods="paymentMethods"
											:selected-payment-method-id="selectedPaymentMethodId ?? null"
											:is-checkout-ui-busy="isCheckoutUiBusy"
											:get-method-icon="getMethodIcon"
											:payment-method-type-label="paymentMethodTypeLabel"
											:selected-payment-method="selectedPaymentMethod"
											:is-bank-transfer-method="isBankTransferMethod"
											:is-stripe-method="isStripeMethod"
											:bank-details="bankDetails"
											:reserved-bank-transfer-loading="reservedBankTransferLoading"
											:reserved-bank-transfer-reference="reservedBankTransferReference"
											:reserved-bank-transfer-error="reservedBankTransferError"
											:reserved-bank-transfer-payment-reference="reservedBankTransferPaymentReference"
											:is-bank-transfer-evidence-required-immediately="isBankTransferEvidenceRequiredImmediately"
											:bank-transfer-evidence="bankTransferEvidence"
											:bank-transfer-evidence-errors="bankTransferEvidenceErrors"
											:on-bank-transfer-evidence-file-change="onBankTransferEvidenceFileChange"
											:is-stripe-test-mode="isStripeTestMode"
											:effective-stripe-publishable-key="effectiveStripePublishableKey"
											:manual-stripe-public-key="manualStripePublicKey"
											:on-stripe-mount-ready="(el: HTMLElement | null) => { stripeCardMountRef = el }"
											:stripe-card-error="stripeCardError"
											:stripe-payment-attempt-error="stripePaymentAttemptError"
											:stripe-card-ready="stripeCardReady"
											:agreed-to-terms="agreedToTerms"
											:discount-code="store.discountCode"
											:event-id="eventId"
											@jump-to-attendee="jumpToAttendee"
											@update:selected-payment-method-id="(id) => { selectedPaymentMethodId = id ?? undefined }"
											@update:manual-stripe-public-key="(val) => { manualStripePublicKey = val }"
											@update:agreed-to-terms="(val) => { agreedToTerms = val }"
											@update:discount-code="(val) => { store.setDiscountCode(val) }"
										/>
									</template>

									<RegisterStepNavBar
										class="border-t border-slate-100 pt-6"
										:is-review-step="activeStepIndex === reviewStepIndex"
										:is-checkout-ui-busy="isCheckoutUiBusy"
										:is-saving="isSaving"
										:can-continue="canContinue"
										:should-disable-checkout-button="shouldDisableCheckoutButton"
										:show-checkout-as-disabled="showCheckoutAsDisabled"
										:checkout-primary-button-label="checkoutPrimaryButtonLabel"
										:primary-action-label="primaryActionLabel"
										@back="handleBack"
										@next="handleNext"
										@checkout="handleCheckout"
									/>
								</div>
							</Transition>
						</div>
					</div>
				</main>

				<!-- <aside v-if="showCheckoutPricingSidebar" class="w-full lg:w-80 lg:flex-shrink-0"> -->
					<!-- <div class="space-y-4 lg:sticky lg:top-24">
						<div class="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white shadow-lg">
							<p class="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Live checkout pricing</p>
							<p class="mt-2 text-sm text-white/90">Transparent totals powered by server-side pricing rules.</p>
						</div>

						<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<div class="flex items-center justify-between">
								<h3 class="text-sm font-semibold text-slate-900">Payment breakdown</h3>
								<p class="text-xs text-slate-500">Calculated server-side</p>
							</div>
							<p v-if="checkoutPreviewLoading" class="mt-3 text-xs text-slate-500">Refreshing payment breakdown...</p>
							<p v-else-if="checkoutPreviewError" class="mt-3 text-xs font-semibold text-red-600">{{ checkoutPreviewError }}</p>
							<div class="mt-3 space-y-2">
								<div
									v-for="item in breakdownLines"
									:key="item.id"
									class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm"
								>
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="font-semibold text-slate-800">{{ item.name }}</p>
											<p class="text-xs text-slate-500">{{ item.description }}</p>
											<p v-if="item.discountHint" class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{{ item.discountHint }}</p>
										</div>
										<p class="font-semibold text-slate-900">{{ formatMoney(item.finalAmount, item.currency) }}</p>
									</div>
									<p class="mt-2 text-[11px] text-slate-600">
										{{ formatMoney(item.originalAmount, item.currency) }}
										<span class="text-slate-400">-</span>
										<span class="text-emerald-700">{{ formatMoney(item.discountAmount, item.currency) }}</span>
										<span class="text-slate-400">=</span>
										<span class="font-semibold text-slate-800">{{ formatMoney(item.finalAmount, item.currency) }}</span>
									</p>
								</div>
								<p v-if="!breakdownLines.length && !checkoutPreviewLoading" class="text-xs text-slate-500">No payable items selected yet.</p>
							</div>
							<div class="mt-4 border-t border-slate-100 pt-3 text-sm">
								<div class="flex items-center justify-between text-slate-600">
									<span>Subtotal</span>
									<span>{{ formatMoney(paymentBreakdownTotal.originalAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-1 flex items-center justify-between text-emerald-700">
									<span>Total discount</span>
									<span>-{{ formatMoney(paymentBreakdownTotal.discountAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-2 flex items-center justify-between text-base font-bold text-slate-900">
									<span>Total due</span>
									<span>{{ formatMoney(paymentBreakdownTotal.amount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<p v-if="isPollingPaymentStatus" class="mt-2 text-xs font-semibold text-amber-700">{{ paymentProcessingMessage || 'Finalizing your payment...' }}</p>
							</div>
						</div>

						<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
							<div class="flex items-center gap-2 font-semibold">
								<UIcon name="i-heroicons-lock-closed" class="h-4 w-4" />
								Powered and secured by Stripe
							</div>
							<p class="mt-1 text-xs text-emerald-700">Card data is tokenized by Stripe and never stored directly in AMDG forms.</p>
						</div>
					</div> -->
				<!-- </aside> -->
			</template>
		</div>
	</div>

	<Transition
		enter-active-class="transition duration-300 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition duration-200 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<RegisterCheckoutOverlay
			:is-visible="isCheckoutUiBusy"
			:stage-label="checkoutProcessingStageLabel"
			:description="checkoutProcessingDescription"
		/>
	</Transition>

	<RegisterSessionExpiredModal
		v-if="!showCheckoutSuccessModal"
		v-model="showIntentExpiredModal"
		:show-checkout-success-modal="showCheckoutSuccessModal"
		@return-to-event="redirectToEventHome"
	/>

	<RegisterSuccessModal
		v-model="showCheckoutSuccessModal"
		:event-title="event?.title || 'this event'"
		:bank-transfer-reference="checkoutBankTransferReference"
		:bank-transfer-instructions="checkoutBankTransferInstructions"
		@view-dashboard="closeSuccessModalAndRedirect"
	/>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useRegistrationStore } from '~/stores/registration'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { attendeeValidationSchema } from '~/schemas/registration'
import type { BreakdownLine } from '~/components/registration/RegisterAttendeeSidebar.vue'
import RegisterHero from '~/components/registration/RegisterHero.vue'
import RegisterEventBar from '~/components/registration/RegisterEventBar.vue'
import RegisterCheckoutOverlay from '~/components/registration/RegisterCheckoutOverlay.vue'
import RegisterSessionExpiredModal from '~/components/registration/RegisterSessionExpiredModal.vue'
import RegisterSuccessModal from '~/components/registration/RegisterSuccessModal.vue'
import RegisterStepperHeader from '~/components/registration/RegisterStepperHeader.vue'
import RegisterStepNavBar from '~/components/registration/RegisterStepNavBar.vue'
import RegisterAttendeeSidebar from '~/components/registration/RegisterAttendeeSidebar.vue'
import RegisterStepAttendeeDetails from '~/components/registration/RegisterStepAttendeeDetails.vue'
import RegisterStepPersonalInfo from '~/components/registration/RegisterStepPersonalInfo.vue'
import RegisterStepPackage from '~/components/registration/RegisterStepPackage.vue'
import RegisterStepProducts from '~/components/registration/RegisterStepProducts.vue'
import RegisterStepConsents from '~/components/registration/RegisterStepConsents.vue'
import RegisterStepReview from '~/components/registration/RegisterStepReview.vue'
import RegisterPrecheckErrorAlert from '~/components/registration/RegisterPrecheckErrorAlert.vue'

// Use middleware to validate booking intent and URL parameters
definePageMeta({
  middleware: 'register',
})
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import { useCheckoutBooking } from '~/composables/resources/booking/bookings'
import { useCheckoutPreview } from '~/composables/resources/booking/checkoutPreview'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import { bookingsPackageProductsList, paymentsListRetrieve, productsListRetrieve, productsListVariantsList } from '~/api/sdk.gen'
import {
	buildCheckoutPayload,
	buildCheckoutMultipartPayload,
	buildCheckoutPreviewPayload,
	createIdempotencyKey,
} from '~/composables/registration/checkout'
import { useBookingIntentManager } from '~/composables/registration/useBookingIntentManager'
import { usePackageProductManager } from '~/composables/registration/usePackageProductManager'
import { usePersonalInfoManager } from '~/composables/registration/usePersonalInfoManager'
import { useAttendeeEnrichmentOptions } from '~/composables/registration/useAttendeeEnrichmentOptions'
import { useRegistrationStepManager } from '~/composables/registration/useRegistrationStepManager'
import { usePaymentMethodManager } from '~/composables/registration/usePaymentMethodManager'
import { useStripeCheckoutFlow } from '~/composables/registration/useStripeCheckoutFlow'
import { usePrecheckBooking, parsePrecheckAttendeeErrors, parsePrecheckBookingErrorCodes, formatPrecheckErrorCode, extractPrecheckResult } from '~/composables/registration/usePrecheckValidation'
import type { PrecheckResult, PrecheckAttendeeError } from '~/composables/registration/usePrecheckValidation'
import { uploadMultipart } from '~/utils/upload'
import { onImageError, resolveImageUrl } from '~/utils/image'
import { formatDate, formatTime } from '~/utils/time'
import type { AttendeeDraft } from '~/stores/registration'

import { formatMoney } from '~/utils/money'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useRegistrationStore()
const runtimeConfig = useRuntimeConfig()
const currentIndex = computed(() => store.currentIndex)
const checkoutCompleted = ref(false)

// Initialize form (will be reset when currentAttendee changes)
const { values, errors, setFieldValue, resetForm, validate } = useForm({
	validationSchema: toTypedSchema(attendeeValidationSchema),
	initialValues: {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		date_of_birth: '',
		gender: '',
		relationship_to_user: '',
	},
})

const attendeeTouchedFields = ref<Set<string>>(new Set())
const forceShowAttendeeErrors = ref(false)

const markAttendeeFieldTouched = (field: string) => {
	const next = new Set(attendeeTouchedFields.value)
	next.add(field)
	attendeeTouchedFields.value = next
}

const resetAttendeeInlineValidationState = () => {
	attendeeTouchedFields.value = new Set()
	forceShowAttendeeErrors.value = false
}

const attendeeStepErrors = computed(() => {
	const filteredErrors: Partial<Record<string, string>> = {}
	for (const [field, message] of Object.entries(errors.value)) {
		if (!message) continue
		if (forceShowAttendeeErrors.value || attendeeTouchedFields.value.has(field)) {
			filteredErrors[field] = message
		}
	}
	return filteredErrors
})

const onAttendeeFieldChange = async (field: string, value: string, shouldValidateField: boolean) => {
	if (!currentAttendee.value) return
	;(currentAttendee.value as any)[field] = value
	setFieldValue(field as any, value, shouldValidateField)

	if (shouldValidateField) {
		markAttendeeFieldTouched(field)
	}
}

const runSafeValidation = async () => {
	try {
		return await validate()
	} catch {
		return { valid: false }
	}
}

const eventId = computed(() => String(route.params.id || ''))
const ticketCount = computed(() => Number(route.query.tickets || 1))
const registrationMode = computed(() => {
	const mode = String(route.query.mode || '').toLowerCase()
	if (mode === 'multiple') return 'multiple'
	if (mode === 'self') return 'self'
	return Number(route.query.tickets || 1) > 1 ? 'multiple' : 'self'
})
const registrarAttending = computed(() => {
	if (route.query.uia !== undefined) {
		const attending = String(route.query.uia).toLowerCase()
		return attending === 'true' || attending === '1'
	}

	if (route.query.o !== undefined) {
		// Legacy behavior: o=false used to mean registrar is attending.
		const legacy = String(route.query.o).toLowerCase()
		if (legacy === 'false' || legacy === '0') return true
		if (legacy === 'true' || legacy === '1') return false
	}

	return true
})

watchEffect(() => {
	if (!eventId.value) return
	if (store.eventId !== eventId.value || store.ticketCount !== ticketCount.value || store.registrarAttending !== registrarAttending.value) {
		store.init(eventId.value, ticketCount.value, registrarAttending.value)
	}
})

const eventQuery = useEvent(eventId)
const event = computed(() => eventQuery.data.value?.data || null)
const event_uuid = computed(() => event.value?.event_id || '')
const eventLoading = computed(() => eventQuery.isLoading.value)
const { data: eventVenuesData } = useEventVenues(
	computed(() => ({
		event: eventId.value,
	}))
)
const primaryVenue = computed(() => eventVenuesData.value?.data?.results?.[0] || null)

const fallbackHeroImage = '/assets/images/hero-cathedral.png'
const heroImageSrc = computed(() => resolveImageUrl(event.value?.main_landing_image?.image, fallbackHeroImage))
const reminderDate = computed(() => (event.value?.start_datetime ? formatDate(event.value.start_datetime, 'MMM d, yyyy') : 'TBA'))
const reminderTime = computed(() => {
	if (!event.value?.start_datetime) return 'TBA'
	const start = formatTime(event.value.start_datetime, event.value?.timezone)
	if (!event.value?.end_datetime) return start
	return `${start} - ${formatTime(event.value.end_datetime, event.value?.timezone)}`
})
const reminderLocation = computed(() => {
	if (primaryVenue.value?.venue_name) return primaryVenue.value.venue_name
	if (event.value?.organisation_name) return event.value.organisation_name
	return 'Location TBA'
})

const {
	showIntentExpiredModal,
	showIntentCountdown,
	intentCountdownLabel,
	intentTimerToneClass,
	pingBookingIntent,
	stopIntentPing,
	stopIntentCountdown,
	redirectToEventHome,
} = useBookingIntentManager({
	event,
	eventId,
	ticketCount,
	bookingIntentId: computed(() => store.bookingIntentId),
	checkoutCompleted,
	setBookingIntentId: (intentId) => store.setBookingIntentId(intentId),
	resetRegistrationStore: () => store.reset(),
	onIntentExpired: () => {
		showCheckoutSuccessModal.value = false
	},
})

const {
	steps,
	attendeeStepCount,
	reviewStepIndex,
	activeStepIndex,
	stepperTransitionName,
	stepWindowStart,
	visibleSteps,
	stepProgressPercent,
	attendeeDisplayName,
	attendeeStatusLabel,
	attendeeStatusBadgeClass,
	attendeeSidebarCardClass,
	attendeeStepSummary,
} = useRegistrationStepManager({
	currentIndex,
	isAttendeeReady: (attendee) => isAttendeeReady(attendee),
	maxVisibleStepperSteps: 3,
})

const currentAttendee = computed(() => store.attendees[currentIndex.value])
const currentAttendeeNumber = computed(() => currentIndex.value + 1)
const isRegistrarSelf = computed(() => store.registrarAttending && store.currentIndex === 0)
const showRelationshipField = computed(() => !(registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1))
const hasCurrentAreaFrom = computed(() => !!currentAttendee.value?.area_from)

const {
	relationshipOptions,
	genderOptions,
	emergencyRelationshipOptions,
	isAttendeeMinor,
	minorHasEmergencyContact,
	hasPersonalInfoItem,
	hasValidPersonalInfoItems,
	getPersonalInfoItemValidationError,
	toggleDietaryRequirement,
	toggleMedicalCondition,
	toggleAccessibilityRequirement,
	updateDietaryRequirementDetails,
	updateMedicalConditionSeverity,
	updateMedicalConditionDetails,
	updateAccessibilityRequirementDetails,
	isOtherOption,
	getDetailsForItem,
	addEmergencyContact,
} = usePersonalInfoManager({
	currentAttendee,
	currentIndex,
	setPersonalInfo: (index, personalInfo) => store.setPersonalInfo(index, personalInfo),
})

const {
	alternativeSigninOptions,
	alternativeSigninsLoading,
} = useAttendeeEnrichmentOptions(computed(() => store.bookingIntentId))

watchEffect(() => {
	if (!currentAttendee.value) return
	if (registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1) {
		currentAttendee.value.relationship_to_user = 'self'
	}
})

const dietaryRequirementsQuery = useDietaryRequirements()
const medicalConditionsQuery = useMedicalConditions()
const accessibilityRequirementsQuery = useAccessibilityRequirements()

const dietaryRequirements = computed(() => dietaryRequirementsQuery.data.value?.data?.results || [])
const medicalConditions = computed(() => medicalConditionsQuery.data.value?.data?.results || [])
const accessibilityRequirements = computed(() => accessibilityRequirementsQuery.data.value?.data?.results || [])

const consentsQuery = useConsents(
	computed(() => (event.value?.event_id ? { event: String(event.value.url_safe_title), page_size: 100 } : undefined))
)
const consents = computed(() => consentsQuery.data.value?.data?.results || [])

const eventQuestionsQuery = useEventQuestions(
	computed(() => (event.value?.url_safe_title ? { event: event.value.url_safe_title, page_size: 100 } : undefined)),
	{ enabled: computed(() => !!event.value?.event_id) }
)
const eventQuestions = computed(() => eventQuestionsQuery.data.value?.data?.results || [])
const requiredQuestionIds = computed(() => eventQuestions.value.filter((question) => question.required).map((question) => question.id))

const bookingPackagesQuery = useBookingPackages(
	computed(() => {
		return { event_id: event_uuid.value }
	})
)

const bookingPackages = computed(() => bookingPackagesQuery.data.value?.data?.results || [])
const allPackagesQuery = useBookingPackages(
	computed(() => {
		return { event_id: event_uuid.value, page_size: 200 }
	})
)
const allPackages = computed(() => allPackagesQuery.data.value?.data?.results || [])
const packageById = (packageId?: number) => allPackages.value.find((pkg) => pkg.id === packageId)

type ReviewPackageProductRow = {
	id: number
	productPublicId: string
	productTitle: string
	imageUrl: string | null
}

type ReviewVariantRow = {
	variantId: string
	sizeDisplay: string
	color: string
}

const reviewPackageProductsByPackageId = ref<Record<number, ReviewPackageProductRow[]>>({})
const reviewVariantsByPackageProductId = ref<Record<number, ReviewVariantRow[]>>({})

const ensureReviewCatalogForPackage = async (packageId: number) => {
	if (reviewPackageProductsByPackageId.value[packageId]) return

	try {
		const packageResponse = await bookingsPackageProductsList({ path: { id: packageId } })
		const packageProducts = (packageResponse.data?.results || []).map((row: any) => ({
			id: Number(row.id),
			productPublicId: String(row.product_public_id || row.product_id || row.product || '').trim(),
			productTitle: String(row.product_title || 'Add-on'),
			imageUrl: null as string | null,
		}))

		const lookups = await Promise.all(packageProducts.map(async (product) => {
			if (!product.productPublicId) {
				return { productId: product.id, imageUrl: null as string | null, variants: [] as ReviewVariantRow[] }
			}

			try {
				const [variantsResponse, productResponse] = await Promise.all([
					productsListVariantsList({
						path: { product_product_id: product.productPublicId },
						query: { page_size: 200 },
					}),
					productsListRetrieve({
						path: { product_id: product.productPublicId },
					}),
				])

				const variants = (variantsResponse.data?.results || []).map((variant: any) => ({
					variantId: String(variant.variant_id || variant.id || ''),
					sizeDisplay: String(variant.size_display || variant.size || 'Unspecified'),
					color: String(variant.color || ''),
				}))

				const detail = productResponse.data
				const mainImage = detail?.main_image?.url || detail?.images?.main?.url || null

				return {
					productId: product.id,
					imageUrl: mainImage ? resolveImageUrl(mainImage) : null,
					variants,
				}
			} catch {
				return { productId: product.id, imageUrl: null as string | null, variants: [] as ReviewVariantRow[] }
			}
		}))

		reviewPackageProductsByPackageId.value = {
			...reviewPackageProductsByPackageId.value,
			[packageId]: packageProducts.map((product) => {
				const lookup = lookups.find((entry) => entry.productId === product.id)
				return {
					...product,
					imageUrl: lookup?.imageUrl || null,
				}
			}),
		}

		const mergedVariants = { ...reviewVariantsByPackageProductId.value }
		lookups.forEach((lookup) => {
			mergedVariants[lookup.productId] = lookup.variants
		})
		reviewVariantsByPackageProductId.value = mergedVariants
	} catch (error) {
		console.warn('Unable to load review variant catalog for package', packageId, error)
	}
}

const hydrateReviewVariantCatalog = async () => {
	const packageIds = Array.from(new Set(
		store.attendees
			.filter((attendee) => (attendee.productSelections || []).length > 0 && !!attendee.packageId)
			.map((attendee) => Number(attendee.packageId))
	))

	if (!packageIds.length) return
	await Promise.all(packageIds.map((packageId) => ensureReviewCatalogForPackage(packageId)))
}

const getVariantDetailsForPreviewProduct = (
	attendeeIndex: number,
	productTitle: string | undefined,
	productIndex: number
) => {
	const attendee = store.attendees[attendeeIndex]
	if (!attendee) return []

	const selections = attendee.productSelections || []
	if (!selections.length) return []

	const packageProducts = attendee.packageId
		? reviewPackageProductsByPackageId.value[Number(attendee.packageId)] || []
		: []

	const normalizedTitle = String(productTitle || '').trim().toLowerCase()
	let selection: typeof selections[number] | null = selections[productIndex] || null

	if (!selection && normalizedTitle) {
		selection = selections.find((entry) => {
			const packageProduct = packageProducts.find((row) => row.id === entry.packageProductId)
			return String(packageProduct?.productTitle || '').trim().toLowerCase() === normalizedTitle
		}) || null
	}

	if (!selection) return []

	const packageProduct = packageProducts.find((row) => row.id === selection.packageProductId)
	const variant = (reviewVariantsByPackageProductId.value[selection.packageProductId] || []).find(
		(row) => row.variantId === selection.variantId
	)

	return [{
		productName: packageProduct?.productTitle || productTitle || 'Add-on',
		sizeLabel: variant?.sizeDisplay || 'Unspecified',
		colorLabel: variant?.color || null,
		quantity: Math.max(1, Number(selection.quantity || 1)),
		imageUrl: packageProduct?.imageUrl || null,
	}]
}

type AvailabilityWindow = {
	available_from?: string | null
	available_to?: string | null
}

const isDateWithinAvailabilityWindow = (window: AvailabilityWindow, now: Date) => {
	const from = window.available_from ? new Date(window.available_from) : null
	const to = window.available_to ? new Date(window.available_to) : null

	if (from && Number.isNaN(from.getTime())) return false
	if (to && Number.isNaN(to.getTime())) return false

	if (from && now < from) return false
	if (to && now > to) return false
	return true
}

const isPackageCurrentlyAvailable = (pkg: any) => {
	const windows = Array.isArray(pkg?.availability_windows) ? pkg.availability_windows as AvailabilityWindow[] : []
	if (!windows.length) return true
	const now = new Date()
	return windows.some((window) => isDateWithinAvailabilityWindow(window, now))
}

const availableBookingPackages = computed(() => bookingPackages.value.filter((pkg) => isPackageCurrentlyAvailable(pkg)))
const isCurrentAttendeePackageAvailable = computed(() => {
	if (!currentAttendee.value?.packageId) return false
	const pkg = packageById(currentAttendee.value.packageId)
	if (!pkg) return false
	return isPackageCurrentlyAvailable(pkg)
})

const {
	packageProductsLoading,
	packageProductsError,
	currentPackageProducts,
	currentAttendeeProductSelections,
	selectedAddOnsSummary,
	variantOptionLabel,
	handlePackageProductVariantChange,
	getSelectionForPackageProduct,
	getVariantsForPackageProduct,
	getUniqueSizesForPackageProduct,
	getColorsForPackageProductAndSize,
	getVariantIdForPackageProductSizeColor,
	setSelectedSizeForProduct,
	getSelectedSizeForProduct,
	getSelectedVariantPriceInfo,
	hasAnyVariantsForPackageProduct,
	hasSelectableVariantsForPackageProduct,
	getBundleMultiplier,
	getBundledVariantEstimate,
	getSelectedVariantForPackageProduct,
	getSelectedBundledVariantEstimate,
	setPackageProductVariantSelection,
	setPackageProductQuantity,
	removePackageProductSelection,
	loadPackageProductsForCurrentAttendee,
} = usePackageProductManager({
	currentAttendee,
	currentIndex,
	setProductSelections: (index, selections) => store.setProductSelections(index, selections),
})

const getPackageProductImageSrc = (packageProduct: { imageUrl: string | null }) => {
	return resolveImageUrl(packageProduct.imageUrl)
}

const attendeeReviewAmount = (attendee: AttendeeDraft, index: number) => {
	const previewAttendees = checkoutPreview.value?.attendees || []
	const previewAttendee = previewAttendees[index]
	if (previewAttendee?.attendee_total) {
		return {
			amount: Number(previewAttendee.attendee_total || 0),
			currency: previewAttendee.currency || checkoutPreview.value?.currency || 'GBP',
		}
	}

	const pkg = packageById(attendee.packageId)
	return {
		amount: Number(pkg?.modified_amount || 0),
		currency: pkg?.base_amount_currency || checkoutPreview.value?.currency || 'GBP',
	}
}
const {
	paymentMethods,
	selectedPaymentMethodId,
	selectedPaymentMethod,
	getMethodIcon,
	paymentMethodTypeLabel,
	isBankTransferMethod,
	isStripeMethod,
	isBankTransferEvidenceRequiredImmediately,
	bankDetails,
	reservedBankTransferPaymentId,
	reservedBankTransferPaymentReference,
	reservedBankTransferReference,
	reservedBankTransferLoading,
	reservedBankTransferError,
	clearReservedBankTransferPayment,
	reserveBankTransferPayment,
	bankTransferEvidence,
	bankTransferEvidenceErrors,
	clearBankTransferEvidenceForm,
	onBankTransferEvidenceFileChange,
	isBankTransferEvidenceFormReady,
	validateBankTransferEvidenceForm,
	uploadBankTransferEvidenceForCheckout,
} = usePaymentMethodManager({
	eventUuid: event_uuid,
	bookingIntentId: computed(() => store.bookingIntentId),
})

type PreviewDiscountLine = {
	name?: string
	amount?: string
}

type PreviewPackage = {
	package_name?: string
	final_amount?: string
	discount_total?: string
	currency?: string
	applied_discounts?: PreviewDiscountLine[]
}

type PreviewProductLine = {
	product_title?: string
	quantity?: number
	line_total?: string
	currency?: string
	applied_discounts?: PreviewDiscountLine[]
}

type PreviewAttendee = {
	attendee_name?: string
	package?: PreviewPackage
	products?: PreviewProductLine[]
	attendee_total?: string
	currency?: string
}

type CheckoutPreviewData = {
	total_amount?: string
	currency?: string
	attendees?: PreviewAttendee[]
}

const checkoutPreviewMutation = useCheckoutPreview()
const checkoutMutation = useCheckoutBooking()
const stripeConfigQuery = useStripeConfig()
const isStripeTestMode = computed(() => !!runtimeConfig.public.stripeTestMode)
const testModeStripePublishableKey = computed(() => String(runtimeConfig.public.stripeTestPublishableKey || '').trim())
const manualStripePublicKey = ref(testModeStripePublishableKey.value)
const effectiveStripePublishableKey = computed(() => {
	const manualKey = manualStripePublicKey.value.trim()
	if (isStripeTestMode.value && manualKey) {
		return manualKey
	}
	const apiKey = stripeConfigQuery.data.value?.data?.publishable_key?.trim()
	if (apiKey) {
		return apiKey
	}
	return testModeStripePublishableKey.value
})

const idempotencyKey = ref(createIdempotencyKey())
const isSaving = ref(false)
const precheckMutation = usePrecheckBooking()
const precheckBookingErrors = ref<string[]>([])
const precheckAttendeeErrors = ref<PrecheckAttendeeError[]>([])
const checkoutResult = ref<any>(null)
const showCheckoutSuccessModal = ref(false)
const checkoutPreview = ref<CheckoutPreviewData | null>(null)
const checkoutPreviewError = ref('')
const checkoutPreviewLoading = computed(() => checkoutPreviewMutation.isPending.value)

const {
	stripeCardMountRef,
	stripeInstance,
	stripeCardElement,
	stripeCardReady,
	stripeCardError,
	stripePaymentAttemptError,
	stripeClientSecret,
	requireStripeAccountIdFromPaymentMethod,
	teardownStripeElements,
	ensureStripeCardMounted,
	isPollingPaymentStatus,
	paymentProcessingMessage,
	stopPaymentStatusPolling,
	startPaymentStatusPolling,
} = useStripeCheckoutFlow({
	isStripeMethod,
	selectedPaymentMethod,
	effectiveStripePublishableKey,
	reviewStepIndex,
	activeStepIndex,
	attendeeDisplayName,
	firstAttendee: computed(() => store.attendees[0]),
	checkoutResult,
	showCheckoutSuccessModal,
	onToast: (opts) => toast.add(opts as any),
})

const isCheckoutUiBusy = computed(() => isSaving.value || isPollingPaymentStatus.value)
const shouldDisableCheckoutButton = computed(() => checkoutCompleted.value || isCheckoutUiBusy.value)

const checkoutPrimaryButtonLabel = computed(() => {
	if (isPollingPaymentStatus.value) return 'Finalizing payment...'
	if (isSaving.value && isStripeMethod.value) return 'Processing card payment...'
	if (isSaving.value && isBankTransferMethod.value) return 'Submitting transfer checkout...'
	if (isSaving.value) return 'Completing checkout...'
	return 'Complete registration'
})

const agreedToTerms = ref(false)

const showCheckoutAsDisabled = computed(() => {
	if (activeStepIndex.value !== reviewStepIndex) return false
	if (checkoutCompleted.value || isCheckoutUiBusy.value) return false
	return canContinue.value && !agreedToTerms.value
})

const checkoutProcessingStageLabel = computed(() => {
	if (isPollingPaymentStatus.value) return 'Finalizing your registration'
	if (isStripeMethod.value) return 'Confirming card payment'
	if (isBankTransferMethod.value) return 'Submitting bank transfer checkout'
	return 'Submitting checkout'
})

const checkoutProcessingDescription = computed(() => {
	if (isPollingPaymentStatus.value) {
		return paymentProcessingMessage.value || 'We are verifying payment status and preparing your booking.'
	}
	if (isStripeMethod.value) {
		return 'Your card is being securely processed via Stripe. Please do not close this page.'
	}
	if (isBankTransferMethod.value) {
		return 'We are locking in your transfer details and creating your booking.'
	}
	return 'We are completing your checkout request.'
})

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null

const checkoutBankTransferReference = computed(() => {
	const value = checkoutResult.value?.bank_transfer_reference
	return typeof value === 'string' && value.trim().length ? value.trim() : null
})

const checkoutBankTransferInstructions = computed(() => {
	const value = checkoutResult.value?.bank_transfer_instructions
	return typeof value === 'string' && value.trim().length ? value.trim() : null
})

const parseDiscountAmount = (value: string | undefined) => Math.abs(Number(value || 0))

const previewTriggerSignature = computed(() => JSON.stringify(
	[
		store.discountCode,
		...store.attendees.map((attendee) => ({
		attendeeId: attendee.attendeeId || null,
		firstName: attendee.first_name,
		lastName: attendee.last_name,
		dob: attendee.date_of_birth,
		relationship: attendee.relationship_to_user || null,
		areaFrom: attendee.area_from || null,
		packageId: attendee.packageId || null,
		products: attendee.productSelections || [],
		consents: attendee.consents,
		answers: attendee.questionAnswers,
	}))
	]
))

const breakdownLines = computed<BreakdownLine[]>(() => {
	const previewAttendees = Array.isArray(checkoutPreview.value?.attendees)
		? checkoutPreview.value!.attendees!
		: []

	if (!previewAttendees.length) {
		return store.attendees.map((attendee, index) => {
			const pkg = packageById(attendee.packageId)
			const amount = Number(pkg?.modified_amount || 0)
			const currency = pkg?.base_amount_currency || checkoutResult.value?.currency || 'GBP'
			return {
				id: `fallback-${index}`,
				name: attendeeDisplayName(attendee, index),
				description: pkg?.name || 'No package selected',
				originalAmount: amount,
				discountAmount: 0,
				finalAmount: amount,
				currency,
			}
		})
	}

	const lines: BreakdownLine[] = []
	previewAttendees.forEach((attendee, attendeeIndex) => {
		const attendeeName = attendee.attendee_name || `Attendee ${attendeeIndex + 1}`
		const packageLine = attendee.package
		if (packageLine) {
			const packageDiscount = parseDiscountAmount(packageLine.discount_total)
			const packageFinal = Number(packageLine.final_amount || 0)
			const discountHint = packageLine.applied_discounts?.length
				? `${packageLine.applied_discounts.length} discount(s)`
				: undefined
			lines.push({
				id: `package-${attendeeIndex}`,
				name: attendeeName,
				description: packageLine.package_name || 'Package',
				originalAmount: packageFinal + packageDiscount,
				discountAmount: packageDiscount,
				finalAmount: packageFinal,
				currency: packageLine.currency || checkoutPreview.value?.currency || 'GBP',
				discountHint,
			})
		}

		attendee.products?.forEach((product, productIndex) => {
			const productDiscount = (product.applied_discounts || []).reduce((sum, discount) => {
				return sum + parseDiscountAmount(discount.amount)
			}, 0)
			const productFinal = Number(product.line_total || 0)
			const discountHint = product.applied_discounts?.length
				? `${product.applied_discounts.length} discount(s)`
				: undefined
			lines.push({
				id: `product-${attendeeIndex}-${productIndex}`,
				name: `${attendeeName} add-on`,
				description: `${product.product_title || 'Product'} x${product.quantity || 1}`,
				originalAmount: productFinal + productDiscount,
				discountAmount: productDiscount,
				finalAmount: productFinal,
				currency: product.currency || checkoutPreview.value?.currency || 'GBP',
				discountHint,
				variantDetails: getVariantDetailsForPreviewProduct(attendeeIndex, product.product_title, productIndex),
			})
		})
	})

	return lines
})

const paymentBreakdownTotal = computed(() => {
	if (checkoutPreview.value?.total_amount) {
		const computedOriginal = breakdownLines.value.reduce((sum, item) => sum + item.originalAmount, 0)
		const computedDiscount = breakdownLines.value.reduce((sum, item) => sum + item.discountAmount, 0)
		return {
			originalAmount: computedOriginal,
			discountAmount: computedDiscount,
			amount: Number(checkoutPreview.value.total_amount || 0),
			currency: checkoutPreview.value.currency || 'GBP',
		}
	}

	const originalAmount = breakdownLines.value.reduce((sum, item) => sum + item.originalAmount, 0)
	const discountAmount = breakdownLines.value.reduce((sum, item) => sum + item.discountAmount, 0)
	const amount = breakdownLines.value.reduce((sum, item) => sum + item.finalAmount, 0)
	const currency = breakdownLines.value.find((item) => item.currency)?.currency || checkoutResult.value?.currency || 'GBP'
	return { originalAmount, discountAmount, amount, currency }
})

const showCheckoutPricingSidebar = computed(() => activeStepIndex.value === reviewStepIndex)
const showQuickReviewButton = computed(() =>
	store.attendees.length > 1
	&& activeStepIndex.value !== reviewStepIndex
	&& store.attendees.every((attendee) => isAttendeeReady(attendee))
)
const quickReviewButtonLabel = computed(() => `Review all (${store.attendees.length})`)

// const formatMoney = (value: number | string, currency: string = 'GBP') => {
// 	const amount = typeof value === 'number' ? value : Number(value || 0)
// 	return `${amount.toFixed(2)} ${currency}`
// }

const requiredConsentsMissing = computed(() => {
	if (!consents.value.length) return 0
	return consents.value.filter((consent) => consent.required && !isConsentChecked(consent.id)).length
})

const requiredConsentIds = computed(() => consents.value.filter((consent) => consent.required).map((consent) => consent.id))

const hasQuestionAnswerContent = (answer: AttendeeDraft['questionAnswers'][number]) => {
	if (typeof answer.answerText === 'string' && answer.answerText.trim().length > 0) return true
	if (typeof answer.answerText === 'number') return true
	if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) return true
	if (answer.uploadResourceId) return true
	if (answer.uploadUrl) return true
	return false
}

const attendeeHasRequiredAnswers = (attendee: AttendeeDraft) => {
	if (!requiredQuestionIds.value.length) return true
	return requiredQuestionIds.value.every((questionId) => {
		const answer = attendee.questionAnswers.find((entry) => entry.questionId === questionId)
		return !!answer && hasQuestionAnswerContent(answer)
	})
}

const attendeeHasRequiredConsents = (attendee: AttendeeDraft) => {
	if (!requiredConsentIds.value.length) return true
	return requiredConsentIds.value.every((consentId) =>
		attendee.consents.some((consent) => consent.consentId === consentId && consent.consentGiven)
	)
}

const attendeeHasCompleteAlternativeSignin = (attendee: AttendeeDraft) => {
	const signin = attendee.personalInfo.alternativeSigninIdentifier
	if (!signin) return true

	const hasType = !!String(signin.eventAlternativeSigninId || '').trim()
	const hasIdentifier = !!String(signin.identifier || '').trim()
	return (hasType && hasIdentifier) || (!hasType && !hasIdentifier)
}

const isAttendeeReady = (attendee: AttendeeDraft) => {
	const hasNames = !!attendee.first_name && !!attendee.last_name
	const hasRelationship = !!attendee.relationship_to_user || (store.registrarAttending && attendee === store.attendees[0])
	const hasDob = !!attendee.date_of_birth
	const hasAreaFrom = !!attendee.area_from
	const hasPackage = !!attendee.packageId
	const hasEmergencyContactIfMinor = minorHasEmergencyContact(attendee)
	const hasPersonalInfoValidity = hasValidPersonalInfoItems(attendee)
	const hasCompleteAlternativeSignin = attendeeHasCompleteAlternativeSignin(attendee)
	return hasNames
		&& hasRelationship
		&& hasDob
		&& hasAreaFrom
		&& hasPackage
		&& hasEmergencyContactIfMinor
		&& hasPersonalInfoValidity
		&& hasCompleteAlternativeSignin
		&& attendeeHasRequiredAnswers(attendee)
		&& attendeeHasRequiredConsents(attendee)
}

const isBookingFree = computed(() => {
	return paymentBreakdownTotal.value.amount === 0
})

const canContinue = computed(() => {
	if (!currentAttendee.value) return false
	if (activeStepIndex.value === 0) {
		const hasNames = !!values.first_name && !!values.last_name
		const hasRelationship = !!currentAttendee.value.relationship_to_user || isRegistrarSelf.value
		const hasDob = !!values.date_of_birth
		const hasAreaFrom = !!currentAttendee.value.area_from
		const parsed = attendeeValidationSchema.safeParse({
			first_name: values.first_name || '',
			last_name: values.last_name || '',
			email: values.email || '',
			phone_number: values.phone_number || '',
			date_of_birth: values.date_of_birth || '',
			gender: values.gender || '',
			relationship_to_user: values.relationship_to_user || '',
		})
		const hasNoErrors = parsed.success
		return hasNames && hasRelationship && hasDob && hasAreaFrom && hasNoErrors
	}
	if (activeStepIndex.value === 1) {
		return attendeeHasRequiredAnswers(currentAttendee.value)
	}
	if (activeStepIndex.value === 2) {
		const hasValidPersonalInfo = hasValidPersonalInfoItems(currentAttendee.value)
		const hasCompleteAlternativeSignin = attendeeHasCompleteAlternativeSignin(currentAttendee.value)
		// Personal info step: enforce emergency contact for minors
		if (isAttendeeMinor(currentAttendee.value)) {
			return minorHasEmergencyContact(currentAttendee.value)
				&& hasValidPersonalInfo
				&& hasCompleteAlternativeSignin
		}
		return hasValidPersonalInfo && hasCompleteAlternativeSignin
	}
	if (activeStepIndex.value === 3) {
		return !!currentAttendee.value.packageId && isCurrentAttendeePackageAvailable.value
	}
	if (activeStepIndex.value === 5) {
		return requiredConsentsMissing.value === 0
	}
	if (activeStepIndex.value === reviewStepIndex) {
		const allAttendeesReady = store.attendees.every((attendee) => isAttendeeReady(attendee))
		if (checkoutCompleted.value || !store.bookingIntentId || !allAttendeesReady || isPollingPaymentStatus.value) {
			return false
		}
		// For free bookings, skip payment method requirement
		if (isBookingFree.value) {
			return true
		}
		// For paid bookings, require payment method selection
		if (!selectedPaymentMethodId.value) {
			return false
		}
		if (isStripeMethod.value) {
			return stripeCardReady.value && !stripeCardError.value
		}
		if (isBankTransferEvidenceRequiredImmediately.value) {
			return isBankTransferEvidenceFormReady.value && !!reservedBankTransferReference.value && !reservedBankTransferLoading.value
		}
		if (isBankTransferMethod.value) {
			return !!reservedBankTransferReference.value && !reservedBankTransferLoading.value
		}
		return true
	}
	return true
})

const getCannotContinueMessage = () => {
	if (!currentAttendee.value) return 'Please complete required information before continuing.'

	if (activeStepIndex.value === 0) {
		if (errors.value.first_name) return errors.value.first_name
		if (errors.value.last_name) return errors.value.last_name
		if (errors.value.date_of_birth) return errors.value.date_of_birth
		if (errors.value.email) return errors.value.email
		if (errors.value.phone_number) return errors.value.phone_number
		if (!currentAttendee.value.area_from) return 'Please select an area to continue.'
		if (!currentAttendee.value.relationship_to_user && !isRegistrarSelf.value) return 'Please select relationship to user.'
		return 'Please complete attendee details to continue.'
	}

	if (activeStepIndex.value === 1) {
		return 'Please answer all required event questions before continuing.'
	}

	if (activeStepIndex.value === 2) {
		if (isAttendeeMinor(currentAttendee.value) && !minorHasEmergencyContact(currentAttendee.value)) {
			return 'Emergency contact is required for minors.'
		}
		if (!attendeeHasCompleteAlternativeSignin(currentAttendee.value)) {
			return 'Alternative sign-in requires both type and identifier.'
		}
		if (!hasValidPersonalInfoItems(currentAttendee.value)) {
			return 'Please add details for selected OTHER requirements.'
		}
		return 'Please complete personal information to continue.'
	}

	if (activeStepIndex.value === 3) {
		return 'Please select a ticket package to continue.'
	}

	if (activeStepIndex.value === 5) {
		return 'Please accept all required consents before continuing.'
	}

	if (activeStepIndex.value === reviewStepIndex) {
		if (isStripeMethod.value && stripeCardError.value) return stripeCardError.value
		if (isStripeMethod.value && !stripeCardReady.value) return 'Please complete your card details before continuing.'
		if (isBankTransferEvidenceRequiredImmediately.value && !isBankTransferEvidenceFormReady.value) {
			return 'Evidence file, payer details, and amount are required for this bank transfer method.'
		}
		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			return reservedBankTransferError.value || 'Please wait for your bank transfer reference to be reserved.'
		}
		if (!isBookingFree.value && !selectedPaymentMethodId.value) return 'Please choose a payment method.'
		return 'Some attendees are missing required information.'
	}

	return 'Please complete required information before continuing.'
}

const primaryActionLabel = computed(() => {
	if (activeStepIndex.value === attendeeStepCount - 1) {
		if (store.currentIndex === store.attendees.length - 1) {
			return isBookingFree.value ? 'Complete registration' : 'Review payment'
		}
		return 'Next attendee'
	}
	return 'Continue'
})

const isConsentChecked = (consentId: number) => {
	return currentAttendee.value?.consents?.some((consent) => consent.consentId === consentId && consent.consentGiven) || false
}

const toggleConsent = (consentId: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const existing = currentAttendee.value.consents || []
	const updated = existing.filter((consent) => consent.consentId !== consentId)
	updated.push({ consentId, consentGiven: checked })
	store.setConsents(store.currentIndex, updated)
}

const refreshCheckoutPreview = async () => {
	if (!store.bookingIntentId) return
	if (activeStepIndex.value !== reviewStepIndex) return

	checkoutPreviewError.value = ''
	try {
		const payload = buildCheckoutPreviewPayload({
			bookingIntentId: store.bookingIntentId,
			attendees: store.attendees,
			discountCode: store.discountCode,
		})
		const response = await checkoutPreviewMutation.mutateAsync(payload)
		checkoutPreview.value = (response.data || null) as CheckoutPreviewData | null
	} catch (error) {
		checkoutPreview.value = null
		checkoutPreviewError.value = 'Unable to refresh payment breakdown right now.'
		console.error('Checkout preview failed', error)
	}
}

const scheduleCheckoutPreviewRefresh = () => {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
	}
	previewDebounceTimer = setTimeout(() => {
		void refreshCheckoutPreview()
	}, 350)
}

watch(
	[() => activeStepIndex.value, () => store.bookingIntentId, () => selectedPaymentMethodId.value, previewTriggerSignature],
	() => {
		if (activeStepIndex.value !== reviewStepIndex) return
		scheduleCheckoutPreviewRefresh()
	},
	{ immediate: true }
)

watch(
	[() => activeStepIndex.value, previewTriggerSignature],
	() => {
		if (activeStepIndex.value !== reviewStepIndex) return
		void hydrateReviewVariantCatalog()
	},
	{ immediate: true }
)



const clearAreaFrom = () => {
	if (!currentAttendee.value) return
	store.setAreaFrom(store.currentIndex, null, null)
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number | null => {
	if (!dateOfBirth) return null
	const today = new Date()
	const birthDate = new Date(dateOfBirth)
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age < 0 ? null : age
}

const currentAttendeeAge = computed(() => {
	return calculateAge(values.date_of_birth || currentAttendee.value?.date_of_birth || '')
})

// Track validation errors state
const hasAttendeeDetailsErrors = computed(() => {
	if (activeStepIndex.value !== 0) return false
	// Check for required fields with errors
	return !!(errors.value.first_name || errors.value.last_name || errors.value.date_of_birth)
})

const shouldShowStepPrecheckAlert = computed(() =>
	(activeStepIndex.value === 0 || activeStepIndex.value === 1 || activeStepIndex.value === 2 || activeStepIndex.value === reviewStepIndex)
	&& (precheckBookingErrors.value.length > 0 || precheckAttendeeErrors.value.length > 0)
)

// Sync form values when current attendee changes
// Only sync form values when the attendee index or step changes — NOT on every field edit.
// Using watchEffect here would re-run on every keystroke (because it tracks
// currentAttendee.value.first_name etc.) and would call resetForm, clearing errors.
watch(
	[() => store.currentIndex, () => activeStepIndex.value],
	() => {
		if (!currentAttendee.value || activeStepIndex.value !== 0) return
		resetForm({
			values: {
				first_name: currentAttendee.value.first_name || '',
				last_name: currentAttendee.value.last_name || '',
				email: currentAttendee.value.email || '',
				phone_number: currentAttendee.value.phone_number || '',
				date_of_birth: currentAttendee.value.date_of_birth || '',
				gender: currentAttendee.value.gender || '',
				relationship_to_user: currentAttendee.value.relationship_to_user || '',
			},
		})
	},
	{ immediate: true }
)

watch(
	[() => store.currentIndex, () => activeStepIndex.value],
	() => {
		if (activeStepIndex.value !== 0) return
		resetAttendeeInlineValidationState()
	}
)

const handleNext = async () => {
	const runStepPrecheck = async (): Promise<boolean> => {
		if (!store.bookingIntentId || !currentAttendee.value) return true

		try {
			const precheckResponse = await precheckMutation.mutateAsync({
				bookingIntentId: store.bookingIntentId,
				attendees: [currentAttendee.value],
			})
			const result = extractPrecheckResult(precheckResponse)
			if (result && !result.valid) {
				const bookingCodes = parsePrecheckBookingErrorCodes(result)
				const attendeeItems = parsePrecheckAttendeeErrors(result)
				precheckBookingErrors.value = bookingCodes
				precheckAttendeeErrors.value = attendeeItems
				const firstCode = bookingCodes[0] || attendeeItems[0]?.codes?.[0]
				toast.add({
					title: 'Registration check failed',
					description: firstCode ? formatPrecheckErrorCode(firstCode) : 'This attendee could not be validated yet.',
					color: 'red',
				})
				return false
			}
			if (!result) {
				throw new Error('Unable to parse precheck response.')
			}

			precheckBookingErrors.value = []
			precheckAttendeeErrors.value = []
			return true
		} catch (precheckError) {
			const result = extractPrecheckResult(precheckError)
			if (result?.booking_errors || result?.attendee_errors) {
				const bookingCodes = parsePrecheckBookingErrorCodes(result)
				const attendeeItems = parsePrecheckAttendeeErrors(result)
				precheckBookingErrors.value = bookingCodes
				precheckAttendeeErrors.value = attendeeItems
				const firstCode = bookingCodes[0] || attendeeItems[0]?.codes?.[0]
				toast.add({
					title: 'Registration check failed',
					description: firstCode ? formatPrecheckErrorCode(firstCode) : 'This attendee could not be validated yet.',
					color: 'red',
				})
				return false
			}
			toast.add({
				title: 'Registration check failed',
				description: 'Unable to validate attendee details right now. Please try again.',
				color: 'red',
			})
			console.warn('Step precheck failed and was blocked', precheckError)
			return false
		}
	}

	if (activeStepIndex.value === 0) {
		await runSafeValidation()
	}
	if (!canContinue.value) {
		if (activeStepIndex.value === 0) {
			forceShowAttendeeErrors.value = true
		}
		toast.add({
			title: 'Cannot continue',
			description: getCannotContinueMessage(),
			color: 'red',
		})
		return
	}

	if (activeStepIndex.value === 0 || activeStepIndex.value === 1 || activeStepIndex.value === 2) {
		const passedPrecheck = await runStepPrecheck()
		if (!passedPrecheck) return
	}

	if (!(await pingBookingIntent(true))) return

	if (activeStepIndex.value < attendeeStepCount - 1) {
		activeStepIndex.value += 1
		return
	}

	if (store.currentIndex < store.attendees.length - 1) {
		store.setCurrentIndex(store.currentIndex + 1)
		activeStepIndex.value = 0
	} else {
		activeStepIndex.value = reviewStepIndex
	}
}

const handleBack = async () => {
	if (!(await pingBookingIntent(true))) return

	if (activeStepIndex.value > 0 && activeStepIndex.value <= attendeeStepCount - 1) {
		activeStepIndex.value -= 1
		return
	}

	if (activeStepIndex.value === reviewStepIndex) {
		activeStepIndex.value = attendeeStepCount - 1
		return
	}

	if (store.currentIndex > 0) {
		store.setCurrentIndex(store.currentIndex - 1)
		activeStepIndex.value = attendeeStepCount - 1
		return
	}

	goBack()
}

const jumpToAttendee = async (index: number) => {
	if (!(await pingBookingIntent(true))) return
	store.setCurrentIndex(index)
	activeStepIndex.value = 0
}

const jumpToReview = async () => {
	if (!(await pingBookingIntent(true))) return
	activeStepIndex.value = reviewStepIndex
}

const handleCheckout = async () => {
	if (checkoutCompleted.value) return
	if (!agreedToTerms.value) {
		toast.add({
			title: 'Agreement required',
			description: 'Please tick agree to terms and conditions.',
			color: 'amber',
		})
		return
	}
	if (!canContinue.value || !store.bookingIntentId) return
	// Only require payment method for paid bookings
	if (!isBookingFree.value && !selectedPaymentMethodId.value) return
	if (!(await pingBookingIntent(false))) return

	// Run server-side precheck before committing to checkout
	try {
		const precheckResponse = await precheckMutation.mutateAsync({
			bookingIntentId: store.bookingIntentId,
			attendees: store.attendees,
		})
		const result = extractPrecheckResult(precheckResponse)
		if (result && !result.valid) {
			precheckBookingErrors.value = parsePrecheckBookingErrorCodes(result)
			precheckAttendeeErrors.value = parsePrecheckAttendeeErrors(result)
			toast.add({ title: 'Registration check failed', description: 'Some attendees could not be registered. Please review the errors shown.', color: 'red' })
			return
		}
		if (!result) {
			throw new Error('Unable to parse precheck response.')
		}
		precheckBookingErrors.value = []
		precheckAttendeeErrors.value = []
	} catch (precheckError) {
		const result = extractPrecheckResult(precheckError)
		if (result?.booking_errors || result?.attendee_errors) {
			precheckBookingErrors.value = parsePrecheckBookingErrorCodes(result)
			precheckAttendeeErrors.value = parsePrecheckAttendeeErrors(result)
			toast.add({ title: 'Registration check failed', description: 'Some attendees could not be registered. Please review the errors shown.', color: 'red' })
			return
		}
		toast.add({ title: 'Registration check failed', description: 'Unable to validate registration right now. Please try again.', color: 'red' })
		console.warn('Checkout precheck failed and was blocked', precheckError)
		return
	}

	isSaving.value = true
	checkoutResult.value = null
	stripeCardError.value = ''
	stripePaymentAttemptError.value = ''

	try {
		const missingPackageAttendeeIndex = store.attendees.findIndex((attendee) => !attendee.packageId)
		if (missingPackageAttendeeIndex >= 0) {
			toast.add({
				title: 'Missing ticket package',
				description: `Please select a package for attendee ${missingPackageAttendeeIndex + 1}.`,
				color: 'red',
			})
			return
		}

		if (!validateBankTransferEvidenceForm()) {
			toast.add({
				title: 'Missing transfer evidence',
				description: 'Add required bank transfer evidence before completing checkout.',
				color: 'red',
			})
			return
		}

		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			await reserveBankTransferPayment()
		}

		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			toast.add({
				title: 'Missing transfer reference',
				description: reservedBankTransferError.value || 'Please reserve the bank transfer reference before checkout.',
				color: 'red',
			})
			return
		}

		const paymentMethodId = isBookingFree.value ? -1 : (selectedPaymentMethodId.value as number)

		let bankTransferEvidenceId: string | undefined
		if (isBankTransferEvidenceRequiredImmediately.value) {
			bankTransferEvidenceId = await uploadBankTransferEvidenceForCheckout()
		}

		const bankTransferPaymentId = reservedBankTransferPaymentId.value || undefined
		const hasQuestionFiles = store.attendees.some((attendee) =>
			attendee.questionAnswers.some((answer) => Boolean(answer.uploadFile))
		)

		const checkoutBody = hasQuestionFiles
			? buildCheckoutMultipartPayload({
				bookingIntentId: store.bookingIntentId,
				paymentMethodId,
				attendees: store.attendees,
				paymentId: bankTransferPaymentId,
				bankTransferEvidenceId,
				discountCode: store.discountCode,
			})
			: buildCheckoutPayload({
				bookingIntentId: store.bookingIntentId,
				paymentMethodId,
				attendees: store.attendees,
				paymentId: bankTransferPaymentId,
				bankTransferEvidenceId,
				discountCode: store.discountCode,
				// TODO missing: stripePaymentIntentId:
			})

		const response = await checkoutMutation.mutateAsync({
			body: checkoutBody as any,
			idempotencyKey: idempotencyKey.value,
		})
		const normalizedCheckoutResponse = response as Record<string, any>
		checkoutResult.value = ((normalizedCheckoutResponse?.data ?? normalizedCheckoutResponse) || null) as any

		if (isBankTransferMethod.value && !checkoutResult.value?.bank_transfer_reference) {
			const paymentId = Number(checkoutResult.value?.payment_id || 0)
			if (paymentId > 0) {
				try {
					const paymentResponse = await paymentsListRetrieve({ path: { payment_id: String(paymentId) } })
					const paymentData = paymentResponse.data as Record<string, unknown> | undefined
					const fetchedReference = typeof paymentData?.bank_transfer_reference === 'string'
						? paymentData.bank_transfer_reference
						: null
					const fetchedInstructions = typeof paymentData?.bank_transfer_instructions === 'string'
						? paymentData.bank_transfer_instructions
						: null

					checkoutResult.value = {
						...checkoutResult.value,
						bank_transfer_reference: fetchedReference || checkoutResult.value?.bank_transfer_reference || null,
						bank_transfer_instructions: fetchedInstructions || checkoutResult.value?.bank_transfer_instructions || null,
					}
				} catch (paymentLookupError) {
					console.warn('Unable to hydrate bank transfer reference from payment details', paymentLookupError)
				}
			}
		}

		if (isStripeMethod.value) {
			stripeClientSecret.value = checkoutResult.value?.stripe_client_secret || null
			if (!stripeClientSecret.value) {
				throw new Error('Missing Stripe client secret in checkout response.')
			}

			await ensureStripeCardMounted()
			if (!stripeInstance.value || !stripeCardElement.value) {
				throw new Error('Stripe card form is not ready yet.')
			}

			const stripeAccountOption = requireStripeAccountIdFromPaymentMethod(selectedPaymentMethod.value, 'register checkout stripe confirm')
			console.debug('[register checkout stripe confirm] confirming card payment', {
				paymentMethodId: selectedPaymentMethod.value?.id || null,
				paymentMethodTitle: selectedPaymentMethod.value?.title || null,
				stripeAccountId: stripeAccountOption,
				clientSecretTail: stripeClientSecret.value.slice(-6),
			})

			const confirmation = await stripeInstance.value.confirmCardPayment(
				stripeClientSecret.value,
				{
					payment_method: {
						card: stripeCardElement.value,
						billing_details: {
							name: attendeeDisplayName(store.attendees[0], 0),
							email: store.attendees[0]?.email || undefined,
						},
					},
				},
				({ stripeAccount: stripeAccountOption } as any)
			)
			isSaving.value = false

			if (confirmation.error) {
				console.error('[register checkout stripe confirm] Stripe confirmation failed', {
					paymentMethodId: selectedPaymentMethod.value?.id || null,
					stripeAccountId: stripeAccountOption,
					message: confirmation.error.message || null,
					code: (confirmation.error as any)?.code || null,
					type: (confirmation.error as any)?.type || null,
				})
				stripePaymentAttemptError.value = confirmation.error.message || 'Card confirmation failed.'
				idempotencyKey.value = createIdempotencyKey()
				toast.add({ title: 'Payment failed', description: stripePaymentAttemptError.value, color: 'red' })
				return
			}

			console.info('[register checkout stripe confirm] Stripe confirmation succeeded', {
				paymentMethodId: selectedPaymentMethod.value?.id || null,
				stripeAccountId: stripeAccountOption,
				paymentIntentId: confirmation.paymentIntent?.id || null,
				status: confirmation.paymentIntent?.status || null,
			})

			if (confirmation.paymentIntent?.status === 'succeeded') {
				checkoutCompleted.value = true

				const paymentId = String(checkoutResult.value?.payment_id || '')
				const bookingId = Number(checkoutResult.value?.booking_id || 0)
				if (paymentId) {
					startPaymentStatusPolling(paymentId, bookingId > 0 ? bookingId : undefined)
					toast.add({
						title: 'Payment confirmed',
						description: 'Stripe confirmed your payment. Finalizing your registration now.',
						color: 'amber',
					})
					return
				}

				showCheckoutSuccessModal.value = true
				toast.add({
					title: 'Payment confirmed',
					description: 'Stripe payment confirmed. Registration is complete.',
					color: 'green',
				})
				return
			}

			toast.add({
				title: 'Payment processing',
				description: 'Stripe is still processing your payment.',
				color: 'amber',
			})
			checkoutCompleted.value = true
			showCheckoutSuccessModal.value = true
			return
		}

		checkoutCompleted.value = true
		showCheckoutSuccessModal.value = true
		if (isBankTransferMethod.value) {
			const description = checkoutBankTransferReference.value
				? `Registration completed. Use reference ${checkoutBankTransferReference.value} for your transfer.`
				: 'Registration completed. Your transfer reference will appear in payment details shortly.'
			toast.add({ title: 'Registration submitted', description, color: 'green' })
			clearReservedBankTransferPayment()
		} else {
			toast.add({ title: 'Success', description: 'Registration completed.', color: 'green' })
		}
	} catch (error) {
		console.error('Checkout failed', error)
		idempotencyKey.value = createIdempotencyKey()
		let description = 'Checkout failed. Please try again.'
		if (error instanceof Error && error.message) {
			description = error.message
		}
		const payload = (error as any)?.data || (error as any)?.response?._data || (error as any)?.response?.data
		if (typeof payload === 'string' && payload) {
			description = payload
		} else if (payload && typeof payload === 'object') {
			const firstValue = Object.values(payload)[0] as any
			if (Array.isArray(firstValue) && firstValue[0]) {
				description = String(firstValue[0])
			} else if (typeof firstValue === 'string') {
				description = firstValue
			}
		}
		toast.add({ title: 'Error', description, color: 'red' })
	} finally {
		isSaving.value = false
	}
	}

const closeSuccessModalAndRedirect = () => {
	showCheckoutSuccessModal.value = false
	showIntentExpiredModal.value = false
	stopIntentPing()
	stopIntentCountdown()
	store.reset()
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.url_safe_title}/b` })
		return
	}
	router.push({ path: '/events' })
}

onBeforeUnmount(() => {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
		previewDebounceTimer = null
	}
	stopIntentPing()
	stopIntentCountdown()
	stopPaymentStatusPolling()
	teardownStripeElements()
})

const goBack = () => {
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.url_safe_title}` })
		return
	}
	router.back()
}
</script>

<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
	transition: opacity 0.24s ease, transform 0.24s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
	opacity: 0;
	transform: translateY(8px);
}

.stepper-slide-forward-enter-active,
.stepper-slide-forward-leave-active,
.stepper-slide-back-enter-active,
.stepper-slide-back-leave-active {
	transition: opacity 0.24s ease, transform 0.24s ease;
}

.stepper-slide-forward-enter-from,
.stepper-slide-back-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

.stepper-slide-forward-leave-to,
.stepper-slide-back-enter-from {
	opacity: 0;
	transform: translateX(-20px);
}

.success-modal {
	position: relative;
	overflow: hidden;
	background: linear-gradient(180deg, #f8fafc 0%, #ffffff 62%);
}

.success-glow {
	pointer-events: none;
	position: absolute;
	inset: -90px -10% auto;
	height: 210px;
	background: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.06) 38%, rgba(255, 255, 255, 0) 70%);
}

.success-pop {
	position: relative;
	animation: successRise 0.75s ease-out;
}

.success-check {
	animation: successPulse 1.2s ease-out;
}

.success-title {
	animation: successFadeIn 0.9s ease-out;
}

.success-event-lead {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 0.5s forwards;
}

.success-event-name {
	opacity: 0;
	animation: successFadeIn 1s ease-out 0.8s forwards;
}

.success-stagger .success-card {
	opacity: 0;
	animation: successCardIn 0.65s ease both;
	animation-delay: 1.15s;
}

.success-stagger .success-card:nth-child(2) {
	animation-delay: 1.28s;
}

.success-stagger .success-card:nth-child(3) {
	animation-delay: 1.4s;
}

.success-stagger .success-card:nth-child(4) {
	animation-delay: 1.52s;
}

.success-stagger .success-card:nth-child(5) {
	animation-delay: 1.64s;
}

.success-stagger .success-card:nth-child(6) {
	animation-delay: 1.76s;
}

.success-cta-wrap {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 1.95s forwards;
}

.checkout-lock {
	user-select: none;
}

.checkout-overlay-top {
	height: 72px;
	background: linear-gradient(180deg, rgba(219, 234, 254, 0.85) 0%, rgba(255, 255, 255, 0) 100%);
}

.checkout-orbit {
	animation: checkoutOrbit 1.1s linear infinite;
	transform-origin: center;
}

.checkout-progress-line {
	position: relative;
	height: 6px;
	border-radius: 999px;
	background: rgba(59, 130, 246, 0.25);
	overflow: hidden;
}

.checkout-progress-dot {
	position: absolute;
	top: 50%;
	left: 0;
	width: 110px;
	height: 110%;
	border-radius: 999px;
	background: linear-gradient(90deg, rgba(37, 99, 235, 0), rgba(37, 99, 235, 0.95), rgba(37, 99, 235, 0));
	transform: translateY(-50%);
	animation: checkoutProgress 1.4s ease-in-out infinite;
}

@keyframes successRise {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes successPulse {
	0% {
		transform: scale(0.5) rotate(-12deg);
		opacity: 0;
	}
	60% {
		transform: scale(1.14) rotate(0deg);
		opacity: 1;
	}
	100% {
		transform: scale(1);
	}
}

@keyframes successCardIn {
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes successFadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes checkoutOrbit {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes checkoutProgress {
	0% {
		left: -28%;
	}
	50% {
		left: 42%;
	}
	100% {
		left: 100%;
	}
}
</style>