<template>
  <div class="w-full">
    <div v-if="!windows || windows.length === 0" class="text-center py-8 text-gray-500">
      No availability windows to display
    </div>
    
    <div v-else class="space-y-4">
      <!-- Timeline Header -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Timeline View</h3>
        <div class="text-xs text-gray-600 font-medium">
          {{ formatDate(earliestDate, 'MMM d, yyyy') }} - {{ formatDate(latestDate, 'MMM d, yyyy') }}
        </div>
      </div>

      <!-- Compact Timeline Container -->
      <div class="relative bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Date Markers (Top) -->
          <div class="relative h-6 mb-3 border-b border-gray-300">
            <div class="absolute inset-0 flex justify-between items-end">
              <div v-for="marker in dateMarkers" :key="marker.date || marker.label" class="flex flex-col items-center">
                <div class="h-2 w-px bg-gray-400"></div>
                <div class="text-[10px] text-gray-600 font-medium whitespace-nowrap">
                  {{ marker.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Event Block (if provided) -->
          <div v-if="eventStart && eventEnd" class="mb-4 relative">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="material-symbols-outlined text-sm text-blue-600">event</span>
              <span class="text-xs font-semibold text-gray-700">{{ eventTitle || 'Event' }}</span>
            </div>
            <div class="relative h-8 mb-1">
              <div
                class="absolute h-full rounded bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md border border-blue-700 flex items-center px-2"
                :style="getEventStyle()"
              >
                <span class="text-xs text-white font-medium whitespace-nowrap">
                  {{ formatDate(eventStart, 'MMM d') }} - {{ formatDate(eventEnd, 'MMM d') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Compact Availability Windows - All in One View -->
          <div v-if="windows && windows.length > 0" class="space-y-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-sm text-gray-600">schedule</span>
              <span class="text-xs font-semibold text-gray-700">Availability Windows</span>
              <span class="text-[10px] font-bold text-navy-500 px-1.5 py-0.5 bg-navy-100 rounded-full">{{ windows.length }}</span>
            </div>
            
            <!-- All Windows in Compact Rows -->
            <div class="space-y-1">
              <div
                v-for="window in sortedWindows"
                :key="window.availability_id"
                class="relative h-8"
              >
                <!-- Window Name Label (Left) -->
                <div class="absolute left-0 top-0 bottom-0 w-40 flex items-center pr-2 border-r border-gray-300">
                  <div class="truncate text-xs font-medium text-gray-700">
                    {{ window.name }}
                  </div>
                </div>

                <!-- Timeline Bar (Right) -->
                <div class="absolute left-40 right-0 top-0 bottom-0 pl-2">
                  <div
                    class="group relative h-full rounded transition-all duration-200 hover:shadow-md cursor-pointer"
                    :class="getWindowColorClass(window.availability_type)"
                    :style="getWindowStyle(window)"
                    @click="$emit('windowClick', window)"
                  >
                    <!-- Inline Date Display -->
                    <div class="absolute inset-0 flex items-center px-2 gap-1">
                      <span class="text-[10px] text-white font-medium whitespace-nowrap">
                        {{ formatDate(window.available_from, 'MMM d') }} - {{ formatDate(window.available_to, 'MMM d') }}
                      </span>
                      <span
                        v-if="window.is_active"
                        class="text-[9px] py-0 px-1 bg-white/20 rounded text-white font-bold"
                      >
                        ●
                      </span>
                    </div>

                    <!-- Hover Tooltip -->
                    <div class="absolute left-0 top-full mt-2 z-20 hidden group-hover:block">
                      <div class="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[220px]">
                        <div class="font-semibold mb-1.5">{{ window.name }}</div>
                        <div class="space-y-1 text-gray-300">
                          <div class="flex items-center gap-1.5">
                            <span class="inline-block w-2 h-2 rounded-full" :class="getWindowDotClass(window.availability_type)"></span>
                            {{ getTypeLabel(window.availability_type) }}
                          </div>
                          <div class="text-gray-200 font-medium pt-1">
                            {{ formatDateTime(window.available_from, timezone) }}
                          </div>
                          <div class="text-gray-400 text-[10px]">to</div>
                          <div class="text-gray-200 font-medium">
                            {{ formatDateTime(window.available_to, timezone) }}
                          </div>
                          <div v-if="window.description" class="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                            {{ window.description }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Intelligent Warnings -->
        <div v-if="warnings.length > 0" class="mt-4 space-y-2">
          <div
            v-for="(warning, index) in warnings"
            :key="index"
            :class="[
              'p-3 border rounded-lg',
              warning.severity === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            ]"
          >
            <div class="flex items-start gap-2">
              <span
                :class="warning.severity === 'error' ? 'text-red-600' : 'text-yellow-600'"
                class="material-symbols-outlined text-lg flex-shrink-0"
              >
                {{ warning.severity === 'error' ? 'error' : 'warning' }}
              </span>
              <div :class="warning.severity === 'error' ? 'text-red-800' : 'text-yellow-800'" class="text-xs">
                <span class="font-semibold">{{ warning.title }}:</span>
                {{ warning.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { computed } from 'vue'
import type { AvailabilityWindow } from '~/api/types.gen'
import { formatDateTime, formatDate, formatDateRange } from '~/utils/time'
import { AVAILABILITY_TYPES } from '~/schemas/events/availability'
import { getWindowColorClass, getTypeLabel } from '~/utils/format/availability-windows'

interface Props {
  windows: AvailabilityWindow[]
  timezone?: string
  eventStart?: string
  eventEnd?: string
  eventTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'Europe/London',
})

defineEmits<{
  windowClick: [window: AvailabilityWindow]
}>()

// Sort windows by start date
const sortedWindows = computed(() => {
  return [...props.windows].sort((a, b) => {
    const dateA = new Date(a.available_from || 0).getTime()
    const dateB = new Date(b.available_from || 0).getTime()
    return dateA - dateB
  })
})

// Get earliest and latest dates for timeline bounds
const earliestDate = computed(() => {
  if (!props.windows || props.windows.length === 0) {
    return props.eventStart || ''
  }
  
  const dates = props.windows
    .filter(w => w.available_from)
    .map(w => new Date(w.available_from!).getTime())
  
  // Include event start date if available
  if (props.eventStart) {
    dates.push(new Date(props.eventStart).getTime())
  }
  
  return dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : ''
})

const latestDate = computed(() => {
  if (!props.windows || props.windows.length === 0) {
    return props.eventEnd || ''
  }
  
  const dates = props.windows
    .filter(w => w.available_to)
    .map(w => new Date(w.available_to!).getTime())
  
  // Include event end date if available
  if (props.eventEnd) {
    dates.push(new Date(props.eventEnd).getTime())
  }
  
  return dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : ''
})

// Generate date markers for the timeline
const dateMarkers = computed(() => {
  if (!earliestDate.value || !latestDate.value) return []
  
  const start = DateTime.fromISO(earliestDate.value)
  const end = DateTime.fromISO(latestDate.value)
  const totalDays = end.diff(start, 'days').days
  
  // Show 5-7 markers depending on range
  const numMarkers = Math.min(7, Math.max(5, Math.ceil(totalDays / 30)))
  const markers = []
  
  for (let i = 0; i < numMarkers; i++) {
    const date = start.plus({ days: (totalDays / (numMarkers - 1)) * i })
    markers.push({
      date: date.toISO(),
      label: date.toFormat('MMM d'),
    })
  }
  
  return markers
})

// Calculate position and width for event block
function getEventStyle() {
  if (!props.eventStart || !props.eventEnd || !earliestDate.value || !latestDate.value) return {}
  
  const totalRange = new Date(latestDate.value).getTime() - new Date(earliestDate.value).getTime()
  const eventStartTime = new Date(props.eventStart).getTime() - new Date(earliestDate.value).getTime()
  const eventDuration = new Date(props.eventEnd).getTime() - new Date(props.eventStart).getTime()
  
  const left = (eventStartTime / totalRange) * 100
  const width = (eventDuration / totalRange) * 100
  
  return {
    marginLeft: `${left}%`,
    width: `${width}%`,
  }
}

// Calculate position and width for timeline bars (relative to timeline area, not full width)
function getWindowStyle(window: AvailabilityWindow) {
  if (!window.available_from || !window.available_to) return {}
  
  const totalRange = new Date(latestDate.value).getTime() - new Date(earliestDate.value).getTime()
  const windowStart = new Date(window.available_from).getTime() - new Date(earliestDate.value).getTime()
  const windowDuration = new Date(window.available_to).getTime() - new Date(window.available_from).getTime()
  
  const left = (windowStart / totalRange) * 100
  const width = (windowDuration / totalRange) * 100
  
  return {
    marginLeft: `${left}%`,
    width: `${Math.max(width, 2)}%`, // Minimum 2% width for visibility
  }
}

// Get dot color class for tooltip
function getWindowDotClass(type: string | undefined) {

  
  const colorMap: Record<string, string> = {
    REGISTRATION_WINDOW: 'bg-blue-400',
    PAYMENT_WINDOW: 'bg-green-400',
    REFUND_WINDOW: 'bg-red-400',
    CANCELLATION_WINDOW: 'bg-orange-400',
    EARLY_BIRD: 'bg-purple-400',
    LATE_REGISTRATION: 'bg-yellow-400',
  }

  if (type === undefined) {
    return 'bg-gray-400'
  }
  return colorMap[type] || 'bg-gray-400'
}

// Intelligent warnings for overlaps and logical inconsistencies
interface Warning {
  severity: 'warning' | 'error'
  title: string
  message: string
}

const warnings = computed<Warning[]>(() => {
  const result: Warning[] = []
  const eventStartTime = props.eventStart ? new Date(props.eventStart).getTime() : null
  const eventEndTime = props.eventEnd ? new Date(props.eventEnd).getTime() : null
  
  // Check for same-type overlaps
  const typeGroups = new Map<string, AvailabilityWindow[]>()
  
  // Group windows by type
  props.windows.forEach(window => {
    const type = window.availability_type || 'UNKNOWN'
    if (!typeGroups.has(type)) {
      typeGroups.set(type, [])
    }
    typeGroups.get(type)!.push(window)
  })
  
  // Check for overlaps within each type
  for (const [type, windows] of typeGroups) {
    if (windows.length < 2) continue
    
    const overlappingPairs: string[] = []
    for (let i = 0; i < windows.length; i++) {
      for (let j = i + 1; j < windows.length; j++) {
        const w1 = windows[i]
        const w2 = windows[j]
        
        if (!w1.available_from || !w1.available_to || !w2.available_from || !w2.available_to) {
          continue
        }
        
        const start1 = new Date(w1.available_from).getTime()
        const end1 = new Date(w1.available_to).getTime()
        const start2 = new Date(w2.available_from).getTime()
        const end2 = new Date(w2.available_to).getTime()
        
        // Check if windows overlap
        if (start1 < end2 && start2 < end1) {
          overlappingPairs.push(`"${w1.name}" and "${w2.name}"`)
        }
      }
    }
    
    if (overlappingPairs.length > 0) {
      result.push({
        severity: 'warning',
        title: 'Same-type overlap detected',
        message: `${getTypeLabel(type)} windows overlap: ${overlappingPairs[0]}. This may cause confusion for users.`,
      })
    }
  }
  
  // Check for logical inconsistencies if event dates are provided
  if (eventStartTime && eventEndTime) {
    props.windows.forEach(window => {
      if (!window.available_from || !window.available_to) return
      
      const windowStart = new Date(window.available_from).getTime()
      const windowEnd = new Date(window.available_to).getTime()
      
      // Refund windows shouldn't extend significantly after event ends
      if (window.availability_type === 'REFUND_WINDOW' && windowEnd > eventEndTime + (30 * 24 * 60 * 60 * 1000)) {
        result.push({
          severity: 'warning',
          title: 'Unusual refund window',
          message: `"${window.name}" extends more than 30 days after the event ends. Is this intentional?`,
        })
      }
      
      // Registration windows shouldn't extend past event start
      if (window.availability_type === 'REGISTRATION_WINDOW' && windowEnd > eventStartTime) {
        result.push({
          severity: 'warning',
          title: 'Registration window extends into event',
          message: `"${window.name}" extends past the event start date. Consider closing registration before the event begins.`,
        })
      }
      
      // Windows starting after event ends are likely mistakes
      if (windowStart > eventEndTime) {
        result.push({
          severity: 'error',
          title: 'Window starts after event ends',
          message: `"${window.name}" starts after the event has ended. This is likely a mistake.`,
        })
      }
      
      // Payment windows should generally end before or shortly after event starts
      if (window.availability_type === 'PAYMENT_WINDOW' && windowEnd > eventStartTime + (7 * 24 * 60 * 60 * 1000)) {
        result.push({
          severity: 'warning',
          title: 'Payment window extends beyond event',
          message: `"${window.name}" extends more than 7 days after event start. Consider closing payments earlier.`,
        })
      }
    })
  }
  
  return result
})
</script>
