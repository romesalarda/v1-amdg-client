<template>
  <div class="w-full">
    <div v-if="!windows || windows.length === 0" class="text-center py-8 text-gray-500">
      No availability windows to display
    </div>
    
    <div v-else class="space-y-4">
      <!-- Calendar Header with Navigation -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-chevron-left"
            variant="ghost"
            size="sm"
            @click="previousMonth"
          />
          <h3 class="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {{ currentMonthYear }}
          </h3>
          <UButton
            icon="i-heroicons-chevron-right"
            variant="ghost"
            size="sm"
            @click="nextMonth"
          />
        </div>
        <UButton
          variant="outline"
          size="sm"
          @click="goToToday"
        >
          Today
        </UButton>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <!-- Day Headers -->
        <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center py-3 text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2 relative"
            :class="{
              'bg-gray-50': !day.isCurrentMonth,
              'bg-blue-50': day.isToday && day.isCurrentMonth,
              'bg-white': day.isCurrentMonth && !day.isToday
            }"
          >
            <!-- Date Number and Event Indicator -->
            <div class="flex items-start justify-between mb-1">
              <span
                class="text-sm font-medium"
                :class="{
                  'text-gray-400': !day.isCurrentMonth,
                  'text-blue-700 font-bold': day.isToday,
                  'text-gray-900': day.isCurrentMonth && !day.isToday
                }"
              >
                {{ day.date.getDate() }}
              </span>
              <!-- Event date badge -->
              <div v-if="isEventDay(day.date)" class="flex flex-col items-end gap-0.5">
                <UBadge
                  size="xs"
                  color="indigo"
                  variant="solid"
                  class="text-[9px] px-1"
                >
                  EVENT
                </UBadge>
                <span
                  v-if="isEventStartDay(day.date)"
                  class="text-[8px] text-indigo-600 font-semibold"
                >
                  Start
                </span>
                <span
                  v-if="isEventEndDay(day.date)"
                  class="text-[8px] text-indigo-600 font-semibold"
                >
                  End
                </span>
              </div>
            </div>

            <!-- Windows for this day -->
            <div class="space-y-1">
              <div
                v-for="windowInfo in getWindowsForDay(day.date)"
                :key="`${windowInfo.window.availability_id}-${day.date.getTime()}`"
                class="text-xs rounded cursor-pointer transition-all hover:scale-[1.02]"
                :class="getWindowSolidClasses(windowInfo.window.availability_type)"
                :title="getDetailedTooltip(windowInfo.window, day.date)"
                @click="$emit('windowClick', windowInfo.window)"
              >
                <!-- Start day: Show full details -->
                <div v-if="windowInfo.isStart" class="p-1.5">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-arrow-right-circle" class="w-3 h-3 flex-shrink-0" />
                    <span class="truncate flex-1 font-medium">{{ windowInfo.window.name }}</span>
                    <UBadge
                      v-if="windowInfo.window.is_active"
                      size="xs"
                      color="white"
                      variant="solid"
                    >
                      ●
                    </UBadge>
                  </div>
                  <div class="text-[10px] opacity-80 truncate mt-0.5">
                    {{ getTypeLabel(windowInfo.window.availability_type) }}
                  </div>
                  <div class="text-[9px] opacity-70 mt-0.5">
                    {{ formatTime(windowInfo.window.available_from) }}
                  </div>
                </div>
                
                <!-- Middle days: Solid color block with minimal info -->
                <div v-else-if="windowInfo.isContinuation" class="p-1 flex items-center justify-center">
                  <div class="text-[10px] opacity-70 font-medium truncate">
                    {{ windowInfo.window.name }}
                  </div>
                </div>
                
                <!-- End day: Show end time -->
                <div v-else-if="windowInfo.isEnd" class="p-1.5">
                  <div class="flex items-center gap-1">
                    <span class="truncate flex-1 font-medium">{{ windowInfo.window.name }}</span>
                    <UIcon name="i-heroicons-arrow-left-circle" class="w-3 h-3 flex-shrink-0" />
                  </div>
                  <div class="text-[9px] opacity-70 mt-0.5 text-right">
                    Ends: {{ formatTime(windowInfo.window.available_to) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- More indicator -->
            <div
              v-if="getWindowsForDay(day.date).length > 3"
              class="absolute bottom-1 right-1 text-[10px] text-gray-500 font-medium bg-white px-1 rounded"
            >
              +{{ getWindowsForDay(day.date).length - 3 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-green-500"></div>
          <span class="text-gray-700">Registration</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-red-500"></div>
          <span class="text-gray-700">Refunds</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-purple-500"></div>
          <span class="text-gray-700">Merchandise</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-orange-500"></div>
          <span class="text-gray-700">Booking</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-blue-500"></div>
          <span class="text-gray-700">Other</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AvailabilityWindow } from '~/api/types.gen'
import { 
  getWindowSolidClasses,
  getTypeLabel,
  getWindowTooltip
} from '~/utils/format/availability-windows'

const props = defineProps<{
  windows: AvailabilityWindow[]
  timezone?: string
  eventStart?: string
  eventEnd?: string
  eventTitle?: string
}>()

defineEmits<{
  windowClick: [window: AvailabilityWindow]
}>()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Current viewing month
const currentDate = ref(new Date())

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

// Calendar navigation
const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

// Generate calendar days
interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const startingDayOfWeek = firstDay.getDay()
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const endingDayOfWeek = lastDay.getDay()
  
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  // Current month days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  // Next month days
  const remainingDays = 42 - days.length // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  return days
})

// Check if date falls within event dates
const isEventDay = (date: Date): boolean => {
  if (!props.eventStart || !props.eventEnd) return false
  
  const eventStartDate = new Date(props.eventStart)
  const eventEndDate = new Date(props.eventEnd)
  
  eventStartDate.setHours(0, 0, 0, 0)
  eventEndDate.setHours(23, 59, 59, 999)
  date.setHours(12, 0, 0, 0)
  
  return date >= eventStartDate && date <= eventEndDate
}

// Check if this is the event start day
const isEventStartDay = (date: Date): boolean => {
  if (!props.eventStart) return false
  
  const eventStartDate = new Date(props.eventStart)
  eventStartDate.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  return date.getTime() === eventStartDate.getTime()
}

// Check if this is the event end day
const isEventEndDay = (date: Date): boolean => {
  if (!props.eventEnd) return false
  
  const eventEndDate = new Date(props.eventEnd)
  eventEndDate.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  return date.getTime() === eventEndDate.getTime()
}

// Interface for window display info
interface WindowDisplayInfo {
  window: AvailabilityWindow
  isStart: boolean
  isContinuation: boolean
  isEnd: boolean
}

// Get windows that overlap with a specific day
const getWindowsForDay = (date: Date): WindowDisplayInfo[] => {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  
  return props.windows
    .filter(window => {
      if (!window.available_from || !window.available_to) return false

      const windowStart = new Date(window.available_from)
      const windowEnd = new Date(window.available_to)
      
      // Check if window overlaps with this day
      return windowStart <= dayEnd && windowEnd >= dayStart
    })
    .map(window => {
      const windowStart = new Date(window.available_from!)
      const windowEnd = new Date(window.available_to!)
      
      // Normalize dates for comparison
      const windowStartDay = new Date(windowStart)
      windowStartDay.setHours(0, 0, 0, 0)
      
      const windowEndDay = new Date(windowEnd)
      windowEndDay.setHours(0, 0, 0, 0)
      
      const currentDay = new Date(date)
      currentDay.setHours(0, 0, 0, 0)
      
      const isStart = windowStartDay.getTime() === currentDay.getTime()
      const isEnd = windowEndDay.getTime() === currentDay.getTime()
      const isContinuation = !isStart && !isEnd
      
      return {
        window,
        isStart,
        isContinuation,
        isEnd
      }
    })
    .slice(0, 3) // Limit to first 3 windows per day for space
}

// Format time from datetime string
const formatTime = (datetime?: string): string => {
  if (!datetime) return ''
  
  const date = new Date(datetime)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Get detailed tooltip text
const getDetailedTooltip = (window: AvailabilityWindow, currentDate: Date): string => {
  if (!window.available_from || !window.available_to) {
    return window.name || 'Unnamed Window'
  }
  
  const windowStart = new Date(window.available_from)
  const windowEnd = new Date(window.available_to)
  
  const windowStartDay = new Date(windowStart)
  windowStartDay.setHours(0, 0, 0, 0)
  
  const windowEndDay = new Date(windowEnd)
  windowEndDay.setHours(0, 0, 0, 0)
  
  const currentDay = new Date(currentDate)
  currentDay.setHours(0, 0, 0, 0)
  
  const isStart = windowStartDay.getTime() === currentDay.getTime()
  const isEnd = windowEndDay.getTime() === currentDay.getTime()
  
  let tooltip = `${window.name}\n${getTypeLabel(window.availability_type)}\n`
  
  if (isStart && isEnd) {
    // Same day window
    tooltip += `${windowStart.toLocaleString()} - ${windowEnd.toLocaleTimeString()}`
  } else if (isStart) {
    tooltip += `Starts: ${windowStart.toLocaleString()}\nEnds: ${windowEnd.toLocaleDateString()} at ${formatTime(window.available_to)}`
  } else if (isEnd) {
    tooltip += `Started: ${windowStart.toLocaleDateString()}\nEnds: ${windowEnd.toLocaleString()}`
  } else {
    // Middle day
    tooltip += `Ongoing\nStarted: ${windowStart.toLocaleDateString()}\nEnds: ${windowEnd.toLocaleDateString()}`
  }
  
  if (window.description) {
    tooltip += `\n\n${window.description}`
  }
  
  return tooltip
}
</script>

<style scoped>
/* Add smooth transitions */
.calendar-day {
  transition: all 0.2s ease;
}
</style>
