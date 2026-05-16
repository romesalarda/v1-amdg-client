<template>
	<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-4 bg-white">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-black text-deep-navy uppercase tracking-tight">Invite Responses</h2>
				<p class="text-sm text-deep-navy/60 font-medium">Accept or decline sponsorship invites from event organisers.</p>
			</div>
			<span class="text-xs font-black uppercase tracking-wider text-deep-navy/50">Pending {{ pendingInvites.length }}</span>
		</div>

		<div v-if="!selectedEventId" class="text-center py-6 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
			<p class="text-sm font-bold text-deep-navy/60">Select an event to focus invite responses.</p>
		</div>

		<div v-if="isLoadingInvites" class="space-y-3">
			<USkeleton class="h-16 w-full" />
			<USkeleton class="h-16 w-full" />
		</div>

		<div
			v-else-if="eventInvites.length === 0"
			class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl"
		>
			<p class="text-sm font-bold text-deep-navy/60">No sponsor invites received yet.</p>
		</div>

		<div v-else class="space-y-3">
			<div
				v-for="invite in eventInvites"
				:key="invite.invite_id"
				class="p-5 border-2 border-deep-navy/10 rounded-xl"
			>
				<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div>
						<p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.email }}</p>
						<p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
							Sent {{ formatDateSafe(invite.sent_at) }}
						</p>
						<p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
							Event {{ invite.event_name || 'Unknown Event' }}
						</p>
						<div class="mt-2 flex items-center gap-2">
							<span class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Token</span>
							<code class="px-2 py-1 rounded bg-blue-500/10 text-blue-700 text-xs font-bold">{{ invite.token }}</code>
						</div>
					</div>

					<div class="flex flex-wrap items-center gap-2">
						<span
							:class="inviteBadgeClass(invite)"
							class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
						>
							{{ inviteBadgeLabel(invite) }}
						</span>

						<button
							v-if="invite.is_valid && !invite.accepted && !invite.declined"
							:disabled="isAcceptingToken"
							@click="acceptInviteToken(invite.token)"
							class="px-4 py-2 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
						>
							Accept
						</button>
						<button
							v-if="invite.is_valid && !invite.accepted && !invite.declined"
							:disabled="isDecliningToken"
							@click="declineInviteToken(invite.token)"
							class="px-4 py-2 border-2 border-red-600 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
						>
							Decline
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSponsorInvites } from '~/composables/communities/sponsors/useSponsorInvites'
import { formatDate } from '~/utils/time'

const props = defineProps<{
	selectedEventId: string
}>()

const {
	isLoadingInvites,
	eventInvites,
	pendingInvites,
	isAcceptingToken,
	isDecliningToken,
	acceptInviteToken,
	declineInviteToken,
	inviteBadgeLabel,
	inviteBadgeClass,
} = useSponsorInvites(computed(() => props.selectedEventId))

function formatDateSafe(value?: string | null) {
	if (!value) return 'Unknown date'
	return formatDate(value)
}
</script>
