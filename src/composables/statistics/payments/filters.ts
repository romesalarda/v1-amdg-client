import { ref, computed } from 'vue'

export interface PaymentStatisticsFilters {
  event_id?: string
  format?: 'raw' | 'echarts'
  include_deleted?: boolean
  group_by?: 'day' | 'week' | 'month'
  date_from?: string
  date_to?: string
  status?: string
  limit?: number
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
 * Composable for managing payment statistics filters
 */
export function usePaymentStatisticsFilters(initialEventId?: string) {
  const filters = ref<PaymentStatisticsFilters>({
    event_id: initialEventId,
    format: 'raw',
    include_deleted: false,
    group_by: 'day',
    limit: 10,
  })

  const selectedQuickRange = ref<string>('all_time')

  // Computed query params for API calls
  const queryParams = computed(() => {
    const params: Record<string, string | number | boolean> = {}
    
    if (filters.value.event_id) {
      params.event_id = filters.value.event_id
    }
    if (filters.value.format) {
      params.format = filters.value.format
    }
    if (filters.value.include_deleted !== undefined) {
      params.include_deleted = filters.value.include_deleted
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
    if (filters.value.status) {
      params.status = filters.value.status
    }
    if (filters.value.limit !== undefined) {
      params.limit = filters.value.limit
    }

    return params
  })

  // Update event ID
  const setEventId = (eventId: string | undefined) => {
    filters.value.event_id = eventId
  }

  // Toggle include deleted
  const toggleIncludeDeleted = () => {
    filters.value.include_deleted = !filters.value.include_deleted
  }

  // Set trend grouping (for trends)
  const setGroupBy = (groupBy: 'day' | 'week' | 'month') => {
    filters.value.group_by = groupBy
  }

  // Set status filter
  const setStatus = (status: string | undefined) => {
    filters.value.status = status
  }

  // Set limit for top results
  const setLimit = (limit: number) => {
    filters.value.limit = limit
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

  // Reset all filters (except event_id)
  const resetFilters = () => {
    const eventId = filters.value.event_id
    filters.value = {
      event_id: eventId,
      format: 'raw',
      include_deleted: false,
      group_by: 'day',
      limit: 10,
    }
    selectedQuickRange.value = 'all_time'
  }

  return {
    filters,
    queryParams,
    selectedQuickRange,
    quickDateRanges: QUICK_DATE_RANGES,
    setEventId,
    toggleIncludeDeleted,
    setGroupBy,
    setStatus,
    setLimit,
    setDateRange,
    applyQuickRange,
    clearDateRange,
    resetFilters,
  }
}

/**
 * Helper to format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Helper to get date range label
 */
export function getDateRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return 'All Time'
  if (from && to) return `${formatDate(from)} - ${formatDate(to)}`
  if (from) return `From ${formatDate(from)}`
  if (to) return `Until ${formatDate(to)}`
  return 'All Time'
}
