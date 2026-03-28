import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventStatisticsOverviewRetrieve,
  eventStatisticsRegistrationTrendsRetrieve,
  eventStatisticsCapacityUtilizationRetrieve,
  eventStatisticsPaymentStatusRetrieve,
  eventStatisticsRevenueOverviewRetrieve,
  eventStatisticsRevenueByEventRetrieve,
  eventStatisticsStatusDistributionRetrieve,
  eventStatisticsTypeDistributionRetrieve,
  eventStatisticsOrganizationDistributionRetrieve,
  eventStatisticsUpcomingRetrieve,
  eventStatisticsReviewsRetrieve,
  eventStatisticsStaffAllocationRetrieve,
  eventStatisticsBookingPackagesRetrieve,
} from '~/api/sdk.gen'
import type {
  EventStatisticsOverviewRetrieveData,
  EventStatisticsRegistrationTrendsRetrieveData,
  EventStatisticsCapacityUtilizationRetrieveData,
  EventStatisticsPaymentStatusRetrieveData,
  EventStatisticsRevenueOverviewRetrieveData,
  EventStatisticsRevenueByEventRetrieveData,
  EventStatisticsStatusDistributionRetrieveData,
  EventStatisticsTypeDistributionRetrieveData,
  EventStatisticsOrganizationDistributionRetrieveData,
  EventStatisticsUpcomingRetrieveData,
  EventStatisticsReviewsRetrieveData,
  EventStatisticsStaffAllocationRetrieveData,
  EventStatisticsBookingPackagesRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['events', 'statistics'] as const

/**
 * Get comprehensive overview statistics for events
 * 
 * @param params - Query parameters including optional event_id filter
 * @example
 * const { data, isLoading } = useEventOverview(computed(() => ({ 
 *   event_id: eventId.value 
 * })))
 */
export function useEventOverview(
  params?: MaybeRefOrGetter<EventStatisticsOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get registration trends over time for a specific event
 * 
 * IMPORTANT: Requires event_id parameter to function properly
 * 
 * @param params - Query parameters with REQUIRED event_id
 * @example
 * const { data, isLoading } = useRegistrationTrends(computed(() => ({
 *   event_id: eventId.value,
 *   period: 'week',
 *   cumulative: true
 * })))
 */
export function useRegistrationTrends(
  params: MaybeRefOrGetter<EventStatisticsRegistrationTrendsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'registration-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsRegistrationTrendsRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get capacity utilization showing registered vs maximum attendance
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useCapacityUtilization(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useCapacityUtilization(
  params?: MaybeRefOrGetter<EventStatisticsCapacityUtilizationRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'capacity-utilization', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsCapacityUtilizationRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get distribution of booking payment statuses
 * 
 * @param params - Query parameters including optional event_id filter
 * @example
 * const { data, isLoading } = usePaymentStatus(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function usePaymentStatus(
  params?: MaybeRefOrGetter<EventStatisticsPaymentStatusRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payment-status', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsPaymentStatusRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get comprehensive revenue overview with breakdown by source
 * 
 * @param params - Query parameters including optional event_id filter
 * @example
 * const { data, isLoading } = useRevenueOverview(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useRevenueOverview(
  params?: MaybeRefOrGetter<EventStatisticsRevenueOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsRevenueOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get revenue data for each event with optional breakdown by source
 * 
 * @param params - Query parameters including limit, sort_by, show_breakdown
 * @example
 * const { data, isLoading } = useRevenueByEvent(computed(() => ({
 *   limit: 10,
 *   sort_by: 'total_revenue',
 *   show_breakdown: true
 * })))
 */
export function useRevenueByEvent(
  params?: MaybeRefOrGetter<EventStatisticsRevenueByEventRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-event', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsRevenueByEventRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get distribution of events across different statuses
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useStatusDistribution(computed(() => ({
 *   organization_id: orgId.value
 * })))
 */
export function useStatusDistribution(
  params?: MaybeRefOrGetter<EventStatisticsStatusDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'status-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsStatusDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - status changes less frequently
  })
}

/**
 * Get distribution of events by type
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useTypeDistribution(computed(() => ({
 *   status: 'OPEN'
 * })))
 */
export function useTypeDistribution(
  params?: MaybeRefOrGetter<EventStatisticsTypeDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'type-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsTypeDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get distribution of events by organization
 * 
 * @param params - Query parameters including optional limit filter
 * @example
 * const { data, isLoading } = useOrganizationDistribution(computed(() => ({
 *   limit: 10
 * })))
 */
export function useOrganizationDistribution(
  params?: MaybeRefOrGetter<EventStatisticsOrganizationDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'organization-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsOrganizationDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get list of upcoming events within specified timeframe
 * 
 * @param params - Query parameters including optional days_ahead filter
 * @example
 * const { data, isLoading } = useUpcomingEvents(computed(() => ({
 *   days_ahead: 30
 * })))
 */
export function useUpcomingEvents(
  params?: MaybeRefOrGetter<EventStatisticsUpcomingRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'upcoming', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsUpcomingRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get event review statistics including ratings distribution
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useReviewStatistics(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useReviewStatistics(
  params?: MaybeRefOrGetter<EventStatisticsReviewsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'reviews', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsReviewsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get staff allocation data showing staff distribution across events
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useStaffAllocation(computed(() => ({
 *   limit: 10
 * })))
 */
export function useStaffAllocation(
  params?: MaybeRefOrGetter<EventStatisticsStaffAllocationRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'staff-allocation', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsStaffAllocationRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get booking package performance data
 * 
 * @param params - Query parameters including optional filters
 * @example
 * const { data, isLoading } = useBookingPackages(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useBookingPackages(
  params?: MaybeRefOrGetter<EventStatisticsBookingPackagesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-packages', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsBookingPackagesRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
