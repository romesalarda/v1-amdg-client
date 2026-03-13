<template>
  <div class="space-y-6">
    <!-- Statistics Filters -->
    <StatisticsFilters
      :quick-date-ranges="filters.quickDateRanges"
      :selected-quick-range="filters.selectedQuickRange.value"
      :include-deleted="filters.filters.value.include_deleted ?? false"
      :group-by="filters.filters.value.group_by"
      :date-range-label="dateRangeLabel"
      :show-grouping-options="currentTab === 'registration-trends'"
      @apply-quick-range="handleQuickRange"
      @toggle-include-deleted="filters.toggleIncludeDeleted"
      @update-group-by="filters.setGroupBy"
      @apply-custom-range="handleCustomRange"
      @reset="filters.resetFilters"
      @export="handleExport"
    />

    <!-- Sub-tab Navigation -->
    <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-3 mx-5">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          class="px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
          :class="currentTab === tab.value 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-gray-700 hover:bg-gray-100'"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[400px] p-5">
      <KeepAlive>
        <component 
          :is="currentTabComponent" 
          :query-params="filters.queryParams.value"
          :group-by="filters.filters.value.group_by"
          :date-range-label="dateRangeLabel"
          @update-group-by="filters.setGroupBy"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useStatisticsFilters, getDateRangeLabel } from '~/composables/statistics/attendee/filters'
import StatisticsFilters from '~/components/statistics/StatisticsFilters.vue'

// Lazy load sub-tab components
const DemographicsView = markRaw(defineAsyncComponent(() => import('./demographics.vue')))
const PersonalInfoView = markRaw(defineAsyncComponent(() => import('./personal-info.vue')))
const RegistrationTrendsView = markRaw(defineAsyncComponent(() => import('./registration-trends.vue')))
const AttendanceView = markRaw(defineAsyncComponent(() => import('./attendance.vue')))
const ConsentsView = markRaw(defineAsyncComponent(() => import('./consents.vue')))

const route = useRoute()
const eventId = computed(() => route.params.id as string)

// Initialize filters with event ID
const filters = useStatisticsFilters(eventId.value)

// Sub-tabs configuration
const tabs = [
  {
    value: 'demographics',
    label: 'Demographics',
    icon: 'i-heroicons-user-group',
    component: DemographicsView,
  },
  {
    value: 'personal-info',
    label: 'Personal Info',
    icon: 'i-heroicons-heart',
    component: PersonalInfoView,
  },
  {
    value: 'registration-trends',
    label: 'Registration',
    icon: 'i-heroicons-chart-bar',
    component: RegistrationTrendsView,
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: 'i-heroicons-check-circle',
    component: AttendanceView,
  },
  {
    value: 'consents',
    label: 'Consents',
    icon: 'i-heroicons-document-check',
    component: ConsentsView,
  },
]

const currentTab = ref('demographics')

// Get current tab component
const currentTabComponent = computed(() => {
  const tab = tabs.find(t => t.value === currentTab.value)
  return tab?.component
})

// Date range label
const dateRangeLabel = computed(() => {
  return getDateRangeLabel(
    filters.filters.value.date_from,
    filters.filters.value.date_to
  )
})

// Handle quick range selection
const handleQuickRange = (rangeValue: string) => {
  filters.applyQuickRange(rangeValue)
}

// Handle custom date range
const handleCustomRange = (from: string, to: string) => {
  filters.setDateRange(from, to)
}

// Handle export (placeholder)
const handleExport = () => {
  // TODO: Implement export functionality
  console.log('Export statistics', filters.queryParams.value)
  alert('Export functionality coming soon!')
}
</script>
