<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Statistics Filters -->
      <StatisticsFilters
      :quick-date-ranges="filters.quickDateRanges"
      :selected-quick-range="filters.selectedQuickRange.value"
      :include-deleted="filters.filters.value.include_deleted ?? false"
      :group-by="filters.filters.value.group_by"
      :date-range-label="dateRangeLabel"
        :show-grouping-options="supportsGroupBy"
      @apply-quick-range="handleQuickRange"
      @toggle-include-deleted="filters.toggleIncludeDeleted"
      @update-group-by="filters.setGroupBy"
      @apply-custom-range="handleCustomRange"
      @reset="filters.resetFilters"
      @export="handleExport"
    />

    <!-- Sub-tab Navigation -->
    <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-2">
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
    <div class="min-h-[400px]">
      <KeepAlive>
        <component 
          :is="currentTabComponent" 
          :query-params="activeQueryParams"
          :group-by="filters.filters.value.group_by"
          :date-range-label="dateRangeLabel"
          @update-group-by="filters.setGroupBy"
        />
      </KeepAlive>
    </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useBookingStatisticsFilters } from '~/composables/statistics/bookings/filters'
import { useEvent } from '~/composables/resources/events/events'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => route.params.id as string)

// Fetch event details
const { data: event } = useEvent(id)

// Initialize filters
const filters = useBookingStatisticsFilters(id.value)

// Watch route params for event ID changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    filters.setEventId(newId as string)
  }
})

// Tab configuration
const tabs = [
  { value: 'overview', label: 'Overview', icon: 'i-heroicons-chart-bar' },
  { value: 'bookings', label: 'Bookings', icon: 'i-heroicons-ticket' },
  { value: 'tickets', label: 'Tickets', icon: 'i-heroicons-rectangle-stack' },
  { value: 'packages', label: 'Packages', icon: 'i-heroicons-cube' },
  { value: 'revenue', label: 'Revenue', icon: 'i-heroicons-currency-dollar' },
  { value: 'intents', label: 'Intents', icon: 'i-heroicons-clock' },
]

const currentTab = ref('overview')
const tabsWithGroupBy = ['bookings', 'revenue', 'intents'] as const

const supportsGroupBy = computed(() => tabsWithGroupBy.includes(currentTab.value as typeof tabsWithGroupBy[number]))

const activeQueryParams = computed(() => {
  const params = { ...filters.queryParams.value }
  if (!supportsGroupBy.value) {
    delete params.group_by
  }
  return params
})

// Lazy load tab components
const currentTabComponent = computed(() => {
  const componentMap: Record<string, any> = {
    overview: defineAsyncComponent(() => import('./overview.vue')),
    bookings: defineAsyncComponent(() => import('./bookings.vue')),
    tickets: defineAsyncComponent(() => import('./tickets.vue')),
    packages: defineAsyncComponent(() => import('./packages.vue')),
    revenue: defineAsyncComponent(() => import('./revenue.vue')),
    intents: defineAsyncComponent(() => import('./intents.vue')),
  }
  return componentMap[currentTab.value] || componentMap.overview
})

// Date range label for display
const dateRangeLabel = computed(() => {
  const { date_from, date_to } = filters.filters.value
  if (!date_from && !date_to) return 'All Time'
  if (!date_from) return `Until ${formatDate(date_to)}`
  if (!date_to) return `From ${formatDate(date_from)}`
  return `${formatDate(date_from)} - ${formatDate(date_to)}`
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
  // TODO: Implement CSV export for current tab
  console.log('Export not yet implemented for tab:', currentTab.value)
}

// Format date helper
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
