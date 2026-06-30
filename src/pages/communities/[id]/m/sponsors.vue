<template>
	<CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
		<div class="space-y-6 m-5">
			<!-- Page header -->
			<div class=" border border-deep-navy/10 shadow-sm p-6 bg-blue-600 rounded-xl">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<p class="text-xs font-semibold text-white uppercase tracking-widest">Community Sponsorships</p>
						<h1 class="mt-1 text-2xl text-white text-deep-navy">Inbound + Outbound Momentum</h1>
						<p class="mt-1 text-sm text-white max-w-2xl">
							Track who sponsors your events, what you sponsor elsewhere, and move from selection to checkout in three clear steps.
						</p>
					</div>
					<div class="flex items-center gap-3 shrink-0">
						<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-4">
							<div class="flex items-center gap-3">
								<div class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
									<span class="material-symbols-outlined text-green-600 text-lg">trending_up</span>
								</div>
								<div>
									<div class="text-xl font-black text-deep-navy">{{ formatMoney(String(netCompletedRevenueDelta), 'GBP') }}</div>
									<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Net Revenue Delta</div>
								</div>
							</div>
						</div>
						<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-4">
							<div class="flex items-center gap-3">
								<div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
									<span class="material-symbols-outlined text-blue-600 text-lg">handshake</span>
								</div>
								<div>
									<div class="text-xl font-black text-deep-navy">{{ netSponsorDelta }}</div>
									<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Net Sponsors</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Tab navigation -->
			<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-1.5">
				<div class="flex gap-1">
					<button
						type="button"
						@click="transitionTab('overview')"
						:class="[
							'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
							activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
						]"
					>
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined text-lg">bar_chart</span>
							<span>Overview</span>
						</div>
					</button>
					<button
						type="button"
						@click="transitionTab('flow')"
						:class="[
							'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
							activeTab === 'flow' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
						]"
					>
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined text-lg">add_ad</span>
							<span>Sponsor An Event</span>
						</div>
					</button>
					<button
						type="button"
						@click="transitionTab('invites')"
						:class="[
							'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
							activeTab === 'invites' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
						]"
					>
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined text-lg">mail</span>
							<span>Invite Responses</span>
						</div>
					</button>
				</div>
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
	middleware: ['auth', 'organisation-controller', 'leader-permission'],
	layout: false,
	leaderPermission: { 
		code: 'allow_monetary_access' 
	},
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

							