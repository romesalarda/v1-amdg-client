<template>
  <div class="w-full">
    <div v-if="!windows || windows.length === 0" class="text-center py-8 text-gray-500">
      No availability windows to display
    </div>
    
    <div v-else class="space-y-4">
      <!-- Timeline Header -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Timeline View</h3>
        <div class="text-xs text-gray-500">
          {{ formatDateRange(earliestDate, latestDate, timezone) }}
        </div>
      </div>

      <!-- Timeline Container -->
      <div class="relative bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <div class="min-w-[600px]">
          <!-- Event Block (if provided) -->
          <div v-if="eventStart && eventEnd" class="mb-6 relative">
            <div class="text-xs font-medium text-gray-700 mb-2">Event</div>
            <div
              class="relative h-16 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border-2 border-blue-700"
              :style="getEventStyle()"
            >
              <div class="absolute inset-0 flex items-center px-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-white" />
                    <span class="font-semibold text-white truncate">
                      {{ eventTitle || 'Event' }}
                    </span>
                  </div>
                  <div class="text-xs text-white/90 mt-1">
                    {{ formatDateRange(eventStart, eventEnd, timezone) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Availability Windows -->
          <div v-if="windows && windows.length > 0" class="space-y-2">
            <div class="text-xs font-medium text-gray-700 mb-2">Availability Windows</div>
            <!-- Timeline Windows -->
            <div class="space-y-3">
              <div
                v-for="window in sortedWindows"
                :key="window.availability_id"
                class="relative"
              >
                <!-- Window Bar -->
                <div
                  class="group relative h-12 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                  :class="getWindowColorClass(window.availability_type)"
                  :style="getWindowStyle(window)"
                  @click="$emit('windowClick', window)"
                >
                  <!-- Window Content -->
                  <div class="absolute inset-0 flex items-center px-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm text-white truncate">
                          {{ window.name }}
                        </span>
                        <UBadge
                          v-if="window.is_active"
                          color="white"
                          variant="solid"
                          size="xs"
                        >
                          Active
                        </UBadge>
                      </div>
                      <div class="text-xs text-white/80 truncate">
                        {{ getTypeLabel(window.availability_type) }}
                      </div>
                    </div>
                  </div>

                  <!-- Hover Tooltip -->
                  <div class="absolute left-0 top-full mt-2 z-10 hidden group-hover:block">
                    <div class="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px]">
                      <div class="font-semibold mb-1">{{ window.name }}</div>
                      <div class="space-y-1 text-gray-300">
                        <div>{{ getTypeLabel(window.availability_type) }}</div>
                        <div>{{ formatDateTime(window.available_from, timezone) }}</div>
                        <div>to {{ formatDateTime(window.available_to, timezone) }}</div>
                        <div v-if="window.description" class="mt-2 pt-2 border-t border-gray-700">
                          {{ window.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Axis -->
          <div class="mt-4 pt-4 border-t border-gray-300">
            <div class="flex justify-between text-xs text-gray-600">
              <span>{{ formatDate(earliestDate, 'MMM d, yyyy') }}</span>
              <span>{{ formatDate(latestDate, 'MMM d, yyyy') }}</span>
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
              <UIcon
                :name="warning.severity === 'error' ? 'i-heroicons-x-circle' : 'i-heroicons-exclamation-triangle'"
                :class="warning.severity === 'error' ? 'text-red-600' : 'text-yellow-600'"
                class="mt-0.5"
              />
              <div :class="warning.severity === 'error' ? 'text-red-800' : 'text-yellow-800'" class="text-sm">
                <span class="font-medium">{{ warning.title }}:</span>
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

// Calculate position and width for timeline bars
function getWindowStyle(window: AvailabilityWindow) {
  if (!window.available_from || !window.available_to) return {}
  
  const totalRange = new Date(latestDate.value).getTime() - new Date(earliestDate.value).getTime()
  const windowStart = new Date(window.available_from).getTime() - new Date(earliestDate.value).getTime()
  const windowDuration = new Date(window.available_to).getTime() - new Date(window.available_from).getTime()
  
  const left = (windowStart / totalRange) * 100
  const width = (windowDuration / totalRange) * 100
  
  return {
    marginLeft: `${left}%`,
    width: `${width}%`,
  }
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
