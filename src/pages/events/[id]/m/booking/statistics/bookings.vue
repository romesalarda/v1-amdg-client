<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="bookingOverviewData?.data?.total_bookings ?? 0"
        label="Total Bookings"
        icon="i-heroicons-ticket"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="bookingOverviewData?.data?.total_attendees ?? 0"
        label="Total Attendees"
        icon="i-heroicons-users"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="bookingOverviewData?.data?.average_attendees_per_booking?.toFixed(1) ?? '0'"
        label="Avg Attendees/Booking"
        icon="i-heroicons-user-group"
        icon-color="purple"
        :loading="overviewLoading"
      />
      <StatCard
        :value="`${completionRateData?.data?.completion_rate?.toFixed(1) ?? 0}%`"
        label="Completion Rate"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="completionLoading"
      />
    </div>

    <StatSection
      title="Booking Trends"
      description="Bookings created over time"
    >
      <div v-if="trendsLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
      <div v-else-if="trendsError" class="text-center text-red-600 py-8">
        Error loading booking trends
      </div>
      <LineChart
        v-else-if="bookingTrendsChartData.labels.length"
        :labels="bookingTrendsChartData.labels"
        :data="bookingTrendsChartData.data"
        height="320px"
        color="#8b5cf6"
        label="Bookings"
      />
      <div v-else class="text-center text-gray-500 py-8">
        No trend data available
      </div>
    </StatSection>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatSection
        title="Booking Status"
        description="Distribution by payment status"
      >
        <div v-if="statusLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="statusError" class="text-center text-red-600 py-8">
          Error loading booking status
        </div>
        <PieChart
          v-else-if="bookingStatusChartData.length"
          :data="bookingStatusChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6']"
          value-label="Bookings"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No booking status data available
        </div>
      </StatSection>

      <StatSection
        title="Bookings by Package"
        description="Most popular booking packages"
      >
        <div v-if="packageLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="packageError" class="text-center text-red-600 py-8">
          Error loading package data
        </div>
        <BarChart
          v-else-if="bookingsByPackageChartData.length"
          :data="bookingsByPackageChartData"
          height="300px"
          color="#6366f1"
          value-label="Bookings"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No package data available
        </div>
      </StatSection>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatSection
        title="Party Size Distribution"
        description="Number of attendees per booking"
      >
        <div v-if="attendeesLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
        <div v-else-if="attendeesError" class="text-center text-red-600 py-8">
          Error loading attendees data
        </div>
        <BarChart
          v-else-if="attendeesPerBookingChartData.length"
          :data="attendeesPerBookingChartData"
          height="300px"
          color="#06b6d4"
          value-label="Attendees"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No party size data available
        </div>
      </StatSection>

      <StatSection
        title="Completion Funnel"
        description="Intent to booking conversion"
      >
        <div v-if="completionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <div v-else-if="completionError" class="text-center text-red-600 py-8">
          Error loading completion rate
        </div>
        <div v-else-if="completionRateData?.data" class="p-6 space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700">Total Intents</span>
            <span class="text-lg font-bold text-gray-900">{{ completionRateData.data.total_intents }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700">Completed</span>
            <span class="text-lg font-bold text-emerald-600">{{ completionRateData.data.completed_intents }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700">Completion Rate</span>
            <span class="text-2xl font-bold text-blue-600">{{ completionRateData.data.completion_rate }}%</span>
          </div>
          <div class="mt-4 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              class="bg-emerald-500 h-full transition-all duration-500"
              :style="`width: ${completionRateData.data.completion_rate}%`"
            ></div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No completion data available
        </div>
      </StatSection>
    </div>

    <StatSection
      title="Status Breakdown Details"
      description="Detailed breakdown of booking statuses"
    >
      <div v-if="overviewLoading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="bookingOverviewData?.data?.status_breakdown" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Percentage</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="status in bookingOverviewData.data.status_breakdown" :key="status.status" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900">{{ formatStatus(status.status) }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ status.count }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ status.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No status breakdown available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useBookingOverview,
  useBookingStatus,
  useBookingTrends,
  useBookingsByPackage,
  useAttendeesPerBooking,
  useCompletionRate,
} from '~/composables/statistics/bookings/booking-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, any>
  groupBy?: 'day' | 'week' | 'month'
}

const props = defineProps<Props>()

const { data: bookingOverviewData, isLoading: overviewLoading } = useBookingOverview(() => props.queryParams)
const { data: statusData, isLoading: statusLoading, error: statusError } = useBookingStatus(() => props.queryParams)
const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useBookingTrends(() => props.queryParams)
const { data: packageData, isLoading: packageLoading, error: packageError } = useBookingsByPackage(() => props.queryParams)
const { data: attendeesData, isLoading: attendeesLoading, error: attendeesError } = useAttendeesPerBooking(() => props.queryParams)
const { data: completionRateData, isLoading: completionLoading, error: completionError } = useCompletionRate(() => props.queryParams)

const bookingStatusChartData = computed<PieChartData[]>(() => {
  if (!statusData.value?.data?.distribution) return []
  return statusData.value.data.distribution.map((item: any) => ({
    name: formatStatus(item.label),
    value: item.value,
  }))
})

const bookingTrendsChartData = computed(() => {
  const trends = trendsData.value?.data?.trends || (trendsData.value as any)?.trends || []
  if (!trends.length) return { labels: [], data: [] }

  return {
    labels: trends.map((item: any) => item.date),
    data: trends.map((item: any) => item.count),
  }
})

const bookingsByPackageChartData = computed<BarChartData[]>(() => {
  if (!packageData.value?.data?.distribution) return []
  return packageData.value.data.distribution.slice(0, 10).map((item: any) => ({
    label: item.package_name || 'Unknown',
    value: item.ticket_count,
  }))
})

const attendeesPerBookingChartData = computed<BarChartData[]>(() => {
  if (!attendeesData.value?.data?.distribution) return []
  return attendeesData.value.data.distribution.map((item: any) => ({
    label: `${item.attendee_count} attendees`,
    value: item.booking_count,
  }))
})

const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
</script>
