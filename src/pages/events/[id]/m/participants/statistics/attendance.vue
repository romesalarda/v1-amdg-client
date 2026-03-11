<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="attendanceData?.data?.total_attendees ?? 0"
        label="Total Attendees"
        icon="i-heroicons-users"
        icon-color="blue"
      />
      <StatCard
        :value="attendanceData?.data?.checked_in ?? 0"
        label="Checked In"
        icon="i-heroicons-check-circle"
        icon-color="green"
      />
      <StatCard
        :value="attendanceData?.data?.not_checked_in ?? 0"
        label="Not Checked In"
        icon="i-heroicons-x-circle"
        icon-color="amber"
      />
      <StatCard
        :value="checkInRate"
        label="Check-in Rate"
        icon="i-heroicons-chart-bar"
        icon-color="purple"
        format="percentage"
      />
    </div>

    <!-- Check-in Rate Gauge -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatSection 
        title="Check-in Rate"
        description="Overall attendance rate for the event"
      >
        <div v-if="attendanceLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="attendanceError" class="text-center text-red-600 py-8">
          Error loading attendance data
        </div>
        <GaugeChart
          v-else-if="attendanceData?.data"
          :value="checkInRate"
          height="280px"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No attendance data available
        </div>
      </StatSection>

      <!-- Check-in Trends -->
      <StatSection 
        title="Check-in Trends"
        description="Pattern of check-ins over time"
      >
        <div v-if="attendanceLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else-if="attendanceError" class="text-center text-red-600 py-8">
          Error loading check-in trends
        </div>
        <div v-else-if="checkInTrendsData.labels.length" class="w-full" style="height: 280px;">
          <LineChart
            :data="checkInTrendsData.data"
            :labels="checkInTrendsData.labels"
            color="#10b981"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No check-in trends available
        </div>
      </StatSection>
    </div>

    <!-- Attendance Status Breakdown -->
    <StatSection 
      title="Attendance Status"
      description="Detailed breakdown of attendance"
    >
      <div v-if="attendanceLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="attendanceData?.data" class="space-y-4">
        <!-- Progress Bar -->
        <div>
          <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Attendance Progress</span>
            <span>{{ attendanceData.data.checked_in }} / {{ attendanceData.data.total_attendees }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-8">
            <div 
              class="bg-green-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
              :style="{ width: `${checkInRate}%` }"
            >
              {{ checkInRate.toFixed(1) }}%
            </div>
          </div>
        </div>

        <!-- Status Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div class="text-3xl font-bold text-green-900">
                  {{ attendanceData.data.checked_in }}
                </div>
                <div class="text-sm text-green-700">Checked In</div>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div class="text-3xl font-bold text-amber-900">
                  {{ attendanceData.data.not_checked_in }}
                </div>
                <div class="text-sm text-amber-700">Awaiting Check-in</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No attendance status data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAttendance } from '~/composables/statistics/attendee/attendee-statistics'
import { formatDate } from '~/composables/statistics/attendee/filters'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import GaugeChart from '~/components/charts/GaugeChart.vue'
import LineChart from '~/components/charts/LineChart.vue'

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Fetch attendance data
const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError } = useAttendance(() => props.queryParams)

// Calculate check-in rate
const checkInRate = computed(() => {
  if (!attendanceData.value?.data) return 0
  const rate = attendanceData.value.data.check_in_rate ?? 0
  return typeof rate === 'number' ? rate : 0
})

// Transform check-in trends data
const checkInTrendsData = computed(() => {
  if (!attendanceData.value?.data?.check_in_trends) {
    return { labels: [], data: [] }
  }
  
  const trends = attendanceData.value.data.check_in_trends
  return {
    labels: trends.map((t: any) => formatDate(t.date)),
    data: trends.map((t: any) => t.count),
  }
})
</script>
