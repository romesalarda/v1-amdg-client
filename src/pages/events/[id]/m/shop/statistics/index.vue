<template>
  <div class="space-y-6 p-6">
    <!-- Statistics Filters -->
    <StatisticsFilters
      :quick-date-ranges="filters.quickDateRanges"
      :selected-quick-range="filters.selectedQuickRange.value"
      :include-deleted="filters.filters.value.include_deleted ?? false"
      :group-by="filters.filters.value.group_by"
      :date-range-label="dateRangeLabel"
      :show-grouping-options="['sales-performance', 'inventory-management'].includes(currentTab)"
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
import { useProductStatisticsFilters, getDateRangeLabel } from '~/composables/statistics/products/filters'
import StatisticsFilters from '~/components/statistics/StatisticsFilters.vue'

// Lazy load sub-tab components
const OverviewView = markRaw(defineAsyncComponent(() => import('./overview.vue')))
const SalesPerformanceView = markRaw(defineAsyncComponent(() => import('./sales-performance.vue')))
const InventoryManagementView = markRaw(defineAsyncComponent(() => import('./inventory-management.vue')))
const ProductInsightsView = markRaw(defineAsyncComponent(() => import('./product-insights.vue')))

const route = useRoute()
const eventId = computed(() => route.params.id as string)

// Initialize filters with event ID
const filters = useProductStatisticsFilters(eventId.value)

// Sub-tabs configuration
const tabs = [
  {
    value: 'overview',
    label: 'Overview',
    icon: 'i-heroicons-squares-2x2',
    component: OverviewView,
  },
  {
    value: 'sales-performance',
    label: 'Sales & Revenue',
    icon: 'i-heroicons-banknotes',
    component: SalesPerformanceView,
  },
  {
    value: 'inventory-management',
    label: 'Inventory',
    icon: 'i-heroicons-cube-transparent',
    component: InventoryManagementView,
  },
  {
    value: 'product-insights',
    label: 'Products',
    icon: 'i-heroicons-cube',
    component: ProductInsightsView,
  },
]

// Current tab state
const currentTab = ref('overview')

// Get current tab component
const currentTabComponent = computed(() => {
  const tab = tabs.find(t => t.value === currentTab.value)
  return tab?.component || OverviewView
})

// Computed date range label
const dateRangeLabel = computed(() => {
  return getDateRangeLabel(
    filters.filters.value.date_from,
    filters.filters.value.date_to
  )
})

// Filter handlers
function handleQuickRange(rangeValue: string) {
  filters.applyQuickRange(rangeValue)
}

function handleCustomRange(from: string, to: string) {
  filters.setDateRange(from, to)
}

function handleExport() {
  // TODO: Implement export functionality
  console.log('Export statistics')
}
</script>
