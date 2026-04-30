<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="stockOverviewData?.data?.total_variants ?? 0"
        label="Total Variants"
        icon="i-heroicons-cube-transparent"
        icon-color="blue"
        :loading="stockOverviewLoading"
      />
      <StatCard
        :value="stockOverviewData?.data?.total_stock ?? 0"
        label="Total Stock Units"
        icon="i-heroicons-squares-2x2"
        icon-color="green"
        :loading="stockOverviewLoading"
      />
      <StatCard
        :value="stockOverviewData?.data?.low_stock_count ?? 0"
        label="Low Stock Items"
        icon="i-heroicons-exclamation-triangle"
        icon-color="amber"
        :loading="stockOverviewLoading"
      />
      <StatCard
        :value="stockOverviewData?.data?.out_of_stock_count ?? 0"
        label="Out of Stock"
        icon="i-heroicons-x-circle"
        icon-color="red"
        :loading="stockOverviewLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Levels Distribution -->
      <StatSection 
        title="Stock Levels Distribution"
        description="Breakdown of variants by stock level ranges"
      >
        <div v-if="stockLevelsLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="stockLevelsError" class="text-center text-red-600 py-8">
          Error loading stock levels
        </div>
        <BarChart
          v-else-if="stockLevelsChartData.length"
          :data="stockLevelsChartData"
          height="300px"
          color="#3b82f6"
          value-label="Variants"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No stock levels data available
        </div>
      </StatSection>

      <!-- Size Distribution -->
      <StatSection 
        title="Size Distribution"
        description="Distribution of variants by size"
      >
        <div v-if="sizeDistributionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="sizeDistributionError" class="text-center text-red-600 py-8">
          Error loading size distribution
        </div>
        <PieChart
          v-else-if="sizeDistributionChartData.length"
          :data="sizeDistributionChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']"
          value-label="Variants"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No size distribution data available
        </div>
      </StatSection>

      <!-- Color Distribution -->
      <StatSection 
        title="Color Distribution"
        description="Distribution of variants by color"
      >
        <div v-if="colorDistributionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
        <div v-else-if="colorDistributionError" class="text-center text-red-600 py-8">
          Error loading color distribution
        </div>
        <PieChart
          v-else-if="colorDistributionChartData.length"
          :data="colorDistributionChartData"
          height="300px"
          :donut="true"
          :colors="colorChartColors"
          value-label="Variants"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No color distribution data available
        </div>
      </StatSection>

      <!-- Stock Status Summary -->
      <StatSection 
        title="Stock Status Summary"
        description="Quick overview of inventory health"
      >
        <div v-if="stockOverviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else class="space-y-4 p-4">
          <!-- In Stock Percentage -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">In Stock</span>
              <span class="text-sm font-bold text-green-600">{{ inStockPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-green-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${inStockPercentage}%` }"
              />
            </div>
          </div>

          <!-- Low Stock Percentage -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Low Stock</span>
              <span class="text-sm font-bold text-amber-600">{{ lowStockPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-amber-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${lowStockPercentage}%` }"
              />
            </div>
          </div>

          <!-- Out of Stock Percentage -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Out of Stock</span>
              <span class="text-sm font-bold text-red-600">{{ outOfStockPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-red-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${outOfStockPercentage}%` }"
              />
            </div>
          </div>

          <!-- Average Stock Level -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="text-center">
              <div class="text-3xl font-black text-gray-900">
                {{ stockOverviewData?.data?.average_stock?.toFixed(1) ?? '0.0' }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">
                Average Stock per Variant
              </div>
            </div>
          </div>
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  useVariantStockOverview,
  useStockLevels,
  useSizeDistribution,
  useColorDistribution
} from '~/composables/statistics/products/product-statistics'
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

// Fetch statistics data
const { data: stockOverviewData, isLoading: stockOverviewLoading } = useVariantStockOverview(() => props.queryParams)
const { data: stockLevelsData, isLoading: stockLevelsLoading, error: stockLevelsError } = useStockLevels(() => props.queryParams)
const { data: sizeDistributionData, isLoading: sizeDistributionLoading, error: sizeDistributionError } = useSizeDistribution(() => props.queryParams)
const { data: colorDistributionData, isLoading: colorDistributionLoading, error: colorDistributionError } = useColorDistribution(() => props.queryParams)

// Transform data for charts
const stockLevelsChartData = computed<BarChartData[]>(() => {
  const distribution = stockLevelsData.value?.data?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    label: item.label || 'Unknown',
    value: item.value || 0,
  }))
})

const sizeDistributionChartData = computed<PieChartData[]>(() => {
  const distribution = sizeDistributionData.value?.data?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || item.name || 'One Size',
    value: item.value || 0,
  })).filter(item => item.value > 0)
})

const colorDistributionChartData = computed<PieChartData[]>(() => {
  const distribution = colorDistributionData.value?.data?.distribution
  if (!distribution || !Array.isArray(distribution)) return []
  
  return distribution.map((item: any) => ({
    name: item.label || item.name || 'Unknown',
    value: item.value || 0,
  })).filter(item => item.value > 0)
})

// Extract hex colors from color distribution data
const colorChartColors = computed(() => {
  const distribution = colorDistributionData.value?.data?.distribution
  if (!distribution || !Array.isArray(distribution)) {
    return ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
  }
  
  return distribution.map((item: any) => item.hex_code || '#6b7280')
})

// Calculate stock percentages
const inStockPercentage = computed(() => {
  const total = stockOverviewData.value?.data?.total_variants ?? 0
  if (total === 0) return 0
  const inStock = total - (stockOverviewData.value?.data?.out_of_stock_count ?? 0)
  return Math.round((inStock / total) * 100)
})

const lowStockPercentage = computed(() => {
  const total = stockOverviewData.value?.data?.total_variants ?? 0
  if (total === 0) return 0
  const lowStock = stockOverviewData.value?.data?.low_stock_count ?? 0
  return Math.round((lowStock / total) * 100)
})

const outOfStockPercentage = computed(() => {
  const total = stockOverviewData.value?.data?.total_variants ?? 0
  if (total === 0) return 0
  const outOfStock = stockOverviewData.value?.data?.out_of_stock_count ?? 0
  return Math.round((outOfStock / total) * 100)
})
</script>
