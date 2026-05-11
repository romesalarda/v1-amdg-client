<template>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Personal info</h2>
			<p class="text-sm text-gray-600">Add any dietary, medical, or accessibility needs.</p>
			<div v-if="isAttendeeMinor(currentAttendee)" class="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
				<p class="text-sm font-semibold text-amber-800">⚠️ Emergency contact required</p>
				<p class="mt-1 text-xs text-amber-700">As this attendee is a minor, an emergency contact is required to continue.</p>
			</div>
		</div>

		<div class="grid gap-6">
			<!-- Community identifiers -->
			<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
				<h3 class="text-sm font-semibold text-slate-900">Community identifiers</h3>
				<p class="mt-1 text-xs text-slate-600">Optionally link this attendee to an organisation.</p>

				<div class="mt-4">
					<label class="mb-1 block text-sm font-medium text-gray-700">Organisation</label>
					<OrganisationSelect
						:model-value="currentAttendee.personalInfo.organisationId ?? null"
						@update:model-value="(value) => { currentAttendee.personalInfo.organisationId = value }"
					/>
				</div>
			</div>

			<!-- Alternative sign-in -->
			<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
				<h3 class="text-sm font-semibold text-slate-900">Alternative sign-in identifier</h3>
				<p class="mt-1 text-xs text-slate-600">Optionally attach one event-supported external identifier for this attendee.</p>

				<div class="mt-4">
					<label class="mb-1 block text-sm font-medium text-gray-700">Alternative sign-in type</label>
					<USelectMenu
						:model-value="currentAttendee.personalInfo.alternativeSigninIdentifier?.eventAlternativeSigninId || undefined"
						:options="buildAlternativeSigninSelectOptions(alternativeSigninOptions)"
						value-attribute="value"
						option-attribute="label"
						placeholder="Select sign-in type"
						:loading="alternativeSigninsLoading"
						@update:model-value="(value) => {
							if (!value) {
								currentAttendee.personalInfo.alternativeSigninIdentifier = null
								return
							}
							if (!currentAttendee.personalInfo.alternativeSigninIdentifier) {
								currentAttendee.personalInfo.alternativeSigninIdentifier = { eventAlternativeSigninId: '', identifier: '' }
							}
							currentAttendee.personalInfo.alternativeSigninIdentifier.eventAlternativeSigninId = String(value)
						}"
					/>
					<p
						v-if="!alternativeSigninsLoading && !alternativeSigninOptions.length"
						class="mt-2 text-xs text-slate-500"
					>
						No alternative sign-in types are currently available for this event.
					</p>
				</div>

				<div v-if="currentAttendee.personalInfo.alternativeSigninIdentifier" class="mt-4">
					<label class="mb-1 block text-sm font-medium text-gray-700">Alternative sign-in identifier</label>
					<UInput
						:model-value="currentAttendee.personalInfo.alternativeSigninIdentifier.identifier"
						placeholder="Enter identifier value"
						@update:model-value="(value) => {
							if (!currentAttendee.personalInfo.alternativeSigninIdentifier) return
							currentAttendee.personalInfo.alternativeSigninIdentifier.identifier = String(value || '')
						}"
					/>
					<p
						v-if="findAlternativeSigninOption(alternativeSigninOptions, currentAttendee.personalInfo.alternativeSigninIdentifier?.eventAlternativeSigninId)?.formatMatch"
						class="mt-2 text-xs text-slate-500"
					>
						Expected format:
						<span class="font-mono">
							{{ findAlternativeSigninOption(alternativeSigninOptions, currentAttendee.personalInfo.alternativeSigninIdentifier?.eventAlternativeSigninId)?.formatMatch }}
						</span>
					</p>
					<p
						v-if="findAlternativeSigninOption(alternativeSigninOptions, currentAttendee.personalInfo.alternativeSigninIdentifier?.eventAlternativeSigninId)?.description"
						class="mt-1 text-xs text-slate-500"
					>
						{{ findAlternativeSigninOption(alternativeSigninOptions, currentAttendee.personalInfo.alternativeSigninIdentifier?.eventAlternativeSigninId)?.description }}
					</p>
				</div>
			</div>

			<!-- Dietary Requirements -->
			<div class="rounded-xl border border-slate-200 bg-white p-4">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 text-left"
					@click="toggleSection('dietary')"
				>
					<div>
						<h3 class="text-sm font-semibold text-gray-900">Dietary requirements</h3>
						<p v-if="!sectionsOpen.dietary" class="mt-1 text-xs text-gray-500">{{ dietarySummary }}</p>
					</div>
					<div class="flex items-center gap-1 text-xs font-semibold text-slate-600">
						<span>{{ sectionsOpen.dietary ? 'Collapse' : 'Add / View' }}</span>
						<UIcon :name="sectionsOpen.dietary ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
					</div>
				</button>
				<div v-if="sectionsOpen.dietary && dietaryRequirements.length" class="mt-3 space-y-3">
					<div
						v-for="requirement in dietaryRequirements"
						:key="requirement.id"
						class="rounded-lg border border-gray-200 p-3 transition-all"
					>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								:id="`dietary-${requirement.id}`"
								:value="requirement.id"
								:checked="hasPersonalInfoItem(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
								@change="toggleDietaryRequirement(requirement.id, $event)"
								class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<label :for="`dietary-${requirement.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
								{{ requirement.label }}
							</label>
						</div>
						<div
							v-if="hasPersonalInfoItem(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
							class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
						>
							<div>
								<label class="mb-1 block text-xs font-semibold text-gray-700">
									Details
									<span v-if="isOtherOption(requirement.id)" class="text-red-500">*</span>
								</label>
								<textarea
									:value="getDetailsForItem(requirement.id, currentAttendee.personalInfo.dietaryRequirements)"
									placeholder="Describe your dietary requirement..."
									@input="updateDietaryRequirementDetails(requirement.id, ($event.target as HTMLTextAreaElement).value)"
									class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
									rows="2"
								/>
								<p class="mt-1 text-xs text-gray-500">Visible to event organizers and catering team</p>
								<p
									v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
									class="mt-1 text-xs text-red-600"
								>
									{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.dietaryRequirements, requirement.id) }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<p v-if="sectionsOpen.dietary && !dietaryRequirements.length" class="mt-2 text-xs text-gray-500">No dietary requirements available.</p>
			</div>

			<!-- Medical Conditions -->
			<div class="rounded-xl border border-slate-200 bg-white p-4">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 text-left"
					@click="toggleSection('medical')"
				>
					<div>
						<h3 class="text-sm font-semibold text-gray-900">Medical conditions</h3>
						<p v-if="!sectionsOpen.medical" class="mt-1 text-xs text-gray-500">{{ medicalSummary }}</p>
					</div>
					<div class="flex items-center gap-1 text-xs font-semibold text-slate-600">
						<span>{{ sectionsOpen.medical ? 'Collapse' : 'Add / View' }}</span>
						<UIcon :name="sectionsOpen.medical ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
					</div>
				</button>
				<div v-if="sectionsOpen.medical && medicalConditions.length" class="mt-3 space-y-3">
					<div
						v-for="condition in medicalConditions"
						:key="condition.id"
						class="rounded-lg border border-gray-200 p-3 transition-all"
					>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								:id="`medical-${condition.id}`"
								:value="condition.id"
								:checked="hasPersonalInfoItem(currentAttendee.personalInfo.medicalConditions, condition.id)"
								@change="toggleMedicalCondition(condition.id, $event)"
								class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<label :for="`medical-${condition.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
								{{ condition.label }}
							</label>
						</div>
						<div
							v-if="hasPersonalInfoItem(currentAttendee.personalInfo.medicalConditions, condition.id)"
							class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
						>
							<div>
								<label class="mb-1 block text-xs font-semibold text-gray-700">Severity</label>
								<USelectMenu
									:model-value="currentAttendee.personalInfo.medicalConditions.find(d => d.id === condition.id)?.severity || ''"
									:options="[
										{ label: 'Mild', value: 'mild' },
										{ label: 'Moderate', value: 'moderate' },
										{ label: 'Severe', value: 'severe' }
									]"
									value-attribute="value"
									option-attribute="label"
									placeholder="Select severity"
									@update:model-value="(val) => updateMedicalConditionSeverity(condition.id, val as 'mild' | 'moderate' | 'severe' | null)"
								/>
							</div>
							<div>
								<label class="mb-1 block text-xs font-semibold text-gray-700">
									Details (public-facing)
									<span v-if="isOtherOption(condition.id)" class="text-red-500">*</span>
								</label>
								<textarea
									:value="getDetailsForItem(condition.id, currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[])"
									placeholder="Describe the condition..."
									@input="updateMedicalConditionDetails(condition.id, ($event.target as HTMLTextAreaElement).value)"
									class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
									rows="2"
								/>
								<p class="mt-1 text-xs text-gray-500">Visible to event organizers and first aid team</p>
								<p
									v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[], condition.id)"
									class="mt-1 text-xs text-red-600"
								>
									{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[], condition.id) }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<p v-if="sectionsOpen.medical && !medicalConditions.length" class="mt-2 text-xs text-gray-500">No medical conditions available.</p>
			</div>

			<!-- Accessibility Requirements -->
			<div class="rounded-xl border border-slate-200 bg-white p-4">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 text-left"
					@click="toggleSection('accessibility')"
				>
					<div>
						<h3 class="text-sm font-semibold text-gray-900">Accessibility requirements</h3>
						<p v-if="!sectionsOpen.accessibility" class="mt-1 text-xs text-gray-500">{{ accessibilitySummary }}</p>
					</div>
					<div class="flex items-center gap-1 text-xs font-semibold text-slate-600">
						<span>{{ sectionsOpen.accessibility ? 'Collapse' : 'Add / View' }}</span>
						<UIcon :name="sectionsOpen.accessibility ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
					</div>
				</button>
				<div v-if="sectionsOpen.accessibility && accessibilityRequirements.length" class="mt-3 space-y-3">
					<div
						v-for="requirement in accessibilityRequirements"
						:key="requirement.id"
						class="rounded-lg border border-gray-200 p-3 transition-all"
					>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								:id="`accessibility-${requirement.id}`"
								:value="requirement.id"
								:checked="hasPersonalInfoItem(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
								@change="toggleAccessibilityRequirement(requirement.id, $event)"
								class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<label :for="`accessibility-${requirement.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
								{{ requirement.label }}
							</label>
						</div>
						<div
							v-if="hasPersonalInfoItem(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
							class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
						>
							<div>
								<label class="mb-1 block text-xs font-semibold text-gray-700">
									Details (public-facing)
									<span v-if="isOtherOption(requirement.id)" class="text-red-500">*</span>
								</label>
								<textarea
									:value="getDetailsForItem(requirement.id, currentAttendee.personalInfo.accessibilityRequirements)"
									placeholder="Describe your accessibility needs..."
									@input="updateAccessibilityRequirementDetails(requirement.id, ($event.target as HTMLTextAreaElement).value)"
									class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
									rows="2"
								/>
								<p class="mt-1 text-xs text-gray-500">Visible to event organizers and accessibility team</p>
								<p
									v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
									class="mt-1 text-xs text-red-600"
								>
									{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.accessibilityRequirements, requirement.id) }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<p v-if="sectionsOpen.accessibility && !accessibilityRequirements.length" class="mt-2 text-xs text-gray-500">No accessibility requirements available.</p>
			</div>

			<!-- Emergency Contact -->
			<div class="rounded-xl border border-slate-200 bg-white p-4">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 text-left"
					@click="toggleSection('emergency')"
				>
					<div>
						<h3 class="text-sm font-semibold text-gray-900">
							Emergency contact
							<span v-if="isAttendeeMinor(currentAttendee)" class="text-red-500">*</span>
						</h3>
						<p v-if="!sectionsOpen.emergency" class="mt-1 text-xs text-gray-500">{{ emergencyContactSummary }}</p>
					</div>
					<div class="flex items-center gap-1 text-xs font-semibold text-slate-600">
						<span>{{ sectionsOpen.emergency ? 'Collapse' : 'Add / View' }}</span>
						<UIcon :name="sectionsOpen.emergency ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
					</div>
				</button>

				<div v-if="sectionsOpen.emergency" class="mt-3">
					<div class="flex items-center justify-end">
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
							<label class="mb-1 block text-sm font-medium text-gray-700">First name <span class="text-red-500">*</span></label>
							<UInput
								v-model="currentAttendee.personalInfo.emergencyContact.first_name"
								placeholder="First name"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Last name <span class="text-red-500">*</span></label>
							<UInput
								v-model="currentAttendee.personalInfo.emergencyContact.last_name"
								placeholder="Last name"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Phone number <span class="text-red-500">*</span></label>
							<UInput
								v-model="currentAttendee.personalInfo.emergencyContact.phone_number"
								placeholder="Phone number"
							/>
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
							<UInput
								v-model="currentAttendee.personalInfo.emergencyContact.email"
								type="email"
								placeholder="Email address"
							/>
						</div>
					</div>
					<p
						v-else-if="isAttendeeMinor(currentAttendee)"
						class="mt-2 text-xs font-semibold text-red-600"
					>
						Emergency contact is required for attendees under 18.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AttendeeDraft, PersonalInfoItemDraft } from '~/stores/registration'
import OrganisationSelect from '~/components/ui/OrganisationSelect.vue'

const props = defineProps<{
	currentAttendee: AttendeeDraft
	isAttendeeMinor: (attendee: AttendeeDraft) => boolean
	dietaryRequirements: Array<{ id: number; label: string }>
	medicalConditions: Array<{ id: number; label: string }>
	accessibilityRequirements: Array<{ id: number; label: string }>
	alternativeSigninOptions: Array<{ id: string; title: string; description: string | null; formatMatch: string | null }>
	alternativeSigninsLoading: boolean
	emergencyRelationshipOptions: Array<{ label: string; value: string }>
	hasPersonalInfoItem: (items: any[], id: number) => boolean
	isOtherOption: (id: number) => boolean
	getDetailsForItem: (id: number, items: PersonalInfoItemDraft[]) => string
	getPersonalInfoItemValidationError: (items: PersonalInfoItemDraft[], id: number) => string | null
	toggleDietaryRequirement: (id: number, event: Event) => void
	toggleMedicalCondition: (id: number, event: Event) => void
	toggleAccessibilityRequirement: (id: number, event: Event) => void
	updateDietaryRequirementDetails: (id: number, value: string) => void
	updateMedicalConditionSeverity: (id: number, value: 'mild' | 'moderate' | 'severe' | null) => void
	updateMedicalConditionDetails: (id: number, value: string) => void
	updateAccessibilityRequirementDetails: (id: number, value: string) => void
	addEmergencyContact: () => void
}>()

const {
	currentAttendee,
	isAttendeeMinor,
	dietaryRequirements,
	medicalConditions,
	accessibilityRequirements,
	alternativeSigninOptions,
	alternativeSigninsLoading,
	emergencyRelationshipOptions,
	hasPersonalInfoItem,
	isOtherOption,
	getDetailsForItem,
	getPersonalInfoItemValidationError,
	toggleDietaryRequirement,
	toggleMedicalCondition,
	toggleAccessibilityRequirement,
	updateDietaryRequirementDetails,
	updateMedicalConditionSeverity,
	updateMedicalConditionDetails,
	updateAccessibilityRequirementDetails,
	addEmergencyContact,
} = toRefs(props)

const buildAlternativeSigninSelectOptions = (
	options: Array<{ id: string; title: string; description: string | null; formatMatch: string | null }>
) => (options || []).map((option) => ({
	label: option.title,
	value: option.id,
}))

const findAlternativeSigninOption = (
	options: Array<{ id: string; title: string; description: string | null; formatMatch: string | null }>,
	selectedId?: string
) => {
	if (!selectedId) return null
	return (options || []).find((option) => option.id === selectedId) || null
}

type SectionKey = 'dietary' | 'medical' | 'accessibility' | 'emergency'

const sectionsOpen = ref<Record<SectionKey, boolean>>({
	dietary: false,
	medical: false,
	accessibility: false,
	emergency: false,
})

const toggleSection = (section: SectionKey) => {
	sectionsOpen.value[section] = !sectionsOpen.value[section]
}

const getSelectedLabelsSummary = (
	options: Array<{ id: number; label: string }>,
	selectedItems: Array<{ id: number }> | undefined,
	emptyState: string
) => {
	if (!selectedItems?.length) return emptyState
	const selectedIds = new Set(selectedItems.map((item) => item.id))
	const selectedLabels = options
		.filter((option) => selectedIds.has(option.id))
		.map((option) => option.label)

	if (!selectedLabels.length) return `${selectedItems.length} selected`
	if (selectedLabels.length <= 2) return selectedLabels.join(' • ')
	return `${selectedLabels.slice(0, 2).join(' • ')} +${selectedLabels.length - 2} more`
}

const dietarySummary = computed(() => getSelectedLabelsSummary(
	dietaryRequirements.value,
	currentAttendee.value.personalInfo.dietaryRequirements,
	'No dietary requirements selected'
))

const medicalSummary = computed(() => getSelectedLabelsSummary(
	medicalConditions.value,
	currentAttendee.value.personalInfo.medicalConditions,
	'No medical conditions selected'
))

const accessibilitySummary = computed(() => getSelectedLabelsSummary(
	accessibilityRequirements.value,
	currentAttendee.value.personalInfo.accessibilityRequirements,
	'No accessibility requirements selected'
))

const emergencyContactSummary = computed(() => {
	const emergencyContact = currentAttendee.value.personalInfo.emergencyContact
	if (!emergencyContact) {
		return isAttendeeMinor.value(currentAttendee.value)
			? 'Required for this attendee but not yet added'
			: 'No emergency contact added'
	}

	const fullName = [emergencyContact.first_name, emergencyContact.last_name]
		.filter(Boolean)
		.join(' ')

	const summaryParts = [
		fullName || null,
		emergencyContact.phone_number || null,
		emergencyContact.relationship || null,
	].filter(Boolean)

	return summaryParts.length ? summaryParts.join(' • ') : 'Emergency contact added'
})
</script>
