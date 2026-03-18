<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="paymentOverview?.data?.total_payments ?? 0"
        label="Total Payments"
        icon="i-heroicons-banknotes"
        icon-color="blue"
        :loading="paymentOverviewLoading"
      />
      <StatCard
        :value="formatCurrency(paymentOverview?.data?.total_amount ?? 0)"
        label="Total Amount"
        icon="i-heroicons-currency-dollar"
        icon-color="green"
        :loading="paymentOverviewLoading"
      />
      <StatCard
        :value="formatCurrency(paymentOverview?.data?.average_amount ?? 0)"
        label="Average Payment"
        icon="i-heroicons-calculator"
        icon-color="purple"
        :loading="paymentOverviewLoading"
      />
      <StatCard
        :value="paymentMethodsData?.data?.total_with_method ?? 0"
        label="With Payment Method"
        icon="i-heroicons-credit-card"
        icon-color="amber"
        :loading="paymentMethodsLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Payment Method Distribution -->
      <StatSection 
        title="Payment Method Distribution"
        description="Breakdown of payments by method"
      >
        <div v-if="paymentMethodsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="paymentMethodsError" class="text-center text-red-600 py-8">
          Error loading payment methods
        </div>
        <PieChart
          v-else-if="paymentMethodsChartData.length"
          :data="paymentMethodsChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No payment method data available
        </div>
      </StatSection>

      <!-- Payment Status Distribution -->
      <StatSection 
        title="Payment Status Distribution"
        description="Payment counts by status"
      >
        <div v-if="paymentStatusLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="paymentStatusError" class="text-center text-red-600 py-8">
          Error loading payment status
        </div>
        <PieChart
          v-else-if="paymentStatusChartData.length"
          :data="paymentStatusChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No payment status data available
        </div>
      </StatSection>
    </div>

    <!-- Payment Trends -->
    <StatSection 
      title="Payment Trends Over Time"
      description="Track payment volume and patterns"
    >
      <div v-if="paymentTrendsLoading" class="flex items-center justify-center h-80">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="paymentTrendsError" class="text-center text-red-600 py-8">
        Error loading payment trends
      </div>
      <div v-else-if="paymentTrendsData.data.length && paymentTrendsData.labels.length" style="height: 320px;">
        <LineChart
          :data="paymentTrendsData.data"
          :labels="paymentTrendsData.labels"
          color="#3b82f6"
          :smooth="true"
        />
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No payment trend data available
      </div>
    </StatSection>

    <!-- Status Breakdown Table -->
    <StatSection 
      title="Payment Status Details"
      description="Detailed breakdown of payment statuses"
    >
      <div v-if="paymentOverviewLoading" class="flex items-center justify-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="paymentOverviewError" class="text-center text-red-600 py-8">
        Error loading status details
      </div>
      <div v-else-if="statusBreakdownData.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Count</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in statusBreakdownData"
              :key="index"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStatusColor(index) }"></span>
                  <span class="font-medium">{{ item.label }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">{{ item.count }}</td>
              <td class="py-3 px-4 text-right text-gray-600">{{ item.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No status breakdown data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePaymentOverview,
  usePaymentMethods,
  usePaymentStatus,
  usePaymentTrends,
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
const { data: paymentOverview, isLoading: paymentOverviewLoading, error: paymentOverviewError } = usePaymentOverview(() => props.queryParams)
const { data: paymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError } = usePaymentMethods(() => props.queryParams)
const { data: paymentStatus, isLoading: paymentStatusLoading, error: paymentStatusError } = usePaymentStatus(() => props.queryParams)
const { data: paymentTrends, isLoading: paymentTrendsLoading, error: paymentTrendsError } = usePaymentTrends(() => props.queryParams)

// Alias for paymentMethods data
const paymentMethodsData = paymentMethods

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Transform data for payment methods pie chart
const paymentMethodsChartData = computed<PieChartData[]>(() => {
  if (!paymentMethods.value?.data?.distribution) return []
  return paymentMethods.value.data.distribution.map((item: { label?: string; value?: number }) => ({
    name: item.label ?? 'Unknown',
    value: item.value ?? 0,
  }))
})

// Transform data for payment status pie chart
const paymentStatusChartData = computed<PieChartData[]>(() => {
  if (!paymentStatus.value?.data?.distribution) return []
  return paymentStatus.value.data.distribution.map((item: { label?: string; value?: number }) => ({
    name: item.label ?? 'Unknown',
    value: item.value ?? 0,
  }))
})

// Transform data for payment trends chart
const paymentTrendsData = computed<{ data: number[], labels: string[] }>(() => {
  if (!paymentTrends.value?.data?.trends) return { data: [], labels: [] }
  
  const trends = paymentTrends.value.data.trends
  return {
    data: trends.map((item: { count?: number }) => item.count ?? 0),
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

// Status breakdown table data
const statusBreakdownData = computed(() => {
  if (!paymentOverview.value?.data?.status_breakdown) return []
  
  return Object.entries(paymentOverview.value.data.status_breakdown).map(([, statusData]: [string, any]) => ({
    label: statusData.label ?? 'Unknown',
    count: statusData.count ?? 0,
    percentage: statusData.percentage ?? 0,
  }))
})

// Get color for status indicators
const getStatusColor = (index: number): string => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']
  return colors[index % colors.length]
}
</script>
