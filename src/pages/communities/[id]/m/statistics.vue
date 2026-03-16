<template>
	<CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-black text-deep-navy uppercase tracking-widest">Organisation Statistics</h1>
					<p class="text-sm text-gray-500 font-medium mt-1">
						Live analytics for {{ organisation?.title || 'this community' }}
					</p>
				</div>
				<div class="flex items-center gap-3">
					<UButton
						:to="`/communities/${organisationId}/m/dashboard`"
						variant="outline"
						color="gray"
						icon="i-heroicons-arrow-left"
						size="sm"
					>
						Back to Dashboard
					</UButton>
					<UButton
						size="sm"
						icon="i-heroicons-arrow-path"
						:loading="isRefreshing"
						@click="refreshAll"
					>
						Refresh
					</UButton>
				</div>
			</div>

			<div class="text-xs text-gray-500">
				Auto-refresh every 60 seconds.
				<span v-if="overview?.generated_at">Last updated: {{ new Date(overview.generated_at).toLocaleString() }}</span>
			</div>

			<div v-if="isInitialLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				<USkeleton v-for="i in 4" :key="i" class="h-28" />
			</div>

			<div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
					<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Events</div>
					<div class="text-2xl font-black text-deep-navy mt-2">{{ overview?.total_events ?? 0 }}</div>
					<div class="text-xs text-gray-500 mt-1">{{ overview?.upcoming_events ?? 0 }} upcoming</div>
				</div>
				<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
					<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Attendees</div>
					<div class="text-2xl font-black text-deep-navy mt-2">{{ overview?.total_attendees ?? 0 }}</div>
					<div class="text-xs text-gray-500 mt-1">{{ overview?.average_attendees_per_event ?? 0 }} avg per event</div>
				</div>
				<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
					<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
					<div class="text-2xl font-black text-deep-navy mt-2">{{ formatMoney(overview?.total_revenue ?? 0, 'GBP') }}</div>
					<div class="text-xs text-gray-500 mt-1">{{ overview?.total_completed_payments ?? 0 }} completed payments</div>
				</div>
				<div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
					<div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Average Payment</div>
					<div class="text-2xl font-black text-deep-navy mt-2">{{ formatMoney(overview?.average_payment_value ?? 0, 'GBP') }}</div>
					<div class="text-xs text-gray-500 mt-1">{{ formatMoney(overview?.average_event_revenue ?? 0, 'GBP') }} avg per event</div>
				</div>
			</div>

			<div v-if="hasAnyError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				One or more statistics blocks failed to load. The visible data may be incomplete.
			</div>

			<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
						<UIcon name="i-heroicons-users" class="w-5 h-5 text-primary" />
						<h3 class="text-sm font-black text-primary uppercase tracking-widest">Leader Distribution</h3>
					</div>
					<div class="p-6">
						<v-chart
							v-if="leaderDistributionOption"
							:option="leaderDistributionOption"
							:autoresize="true"
							class="h-80"
						/>
						<div v-else class="h-80 flex items-center justify-center text-sm text-gray-500">
							No leader distribution data available.
						</div>
					</div>
				</section>

				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
						<UIcon name="i-heroicons-map" class="w-5 h-5 text-primary" />
						<h3 class="text-sm font-black text-primary uppercase tracking-widest">Leaders by Area</h3>
					</div>
					<div class="p-6">
						<v-chart
							v-if="areaDistributionOption"
							:option="areaDistributionOption"
							:autoresize="true"
							class="h-80"
						/>
						<div v-else class="h-80 flex items-center justify-center text-sm text-gray-500">
							No area distribution data available.
						</div>
					</div>
				</section>

				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
						<UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-primary" />
						<h3 class="text-sm font-black text-primary uppercase tracking-widest">Payments by Source</h3>
					</div>
					<div class="p-6">
						<v-chart
							v-if="paymentSourcesOption"
							:option="paymentSourcesOption"
							:autoresize="true"
							class="h-80"
						/>
						<div v-else class="h-80 flex items-center justify-center text-sm text-gray-500">
							No payment source data available.
						</div>
					</div>
				</section>

				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
						<UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-primary" />
						<h3 class="text-sm font-black text-primary uppercase tracking-widest">Event Attendance Performance</h3>
					</div>
					<div class="p-6">
						<v-chart
							v-if="eventPerformanceOption"
							:option="eventPerformanceOption"
							:autoresize="true"
							class="h-80"
						/>
						<div v-else class="h-80 flex items-center justify-center text-sm text-gray-500">
							No event performance data available.
						</div>
					</div>
				</section>
			</div>

			<section class="bg-white rounded-lg shadow overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-100">
					<h3 class="text-sm font-black text-primary uppercase tracking-widest">Top Events</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
								<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendees</th>
								<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Payments</th>
								<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-100">
							<tr v-for="eventItem in topEvents" :key="eventItem.event_title">
								<td class="px-6 py-4 text-sm text-gray-900">{{ eventItem.event_title }}</td>
								<td class="px-6 py-4 text-sm text-gray-700 text-right">{{ eventItem.attendee_count }}</td>
								<td class="px-6 py-4 text-sm text-gray-700 text-right">{{ eventItem.completed_payment_count }}</td>
								<td class="px-6 py-4 text-sm text-gray-700 text-right">{{ formatMoney(eventItem.completed_payment_amount, 'GBP') }}</td>
							</tr>
							<tr v-if="!topEvents.length">
								<td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">
									No event statistics available yet.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	</CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
	TooltipComponent,
	LegendComponent,
	GridComponent,
} from 'echarts/components'
import { formatMoney } from '~/utils/money'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import {
	useOrganisationOverviewStatistics,
	useOrganisationLeadersDistributionStatistics,
	useOrganisationEventPerformanceStatistics,
	useOrganisationPaymentsBySourceStatistics,
} from '~/composables/statistics/organisations/organisation-statistics'

use([
	CanvasRenderer,
	PieChart,
	BarChart,
	TooltipComponent,
	LegendComponent,
	GridComponent,
])

definePageMeta({
	middleware: ['auth', 'organisation-controller'],
	layout: 'default',
})

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

useHead({
	title: 'Organisation Statistics',
})

const toNumber = (value: unknown): number => {
	const num = Number(value)
	return Number.isFinite(num) ? num : 0
}

const toLabel = (value: unknown, fallback = 'Unknown'): string => {
	if (typeof value === 'string' && value.trim().length) return value
	return fallback
}

const baseQuery = computed(() => ({
	organisation_id: Number(organisationId.value),
	format: 'raw' as const,
}))

const eventPerformanceQuery = computed(() => ({
	organisation_id: Number(organisationId.value),
	format: 'raw' as const,
	limit: 12,
}))

const { data: organisationData } = useOrganisation(computed(() => Number(organisationId.value)))
const organisation = computed(() => organisationData.value?.data)

const {
	data: overviewData,
	error: overviewError,
	isFetching: isFetchingOverview,
	refetch: refetchOverview,
} = useOrganisationOverviewStatistics(baseQuery)

const {
	data: leaderDistributionData,
	error: leadersError,
	isFetching: isFetchingLeaders,
	refetch: refetchLeaders,
} = useOrganisationLeadersDistributionStatistics(baseQuery)

const {
	data: eventPerformanceData,
	error: eventPerformanceError,
	isFetching: isFetchingEventPerformance,
	refetch: refetchEventPerformance,
} = useOrganisationEventPerformanceStatistics(eventPerformanceQuery)

const {
	data: paymentSourcesData,
	error: paymentSourcesError,
	isFetching: isFetchingPaymentSources,
	refetch: refetchPaymentSources,
} = useOrganisationPaymentsBySourceStatistics(baseQuery)

const overview = computed(() => overviewData.value?.data)

const topEvents = computed(() => {
	const rows = eventPerformanceData.value?.data?.events
	if (!Array.isArray(rows)) return []

	return rows
		.map((row) => {
			const data = row as Record<string, unknown>
			return {
				event_title: toLabel(data.event_title, 'Untitled Event'),
				attendee_count: toNumber(data.attendee_count),
				completed_payment_count: toNumber(data.completed_payment_count),
				completed_payment_amount: toNumber(data.completed_payment_amount),
			}
		})
		.sort((a, b) => b.attendee_count - a.attendee_count)
		.slice(0, 10)
})

const locationTypeRows = computed(() => {
	const rows = leaderDistributionData.value?.data?.distribution
	if (!Array.isArray(rows)) return []

	return rows
		.map((row) => {
			const data = row as Record<string, unknown>
			return {
				label: toLabel(data.label ?? data.location_type),
				count: toNumber(data.value ?? data.count),
			}
		})
		.sort((a, b) => b.count - a.count)
})

const areaRows = computed(() => {
	const rows = leaderDistributionData.value?.data?.area_distribution
	if (!Array.isArray(rows)) return []

	return rows
		.map((row) => {
			const data = row as Record<string, unknown>
			return {
				name: toLabel(data.area_name ?? data.name),
				count: toNumber(data.leader_count ?? data.count),
			}
		})
		.sort((a, b) => b.count - a.count)
		.slice(0, 10)
})

const paymentSourceRows = computed(() => {
	const rows = paymentSourcesData.value?.data?.sources
	if (!Array.isArray(rows)) return []

	return rows
		.map((row) => {
			const data = row as Record<string, unknown>
			return {
				label: toLabel(data.label ?? data.source),
				value: toNumber(data.value ?? data.amount),
			}
		})
		.filter((row) => row.value > 0)
})

const isInitialLoading = computed(() => !overview.value && isFetchingOverview.value)

const isRefreshing = computed(() =>
	isFetchingOverview.value ||
	isFetchingLeaders.value ||
	isFetchingEventPerformance.value ||
	isFetchingPaymentSources.value
)

const hasAnyError = computed(() =>
	Boolean(overviewError.value || leadersError.value || eventPerformanceError.value || paymentSourcesError.value)
)

const refreshAll = async () => {
	await Promise.all([
		refetchOverview(),
		refetchLeaders(),
		refetchEventPerformance(),
		refetchPaymentSources(),
	])
}

const leaderDistributionOption = computed(() => {
	if (!locationTypeRows.value.length) return null

	return {
		tooltip: {
			trigger: 'item',
			formatter: '{b}: {c} ({d}%)',
		},
		legend: {
			bottom: 0,
			left: 'center',
		},
		series: [
			{
				type: 'pie',
				radius: ['35%', '68%'],
				data: locationTypeRows.value.map((item) => ({
					name: item.label,
					value: item.count,
				})),
			},
		],
	}
})

const areaDistributionOption = computed(() => {
	if (!areaRows.value.length) return null

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'value',
		},
		yAxis: {
			type: 'category',
			data: areaRows.value.map((item) => item.name),
		},
		series: [
			{
				type: 'bar',
				data: areaRows.value.map((item) => item.count),
				itemStyle: {
					color: '#2563eb',
				},
				label: {
					show: true,
					position: 'right',
				},
			},
		],
	}
})

const paymentSourcesOption = computed(() => {
	if (!paymentSourceRows.value.length) return null

	return {
		tooltip: {
			trigger: 'item',
			formatter: (params: any) => `${params.name}: ${params.value}`,
		},
		legend: {
			bottom: 0,
			left: 'center',
		},
		series: [
			{
				type: 'pie',
				radius: '66%',
				data: paymentSourceRows.value.map((item) => ({
					name: item.label,
					value: item.value,
				})),
			},
		],
	}
})

const eventPerformanceOption = computed(() => {
	if (!topEvents.value.length) return null

	const rows = [...topEvents.value].slice(0, 8).reverse()

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: (params: any) => {
				const point = params?.[0]
				if (!point) return ''
				const eventItem = rows[point.dataIndex]
				return [
					`<strong>${eventItem.event_title}</strong>`,
					`Attendees: ${eventItem.attendee_count}`,
					`Payments: ${eventItem.completed_payment_count}`,
					`Revenue: ${formatMoney(eventItem.completed_payment_amount, 'GBP')}`,
				].join('<br/>')
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'value',
		},
		yAxis: {
			type: 'category',
			data: rows.map((item) => item.event_title.length > 26 ? `${item.event_title.slice(0, 23)}...` : item.event_title),
		},
		series: [
			{
				type: 'bar',
				data: rows.map((item) => item.attendee_count),
				itemStyle: {
					color: '#0f766e',
				},
			},
		],
	}
})
</script>