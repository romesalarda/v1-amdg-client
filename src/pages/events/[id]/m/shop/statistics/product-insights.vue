<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="(productOverviewData?.data as any)?.total_products ?? 0"
        label="Total Products"
        icon="i-heroicons-cube"
        icon-color="blue"
        :loading="productOverviewLoading"
      />
      <StatCard
        :value="(productOverviewData?.data as any)?.active_products ?? 0"
        label="Active Products"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="productOverviewLoading"
      />
      <StatCard
        :value="(productOverviewData?.data as any)?.verified_products ?? 0"
        label="Verified Products"
        icon="i-heroicons-shield-check"
        icon-color="purple"
        :loading="productOverviewLoading"
      />
      <StatCard
        :value="(categoryDistributionData?.data as any)?.total_categories ?? 0"
        label="Categories"
        icon="i-heroicons-folder"
        icon-color="amber"
        :loading="categoryDistributionLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Product Status Distribution -->
      <StatSection 
        title="Product Status"
        description="Distribution by active/inactive and verified/unverified"
      >
        <div v-if="statusDistributionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="statusDistributionError" class="text-center text-red-600 py-8">
          Error loading status distribution
        </div>
        <PieChart
          v-else-if="statusDistributionChartData.length"
          :data="statusDistributionChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#3b82f6', '#f59e0b', '#ef4444']"
          value-label="Products"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No status distribution data available
        </div>
      </StatSection>

      <!-- Category Distribution -->
      <StatSection 
        title="Category Distribution"
        description="Number of products per category"
      >
        <div v-if="categoryDistributionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
        <div v-else-if="categoryDistributionError" class="text-center text-red-600 py-8">
          Error loading category distribution
        </div>
        <PieChart
          v-else-if="categoryDistributionChartData.length"
          :data="categoryDistributionChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']"
          value-label="Products"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No category distribution data available
        </div>
      </StatSection>

      <!-- Product Trends -->
      <StatSection 
        title="Product Creation Trends"
        description="New products added over time"
        class="lg:col-span-2"
      >
        <div v-if="productTrendsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="productTrendsError" class="text-center text-red-600 py-8">
          Error loading product trends
        </div>
        <LineChart
          v-else-if="productTrendsChartData.data.length > 0"
          :data="productTrendsChartData.data"
          :labels="productTrendsChartData.labels"
          height="300px"
          color="#8b5cf6"
          y-axis-label="Products"
          :label="'Products'"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No product trends data available
        </div>
      </StatSection>

      <!-- Top Products by Orders -->
      <StatSection 
        title="Most Popular Products"
        description="Products with the highest order counts"
      >
        <div v-if="ordersByProductLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else-if="ordersByProductError" class="text-center text-red-600 py-8">
          Error loading popular products
        </div>
        <BarChart
          v-else-if="ordersByProductChartData.length"
          :data="ordersByProductChartData"
          height="300px"
          color="#10b981"
          :horizontal="true"
          value-label="Orders"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No popular products data available
        </div>
      </StatSection>

      <!-- Orders by Category -->
      <StatSection 
        title="Orders by Category"
        description="Which categories generate the most orders"
      >
        <div v-if="ordersByCategoryLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="ordersByCategoryError" class="text-center text-red-600 py-8">
          Error loading category orders
        </div>
        <BarChart
          v-else-if="ordersByCategoryChartData.length"
          :data="ordersByCategoryChartData"
          height="300px"
          color="#6366f1"
          value-label="Orders"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No category orders data available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  useProductOverview,
  useCategoryDistribution,
  useStatusDistribution,
  useProductTrends,
  useOrdersByProduct,
  useOrdersByCategory
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
const { data: productOverviewData, isLoading: productOverviewLoading } = useProductOverview(() => props.queryParams)
const { data: categoryDistributionData, isLoading: categoryDistributionLoading, error: categoryDistributionError } = useCategoryDistribution(() => props.queryParams)
const { data: statusDistributionData, isLoading: statusDistributionLoading, error: statusDistributionError } = useStatusDistribution(() => props.queryParams)
const { data: productTrendsData, isLoading: productTrendsLoading, error: productTrendsError } = useProductTrends(() => props.queryParams)
const { data: ordersByProductData, isLoading: ordersByProductLoading, error: ordersByProductError } = useOrdersByProduct(() => ({ ...props.queryParams, limit: 10 }))
const { data: ordersByCategoryData, isLoading: ordersByCategoryLoading, error: ordersByCategoryError } = useOrdersByCategory(() => props.queryParams)

// Transform data for charts
const statusDistributionChartData = computed<PieChartData[]>(() => {
  const distribution = (statusDistributionData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || 'Unknown',
    value: item.value || 0,
  })).filter(item => item.value > 0)
})

const categoryDistributionChartData = computed<PieChartData[]>(() => {
  const distribution = (categoryDistributionData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || 'Uncategorized',
    value: item.value || 0,
  })).filter(item => item.value > 0)
})

const productTrendsChartData = computed(() => {
  const trends = (productTrendsData.value?.data as any)?.trends
  if (!trends || !Array.isArray(trends)) return { data: [], labels: [] }
  
  return {
    data: trends.map((item: any) => item.count || item.value || 0),
    labels: trends.map((item: any) => item.date || item.period || ''),
  }
})

const ordersByProductChartData = computed<BarChartData[]>(() => {
  const distribution = (ordersByProductData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.slice(0, 10).map((item: any) => ({
    label: item.label || 'Unknown',
    value: item.value || 0,
  }))
})

const ordersByCategoryChartData = computed<BarChartData[]>(() => {
  const distribution = (ordersByCategoryData.value?.data as any)?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    label: item.label || 'Uncategorized',
    value: item.value || 0,
  }))
})
</script>
