import { ref, computed } from 'vue'

export interface BookingStatisticsFilters {
  event_id?: string
  format?: 'raw' | 'echarts'
  include_deleted?: boolean
  group_by?: 'day' | 'week' | 'month'
  date_from?: string
  date_to?: string
  limit?: number
  organization_id?: number
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
 * Composable for managing booking statistics filters
 */
export function useBookingStatisticsFilters(initialEventId?: string) {
  const filters = ref<BookingStatisticsFilters>({
    event_id: initialEventId,
    format: 'raw',
    include_deleted: false,
    group_by: 'day',
    limit: 10,
  })

  const selectedQuickRange = ref<string>('all_time')

  // Computed query params for API calls
  const queryParams = computed(() => {
    const params: Record<string, any> = {}
    
    if (filters.value.event_id) {
      params.event_id = filters.value.event_id
    }
    if (filters.value.format) {
      params.format = filters.value.format
    }
    if (filters.value.include_deleted) {
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
    if (filters.value.limit) {
      params.limit = filters.value.limit
    }
    if (filters.value.organization_id) {
      params.organization_id = filters.value.organization_id
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

  // Set trend grouping (for trends endpoints)
  const setGroupBy = (groupBy: 'day' | 'week' | 'month') => {
    filters.value.group_by = groupBy
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
      const { date_from, date_to } = range.getDates()
      filters.value.date_from = date_from
      filters.value.date_to = date_to
      selectedQuickRange.value = rangeValue
    }
  }

  // Reset all filters
  const resetFilters = () => {
    const eventId = filters.value.event_id // Preserve event ID
    filters.value = {
      event_id: eventId,
      format: 'raw',
      include_deleted: false,
      group_by: 'day',
      limit: 10,
    }
    selectedQuickRange.value = 'all_time'
  }

  // Set limit for pagination/top N results
  const setLimit = (limit: number) => {
    filters.value.limit = limit
  }

  // Set organization filter
  const setOrganizationId = (orgId: number | undefined) => {
    filters.value.organization_id = orgId
  }

  return {
    filters,
    queryParams,
    selectedQuickRange,
    quickDateRanges: QUICK_DATE_RANGES,
    setEventId,
    toggleIncludeDeleted,
    setGroupBy,
    setDateRange,
    applyQuickRange,
    resetFilters,
    setLimit,
    setOrganizationId,
  }
}
