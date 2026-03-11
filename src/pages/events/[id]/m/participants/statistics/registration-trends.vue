<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        :value="trendsData?.data?.total_attendees ?? 0"
        label="Total Registrations"
        icon="i-heroicons-user-plus"
        icon-color="blue"
      />
      <StatCard
        :value="recentRegistrations"
        label="Recent Registrations"
        icon="i-heroicons-clock"
        icon-color="green"
        :subtitle="recentPeriodLabel"
      />
      <StatCard
        :value="averagePerDay"
        label="Avg per Day"
        icon="i-heroicons-chart-bar"
        icon-color="purple"
        :subtitle="dateRangeLabel"
      />
    </div>

    <!-- Registration Trends Chart -->
    <StatSection 
      title="Registration Trends"
      :description="`Registration patterns over time (grouped by ${groupBy})`"
    >
      <template #header-actions>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Group by:</span>
          <select
            v-model="localGroupBy"
            @change="handleGroupByChange"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </template>

      <div v-if="trendsLoading" class="flex items-center justify-center h-96">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="trendsError" class="text-center text-red-600 py-8">
        Error loading registration trends
      </div>
      <div v-else-if="trendsChartData.labels.length" class="w-full" style="height: 400px;">
        <LineChart
          :data="trendsChartData.data"
          :labels="trendsChartData.labels"
          color="#3b82f6"
          :smooth="true"
        />
      </div>
      <div v-else class="text-center text-gray-500 py-16">
        No registration trends data available
      </div>
    </StatSection>

    <!-- Registration Stats Table -->
    <StatSection 
      title="Registration Statistics"
      description="Detailed breakdown of registration data"
    >
      <div v-if="trendsLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="trendsData?.data?.trends" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrations
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumulative
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(trend, index) in displayTrends" :key="(trend as any).date">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate((trend as any).date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ (trend as any).count }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ getCumulative(index) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No detailed trends data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRegistrationTrends } from '~/composables/statistics/attendee/attendee-statistics'
import { formatDate } from '~/composables/statistics/attendee/filters'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import LineChart from '~/components/charts/LineChart.vue'

interface Props {
  queryParams: Record<string, any>
  groupBy: 'day' | 'week' | 'month'
  dateRangeLabel: string
}

interface Emits {
  (e: 'update-group-by', value: 'day' | 'week' | 'month'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localGroupBy = ref(props.groupBy)

watch(() => props.groupBy, (newValue) => {
  localGroupBy.value = newValue
})

const handleGroupByChange = () => {
  emit('update-group-by', localGroupBy.value)
}

// Fetch registration trends data
const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useRegistrationTrends(() => props.queryParams)

// Transform data for line chart
const trendsChartData = computed(() => {
  if (!trendsData.value?.data?.trends) {
    return { labels: [], data: [] }
  }
  
  const trends = trendsData.value.data.trends
  return {
    labels: trends.map((t: any) => formatDate(t.date)),
    data: trends.map((t: any) => t.count),
  }
})

// Recent registrations (last 7 entries)
const recentRegistrations = computed(() => {
  if (!trendsData.value?.data?.trends) return 0
  const trends = trendsData.value.data.trends
  const recent = trends.slice(-7)
  return recent.reduce((sum: number, t: any) => sum + t.count, 0)
})

const recentPeriodLabel = computed(() => {
  if (localGroupBy.value === 'day') return 'Last 7 days'
  if (localGroupBy.value === 'week') return 'Last 7 weeks'
  return 'Last 7 months'
})

// Average per day
const averagePerDay = computed(() => {
  if (!trendsData.value?.data?.trends || !trendsData.value.data.trends.length) return '0'
  const trends = trendsData.value.data.trends
  const total = trends.reduce((sum: number, t: any) => sum + t.count, 0)
  const avg = total / trends.length
  return avg.toFixed(1)
})

// Display trends (limit to last 50 for table)
const displayTrends = computed(() => {
  if (!trendsData.value?.data?.trends) return []
  return trendsData.value.data.trends.slice(-50).reverse()
})

// Calculate cumulative count
const getCumulative = (index: number) => {
  if (!trendsData.value?.data?.trends) return 0
  const allTrends = trendsData.value.data.trends
  const reversedIndex = allTrends.length - index - 1
  return allTrends.slice(0, reversedIndex + 1).reduce((sum: number, t: any) => sum + t.count, 0)
}
</script>
