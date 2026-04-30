<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="intentOverviewData?.data?.total_intents ?? 0"
        label="Total Intents"
        icon="i-heroicons-clock"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="intentOverviewData?.data?.total_capacity_reserved ?? 0"
        label="Capacity Reserved"
        icon="i-heroicons-users"
        icon-color="purple"
        :loading="overviewLoading"
      />
      <StatCard
        :value="intentOverviewData?.data?.average_capacity_per_intent?.toFixed(1) ?? '0'"
        label="Avg Capacity/Intent"
        icon="i-heroicons-chart-bar"
        icon-color="amber"
        :loading="overviewLoading"
      />
      <StatCard
        :value="`${conversionData?.data?.conversion_rate ?? 0}%`"
        label="Conversion Rate"
        icon="i-heroicons-arrow-trending-up"
        icon-color="green"
        :loading="conversionLoading"
      />
    </div>

    <!-- Charts Grid Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Intent Status Distribution -->
      <StatSection 
        title="Intent Status Distribution"
        description="Breakdown by intent status"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="intentStatusChartData.length">
          <PieChart
            :data="intentStatusChartData"
            height="300px"
            :donut="true"
            :colors="['#6b7280','#10b981','#f59e0b', '#ef4444', ]"
            value-label="Intents"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No status data available
        </div>
      </StatSection>

      <!-- Intent Conversion Funnel -->
      <StatSection 
        title="Conversion Funnel"
        description="Intent conversion breakdown"
      >
        <div v-if="conversionLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <div v-else-if="conversionError" class="text-center text-red-600 py-8">
          Error loading conversion data
        </div>
        <div v-else-if="conversionData?.data" class="p-6 space-y-6">
          <!-- Conversion Rate Display -->
          <div class="text-center">
            <div class="text-5xl font-bold text-emerald-600 mb-2">{{ conversionData.data.conversion_rate }}%</div>
            <div class="text-sm text-gray-500">Conversion Rate</div>
          </div>

          <!-- Funnel Metrics -->
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-700">Completed</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-emerald-600">{{ conversionData.data.completed }}</span>
                <span class="text-xs text-gray-500">({{ conversionData.data.conversion_rate }}%)</span>
              </div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-700">Expired</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-amber-600">{{ conversionData.data.expired }}</span>
                <span class="text-xs text-gray-500">({{ conversionData.data.expiration_rate }}%)</span>
              </div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-700">Cancelled</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-red-600">{{ conversionData.data.cancelled }}</span>
                <span class="text-xs text-gray-500">({{ conversionData.data.cancellation_rate }}%)</span>
              </div>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-700">Pending</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-blue-600">{{ conversionData.data.pending }}</span>
                <span class="text-xs text-gray-500">({{ (conversionData.data.pending / conversionData.data.total_intents * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No conversion data available
        </div>
      </StatSection>
    </div>

    <!-- Intent Trends -->
    <StatSection 
      title="Intent Trends"
      description="Intent creation over time"
    >
      <div v-if="trendsLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
      <div v-else-if="trendsError" class="text-center text-red-600 py-8">
        Error loading intent trends
      </div>
      <LineChart
        v-else-if="intentTrendsChartData.labels.length"
        :labels="intentTrendsChartData.labels"
        :data="intentTrendsChartData.data"
        height="300px"
        color="#8b5cf6"
        :label="'Intents Created'"
      />
      <div v-else class="text-center text-gray-500 py-8">
        No trend data available
      </div>
    </StatSection>

    <!-- Detailed Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Status Breakdown Table -->
      <StatSection 
        title="Intent Status Details"
        description="Detailed breakdown by status"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="intentOverviewData?.data?.status_breakdown" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="status in intentOverviewData.data.status_breakdown" :key="status.status" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900">{{ formatStatus(status.status) }}</td>
                <td class="px-4 py-3 text-right text-gray-700">{{ status.count }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ status.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No status breakdown available
        </div>
      </StatSection>

      <!-- Conversion Metrics Summary -->
      <StatSection 
        title="Conversion Metrics"
        description="Key conversion statistics"
      >
        <div v-if="conversionLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <div v-else-if="conversionData?.data" class="space-y-3 p-4">
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Conversion Rate:</span>
            <span class="text-2xl font-bold text-emerald-600">{{ conversionData.data.conversion_rate }}%</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Expiration Rate:</span>
            <span class="text-lg font-bold text-amber-600">{{ conversionData.data.expiration_rate }}%</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm text-gray-600">Cancellation Rate:</span>
            <span class="text-lg font-bold text-red-600">{{ conversionData.data.cancellation_rate }}%</span>
          </div>
          <div class="pt-4">
            <div class="text-xs text-gray-500 mb-2">Funnel Performance</div>
            <div class="space-y-2">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-600">Completed</span>
                  <span class="text-emerald-600 font-medium">{{ conversionData.data.conversion_rate }}%</span>
                </div>
                <div class="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-emerald-500 h-full transition-all duration-500"
                    :style="`width: ${conversionData.data.conversion_rate}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No conversion metrics available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useIntentOverview,
  useIntentConversion,
  useIntentTrends,
} from '~/composables/statistics/bookings/booking-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'

interface Props {
  queryParams: Record<string, any>
  groupBy?: 'day' | 'week' | 'month'
}

const props = defineProps<Props>()

// Fetch all intent statistics
const { data: intentOverviewData, isLoading: overviewLoading } = useIntentOverview(() => props.queryParams)
const { data: conversionData, isLoading: conversionLoading, error: conversionError } = useIntentConversion(() => props.queryParams)
const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useIntentTrends(() => props.queryParams)

// Transform data for charts
const intentStatusChartData = computed<PieChartData[]>(() => {
  if (!intentOverviewData.value?.data?.status_breakdown) return []
  return intentOverviewData.value.data.status_breakdown.map((item: any) => ({
    name: formatStatus(item.status),
    value: item.count,
  }))
})

const intentTrendsChartData = computed(() => {
  if (!trendsData.value?.data?.trends) return { labels: [], data: [] }
  return {
    labels: trendsData.value.data.trends.map((item: any) => item.date),
    data: trendsData.value.data.trends.map((item: any) => item.count),
  }
})

// Helper function to format status
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
</script>
