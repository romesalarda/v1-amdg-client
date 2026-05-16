<template>
	<CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
		<div class="bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-deep-navy rounded-2xl shadow-drawn p-8 space-y-8">
			<div class="flex flex-col gap-4">
				<!-- Page header -->
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<p class="text-[10px] font-black text-deep-navy/60 uppercase tracking-[0.3em]">Community Sponsorships</p>
						<h1 class="text-3xl md:text-4xl font-black text-deep-navy uppercase tracking-tight">Inbound + Outbound Momentum</h1>
						<p class="mt-2 text-sm text-deep-navy/60 font-medium max-w-2xl">
							Track who sponsors your events, what you sponsor elsewhere, and move from selection to checkout in three clear steps.
						</p>
					</div>
					<div class="flex items-center gap-3">
						<div class="px-4 py-3 rounded-xl border-2 border-deep-navy/20 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Net Revenue Delta</p>
							<p class="mt-1 text-lg font-black text-deep-navy">{{ formatMoney(String(netCompletedRevenueDelta), 'GBP') }}</p>
						</div>
						<div class="px-4 py-3 rounded-xl border-2 border-deep-navy/20 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Net Sponsors</p>
							<p class="mt-1 text-lg font-black text-deep-navy">{{ netSponsorDelta }}</p>
						</div>
					</div>
				</div>

				<!-- Tab navigation -->
				<div class="grid grid-cols-3 gap-2 bg-deep-navy/5 rounded-xl p-2 border-2 border-deep-navy/10">
					<button
						type="button"
						@click="transitionTab('overview')"
						:class="activeTab === 'overview' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
						class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
					>
						Overview
					</button>
					<button
						type="button"
						@click="transitionTab('flow')"
						:class="activeTab === 'flow' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
						class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
					>
						Sponsor Flow
					</button>
					<button
						type="button"
						@click="transitionTab('invites')"
						:class="activeTab === 'invites' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
						class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
					>
						Invite Responses
					</button>
				</div>

				<!-- Tab content -->
				<SponsorOverviewTab
					v-if="activeTab === 'overview'"
					:organisation-id="organisationId"
					:selected-event-id="selectedEventId"
				/>

				<SponsorFlowTab
					v-else-if="activeTab === 'flow'"
					:organisation-id="organisationId"
					:organisation-numeric-id="organisationNumericId"
					:selected-event-id="selectedEventId"
					@update:selected-event-id="selectedEventId = $event"
					ref="sponsorFlowRef"
				/>

				<SponsorInvitesTab
					v-else-if="activeTab === 'invites'"
					:selected-event-id="selectedEventId"
				/>
			</div>
		</div>
	</CommunitiesManagementLayout>
</template>

<script lang="ts" setup>
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useSponsorOverview } from '~/composables/communities/sponsors/useSponsorOverview'
import SponsorOverviewTab from '~/components/communities/sponsors/SponsorOverviewTab.vue'
import SponsorFlowTab from '~/components/communities/sponsors/SponsorFlowTab.vue'
import SponsorInvitesTab from '~/components/communities/sponsors/SponsorInvitesTab.vue'
import { formatMoney } from '~/utils/money'
import Swal from 'sweetalert2'
import type { SponsorableEventList } from '~/api/types.gen'

definePageMeta({
	middleware: ['auth', 'organisation-controller'],
	layout: false,
})

useHead({
	title: 'Community Sponsorships',
})

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)
const organisationNumericId = computed(() => organisation.value?.id)

// Shared state — owned by page, passed down to tab components as props
const selectedEventId = ref('')
const selectedEventSnapshot = ref<SponsorableEventList | null>(null)
const activeTab = ref<'overview' | 'flow' | 'invites'>('overview')

// Net header stats — use same composable as SponsorOverviewTab (TanStack Query deduplicates)
const { netCompletedRevenueDelta, netSponsorDelta } = useSponsorOverview(
	organisationId,
	selectedEventId,
)

// Ref to flow tab for resetting wizard state on tab switch
const sponsorFlowRef = ref<InstanceType<typeof SponsorFlowTab> | null>(null)

function transitionTab(tab: string) {
	if (activeTab.value === tab) return

	const flowTabActive = activeTab.value === 'flow'
	const flowTabHasProgress = sponsorFlowRef.value

	if (flowTabActive && flowTabHasProgress) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'Switching tabs will reset your current sponsorship checkout progress.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, switch tabs',
			cancelButtonText: 'No, stay here',
		}).then((result) => {
			if (result.isConfirmed) {
				activeTab.value = tab as any
			}
		})
	} else {
		activeTab.value = tab as any
	}
}
</script>

							