<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="formatCurrency(revenueOverviewData?.data?.total_revenue ?? 0)"
        label="Total Revenue"
        icon="i-heroicons-currency-dollar"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="formatCurrency(revenueOverviewData?.data?.average_revenue_per_booking ?? 0)"
        label="Avg Revenue/Booking"
        icon="i-heroicons-chart-bar"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="revenueOverviewData?.data?.total_completed_payments ?? 0"
        label="Completed Payments"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="formatCurrency(revenueOverviewData?.data?.max_revenue ?? 0)"
        label="Highest Payment"
        icon="i-heroicons-arrow-trending-up"
        icon-color="purple"
        :loading="overviewLoading"
      />
    </div>

    <!-- Charts Grid Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trends -->
      <StatSection 
        title="Revenue Trends"
        description="Revenue collected over time"
      >
        <div v-if="trendsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <div v-else-if="trendsError" class="text-center text-red-600 py-8">
          Error loading revenue trends
        </div>
        <LineChart
          v-else-if="revenueTrendsChartData.labels.length"
          :labels="revenueTrendsChartData.labels"
          :data="revenueTrendsChartData.data"
          height="300px"
          color="#10b981"
          :label="'Revenue (GBP)'"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No trend data available
        </div>
      </StatSection>

      <!-- Revenue Breakdown by Status -->
      <StatSection 
        title="Revenue by Payment Status"
        description="Revenue across all payment states"
      >
        <div v-if="breakdownLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="breakdownError" class="text-center text-red-600 py-8">
          Error loading revenue breakdown
        </div>
        <PieChart
          v-else-if="revenueBreakdownChartData.length"
          :data="revenueBreakdownChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6']"
          value-label="Revenue (GBP)"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No breakdown data available
        </div>
      </StatSection>
    </div>

    <!-- Charts Grid Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue by Package -->
      <StatSection 
        title="Revenue by Package"
        description="Revenue contribution by package"
      >
        <div v-if="packageLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="packageError" class="text-center text-red-600 py-8">
          Error loading package revenue
        </div>
        <BarChart
          v-else-if="revenueByPackageChartData.length"
          :data="revenueByPackageChartData"
          height="300px"
          color="#8b5cf6"
          :horizontal="true"
          value-label="Bookings"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No package revenue data available
        </div>
      </StatSection>

      <!-- Revenue by Ticket Type -->
      <StatSection 
        title="Revenue by Ticket Type"
        description="Revenue breakdown by ticket type"
      >
        <div v-if="ticketTypeLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="ticketTypeError" class="text-center text-red-600 py-8">
          Error loading ticket type revenue
        </div>
        <BarChart
          v-else-if="revenueByTicketTypeChartData.length"
          :data="revenueByTicketTypeChartData"
          height="300px"
          color="#6366f1"
          value-label="Tickets"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No ticket type revenue data available
        </div>
      </StatSection>
    </div>

    <!-- Revenue Details Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Breakdown Table -->
      <StatSection 
        title="Revenue Breakdown Details"
        description="Detailed revenue by payment status"
      >
        <div v-if="breakdownLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="breakdownData?.data?.distribution" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Revenue</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in breakdownData.data.distribution" :key="item.status" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900">{{ formatStatus(item.status) }}</td>
                <td class="px-4 py-3 text-right font-semibold text-emerald-600">{{ formatCurrency(item.revenue) }}</td>
                <td class="px-4 py-3 text-right text-gray-700">{{ item.payment_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No breakdown details available
        </div>
      </StatSection>

      <!-- Revenue Summary -->
      <StatSection 
        title="Revenue Summary"
        description="Key revenue metrics"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <div v-else-if="revenueOverviewData?.data" class="space-y-3 p-4">
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Total Revenue:</span>
            <span class="text-lg font-bold text-emerald-600">{{ formatCurrency(revenueOverviewData.data.total_revenue) }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Average Payment:</span>
            <span class="text-lg font-bold text-blue-600">{{ formatCurrency(revenueOverviewData.data.average_revenue_per_booking) }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Highest Payment:</span>
            <span class="text-lg font-bold text-purple-600">{{ formatCurrency(revenueOverviewData.data.max_revenue) }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Lowest Payment:</span>
            <span class="text-lg font-bold text-gray-600">{{ formatCurrency(revenueOverviewData.data.min_revenue) }}</span>
          </div>
          <div class="flex justify-between items-center py-3">
            <span class="text-sm text-gray-600">Completed Payments:</span>
            <span class="text-lg font-bold text-green-600">{{ revenueOverviewData.data.total_completed_payments }}</span>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No summary data available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useRevenueOverview,
  useRevenueByPackage,
  useRevenueByTicketType,
  useRevenueTrends,
  useRevenueBreakdown,
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

// Fetch all revenue statistics
const { data: revenueOverviewData, isLoading: overviewLoading } = useRevenueOverview(() => props.queryParams)
const { data: packageData, isLoading: packageLoading, error: packageError } = useRevenueByPackage(() => props.queryParams)
const { data: ticketTypeData, isLoading: ticketTypeLoading, error: ticketTypeError } = useRevenueByTicketType(() => props.queryParams)
const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useRevenueTrends(() => props.queryParams)
const { data: breakdownData, isLoading: breakdownLoading, error: breakdownError } = useRevenueBreakdown(() => props.queryParams)

// Transform data for charts
const revenueTrendsChartData = computed(() => {
  if (!trendsData.value?.data?.trends) return { labels: [], data: [] }
  return {
    labels: trendsData.value.data.trends.map((item: any) => item.date),
    data: trendsData.value.data.trends.map((item: any) => item.revenue),
  }
})

const revenueBreakdownChartData = computed<PieChartData[]>(() => {
  if (!breakdownData.value?.data?.distribution) return []
  return breakdownData.value.data.distribution.map((item: any) => ({
    name: formatStatus(item.status),
    value: item.revenue,
  }))
})

const revenueByPackageChartData = computed<BarChartData[]>(() => {
  if (!packageData.value?.data?.distribution) return []
  return packageData.value.data.distribution.slice(0, 10).map((item: any) => ({
    label: item.package_name || 'Unknown',
    value: item.ticket_count,
  }))
})

const revenueByTicketTypeChartData = computed<BarChartData[]>(() => {
  if (!ticketTypeData.value?.data?.distribution) return []
  return ticketTypeData.value.data.distribution.map((item: any) => ({
    label: item.scope || 'Unknown',
    value: item.ticket_count,
  }))
})

// Helper function to format status
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
</script>
