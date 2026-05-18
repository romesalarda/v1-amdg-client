<template>
	<div class="space-y-6">
		<!-- Event info card -->
		<div class="rounded-2xl border-2 border-deep-navy/10 bg-deep-navy/[0.02] p-6 space-y-3">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40">Event</p>
			<h3 class="text-2xl font-black text-deep-navy uppercase tracking-tight leading-tight">
				{{ invite.event_title || invite.event_name || 'Event' }}
			</h3>
			<div v-if="invite.event_start_datetime" class="flex items-center gap-2 text-sm font-bold text-deep-navy/60">
				<span class="material-symbols-outlined text-base">calendar_today</span>
				<span>{{ formatDate(invite.event_start_datetime) }}</span>
				<template v-if="invite.event_end_datetime">
					<span>–</span>
					<span>{{ formatDate(invite.event_end_datetime) }}</span>
				</template>
			</div>
		</div>

		<!-- Invite details -->
		<div class="rounded-2xl border-2 border-deep-navy/10 p-6 space-y-4">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40">Your Invite</p>

			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-deep-navy/50">mail</span>
				<span class="text-sm font-bold text-deep-navy">{{ invite.email }}</span>
			</div>

			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-deep-navy/50">verified</span>
				<span
					class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
					:class="invite.is_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
				>
					{{ invite.is_valid ? 'Valid' : invite.accepted ? 'Already accepted' : 'Declined / expired' }}
				</span>
			</div>

			<div v-if="invite.organisation_name" class="flex items-center gap-3">
				<span class="material-symbols-outlined text-deep-navy/50">corporate_fare</span>
				<span class="text-sm font-bold text-deep-navy">{{ invite.organisation_name }}</span>
			</div>
		</div>

		<!-- Org name input (only when no pre-linked org) -->
		<div v-if="!hasOrg" class="space-y-2">
			<label class="block text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">
				Your Organisation Name <span class="text-red-500">*</span>
			</label>
			<p class="text-xs text-deep-navy/50 font-medium">
				A new organisation will be created in the system under your account.
			</p>
			<input
				:value="organisationName"
				type="text"
				placeholder="e.g. Acme Corporation"
				maxlength="255"
				class="w-full px-4 py-3 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm"
				@input="emit('update:organisationName', ($event.target as HTMLInputElement).value)"
			/>
		</div>

		<!-- Sponsor display name -->
		<div class="space-y-2">
			<label class="block text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">
				Sponsor Display Name <span class="text-deep-navy/30">(optional)</span>
			</label>
			<p class="text-xs text-deep-navy/50 font-medium">
				Defaults to your organisation name if left blank.
			</p>
			<input
				:value="sponsorName"
				type="text"
				placeholder="Name shown on the sponsor list"
				maxlength="200"
				class="w-full px-4 py-3 bg-white border-2 border-deep-navy/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm"
				@input="emit('update:sponsorName', ($event.target as HTMLInputElement).value)"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { SponsorInviteByTokenData } from '~/composables/resources/organisation/organisationSponsorInvites'

const props = defineProps<{
	invite: SponsorInviteByTokenData
	hasOrg: boolean
	organisationName: string
	sponsorName: string
}>()

const emit = defineEmits<{
	(e: 'update:organisationName', value: string): void
	(e: 'update:sponsorName', value: string): void
}>()

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}
</script>
