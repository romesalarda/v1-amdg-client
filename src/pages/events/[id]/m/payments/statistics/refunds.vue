<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="refundRequests?.data?.total_requests ?? 0"
        label="Total Requests"
        icon="i-heroicons-arrow-uturn-left"
        icon-color="blue"
        :loading="refundRequestsLoading"
      />
      <StatCard
        :value="formatCurrency(refundRequests?.data?.total_amount ?? 0)"
        label="Total Amount"
        icon="i-heroicons-currency-dollar"
        icon-color="red"
        :loading="refundRequestsLoading"
      />
      <StatCard
        :value="refundProcessing?.data?.average_days?.toFixed(1) ?? 'N/A'"
        label="Avg Processing (days)"
        icon="i-heroicons-clock"
        icon-color="amber"
        :loading="refundProcessingLoading"
      />
      <StatCard
        :value="refundProcessing?.data?.total_processed ?? 0"
        label="Processed Refunds"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="refundProcessingLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Refund Trends -->
      <StatSection 
        title="Refund Trends Over Time"
        description="Track refund request patterns"
      >
        <div v-if="refundTrendsLoading" class="flex items-center justify-center h-80">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="refundTrendsError" class="text-center text-red-600 py-8">
          Error loading refund trends
        </div>
        <div v-else-if="refundTrendsData.data.length && refundTrendsData.labels.length" style="height: 320px;">
          <LineChart
            :data="refundTrendsData.data"
            :labels="refundTrendsData.labels"
            color="#ef4444"
            :smooth="true"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No refund trend data available
        </div>
      </StatSection>

      <!-- Refund Status Distribution and Processing Times Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Refund Status Distribution -->
        <StatSection 
          title="Refund Status Distribution"
          description="Breakdown of refund requests by status"
        >
          <div v-if="refundRequestsLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="refundRequestsError" class="text-center text-red-600 py-8">
            Error loading refund status
          </div>
          <PieChart
            v-else-if="refundStatusChartData.length"
            :data="refundStatusChartData"
            height="300px"
            :donut="true"
            :colors="['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']"
            value-label="Refunds"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No status data available
          </div>
        </StatSection>

        <!-- Processing Time Metrics -->
        <StatSection 
          title="Processing Time Metrics"
          description="Refund processing performance"
        >
          <div v-if="refundProcessingLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
          <div v-else-if="refundProcessingError" class="text-center text-red-600 py-8">
            Error loading processing times
          </div>
          <div v-else-if="refundProcessing?.data" class="space-y-4 p-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-xs text-gray-500 uppercase font-semibold">Average Days</div>
                  <div class="text-2xl font-black text-gray-900">{{ refundProcessing.data.average_days?.toFixed(1) ?? 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-xs text-gray-500 uppercase font-semibold">Median Days</div>
                  <div class="text-2xl font-black text-gray-900">{{ refundProcessing.data.median_days ?? 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Fastest</div>
                <div class="text-xl font-black text-green-600">{{ refundProcessing.data.min_days ?? 'N/A' }} days</div>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Slowest</div>
                <div class="text-xl font-black text-red-600">{{ refundProcessing.data.max_days ?? 'N/A' }} days</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            No processing time data available
          </div>
        </StatSection>
      </div>
    </div>

    <!-- Refund Status Details Table -->
    <StatSection 
      title="Refund Status Details"
      description="Detailed breakdown of refund request statuses"
    >
      <div v-if="refundRequestsLoading" class="flex items-center justify-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="refundRequestsError" class="text-center text-red-600 py-8">
        Error loading status details
      </div>
      <div v-else-if="refundStatusTableData.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Count</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Total Amount</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in refundStatusTableData"
              :key="index"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStatusColor(index) }"></span>
                  <span class="font-medium">{{ item.label }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">{{ item.value }}</td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-red-600">{{ formatCurrency(item.total_amount) }}</span>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">{{ item.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No refund status data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useRefundRequests,
  useRefundTrends,
  useRefundProcessing,
} from '~/composables/statistics/payments/payment-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'

interface Props {
  queryParams: Record<string, string | number | boolean>
}

const props = defineProps<Props>()
const activeGroupBy = computed(() => (props.queryParams.group_by as string) || 'day')

// Fetch statistics data
const { data: refundRequests, isLoading: refundRequestsLoading, error: refundRequestsError } = useRefundRequests(() => props.queryParams)
const { data: refundTrends, isLoading: refundTrendsLoading, error: refundTrendsError } = useRefundTrends(() => props.queryParams)
const { data: refundProcessing, isLoading: refundProcessingLoading, error: refundProcessingError } = useRefundProcessing(() => props.queryParams)

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Transform data for refund trends chart
const refundTrendsData = computed<{ data: number[], labels: string[] }>(() => {
  if (!refundTrends.value?.data?.trends) return { data: [], labels: [] }
  
  const trends = refundTrends.value.data.trends
  return {
    data: trends.map((item: { amount?: number }) => item.amount ?? 0),
    labels: trends.map((item: { date?: string }) => {
      if (!item.date) return ''
      const date = new Date(item.date)

      if (activeGroupBy.value === 'hour') {
        return date.toLocaleString('en-GB', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }

      if (activeGroupBy.value === 'month') {
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      }

      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    }),
  }
})

// Transform data for refund status pie chart
const refundStatusChartData = computed<PieChartData[]>(() => {
  if (!refundRequests.value?.data?.status_distribution) return []
  return refundRequests.value.data.status_distribution.map((item: { label?: string; value?: number }) => ({
    name: item.label ?? 'Unknown',
    value: item.value ?? 0,
  }))
})

// Transform data for refund status table
const refundStatusTableData = computed(() => {
  if (!refundRequests.value?.data?.status_distribution) return []
  return refundRequests.value.data.status_distribution.map((item: {
    label?: string
    value?: number
    percentage?: number
    total_amount?: number
  }) => ({
    label: item.label ?? 'Unknown',
    value: item.value ?? 0,
    percentage: item.percentage ?? 0,
    total_amount: item.total_amount ?? 0,
  }))
})

// Get color for status indicators
const getStatusColor = (index: number): string => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']
  return colors[index % colors.length]
}
</script>
