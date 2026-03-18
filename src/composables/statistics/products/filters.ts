import { ref, computed } from 'vue'

export interface ProductStatisticsFilters {
  event_id?: string
  organization_id?: number
  category_id?: number
  format?: 'raw' | 'echarts'
  include_deleted?: boolean
  is_active?: boolean
  verified?: boolean
  status?: string // Order status filter
  group_by?: 'day' | 'week' | 'month' | 'hour'
  date_from?: string
  date_to?: string
  limit?: number
  cumulative?: boolean
}

export interface QuickDateRange {
  label: string
  value: string
  getDates: () => { date_from: string; date_to: string }
}

const QUICK_DATE_RANGES: QuickDateRange[] = [
  {
    label: 'Last 7 Days',
    value: 'last_7_days',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 7)
      return {
        date_from: from.toISOString().split('T')[0],
        date_to: to.toISOString().split('T')[0],
      }
    },
  },
  {
    label: 'Last 30 Days',
    value: 'last_30_days',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 30)
      return {
        date_from: from.toISOString().split('T')[0],
        date_to: to.toISOString().split('T')[0],
      }
    },
  },
  {
    label: 'Last 90 Days',
    value: 'last_90_days',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 90)
      return {
        date_from: from.toISOString().split('T')[0],
        date_to: to.toISOString().split('T')[0],
      }
    },
  },
  {
    label: 'This Month',
    value: 'this_month',
    getDates: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        date_from: from.toISOString().split('T')[0],
        date_to: now.toISOString().split('T')[0],
      }
    },
  },
  {
    label: 'This Year',
    value: 'this_year',
    getDates: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), 0, 1)
      return {
        date_from: from.toISOString().split('T')[0],
        date_to: now.toISOString().split('T')[0],
      }
    },
  },
  {
    label: 'All Time',
    value: 'all_time',
    getDates: () => ({
      date_from: '',
      date_to: '',
    }),
  },
]

/**
 * Composable for managing product statistics filters
 */
export function useProductStatisticsFilters(initialEventId?: string) {
  const filters = ref<ProductStatisticsFilters>({
    event_id: initialEventId,
    format: 'raw',
    include_deleted: false,
    group_by: 'day',
    limit: 10,
    cumulative: false,
  })

  const selectedQuickRange = ref<string>('all_time')

  // Computed query params for API calls
  const queryParams = computed(() => {
    const params: Record<string, any> = {}
    
    if (filters.value.event_id) {
      params.event_id = filters.value.event_id
    }
    if (filters.value.organization_id) {
      params.organization_id = filters.value.organization_id
    }
    if (filters.value.category_id) {
      params.category_id = filters.value.category_id
    }
    if (filters.value.format) {
      params.format = filters.value.format
    }
    if (filters.value.include_deleted) {
      params.include_deleted = filters.value.include_deleted
    }
    if (filters.value.is_active !== undefined) {
      params.is_active = filters.value.is_active
    }
    if (filters.value.verified !== undefined) {
      params.verified = filters.value.verified
    }
    if (filters.value.status) {
      params.status = filters.value.status
    }
    if (filters.value.group_by) {
      params.group_by = filters.value.group_by
    }
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to
    }
    if (filters.value.limit) {
      params.limit = filters.value.limit
    }
    if (filters.value.cumulative) {
      params.cumulative = filters.value.cumulative
    }

    return params
  })

  // Update event ID
  const setEventId = (eventId: string | undefined) => {
    filters.value.event_id = eventId
  }

  // Set organization ID
  const setOrganizationId = (orgId: number | undefined) => {
    filters.value.organization_id = orgId
  }

  // Set category filter
  const setCategoryId = (categoryId: number | undefined) => {
    filters.value.category_id = categoryId
  }

  // Toggle include deleted
  const toggleIncludeDeleted = () => {
    filters.value.include_deleted = !filters.value.include_deleted
  }

  // Set product active status filter
  const setIsActive = (isActive: boolean | undefined) => {
    filters.value.is_active = isActive
  }

  // Set product verified status filter
  const setVerified = (verified: boolean | undefined) => {
    filters.value.verified = verified
  }

  // Set order status filter
  const setStatus = (status: string | undefined) => {
    filters.value.status = status
  }

  // Set trend grouping
  const setGroupBy = (groupBy: 'day' | 'week' | 'month' | 'hour') => {
    filters.value.group_by = groupBy
  }

  // Set result limit
  const setLimit = (limit: number) => {
    filters.value.limit = limit
  }

  // Toggle cumulative
  const toggleCumulative = () => {
    filters.value.cumulative = !filters.value.cumulative
  }

  // Set custom date range
  const setDateRange = (from: string, to: string) => {
    filters.value.date_from = from
    filters.value.date_to = to
    selectedQuickRange.value = 'custom'
  }

  // Apply quick date range
  const applyQuickRange = (rangeValue: string) => {
    const range = QUICK_DATE_RANGES.find(r => r.value === rangeValue)
    if (range) {
      const dates = range.getDates()
      filters.value.date_from = dates.date_from
      filters.value.date_to = dates.date_to
      selectedQuickRange.value = rangeValue
    }
  }

  // Clear date filters
  const clearDateRange = () => {
    filters.value.date_from = undefined
    filters.value.date_to = undefined
    selectedQuickRange.value = 'all_time'
  }

  // Clear category filter
  const clearCategory = () => {
    filters.value.category_id = undefined
  }

  // Clear status filters
  const clearStatusFilters = () => {
    filters.value.is_active = undefined
    filters.value.verified = undefined
    filters.value.status = undefined
  }

  // Reset all filters (except event_id)
  const resetFilters = () => {
    const eventId = filters.value.event_id
    filters.value = {
      event_id: eventId,
      format: 'raw',
      include_deleted: false,
      group_by: 'day',
      limit: 10,
      cumulative: false,
    }
    selectedQuickRange.value = 'all_time'
  }

  // Count active filters (excluding defaults)
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.category_id) count++
    if (filters.value.is_active !== undefined) count++
    if (filters.value.verified !== undefined) count++
    if (filters.value.status) count++
    if (filters.value.date_from || filters.value.date_to) count++
    if (filters.value.include_deleted) count++
    return count
  })

  return {
    filters,
    queryParams,
    selectedQuickRange,
    quickDateRanges: QUICK_DATE_RANGES,
    activeFilterCount,
    setEventId,
    setOrganizationId,
    setCategoryId,
    toggleIncludeDeleted,
    setIsActive,
    setVerified,
    setStatus,
    setGroupBy,
    setLimit,
    toggleCumulative,
    setDateRange,
    applyQuickRange,
    clearDateRange,
    clearCategory,
    clearStatusFilters,
    resetFilters,
  }
}

/**
 * Helper to format date range for display
 */
export function getDateRangeLabel(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) {
    return 'All time'
  }
  if (dateFrom && dateTo) {
    return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`
  }
  if (dateFrom) {
    return `From ${formatDate(dateFrom)}`
  }
  if (dateTo) {
    return `Until ${formatDate(dateTo)}`
  }
  return 'All time'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
