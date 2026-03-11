<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="formatCurrency((revenueOverviewData?.data as any)?.total_revenue ?? 0)"
        label="Total Revenue"
        icon="i-heroicons-currency-pound"
        icon-color="purple"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="(revenueOverviewData?.data as any)?.completed_orders ?? 0"
        label="Completed Orders"
        icon="i-heroicons-check-badge"
        icon-color="green"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="formatCurrency((revenueOverviewData?.data as any)?.average_order_value ?? 0)"
        label="Avg Order Value"
        icon="i-heroicons-calculator"
        icon-color="blue"
        :loading="revenueOverviewLoading"
      />
      <StatCard
        :value="(orderStatusData?.data as any)?.total_orders ?? 0"
        label="Total Orders"
        icon="i-heroicons-shopping-cart"
        icon-color="amber"
        :loading="orderStatusLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trends -->
      <StatSection 
        title="Revenue Trends"
        description="Revenue over time from completed orders"
        class="lg:col-span-2"
      >
        <div v-if="revenueTrendsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="revenueTrendsError" class="text-center text-red-600 py-8">
          Error loading revenue trends
        </div>
        <LineChart
          v-else-if="revenueTrendsChartData.data.length"
          :data="revenueTrendsChartData.data"
          :labels="revenueTrendsChartData.labels"
          height="300px"
          color="#9333ea"
          y-axis-label="Revenue (£)"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No revenue trends data available
        </div>
      </StatSection>

      <!-- Order Status Distribution -->
      <StatSection 
        title="Order Status Distribution"
        description="Breakdown of orders by current status"
      >
        <div v-if="orderStatusLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="orderStatusError" class="text-center text-red-600 py-8">
          Error loading order status
        </div>
        <PieChart
          v-else-if="orderStatusChartData.length"
          :data="orderStatusChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#6b7280']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No order status data available
        </div>
      </StatSection>

      <!-- Order Trends -->
      <StatSection 
        title="Order Trends"
        description="New orders over time"
      >
        <div v-if="orderTrendsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
        <div v-else-if="orderTrendsError" class="text-center text-red-600 py-8">
          Error loading order trends
        </div>
        <LineChart
          v-else-if="orderTrendsChartData.data.length"
          :data="orderTrendsChartData.data"
          :labels="orderTrendsChartData.labels"
          height="300px"
          color="#f59e0b"
          y-axis-label="Orders"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No order trends data available
        </div>
      </StatSection>

      <!-- Top Products by Revenue -->
      <StatSection 
        title="Top Products by Revenue"
        description="Best performing products (completed orders only)"
      >
        <div v-if="revenueByProductLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else-if="revenueByProductError" class="text-center text-red-600 py-8">
          Error loading top products
        </div>
        <BarChart
          v-else-if="revenueByProductChartData.length"
          :data="revenueByProductChartData"
          height="300px"
          color="#10b981"
          :horizontal="true"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No product revenue data available
        </div>
      </StatSection>

      <!-- Revenue by Category -->
      <StatSection 
        title="Revenue by Category"
        description="Revenue breakdown across product categories"
      >
        <div v-if="revenueByCategoryLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="revenueByCategoryError" class="text-center text-red-600 py-8">
          Error loading category revenue
        </div>
        <PieChart
          v-else-if="revenueByCategoryChartData.length"
          :data="revenueByCategoryChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No category revenue data available
        </div>
      </StatSection>

      <!-- Revenue Breakdown (Standalone vs Package) -->
      <StatSection 
        title="Revenue Source"
        description="Revenue split between standalone and package sales"
      >
        <div v-if="revenueBreakdownLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="revenueBreakdownError" class="text-center text-red-600 py-8">
          Error loading revenue breakdown
        </div>
        <PieChart
          v-else-if="revenueBreakdownChartData.length"
          :data="revenueBreakdownChartData"
          height="300px"
          :donut="true"
          :colors="['#9333ea', '#06b6d4']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No revenue breakdown data available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  useRevenueOverview,
  useRevenueTrends,
  useRevenueByProduct,
  useRevenueByCategory,
  useRevenueBreakdown,
  useOrderStatusDistribution,
  useOrderTrends
} from '~/composables/statistics/products/product-statistics'
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

// Fetch statistics data
const { data: revenueOverviewData, isLoading: revenueOverviewLoading } = useRevenueOverview(() => props.queryParams)
const { data: revenueTrendsData, isLoading: revenueTrendsLoading, error: revenueTrendsError } = useRevenueTrends(() => props.queryParams)
const { data: revenueByProductData, isLoading: revenueByProductLoading, error: revenueByProductError } = useRevenueByProduct(() => ({ ...props.queryParams, limit: 10 }))
const { data: revenueByCategoryData, isLoading: revenueByCategoryLoading, error: revenueByCategoryError } = useRevenueByCategory(() => props.queryParams)
const { data: revenueBreakdownData, isLoading: revenueBreakdownLoading, error: revenueBreakdownError } = useRevenueBreakdown(() => props.queryParams)
const { data: orderStatusData, isLoading: orderStatusLoading, error: orderStatusError } = useOrderStatusDistribution(() => props.queryParams)
const { data: orderTrendsData, isLoading: orderTrendsLoading, error: orderTrendsError } = useOrderTrends(() => props.queryParams)

// Transform data for charts
const revenueTrendsChartData = computed(() => {
  const trends = (revenueTrendsData.value?.data as any)?.trends
  if (!trends || !Array.isArray(trends)) return { data: [], labels: [] }
  
  return {
    data: trends.map((item: any) => parseFloat(item.revenue || item.value || 0)),
    labels: trends.map((item: any) => item.date || item.period || ''),
  }
})

const orderStatusChartData = computed<PieChartData[]>(() => {
  const distribution = (orderStatusData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || item.name || 'Unknown',
    value: item.value || item.count || 0,
  })).filter(item => item.value > 0)
})

const orderTrendsChartData = computed(() => {
  const trends = (orderTrendsData.value?.data as any)?.trends
  if (!trends || !Array.isArray(trends)) return { data: [], labels: [] }
  
  return {
    data: trends.map((item: any) => item.count || item.value || 0),
    labels: trends.map((item: any) => item.date || item.period || ''),
  }
})

const revenueByProductChartData = computed<BarChartData[]>(() => {
  const distribution = (revenueByProductData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.slice(0, 10).map((item: any) => ({
    label: item.label || 'Unknown',
    value: parseFloat(item.value || 0),
  }))
})

const revenueByCategoryChartData = computed<PieChartData[]>(() => {
  const distribution = (revenueByCategoryData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || item.name || 'Unknown',
    value: parseFloat(item.value || 0),
  })).filter(item => item.value > 0)
})

const revenueBreakdownChartData = computed<PieChartData[]>(() => {
  const distribution = (revenueBreakdownData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || item.name || 'Unknown',
    value: parseFloat(item.value || 0),
  })).filter(item => item.value > 0)
})

// Helper to format currency
function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '£0.00'
  return `£${num.toFixed(2)}`
}
</script>
