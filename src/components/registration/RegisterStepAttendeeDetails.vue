<template>
	<div class="w-full min-w-0 space-y-6">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Attendee details</h2>
			<p class="text-sm text-gray-600" v-if="isRegistrarSelf">Please provide <b>YOUR</b> details.</p>
			<p class="text-sm text-gray-600" v-else>Tell us about this attendee and their relationship to you.</p>
		</div>

		<div class="grid w-full min-w-0 gap-4 sm:grid-cols-2">
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">First name <span class="text-red-500">*</span></label>
				<UInput
					class="w-full"
					:model-value="values.first_name"
					placeholder="First name"
					maxlength="20"
					@update:model-value="(val) => emit('update-field-validate', 'first_name', val)"
					:color="errors.first_name ? 'red' : 'gray'"
				/>
				<p v-if="errors.first_name" class="mt-1 text-xs text-red-500">{{ errors.first_name }}</p>
			</div>
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">Last name <span class="text-red-500">*</span></label>
				<UInput
					class="w-full"
					:model-value="values.last_name"
					placeholder="Last name"
					maxlength="20"
					@update:model-value="(val) => emit('update-field-validate', 'last_name', val)"
					:color="errors.last_name ? 'red' : 'gray'"
				/>
				<p v-if="errors.last_name" class="mt-1 text-xs text-red-500">{{ errors.last_name }}</p>
			</div>
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
				<UInput
					class="w-full"
					:model-value="values.email"
					type="email"
					placeholder="email@example.com"
					@update:model-value="(val) => emit('update-field-validate', 'email', val)"
					:color="errors.email ? 'red' : 'gray'"
				/>
				<p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
			</div>
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
				<UInput
					class="w-full"
					:model-value="values.phone_number"
					placeholder="Phone number"
					@update:model-value="(val) => emit('update-field-validate', 'phone_number', val)"
					:color="errors.phone_number ? 'red' : 'gray'"
				/>
				<p v-if="errors.phone_number" class="mt-1 text-xs text-red-500">{{ errors.phone_number }}</p>
			</div>
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">Date of birth <span class="text-red-500">*</span></label>
				<UInput
					class="w-full"
					:model-value="values.date_of_birth"
					type="date"
					@update:model-value="(val) => emit('update-field-validate', 'date_of_birth', val)"
					:color="errors.date_of_birth ? 'red' : 'gray'"
				/>
				<p v-if="errors.date_of_birth" class="mt-1 text-xs text-red-500">{{ errors.date_of_birth }}</p>
				<p v-if="currentAttendeeAge !== null" class="mt-2 text-sm font-medium text-slate-600">
					Age: <span class="font-bold text-slate-900">{{ currentAttendeeAge }}</span> years old
				</p>
			</div>
			<div class="min-w-0">
				<label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
				<USelectMenu
					class="w-full"
					:model-value="values.gender"
					:options="genderOptions"
					value-attribute="value"
					option-attribute="label"
					placeholder="Select gender"
					@update:model-value="(val) => emit('update-field', 'gender', val)"
				/>
			</div>
			<div v-if="showRelationshipField && !isRegistrarSelf" class="min-w-0 sm:col-span-2">
				<label class="mb-1 block text-sm font-medium text-gray-700">Relationship to you <span class="text-red-500">*</span></label>
				<USelectMenu
					class="w-full"
					:model-value="values.relationship_to_user"
					:options="relationshipOptions"
					value-attribute="value"
					option-attribute="label"
					placeholder="Select relationship"
					@update:model-value="(val) => emit('update-field', 'relationship_to_user', val)"
					:disabled="isRegistrarSelf"
				/>
			</div>

			<div class="sm:col-span-2 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
				<p class="text-sm font-semibold text-slate-900">Area from <span class="text-red-500">*</span></p>
				<p class="mt-1 text-xs text-slate-600">
					Start typing to search for an area, then select from the list.
				</p>
				<div class="mt-4">
					<AreaSearchSelect
						:model-value="currentAreaFrom"
						:selected-label="currentAreaFromName"
						@select="onAreaSelected"
					/>
				</div>
				<div v-if="hasCurrentAreaFrom" class="mt-3">
					<UButton size="xs" color="gray" variant="ghost" @click="emit('clear-area-from')">
						Change area
					</UButton>
				</div>
				<p class="mt-3 text-xs font-semibold" :class="hasCurrentAreaFrom ? 'text-emerald-700' : 'text-slate-500'">
					{{ hasCurrentAreaFrom ? `✓ Area selected: ${currentAreaFromName}` : 'Select an area to continue.' }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">

import AreaSearchSelect from '~/components/ui/AreaSearchSelect.vue'

defineProps<{
	values: {
		first_name?: string
		last_name?: string
		email?: string
		phone_number?: string
		date_of_birth?: string
		gender?: string
		relationship_to_user?: string
	}
	errors: Partial<Record<string, string>>
	isRegistrarSelf: boolean
	showRelationshipField: boolean
	genderOptions: Array<{ label: string; value: string }>
	relationshipOptions: Array<{ label: string; value: string }>
	currentAttendeeAge: number | null
	hasCurrentAreaFrom: boolean
	currentAreaFrom: number | null | undefined
	currentAreaFromName: string | null | undefined
}>()

const emit = defineEmits<{
	'update-field': [field: string, value: string]
	'update-field-validate': [field: string, value: string]
	'select-area': [value: number, label: string]
	'clear-area-from': []
}>()

const onAreaSelected = (value: number, label: string) => {
	emit('select-area', value, label)
}
</script>
