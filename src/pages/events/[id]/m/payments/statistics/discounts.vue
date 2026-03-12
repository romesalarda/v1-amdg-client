<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        :value="discountUsage?.data?.total_discounts ?? 0"
        label="Active Discounts"
        icon="i-heroicons-tag"
        icon-color="blue"
        :loading="discountUsageLoading"
      />
      <StatCard
        :value="discountRules?.data?.total_rules ?? 0"
        label="Discount Rules"
        icon="i-heroicons-cog-6-tooth"
        icon-color="purple"
        :loading="discountRulesLoading"
      />
      <StatCard
        :value="topDiscounts?.data?.total_returned ?? 0"
        label="Top Discounts"
        icon="i-heroicons-star"
        icon-color="amber"
        :loading="topDiscountsLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Discount Type Distribution -->
      <StatSection 
        title="Discount Type Distribution"
        description="Breakdown of discounts by type"
      >
        <div v-if="discountUsageLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="discountUsageError" class="text-center text-red-600 py-8">
          Error loading discount usage
        </div>
        <PieChart
          v-else-if="discountTypeChartData.length"
          :data="discountTypeChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#10b981', '#f59e0b']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No discount type data available
        </div>
      </StatSection>

      <!-- Discount Rule Types -->
      <StatSection 
        title="Discount Rule Distribution"
        description="Distribution of rule types"
      >
        <div v-if="discountRulesLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="discountRulesError" class="text-center text-red-600 py-8">
          Error loading discount rules
        </div>
        <BarChart
          v-else-if="discountRulesChartData.length"
          :data="discountRulesChartData"
          height="300px"
          color="#8b5cf6"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No discount rule data available
        </div>
      </StatSection>
    </div>

    <!-- Top Discounts Table -->
    <StatSection 
      title="Top Discounts"
      description="Most popular discount codes and offers"
    >
      <div v-if="topDiscountsLoading" class="flex items-center justify-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
      <div v-else-if="topDiscountsError" class="text-center text-red-600 py-8">
        Error loading top discounts
      </div>
      <div v-else-if="topDiscountsTableData.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="py-3 px-4 font-semibold text-gray-700">Discount Name</th>
              <th class="py-3 px-4 font-semibold text-gray-700">Type</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Value</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Rules</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="discount in topDiscountsTableData"
              :key="discount.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <span class="font-medium">{{ discount.name }}</span>
              </td>
              <td class="py-3 px-4">
                <UBadge 
                  :color="discount.discount_type === 'PERCENTAGE' ? 'blue' : 'green'"
                  variant="soft"
                  size="xs"
                >
                  {{ discount.discount_type }}
                </UBadge>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">
                {{ discount.display_value }}
              </td>
              <td class="py-3 px-4 text-right text-gray-600">
                {{ discount.rule_count }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No discount data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useDiscountUsage,
  useDiscountRules,
  useTopDiscounts,
} from '~/composables/statistics/payments/payment-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, string | number | boolean>
}

const props = defineProps<Props>()

// Fetch statistics data
const { data: discountUsage, isLoading: discountUsageLoading, error: discountUsageError } = useDiscountUsage(() => props.queryParams)
const { data: discountRules, isLoading: discountRulesLoading, error: discountRulesError } = useDiscountRules(() => props.queryParams)
const { data: topDiscounts, isLoading: topDiscountsLoading, error: topDiscountsError } = useTopDiscounts(() => props.queryParams)

// Transform data for discount type pie chart
const discountTypeChartData = computed<PieChartData[]>(() => {
  if (!discountUsage.value?.data?.type_distribution) return []
  return discountUsage.value.data.type_distribution.map((item: { label?: string; value?: number }) => ({
    name: item.label ?? 'Unknown',
    value: item.value ?? 0,
  }))
})

// Transform data for discount rules bar chart
const discountRulesChartData = computed<BarChartData[]>(() => {
  if (!discountRules.value?.data?.rules) return []
  return discountRules.value.data.rules.map((item: { label?: string; count?: number }) => ({
    label: item.label ?? 'Unknown',
    value: item.count ?? 0,
  }))
})

// Transform data for top discounts table
const topDiscountsTableData = computed(() => {
  if (!topDiscounts.value?.data?.discounts) return []
  return topDiscounts.value.data.discounts.map((discount: {
    id?: string
    name?: string
    discount_type?: string
    display_value?: string
    rule_count?: number
  }) => ({
    id: discount.id ?? '',
    name: discount.name ?? 'Unknown',
    discount_type: discount.discount_type ?? 'Unknown',
    display_value: discount.display_value ?? 'N/A',
    rule_count: discount.rule_count ?? 0,
  }))
})
</script>
