<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="formatCurrency(revenueOverview?.data?.total_revenue ?? 0)"
        label="Total Revenue"
        icon="i-heroicons-currency-dollar"
        icon-color="green"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="revenueOverview?.data?.total_completed_payments ?? 0"
        label="Completed Payments"
        icon="i-heroicons-check-circle"
        icon-color="blue"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="formatCurrency(revenueOverview?.data?.average_payment ?? 0)"
        label="Average Payment"
        icon="i-heroicons-calculator"
        icon-color="purple"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="formatCurrency(revenueOverview?.data?.net_revenue ?? 0)"
        label="Net Revenue"
        icon="i-heroicons-document-text"
        icon-color="amber"
        :loading="revenueOverviewLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Revenue Trends -->
      <StatSection 
        title="Revenue Trends Over Time"
        description="Track revenue patterns and growth"
      >
        <div v-if="revenueTrendsLoading" class="flex items-center justify-center h-80">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else-if="revenueTrendsError" class="text-center text-red-600 py-8">
          Error loading revenue trends
        </div>
        <div v-else-if="revenueTrendsData.data.length && revenueTrendsData.labels.length" style="height: 320px;">
          <LineChart
            :data="revenueTrendsData.data"
            :labels="revenueTrendsData.labels"
            color="#10b981"
            :smooth="true"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No revenue trend data available
        </div>
      </StatSection>

      <!-- Revenue Breakdown and Revenue by Method Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Breakdown -->
        <StatSection 
          title="Revenue Breakdown"
          description="Revenue by source type"
        >
          <div v-if="revenueBreakdownLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="revenueBreakdownError" class="text-center text-red-600 py-8">
            Error loading revenue breakdown
          </div>
          <PieChart
            v-else-if="revenueBreakdownChartData.length"
            :data="revenueBreakdownChartData"
            height="300px"
            :donut="true"
            :colors="['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No breakdown data available
          </div>
        </StatSection>

        <!-- Revenue by Payment Method -->
        <StatSection 
          title="Revenue by Payment Method"
          description="Revenue distribution across payment methods"
        >
          <div v-if="revenueByMethodLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <div v-else-if="revenueByMethodError" class="text-center text-red-600 py-8">
            Error loading revenue by method
          </div>
          <BarChart
            v-else-if="revenueByMethodChartData.length"
            :data="revenueByMethodChartData"
            height="300px"
            color="#8b5cf6"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No payment method data available
          </div>
        </StatSection>
      </div>

      <!-- Link to Product Statistics -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-blue-900">Product Statistics</h3>
            <p class="text-xs text-blue-700">View detailed product sales and inventory analytics</p>
          </div>
        </div>
        <UButton
          color="blue"
          variant="solid"
          size="sm"
          icon="i-heroicons-arrow-right"
          trailing
          :to="`/events/${eventId}/m/shop/statistics`"
        >
          View Product Stats
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  useRevenueOverview,
  useRevenueTrends,
  useRevenueBreakdown,
  useRevenueByMethod,
} from '~/composables/statistics/payments/payment-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, string | number | boolean>
}

const props = defineProps<Props>()

const route = useRoute()
const eventId = computed(() => route.params.id as string)

// Fetch statistics data
const { data: revenueOverview, isLoading: revenueOverviewLoading, error: revenueOverviewError } = useRevenueOverview(() => props.queryParams)
const { data: revenueTrends, isLoading: revenueTrendsLoading, error: revenueTrendsError } = useRevenueTrends(() => props.queryParams)
const { data: revenueBreakdown, isLoading: revenueBreakdownLoading, error: revenueBreakdownError } = useRevenueBreakdown(() => props.queryParams)
const { data: revenueByMethod, isLoading: revenueByMethodLoading, error: revenueByMethodError } = useRevenueByMethod(() => props.queryParams)

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Transform data for revenue trends chart
const revenueTrendsData = computed<{ data: number[], labels: string[] }>(() => {
  if (!revenueTrends.value?.data?.trends) return { data: [], labels: [] }
  
  const trends = revenueTrends.value.data.trends
  return {
    data: trends.map((item: { revenue?: number }) => item.revenue ?? 0),
    labels: trends.map((item: { date?: string }) => {
      if (!item.date) return ''
      const date = new Date(item.date)
      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    }),
  }
})

// Transform data for revenue breakdown pie chart
const revenueBreakdownChartData = computed<PieChartData[]>(() => {
  if (!revenueBreakdown.value?.data) return []
  const data = revenueBreakdown.value.data
  
  const breakdown: PieChartData[] = []
  
  if (data.gross_revenue) {
    breakdown.push({ name: 'Gross Revenue', value: data.gross_revenue })
  }
  if (data.refunded_amount) {
    breakdown.push({ name: 'Refunded', value: data.refunded_amount })
  }
  if (data.net_revenue) {
    breakdown.push({ name: 'Net Revenue', value: data.net_revenue })
  }
  
  return breakdown
})

// Transform data for revenue by method bar chart
const revenueByMethodChartData = computed<BarChartData[]>(() => {
  if (!revenueByMethod.value?.data?.methods) return []
  
  const methods = revenueByMethod.value.data.methods as Array<{
    method_title?: string
    total_revenue?: number
  }>
  
  return methods.map((item) => ({
    label: item.method_title ?? 'Unknown',
    value: item.total_revenue ?? 0,
  }))
})
</script>
