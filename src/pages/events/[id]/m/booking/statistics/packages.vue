<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="packageOverviewData?.data?.total_packages ?? 0"
        label="Total Packages"
        icon="i-heroicons-cube"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="packageOverviewData?.data?.active_packages ?? 0"
        label="Active Packages"
        icon="i-heroicons-check-circle"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="packageOverviewData?.data?.packages_with_tickets ?? 0"
        label="With Tickets"
        icon="i-heroicons-ticket"
        icon-color="purple"
        :loading="overviewLoading"
      />
      <StatCard
        :value="packageOverviewData?.data?.total_rules ?? 0"
        label="Total Rules"
        icon="i-heroicons-document-text"
        icon-color="amber"
        :loading="overviewLoading"
      />
    </div>

    <!-- Charts Grid Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Package Popularity -->
      <StatSection 
        title="Package Popularity"
        description="Most popular packages by usage"
      >
        <div v-if="popularityLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="popularityError" class="text-center text-red-600 py-8">
          Error loading package popularity
        </div>
        <BarChart
          v-else-if="packagePopularityChartData.length"
          :data="packagePopularityChartData"
          height="300px"
          color="#3b82f6"
          value-label="Bookings"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No popularity data available
        </div>
      </StatSection>

      <!-- Package Rules Distribution -->
      <StatSection 
        title="Package Rules"
        description="Distribution by rule type"
      >
        <div v-if="rulesLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="rulesError" class="text-center text-red-600 py-8">
          Error loading package rules
        </div>
        <BarChart
          v-else-if="packageRulesChartData.length"
          :data="packageRulesChartData"
          height="300px"
          color="#8b5cf6"
          value-label="Rules"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No rules data available
        </div>
      </StatSection>
    </div>

    <!-- Package Pricing Section -->
    <StatSection 
      title="Package Pricing Overview"
      description="Pricing statistics and distribution"
    >
      <div v-if="pricingLoading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
      <div v-else-if="pricingError" class="text-center text-red-600 py-8">
        Error loading pricing data
      </div>
      <div v-else-if="pricingData?.data" class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-gray-900">{{ formatCurrency(pricingData.data.average_base_amount) }}</div>
          <div class="text-sm text-gray-500 mt-1">Average Price</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-emerald-600">{{ formatCurrency(pricingData.data.min_base_amount) }}</div>
          <div class="text-sm text-gray-500 mt-1">Minimum Price</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ formatCurrency(pricingData.data.max_base_amount) }}</div>
          <div class="text-sm text-gray-500 mt-1">Maximum Price</div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No pricing data available
      </div>
    </StatSection>

    <!-- Pricing Table -->
    <StatSection 
      title="Package Pricing Details"
      description="Detailed pricing information for top packages"
    >
      <div v-if="pricingLoading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="pricingData?.data?.packages" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">Package Name</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Base Amount</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Modifier</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-700">Active</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="pkg in pricingData.data.packages" :key="pkg.package_id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-900">{{ pkg.package_name }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ formatCurrency(pkg.base_amount) }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ pkg.percentage_modifier }}%</td>
              <td class="px-4 py-3 text-center">
                <span :class="pkg.is_active ? 'text-green-600' : 'text-gray-400'">
                  {{ pkg.is_active ? '✓' : '✗' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No pricing details available
      </div>
    </StatSection>

    <!-- Overview Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatSection 
        title="Package Summary"
        description="Key package metrics"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="packageOverviewData?.data" class="space-y-3 p-4">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Total Packages:</span>
            <span class="text-sm font-semibold text-gray-900">{{ packageOverviewData.data.total_packages }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Active Packages:</span>
            <span class="text-sm font-semibold text-emerald-600">{{ packageOverviewData.data.active_packages }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Packages with Tickets:</span>
            <span class="text-sm font-semibold text-blue-600">{{ packageOverviewData.data.packages_with_tickets }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Total Rules:</span>
            <span class="text-sm font-semibold text-gray-900">{{ packageOverviewData.data.total_rules }}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">Active Rules:</span>
            <span class="text-sm font-semibold text-emerald-600">{{ packageOverviewData.data.active_rules }}</span>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No overview data available
        </div>
      </StatSection>

      <StatSection 
        title="Top Packages"
        description="Most used packages by ticket count"
      >
        <div v-if="popularityLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="popularityData?.data?.popularity" class="space-y-2 p-4">
          <div 
            v-for="(pkg, index) in popularityData.data.popularity.slice(0, 5)" 
            :key="pkg.package_id"
            class="flex justify-between items-center py-2 border-b border-gray-100"
          >
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">{{ index + 1 }}</span>
              <span class="text-sm text-gray-900">{{ pkg.package_name }}</span>
            </div>
            <span class="text-sm font-semibold text-blue-600">{{ pkg.ticket_count }} tickets</span>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No popularity data available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePackageOverview,
  usePackagePopularity,
  usePackageRules,
  usePackagePricing,
} from '~/composables/statistics/bookings/booking-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import BarChart from '~/components/charts/BarChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Fetch all package statistics
const { data: packageOverviewData, isLoading: overviewLoading } = usePackageOverview(() => props.queryParams)
const { data: popularityData, isLoading: popularityLoading, error: popularityError } = usePackagePopularity(() => props.queryParams)
const { data: rulesData, isLoading: rulesLoading, error: rulesError } = usePackageRules(() => props.queryParams)
const { data: pricingData, isLoading: pricingLoading, error: pricingError } = usePackagePricing(() => props.queryParams)

const currencyCode = computed(() => {
  const data = packageOverviewData.value?.data
  return (data?.currency?.code || 'GBP') as string
})

// Transform data for charts
const packagePopularityChartData = computed<BarChartData[]>(() => {
  if (!popularityData.value?.data?.popularity) return []
  return popularityData.value.data.popularity.slice(0, 10).map((item: any) => ({
    label: item.package_name,
    value: item.ticket_count,
  }))
})

const packageRulesChartData = computed<BarChartData[]>(() => {
  if (!rulesData.value?.data?.distribution) return []
  return rulesData.value.data.distribution.map((item: any) => ({
    label: formatRuleType(item.rule_type),
    value: item.count,
  }))
})

// Helper function to format rule type
const formatRuleType = (text: string) => {
  return text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode.value,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
