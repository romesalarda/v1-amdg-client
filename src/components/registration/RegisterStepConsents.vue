<template>
	<div class="space-y-6">
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
</template>

<script setup lang="ts">
defineProps<{
	consents: Array<{ id: number; title: string; description?: string; required?: boolean; external_link?: string | null }>
	isConsentChecked: (consentId: number) => boolean
	toggleConsent: (consentId: number, event: Event) => void
}>()
</script>
