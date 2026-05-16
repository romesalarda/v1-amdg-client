<template>
	<div class="space-y-6">
		<!-- Summary stat cards -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Inbound Sponsors</p>
				<p class="mt-2 text-2xl font-black text-deep-navy">{{ inboundSummary.total_sponsors }}</p>
				<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Completed {{ formatMoney(String(inboundSummary.completed_revenue), 'GBP') }}</p>
			</div>
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Outbound Sponsors</p>
				<p class="mt-2 text-2xl font-black text-deep-navy">{{ outboundSummary.total_sponsors }}</p>
				<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Committed {{ formatMoney(String(outboundSummary.commitment_amount), 'GBP') }}</p>
			</div>
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Average Completed / Sponsor</p>
				<p class="mt-2 text-2xl font-black text-deep-navy">{{ formatMoney(String(inboundSummary.average_completed_revenue_per_sponsor), 'GBP') }}</p>
				<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Outbound {{ formatMoney(String(outboundSummary.average_completed_revenue_per_sponsor), 'GBP') }}</p>
			</div>
		</div>

		<!-- Charts row -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Top Inbound Sponsors</p>
				<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
					<USkeleton class="h-6 w-full" />
					<USkeleton class="h-6 w-5/6" />
				</div>
				<div v-else class="mt-4 h-[220px]">
					<PieChart :height="'220px'" :data="inboundSponsorChart" :donut="true" :show-legend="false" />
				</div>
			</div>
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Inbound Sponsors by Event</p>
				<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
					<USkeleton class="h-6 w-full" />
					<USkeleton class="h-6 w-5/6" />
				</div>
				<div v-else class="mt-4 h-[220px]">
					<BarChart :height="'220px'" :data="inboundEventChart" :color="'#0f766e'" />
				</div>
			</div>
			<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
				<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Outbound Sponsors by Event</p>
				<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
					<USkeleton class="h-6 w-full" />
					<USkeleton class="h-6 w-5/6" />
				</div>
				<div v-else class="mt-4 h-[220px]">
					<BarChart :height="'220px'" :data="outboundEventChart" :color="'#1d4ed8'" />
				</div>
			</div>
		</div>

		<!-- Ledger panels -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Inbound ledger -->
			<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-5 bg-white">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Inbound</p>
						<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Sponsors Funding Your Events</h2>
					</div>
					<span class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ inboundCount }} results</span>
				</div>

				<div class="flex flex-col md:flex-row gap-3">
					<input
						v-model="ledgerSearch"
						type="text"
						placeholder="Search sponsor, event, or package"
						class="flex-1 px-4 py-3 rounded-xl border-2 border-deep-navy/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
					/>
					<button
						type="button"
						@click="ledgerUseSelectedEvent = !ledgerUseSelectedEvent"
						:class="ledgerUseSelectedEvent ? 'bg-deep-navy text-white' : 'border-2 border-deep-navy/30 text-deep-navy'"
						class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition"
					>
						{{ ledgerUseSelectedEvent ? 'Selected Event' : 'All Events' }}
					</button>
				</div>

				<div v-if="isLoadingInbound" class="space-y-3">
					<USkeleton class="h-20 w-full" />
					<USkeleton class="h-20 w-full" />
				</div>
				<div v-else-if="inboundSponsors.length === 0" class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
					<p class="text-sm font-bold text-deep-navy/60">No inbound sponsors match this view yet.</p>
				</div>
				<div v-else class="space-y-3">
					<div v-for="row in inboundSponsors" :key="row.sponsor_id" class="p-4 border-2 border-deep-navy/10 rounded-xl">
						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<p class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ row.event_title }}</p>
								<p class="text-base font-black text-deep-navy uppercase tracking-tight">{{ row.organisation_title }}</p>
								<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
									{{ row.package_name || 'No package' }} • {{ formatDateSafe(row.added_at) }}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider">
									{{ row.payment?.payment_reference ? row.payment.payment_reference.slice(0, 20).concat('...') : 'Awaiting payment' }}
								</span>
								<span class="text-xs font-black text-deep-navy uppercase tracking-wider">
									{{ row.payment?.base_amount ? formatMoney(row.payment.base_amount, 'GBP') : 'Pending' }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div class="pt-3 flex items-center justify-between">
					<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/40">Page {{ inboundPage }}</p>
					<UPagination v-model="inboundPage" :total="inboundCount" :page-count="ledgerPageSize" :max="5" />
				</div>
			</div>

			<!-- Outbound ledger -->
			<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-5 bg-white">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Outbound</p>
						<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Events You Sponsor</h2>
					</div>
					<span class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ outboundCount }} results</span>
				</div>

				<div class="flex flex-col md:flex-row gap-3">
					<input
						v-model="ledgerSearch"
						type="text"
						placeholder="Search event or package"
						class="flex-1 px-4 py-3 rounded-xl border-2 border-deep-navy/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
					/>
					<button
						type="button"
						@click="ledgerUseSelectedEvent = !ledgerUseSelectedEvent"
						:class="ledgerUseSelectedEvent ? 'bg-deep-navy text-white' : 'border-2 border-deep-navy/30 text-deep-navy'"
						class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition"
					>
						{{ ledgerUseSelectedEvent ? 'Selected Event' : 'All Events' }}
					</button>
				</div>

				<div v-if="isLoadingOutbound" class="space-y-3">
					<USkeleton class="h-20 w-full" />
					<USkeleton class="h-20 w-full" />
				</div>
				<div v-else-if="outboundSponsors.length === 0" class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
					<p class="text-sm font-bold text-deep-navy/60">No outbound sponsorships match this view yet.</p>
				</div>
				<div v-else class="space-y-3">
					<div v-for="row in outboundSponsors" :key="row.sponsor_id" class="p-4 border-2 border-deep-navy/10 rounded-xl">
						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<p class="text-xs font-black uppercase tracking-wider text-deep-navy/40">Sponsoring as {{ row.name }}</p>
								<p class="text-base font-black text-deep-navy uppercase tracking-tight">{{ row.event_title }}</p>
								<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
									{{ row.package_name || 'No package' }} • {{ formatDateSafe(row.added_at) }}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
									{{ row.payment?.payment_reference ? row.payment.payment_reference.slice(0, 15).concat('...') : 'Awaiting payment' }}
								</span>
								<span class="text-xs font-black text-deep-navy uppercase tracking-wider">
									{{ row.payment?.base_amount ? formatMoney(row.payment.base_amount, 'GBP') : 'Pending' }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div class="pt-3 flex items-center justify-between">
					<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/40">Page {{ outboundPage }}</p>
					<UPagination v-model="outboundPage" :total="outboundCount" :page-count="ledgerPageSize" :max="5" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import { useSponsorOverview } from '~/composables/communities/sponsors/useSponsorOverview'
import { formatMoney } from '~/utils/money'
import { formatDate } from '~/utils/time'

const props = defineProps<{
	organisationId: string
	selectedEventId: string
}>()

const {
	ledgerSearch,
	ledgerUseSelectedEvent,
	ledgerPageSize,
	inboundPage,
	outboundPage,
	isLoadingInbound,
	isLoadingOutbound,
	isLoadingSponsorFlow,
	inboundSponsors,
	outboundSponsors,
	inboundCount,
	outboundCount,
	inboundSummary,
	outboundSummary,
	inboundSponsorChart,
	inboundEventChart,
	outboundEventChart,
} = useSponsorOverview(
	computed(() => props.organisationId),
	computed(() => props.selectedEventId),
)

function formatDateSafe(value?: string | null) {
	if (!value) return 'Unknown date'
	return formatDate(value)
}
</script>
