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
              class="bg-green-600 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ml-10"
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
    <!-- Per-Day Breakdown -->
    <StatSection
      title="Check-in by Event Day"
      description="Breakdown of check-in rate for each day of the event"
    >
      <div v-if="checkinStatsLoading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="checkinStatsData?.data?.days?.length">
        <!-- Day filter pills -->
        <div class="flex flex-wrap gap-1.5 mb-4">
          <button
            class="px-2.5 py-1 text-xs font-semibold rounded-full transition-colors"
            :class="selectedDay === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedDay = null"
          >
            All Days
          </button>
          <button
            v-for="day in checkinStatsData.data.days"
            :key="day.checked_in"
            class="px-2.5 py-1 text-xs font-semibold rounded-full transition-colors"
            :class="selectedDay === day.event_day ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedDay = day.event_day"
          >
            Day {{ day.event_day }}
            <span v-if="day.date" class="font-normal opacity-75">({{ formatDate(day.date) }})</span>
          </button>
        </div>

        <!-- Per-day table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <th class="pb-2 pr-4">Day</th>
                <th class="pb-2 pr-4">Date</th>
                <th class="pb-2 pr-4 text-right">Checked In</th>
                <th class="pb-2 pr-4 text-right">Remaining</th>
                <th class="pb-2 pr-4 text-right">Total</th>
                <th class="pb-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="day in visibleDays"
                :key="day.checked_in"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 pr-4 font-semibold text-gray-800">Day {{ day.event_day }}</td>
                <td class="py-3 pr-4 text-gray-500 text-xs">{{ day.date ? formatDate(day.date) : '—' }}</td>
                <td class="py-3 pr-4 text-right text-green-700 font-semibold">{{ day.checked_in }}</td>
                <td class="py-3 pr-4 text-right text-amber-700 font-semibold">{{ day.not_checked_in }}</td>
                <td class="py-3 pr-4 text-right text-gray-600">{{ day.total_attendees }}</td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-20 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                      <div
                        class="bg-green-500 h-1.5 rounded-full"
                        :style="{ width: `${Math.min(day.check_in_rate, 100)}%` }"
                      />
                    </div>
                    <span
                      class="text-xs font-semibold"
                      :class="day.check_in_rate >= 80 ? 'text-green-700' : day.check_in_rate >= 50 ? 'text-amber-700' : 'text-red-700'"
                    >
                      {{ day.check_in_rate.toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-8">
        No per-day check-in data available for this event.
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAttendance, useCheckInStats } from '~/composables/statistics/attendee/attendee-statistics'
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

// Fetch per-day check-in stats
const { data: checkinStatsData, isLoading: checkinStatsLoading } = useCheckInStats(() => props.queryParams)

// Day filter state
const selectedDay = ref<number | null>(null)

// Visible rows based on selected day pill
const visibleDays = computed(() => {
  const days = checkinStatsData.value?.data?.days ?? []
  if (selectedDay.value === null) return days
  return days.filter((d: any) => d.event_day === selectedDay.value)
})

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
