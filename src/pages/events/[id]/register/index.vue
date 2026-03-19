<template>
	<div class="min-h-screen bg-gray-50">
		<div class="mx-auto max-w-5xl space-y-6 px-4 py-8">
			<div class="rounded-2xl border bg-white p-6 shadow-sm">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p class="text-xs font-semibold uppercase tracking-widest text-gray-500">Registration</p>
						<h1 class="text-2xl font-bold text-gray-900">
							{{ event?.title || 'Event Registration' }}
						</h1>
						<p class="mt-1 text-sm text-gray-600" v-if="store.ticketCount">
							Attendee {{ currentAttendeeNumber }} of {{ store.ticketCount }}
						</p>
					</div>
					<UButton color="gray" variant="ghost" @click="goBack">Back to event</UButton>
				</div>
			</div>

			<div class="rounded-2xl border bg-white p-6 shadow-sm">
				<div v-if="eventLoading" class="text-sm text-gray-500">Loading event details...</div>
				<div v-else-if="!event" class="text-sm text-red-600">Event not found.</div>
				<div v-else class="space-y-6">
					<div class="flex flex-wrap gap-2">
						<div
							v-for="(label, index) in steps"
							:key="label"
							class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
							:class="
								index === activeStepIndex
									? 'border-primary bg-primary/10 text-primary'
									: 'border-gray-200 text-gray-500'
							"
						>
							{{ label }}
						</div>
					</div>

					<div v-if="!currentAttendee" class="text-sm text-gray-500">
						Preparing registration details...
					</div>

					<div v-else>
						<div v-if="activeStepIndex === 0" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Attendee details</h2>
								<p class="text-sm text-gray-600">Tell us who will be attending.</p>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">First name</label>
									<UInput v-model="currentAttendee.first_name" placeholder="First name" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Last name</label>
									<UInput v-model="currentAttendee.last_name" placeholder="Last name" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
									<UInput v-model="currentAttendee.email" type="email" placeholder="email@example.com" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
									<UInput v-model="currentAttendee.phone_number" placeholder="Phone number" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Date of birth</label>
									<UInput v-model="currentAttendee.date_of_birth" type="date" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
									<USelectMenu
										v-model="currentAttendee.gender"
										:options="genderOptions"
										value-attribute="value"
										option-attribute="label"
										placeholder="Select gender"
									/>
								</div>
								<div class="sm:col-span-2">
									<label class="mb-1 block text-sm font-medium text-gray-700">Relationship to you</label>
									<USelectMenu
										v-model="currentAttendee.relationship_to_user"
										:options="relationshipOptions"
										value-attribute="value"
										option-attribute="label"
										placeholder="Select relationship"
										:disabled="isRegistrarSelf"
									/>
								</div>
							</div>
						</div>

						<div v-else-if="activeStepIndex === 1" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Event questions</h2>
								<p class="text-sm text-gray-600">Answer any questions the organizer added.</p>
							</div>

							<AttendeeQuestionAnswers
								:event="event"
								v-model="currentAttendee.questionAnswers"
							/>
						</div>

						<div v-else-if="activeStepIndex === 2" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Personal info</h2>
								<p class="text-sm text-gray-600">Add any dietary, medical, or accessibility needs.</p>
							</div>

							<div class="grid gap-6">
								<div>
									<h3 class="text-sm font-semibold text-gray-900">Dietary requirements</h3>
									<div v-if="dietaryRequirements.length" class="mt-3 grid gap-2 sm:grid-cols-2">
										<label
											v-for="requirement in dietaryRequirements"
											:key="requirement.id"
											class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
										>
											<input
												type="checkbox"
												:value="requirement.id"
												:checked="hasPersonalInfoItem(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
												@change="toggleDietaryRequirement(requirement.id, $event)"
												class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
											/>
											<span>{{ requirement.label }}</span>
										</label>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No dietary requirements available.</p>
								</div>

								<div>
									<h3 class="text-sm font-semibold text-gray-900">Medical conditions</h3>
									<div v-if="medicalConditions.length" class="mt-3 grid gap-2 sm:grid-cols-2">
										<label
											v-for="condition in medicalConditions"
											:key="condition.id"
											class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
										>
											<input
												type="checkbox"
												:value="condition.id"
												:checked="hasPersonalInfoItem(currentAttendee.personalInfo.medicalConditions, condition.id)"
												@change="toggleMedicalCondition(condition.id, $event)"
												class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary text-gray-900"
											/>
											<span>{{ condition.label }}</span>
										</label>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No medical conditions available.</p>
								</div>

								<div>
									<h3 class="text-sm font-semibold text-gray-900">Accessibility requirements</h3>
									<div v-if="accessibilityRequirements.length" class="mt-3 grid gap-2 sm:grid-cols-2">
										<label
											v-for="requirement in accessibilityRequirements"
											:key="requirement.id"
											class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
										>
											<input
												type="checkbox"
												:value="requirement.id"
												:checked="hasPersonalInfoItem(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
												@change="toggleAccessibilityRequirement(requirement.id, $event)"
												class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
											/>
											<span>{{ requirement?.label }}</span>
										</label>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No accessibility requirements available.</p>
								</div>

								<div>
									<div class="flex items-center justify-between">
										<h3 class="text-sm font-semibold text-gray-900">Emergency contact</h3>
										<UButton
											v-if="!currentAttendee?.personalInfo?.emergencyContact"
											size="xs"
											color="gray"
											variant="ghost"
											@click="addEmergencyContact"
										>
											Add contact
										</UButton>
									</div>

									<div
										v-if="currentAttendee?.personalInfo?.emergencyContact"
										class="mt-3 grid gap-4 sm:grid-cols-2"
									>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">First name</label>
											<UInput v-model="currentAttendee.personalInfo.emergencyContact.first_name" />
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Last name</label>
											<UInput v-model="currentAttendee.personalInfo.emergencyContact.last_name" />
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
											<UInput v-model="currentAttendee.personalInfo.emergencyContact.phone_number" />
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
											<USelectMenu
												v-model="currentAttendee.personalInfo.emergencyContact.relationship"
												:options="emergencyRelationshipOptions"
												value-attribute="value"
												option-attribute="label"
												placeholder="Select relationship"
											/>
										</div>
										<div class="sm:col-span-2">
											<label class="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
											<UInput v-model="currentAttendee.personalInfo.emergencyContact.email" type="email" />
										</div>
									</div>
								</div>
							</div>
						</div>

						<div v-else-if="activeStepIndex === 3" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Ticket package</h2>
								<p class="text-sm text-gray-600">Choose the package for this attendee.</p>
							</div>

							<div v-if="bookingPackages.length" class="grid gap-4 sm:grid-cols-2">
								<label
									v-for="pkg in bookingPackages"
									:key="pkg.id"
									class="flex cursor-pointer flex-col rounded-xl border p-4 text-sm"
									:class="pkg.id === currentAttendee.packageId ? 'border-primary bg-primary/5' : 'border-gray-200'"
								>
									<div class="flex items-center justify-between">
										<span class="font-semibold text-gray-900">{{ pkg.name }}</span>
										<input
											type="radio"
											class="h-4 w-4 text-primary"
											:value="pkg.id"
											v-model="currentAttendee.packageId"
										/>
									</div>
									<p class="mt-2 text-xs text-gray-600">{{ pkg.description || 'No description provided.' }}</p>
									<p class="mt-3 text-sm font-semibold text-gray-900">
										{{ pkg.modified_amount }} {{ pkg.base_amount_currency }}
									</p>
								</label>
							</div>
							<p v-else class="text-sm text-gray-500">No packages available for this attendee.</p>
						</div>

						<div v-else-if="activeStepIndex === 4" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Products</h2>
								<p class="text-sm text-gray-600">Optional add-ons will appear here when available.</p>
							</div>
							<div class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
								No products available for this event.
							</div>
						</div>

						<div v-else-if="activeStepIndex === 5" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Consents</h2>
								<p class="text-sm text-gray-600">Review and accept event consents.</p>
							</div>

							<div v-if="consents.length" class="space-y-4">
								<label
									v-for="consent in consents"
									:key="consent.id"
									class="flex items-start gap-3 rounded-xl border border-gray-200 p-4"
								>
									<input
										type="checkbox"
										class="mt-1 h-4 w-4 rounded border-gray-300 text-primary"
										:checked="isConsentChecked(consent.id)"
										@change="toggleConsent(consent.id, $event)"
									/>
									<div>
										<div class="flex items-center gap-2">
											<span class="text-sm font-semibold text-gray-900">{{ consent.title }}</span>
											<UBadge v-if="consent.required" color="red" variant="soft" size="xs">Required</UBadge>
										</div>
										<p class="mt-1 text-xs text-gray-600">{{ consent.description }}</p>
										<a
											v-if="consent.external_link"
											:href="consent.external_link"
											target="_blank"
											class="mt-2 inline-block text-xs font-semibold text-primary"
										>
											View details
										</a>
									</div>
								</label>
							</div>
							<p v-else class="text-sm text-gray-500">No consents required for this event.</p>
						</div>

						<div v-else-if="activeStepIndex === reviewStepIndex" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Review and pay</h2>
								<p class="text-sm text-gray-600">Confirm attendee selections and choose a payment method.</p>
							</div>

							<div class="space-y-4">
								<div
									v-for="(attendee, index) in store.attendees"
									:key="index"
									class="rounded-xl border border-gray-200 p-4"
								>
									<div class="flex items-start justify-between">
										<div>
											<p class="text-sm font-semibold text-gray-900">
												Attendee {{ index + 1 }}: {{ attendee.first_name }} {{ attendee.last_name }}
											</p>
											<p class="mt-1 text-xs text-gray-600">
												Package: {{ packageById(attendee.packageId)?.name || 'Not selected' }}
											</p>
										</div>
										<UButton size="xs" color="gray" variant="ghost" @click="jumpToAttendee(index)">
											Edit
										</UButton>
									</div>
								</div>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
								<USelectMenu
									v-if="paymentMethodOptions.length"
									v-model="selectedPaymentMethodId"
									:options="paymentMethodOptions"
									value-attribute="value"
									option-attribute="label"
									placeholder="Select a payment method"
								/>
							</div>

							<div v-if="checkoutResult" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
								<p class="font-semibold">Checkout complete</p>
								<p v-if="checkoutResult.booking_reference" class="mt-1">Reference: {{ checkoutResult.booking_reference }}</p>
								<p v-if="checkoutResult.bank_transfer_reference" class="mt-1">
									Bank transfer reference: {{ checkoutResult.bank_transfer_reference }}
								</p>
								<p v-if="checkoutResult.bank_transfer_instructions" class="mt-1">
									{{ checkoutResult.bank_transfer_instructions }}
								</p>
								<p v-if="checkoutResult.stripe_client_secret" class="mt-1">
									Stripe payment required. Client secret: {{ checkoutResult.stripe_client_secret }}
								</p>
							</div>
						</div>
					</div>

					<div class="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
						<UButton color="gray" variant="ghost" @click="handleBack">Back</UButton>
						<div class="flex items-center gap-3">
							<UButton
								v-if="activeStepIndex === reviewStepIndex"
								color="primary"
								:loading="isSaving"
								:disabled="!canContinue"
								@click="handleCheckout"
							>
								Complete registration
							</UButton>
							<UButton
								v-else
								color="primary"
								:loading="isSaving"
								:disabled="!canContinue"
								@click="handleNext"
							>
								{{ primaryActionLabel }}
							</UButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useRegistrationStore } from '~/stores/registration'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useCreateBookingIntent } from '~/composables/resources/booking/bookingIntents'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { useCheckoutBooking } from '~/composables/resources/booking/bookings'
import { buildCheckoutPayload, createIdempotencyKey } from '~/composables/registration/checkout'
import type { AttendeeDraft, PersonalInfoItemDraft, MedicalConditionItemDraft } from '~/stores/registration'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useRegistrationStore()

const eventId = computed(() => String(route.params.id || ''))
const ticketCount = computed(() => Number(route.query.tickets || 1))
const registrarAttending = computed(() => {
	const attending = String(route.query.o || 'true')
	return attending === 'true' || attending === '1'
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

const bookingIntentMutation = useCreateBookingIntent()
const isCreatingIntent = ref(false)

watchEffect(() => {
	if (!event.value || store.bookingIntentId || isCreatingIntent.value) return
	isCreatingIntent.value = true
	bookingIntentMutation
		.mutateAsync({
			event: event.value.event_id,
			intended_ticket_count: store.ticketCount,
		})
		.then((response) => {
			const intentId = response.data?.booking_intent_id
			if (intentId) {
				store.setBookingIntentId(intentId)
			}
		})
		.catch(() => {
			toast.add({ title: 'Error', description: 'Failed to create booking intent.', color: 'red' })
		})
		.finally(() => {
			isCreatingIntent.value = false
		})
})

const steps = [
	'Attendee details',
	'Event questions',
	'Personal info',
	'Ticket package',
	'Products',
	'Consents',
	'Review & pay',
]
const attendeeStepCount = 6
const reviewStepIndex = attendeeStepCount
const activeStepIndex = ref(0)

const currentAttendee = computed(() => store.attendees[store.currentIndex])
const currentAttendeeNumber = computed(() => store.currentIndex + 1)
const isRegistrarSelf = computed(() => store.registrarAttending && store.currentIndex === 0)

const relationshipOptions = [
	{ label: 'Self', value: 'self' },
	{ label: 'Spouse', value: 'spouse' },
	{ label: 'Child', value: 'child' },
	{ label: 'Friend', value: 'friend' },
	{ label: 'Parent', value: 'parent' },
	{ label: 'Sibling', value: 'sibling' },
	{ label: 'Other', value: 'other' },
]

const genderOptions = [
	{ label: 'Female', value: 'female' },
	{ label: 'Male', value: 'male' },
	{ label: 'Other', value: 'other' },
	{ label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const emergencyRelationshipOptions = [
	{ label: 'Parent', value: 'parent' },
	{ label: 'Sibling', value: 'sibling' },
	{ label: 'Child', value: 'child' },
	{ label: 'Spouse', value: 'spouse' },
	{ label: 'Friend', value: 'friend' },
	{ label: 'Other', value: 'other' },
]

const dietaryRequirementsQuery = useDietaryRequirements()
const medicalConditionsQuery = useMedicalConditions()
const accessibilityRequirementsQuery = useAccessibilityRequirements()

const dietaryRequirements = computed(() => dietaryRequirementsQuery.data.value?.data?.results || [])
const medicalConditions = computed(() => medicalConditionsQuery.data.value?.data?.results || [])
const accessibilityRequirements = computed(() => accessibilityRequirementsQuery.data.value?.data?.results || [])

const consentsQuery = useConsents(
	computed(() => (event.value?.event_id ? { event: String(event.value.event_id), page_size: 100 } : undefined))
)
const consents = computed(() => consentsQuery.data.value?.data?.results || [])

const eventQuestionsQuery = useEventQuestions(
	computed(() => (event.value?.id ? { event: event.value.id, page_size: 100 } : undefined)),
	{ enabled: computed(() => !!event.value?.id) }
)
const eventQuestions = computed(() => eventQuestionsQuery.data.value?.data?.results || [])
const requiredQuestionIds = computed(() => eventQuestions.value.filter((question) => question.required).map((question) => question.id))

const bookingPackagesQuery = useBookingPackages(
	computed(() => {
		return { event__event_id: event_uuid.value }
	})
)

const bookingPackages = computed(() => bookingPackagesQuery.data.value?.data?.results || [])
const allPackagesQuery = useBookingPackages(
	computed(() => {
		return { event__event_id: event_uuid.value, page_size: 200 }
	})
)
const allPackages = computed(() => allPackagesQuery.data.value?.data?.results || [])
const packageById = (packageId?: number) => allPackages.value.find((pkg) => pkg.id === packageId)

const paymentMethodsQuery = usePaymentMethods(
	computed(() => ({ event__event_id: event_uuid.value, page_size: 100 }))
)
const paymentMethodOptions = computed(() =>
	(paymentMethodsQuery.data.value?.data?.results || []).map((method) => ({
		label: method.title,
		value: method.id,
	}))
)
const selectedPaymentMethodId = ref<number | undefined>(undefined)

const checkoutMutation = useCheckoutBooking()
const idempotencyKey = ref(createIdempotencyKey())

const isSaving = ref(false)
const checkoutResult = ref<any>(null)

const requiredConsentsMissing = computed(() => {
	if (!consents.value.length) return 0
	return consents.value.filter((consent) => consent.required && !isConsentChecked(consent.id)).length
})

const requiredConsentIds = computed(() => consents.value.filter((consent) => consent.required).map((consent) => consent.id))

const hasPersonalInfoItem = (items: PersonalInfoItemDraft[] | MedicalConditionItemDraft[], id: number) => {
	return items.some((item) => item.id === id)
}

const updatePersonalInfoItems = <T extends PersonalInfoItemDraft | MedicalConditionItemDraft>(
	items: T[],
	id: number,
	checked: boolean,
) => {
	const next = items.filter((item) => item.id !== id) as T[]
	if (checked) {
		next.push({ id } as T)
	}
	return next
}

const toggleDietaryRequirement = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.dietaryRequirements, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, dietaryRequirements: updated })
}

const toggleMedicalCondition = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.medicalConditions, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, medicalConditions: updated })
}

const toggleAccessibilityRequirement = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.accessibilityRequirements, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, accessibilityRequirements: updated })
}

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

const isAttendeeReady = (attendee: AttendeeDraft) => {
	const hasNames = !!attendee.first_name && !!attendee.last_name
	const hasRelationship = !!attendee.relationship_to_user || (store.registrarAttending && attendee === store.attendees[0])
	const hasDob = !!attendee.date_of_birth
	const hasPackage = !!attendee.packageId
	return hasNames && hasRelationship && hasDob && hasPackage && attendeeHasRequiredAnswers(attendee) && attendeeHasRequiredConsents(attendee)
}

const canContinue = computed(() => {
	if (!currentAttendee.value) return false
	if (activeStepIndex.value === 0) {
		const hasNames = !!currentAttendee.value.first_name && !!currentAttendee.value.last_name
		const hasRelationship = !!currentAttendee.value.relationship_to_user || isRegistrarSelf.value
		const hasDob = !!currentAttendee.value.date_of_birth
		return hasNames && hasRelationship && hasDob
	}
	if (activeStepIndex.value === 1) {
		return attendeeHasRequiredAnswers(currentAttendee.value)
	}
	if (activeStepIndex.value === 3) {
		return !!currentAttendee.value.packageId
	}
	if (activeStepIndex.value === 5) {
		return requiredConsentsMissing.value === 0
	}
	if (activeStepIndex.value === reviewStepIndex) {
		const allAttendeesReady = store.attendees.every((attendee) => isAttendeeReady(attendee))
		return !!store.bookingIntentId && !!selectedPaymentMethodId.value && allAttendeesReady
	}
	return true
})

const primaryActionLabel = computed(() => {
	if (activeStepIndex.value === attendeeStepCount - 1) {
		return store.currentIndex === store.attendees.length - 1 ? 'Review payment' : 'Next attendee'
	}
	return 'Continue'
})

const addEmergencyContact = () => {
	if (!currentAttendee.value?.personalInfo) return
	currentAttendee.value.personalInfo.emergencyContact = {
		first_name: '',
		last_name: '',
		phone_number: '',
		relationship: undefined,
		email: '',
		primary_contact: true,
	}
}

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

const handleNext = () => {
	if (!canContinue.value) return

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

const handleBack = () => {
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

const jumpToAttendee = (index: number) => {
	store.setCurrentIndex(index)
	activeStepIndex.value = 0
}

const handleCheckout = async () => {
	if (!canContinue.value || !store.bookingIntentId || !selectedPaymentMethodId.value) return
	isSaving.value = true
	checkoutResult.value = null

	try {
		const payload = buildCheckoutPayload({
			bookingIntentId: store.bookingIntentId,
			paymentMethodId: selectedPaymentMethodId.value,
			attendees: store.attendees,
		})
		const response = await checkoutMutation.mutateAsync({
			body: payload,
			idempotencyKey: idempotencyKey.value,
		})
		checkoutResult.value = response.data
		toast.add({ title: 'Success', description: 'Checkout completed.', color: 'green' })
	} catch (error) {
		console.error('Checkout failed', error)
		toast.add({ title: 'Error', description: 'Checkout failed. Please try again.', color: 'red' })
	} finally {
		isSaving.value = false
	}
}

const goBack = () => {
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.event_id}` })
		return
	}
	router.back()
}
</script>