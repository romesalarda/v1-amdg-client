<template>
  <div class="space-y-6">
    <!-- Statistics Filters -->
    <StatisticsFilters
      :quick-date-ranges="filters.quickDateRanges"
      :selected-quick-range="filters.selectedQuickRange.value"
      :include-deleted="filters.filters.value.include_deleted ?? false"
      :group-by="filters.filters.value.group_by"
      :allowed-group-by="['hour', 'day', 'week', 'month']"
      :date-range-label="dateRangeLabel"
      :show-grouping-options="['revenue', 'payment-methods', 'donations', 'refunds'].includes(currentTab)"
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
import { usePaymentStatisticsFilters, getDateRangeLabel } from '~/composables/statistics/payments/filters'
import StatisticsFilters from '~/components/statistics/StatisticsFilters.vue'

// Lazy load sub-tab components
const RevenueView = markRaw(defineAsyncComponent(() => import('./revenue.vue')))
const PaymentMethodsView = markRaw(defineAsyncComponent(() => import('./payment-methods.vue')))
const DiscountsView = markRaw(defineAsyncComponent(() => import('./discounts.vue')))
const DonationsView = markRaw(defineAsyncComponent(() => import('./donations.vue')))
const RefundsView = markRaw(defineAsyncComponent(() => import('./refunds.vue')))

const route = useRoute()
const eventId = computed(() => route.params.id as string)

// Initialize filters with event ID
const filters = usePaymentStatisticsFilters(eventId.value)

// Sub-tabs configuration
const tabs = [
  {
    value: 'revenue',
    label: 'Revenue',
    icon: 'i-heroicons-currency-dollar',
    component: RevenueView,
  },
  {
    value: 'payment-methods',
    label: 'Payment Methods',
    icon: 'i-heroicons-credit-card',
    component: PaymentMethodsView,
  },
  {
    value: 'discounts',
    label: 'Discounts',
    icon: 'i-heroicons-tag',
    component: DiscountsView,
  },
  {
    value: 'donations',
    label: 'Donations',
    icon: 'i-heroicons-heart',
    component: DonationsView,
  },
  {
    value: 'refunds',
    label: 'Refunds',
    icon: 'i-heroicons-arrow-uturn-left',
    component: RefundsView,
  },
]

const currentTab = ref('revenue')

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
  console.log('Export payment statistics', filters.queryParams.value)
  alert('Export functionality coming soon!')
}
</script>
