<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        :value="(overviewData?.data as any)?.product_summary?.total_products ?? 0"
        label="Total Products"
        icon="i-heroicons-cube"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="(overviewData?.data as any)?.product_summary?.active_products ?? 0"
        label="Active Products"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="formatCurrency((overviewData?.data as any)?.revenue_summary?.total_revenue ?? 0)"
        label="Total Revenue"
        icon="i-heroicons-currency-pound"
        icon-color="purple"
        :loading="overviewLoading"
      />
      <StatCard
        :value="(overviewData?.data as any)?.order_summary?.total_orders ?? 0"
        label="Total Orders"
        icon="i-heroicons-shopping-cart"
        icon-color="amber"
        :loading="overviewLoading"
      />
    </div>

    <!-- Error State -->
    <div v-if="overviewError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Overview</h3>
      <p class="text-sm text-red-600">{{ overviewError }}</p>
    </div>

    <!-- Charts Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Product Status Distribution -->
      <StatSection 
        title="Product Status"
        description="Distribution by active/inactive and verified status"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <PieChart
          v-else-if="productStatusChartData.length"
          :data="productStatusChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#3b82f6', '#f59e0b', '#ef4444']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No product status data available
        </div>
      </StatSection>

      <!-- Order Status Distribution -->
      <StatSection 
        title="Order Status"
        description="Distribution of orders by current status"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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

      <!-- Top Products by Revenue -->
      <StatSection 
        title="Top Products by Revenue"
        description="Best performing products by revenue generated"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <BarChart
          v-else-if="topProductsChartData.length"
          :data="topProductsChartData"
          height="300px"
          color="#10b981"
          :horizontal="true"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No revenue data available
        </div>
      </StatSection>

      <!-- Stock Overview -->
      <StatSection 
        title="Stock Levels"
        description="Distribution of variants by stock level ranges"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ (overviewData?.data as any)?.variant_summary?.total_variants ?? 0 }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Variants</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ (overviewData?.data as any)?.variant_summary?.total_stock ?? 0 }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Stock</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-amber-900">
                {{ (overviewData?.data as any)?.variant_summary?.low_stock_count ?? 0 }}
              </div>
              <div class="text-xs text-amber-600 uppercase tracking-wide font-semibold">Low Stock</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-red-900">
                {{ (overviewData?.data as any)?.variant_summary?.out_of_stock_count ?? 0 }}
              </div>
              <div class="text-xs text-red-600 uppercase tracking-wide font-semibold">Out of Stock</div>
            </div>
          </div>
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductsOverview } from '~/composables/statistics/products/product-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Fetch overview data
const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useProductsOverview(() => props.queryParams)

// Transform data for charts
const productStatusChartData = computed<PieChartData[]>(() => {
  const data = overviewData.value?.data as any
  const summary = data?.product_summary
  if (!summary) return []
  
  return [
    { name: 'Active & Verified', value: (summary.active_products ?? 0) },
    { name: 'Active & Unverified', value: Math.max(0, (summary.active_products ?? 0) - (summary.verified_products ?? 0)) },
    { name: 'Inactive & Verified', value: (summary.verified_products ?? 0) - (summary.active_products ?? 0) },
    { name: 'Inactive & Unverified', value: (summary.inactive_products ?? 0) },
  ].filter(item => item.value > 0)
})

const orderStatusChartData = computed<PieChartData[]>(() => {
  const data = overviewData.value?.data as any
  const summary = data?.order_summary
  if (!summary) return []
  
  return [
    { name: 'Completed', value: summary.completed ?? 0 },
    { name: 'Processing', value: summary.processing ?? 0 },
    { name: 'Pending', value: summary.pending ?? 0 },
    { name: 'Draft', value: summary.draft ?? 0 },
    { name: 'Cancelled', value: summary.cancelled ?? 0 },
    { name: 'Refunded', value: summary.refunded ?? 0 },
  ].filter(item => item.value > 0)
})

const topProductsChartData = computed<BarChartData[]>(() => {
  const data = overviewData.value?.data as any
  const topProducts = data?.top_products_by_revenue
  if (!topProducts || !Array.isArray(topProducts)) return []
  
  return topProducts.slice(0, 5).map((item: any) => ({
    label: item.label || 'Unknown',
    value: item.value || 0,
  }))
})

// Helper to format currency
function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '£0.00'
  return `£${num.toFixed(2)}`
}
</script>
