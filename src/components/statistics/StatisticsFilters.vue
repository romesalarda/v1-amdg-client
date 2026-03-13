<template>
  <div class="bg-white border border-deep-navy/10 shadow-sm p-4">
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <!-- Left: Quick Date Ranges -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="range in quickDateRanges"
          :key="range.value"
          @click="handleQuickRange(range.value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          :class="selectedQuickRange === range.value 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Right: Options and Export -->
      <div class="flex items-center gap-3">
        <!-- Include Deleted Toggle -->
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            :checked="includeDeleted"
            @change="handleIncludeDeletedChange"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span>Include deleted</span>
        </label>

        <!-- Grouping Options (when applicable) -->
        <div v-if="showGroupingOptions" class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Group by:</span>
          <select
            v-model="localGroupBy"
            @change="handleGroupByChange"
            class="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>

        <!-- Export Button (placeholder) -->
        <button
          @click="handleExport"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          title="Export statistics"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          <span class="hidden sm:inline">Export</span>
        </button>

        <!-- Reset Button -->
        <button
          v-if="hasActiveFilters"
          @click="handleReset"
          class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Custom Date Range (expanded view) -->
    <div v-if="showCustomDateRange" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div class="flex-1 flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              v-model="customDateFrom"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              v-model="customDateTo"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          @click="applyCustomDateRange"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors self-end"
        >
          Apply
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="dateRangeLabel && dateRangeLabel !== 'All Time'" class="mt-3 text-sm text-gray-600">
      <span class="font-medium">Date Range:</span> {{ dateRangeLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { QuickDateRange } from '~/composables/statistics/attendee/filters'

interface Props {
  quickDateRanges: QuickDateRange[]
  selectedQuickRange: string
  includeDeleted: boolean
  groupBy?: 'day' | 'week' | 'month'
  dateRangeLabel?: string
  showGroupingOptions?: boolean
}

interface Emits {
  (e: 'apply-quick-range', value: string): void
  (e: 'toggle-include-deleted'): void
  (e: 'update-group-by', value: 'day' | 'week' | 'month'): void
  (e: 'apply-custom-range', from: string, to: string): void
  (e: 'reset'): void
  (e: 'export'): void
}

const props = withDefaults(defineProps<Props>(), {
  showGroupingOptions: false,
})

const emit = defineEmits<Emits>()

const showCustomDateRange = ref(false)
const customDateFrom = ref('')
const customDateTo = ref('')
const localGroupBy = ref(props.groupBy || 'day')

const hasActiveFilters = computed(() => {
  return props.selectedQuickRange !== 'all_time' || props.includeDeleted
})

watch(() => props.selectedQuickRange, (newValue) => {
  // Show custom date range inputs if custom is selected
  if (newValue === 'custom') {
    showCustomDateRange.value = true
  }
})

watch(() => props.groupBy, (newValue) => {
  if (newValue) {
    localGroupBy.value = newValue
  }
})

const handleQuickRange = (value: string) => {
  if (value === 'custom') {
    showCustomDateRange.value = !showCustomDateRange.value
  } else {
    showCustomDateRange.value = false
    emit('apply-quick-range', value)
  }
}

const handleIncludeDeletedChange = () => {
  emit('toggle-include-deleted')
}

const handleGroupByChange = () => {
  emit('update-group-by', localGroupBy.value)
}

const applyCustomDateRange = () => {
  if (customDateFrom.value && customDateTo.value) {
    emit('apply-custom-range', customDateFrom.value, customDateTo.value)
    showCustomDateRange.value = false
  }
}

const handleReset = () => {
  showCustomDateRange.value = false
  customDateFrom.value = ''
  customDateTo.value = ''
  emit('reset')
}

const handleExport = () => {
  emit('export')
}
</script>
