<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="attendanceLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="days.length">
      <!-- Overall Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          :value="attendanceData?.data?.total_attendees ?? 0"
          label="Total Attendees"
          icon="i-heroicons-users"
          icon-color="blue"
        />
        <StatCard
          :value="(attendanceData?.data as any).event_days_count ?? 0"
          label="Event Days"
          icon="i-heroicons-calendar-days"
          icon-color="indigo"
        />
        <StatCard
          :value="overallCheckedIn"
          label="Total Checked In"
          icon="i-heroicons-check-circle"
          icon-color="green"
        />
      </div>

      <!-- Day Selector -->
      <StatSection
        title="Attendance by Day"
        description="Select a day to view detailed check-in statistics"
      >
        <!-- Day pills -->
        <div class="flex flex-wrap gap-1.5 mb-6">
          <button
            v-for="day in days"
            :key="day.event_day"
            class="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5"
            :class="selectedDayKey === day.event_day
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedDayKey = day.event_day"
          >
            Day {{ day.event_day }}
            <span v-if="day.date" class="font-normal opacity-75">({{ formatDate(day.date) }})</span>
            <span
              v-if="day.date === todayDate"
              class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              :class="selectedDayKey === day.event_day ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'"
            >Today</span>
          </button>
        </div>

        <!-- Selected day detail -->
        <div v-if="selectedDayData" class="space-y-6">
          <!-- Gauge + stat cards side by side -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <!-- Gauge -->
            <div style="height: 280px;">
              <GaugeChart
                :value="selectedDayData.check_in_rate"
                :title="`Day ${selectedDayData.event_day} Check-in Rate`"
                height="280px"
                color="#16a34a"
              />
            </div>

            <!-- Stats -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div class="text-2xl font-bold text-green-900">{{ selectedDayData.checked_in }}</div>
                      <div class="text-xs text-green-700">Checked In</div>
                    </div>
                  </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-clock" class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div class="text-2xl font-bold text-amber-900">{{ selectedDayData.not_checked_in }}</div>
                      <div class="text-xs text-amber-700">Awaiting</div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Progress bar -->
              <div>
                <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Attendance Progress</span>
                  <span>{{ selectedDayData.checked_in }} / {{ selectedDayData.total_attendees }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div
                    class="bg-green-500 h-4 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min(selectedDayData.check_in_rate, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Hourly timeline -->
          <div v-if="hourlyTimeline.labels.length">
            <div class="text-sm font-semibold text-gray-700 mb-2">Hourly Check-in Timeline</div>
            <div style="height: 220px;">
              <LineChart
                :data="hourlyTimeline.data"
                :labels="hourlyTimeline.labels"
                color="#16a34a"
                label="Check-ins"
                height="220px"
              />
            </div>
          </div>
          <div v-else class="text-center text-gray-400 py-4 text-sm">
            No hourly timeline data for this day.
          </div>
        </div>
      </StatSection>

      <!-- All-days summary table -->
      <StatSection
        title="All Days Overview"
        description="Check-in summary across every event day"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <th class="pb-2 pr-4">Day</th>
                <th class="pb-2 pr-4">Date</th>
                <th class="pb-2 pr-4 text-right">Checked In</th>
                <th class="pb-2 pr-4 text-right">Awaiting</th>
                <th class="pb-2 pr-4 text-right">Total</th>
                <th class="pb-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="day in days"
                :key="day.event_day"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                :class="{ 'bg-primary/5': selectedDayKey === day.event_day }"
                @click="selectedDayKey = day.event_day"
              >
                <td class="py-3 pr-4 font-semibold text-gray-800">
                  Day {{ day.event_day }}
                  <span v-if="day.date === todayDate" class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Today</span>
                </td>
                <td class="py-3 pr-4 text-gray-500 text-xs">{{ day.date ? formatDate(day.date) : '—' }}</td>
                <td class="py-3 pr-4 text-right text-green-700 font-semibold">{{ day.checked_in }}</td>
                <td class="py-3 pr-4 text-right text-amber-700 font-semibold">{{ day.not_checked_in }}</td>
                <td class="py-3 pr-4 text-right text-gray-600">{{ day.total_attendees }}</td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-20 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                      <div
                        class="h-1.5 rounded-full"
                        :class="day.check_in_rate >= 80 ? 'bg-green-500' : day.check_in_rate >= 50 ? 'bg-amber-500' : 'bg-red-400'"
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
      </StatSection>
    </template>

    <div v-else-if="!attendanceLoading" class="text-center text-gray-500 py-12">
      No attendance data available.

      {{ attendanceData }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAttendance, useCheckInStats } from '~/composables/statistics/attendee/attendee-statistics'
import { formatDate } from '~/composables/statistics/attendee/filters'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import GaugeChart from '~/components/charts/GaugeChart.vue'
import LineChart from '~/components/charts/LineChart.vue'

interface DayData {
  event_day: number
  date: string | null
  checked_in: number
  not_checked_in: number
  total_attendees: number
  check_in_rate: number
  hourly_timeline: { hour: string; count: number }[]
}

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Fetch attendance data (new structure)
const { data: attendanceData, isLoading: attendanceLoading } = useCheckInStats(() => props.queryParams)

// Today's date in YYYY-MM-DD
const todayDate = new Date().toISOString().slice(0, 10)

// Extracted days array
const days = computed<DayData[]>(() => (attendanceData.value?.data as any)?.days ?? [])

// Total checked in across all days (de-duped by using top-level total or summing days)
const overallCheckedIn = computed(() =>
  days.value.reduce((acc, d) => acc + d.checked_in, 0)
)

// Selected day key — default to today's day if present, otherwise first day
const selectedDayKey = ref<number | null>(null)

watch(days, (newDays) => {
  if (selectedDayKey.value !== null) return
  if (!newDays.length) return
  const todayDay = newDays.find(d => d.date === todayDate)
  selectedDayKey.value = todayDay ? todayDay.event_day : newDays[0].event_day
}, { immediate: true })

const selectedDayData = computed<DayData | null>(() =>
  days.value.find(d => d.event_day === selectedDayKey.value) ?? null
)

// Hourly timeline for selected day
const hourlyTimeline = computed(() => {
  const timeline = selectedDayData.value?.hourly_timeline ?? []
  return {
    labels: timeline.map(t => t.hour),
    data: timeline.map(t => t.count),
  }
})
</script>
