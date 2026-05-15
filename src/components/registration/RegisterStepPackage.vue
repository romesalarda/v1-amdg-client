<template>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Ticket package</h2>
			<p class="text-sm text-gray-600">Choose the package for this attendee.</p>
		</div>

		<template v-if="availableBookingPackages.length">
			<!-- Full Event Passes -->
			<div v-if="fullEventPackages.length">
				<h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Full Event Passes</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					<label
						v-for="pkg in fullEventPackages"
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
			</div>

			<!-- Day Passes -->
			<div v-if="dayPackages.length">
				<h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Day Passes</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					<label
						v-for="pkg in dayPackages"
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
			</div>

			<!-- Other Packages (e.g. WORKSHOP_ONLY) -->
			<div v-if="otherPackages.length">
				<h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Other Packages</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					<label
						v-for="pkg in otherPackages"
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
			</div>
			{{  }}
		</template>
		<p v-else class="text-sm text-gray-500">No packages are currently available for this attendee.</p>
		<p v-if="currentAttendee.packageId && !isCurrentAttendeePackageAvailable" class="text-xs font-semibold text-amber-700">
			The previously selected package is outside its availability window. Please pick another package.
		</p>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttendeeDraft } from '~/stores/registration'

const props = defineProps<{
	currentAttendee: AttendeeDraft
	availableBookingPackages: any[]
	isCurrentAttendeePackageAvailable: boolean
}>()

const fullEventPackages = computed(() =>
	props.availableBookingPackages.filter((pkg) => pkg.scope === 'FULL_EVENT')
)

const dayPackages = computed(() =>
	props.availableBookingPackages.filter((pkg) => pkg.scope === 'SINGLE_DAY')
)

const otherPackages = computed(() =>
	props.availableBookingPackages.filter((pkg) => pkg.scope !== 'FULL_EVENT' && pkg.scope !== 'SINGLE_DAY')
)
</script>
