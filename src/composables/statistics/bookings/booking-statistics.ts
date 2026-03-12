import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  bookingsStatisticsAttendeesPerBookingRetrieve,
  bookingsStatisticsBookingOverviewRetrieve,
  bookingsStatisticsBookingReferencesRetrieve,
  bookingsStatisticsBookingStatusRetrieve,
  bookingsStatisticsBookingTimelineRetrieve,
  bookingsStatisticsBookingTrendsRetrieve,
  bookingsStatisticsBookingsByPackageRetrieve,
  bookingsStatisticsCompletionRateRetrieve,
  bookingsStatisticsIntentConversionRetrieve,
  bookingsStatisticsIntentOverviewRetrieve,
  bookingsStatisticsIntentTrendsRetrieve,
  bookingsStatisticsOverviewRetrieve,
  bookingsStatisticsPackageOverviewRetrieve,
  bookingsStatisticsPackagePopularityRetrieve,
  bookingsStatisticsPackagePricingRetrieve,
  bookingsStatisticsPackageRulesRetrieve,
  bookingsStatisticsRevenueBreakdownRetrieve,
  bookingsStatisticsRevenueByPackageRetrieve,
  bookingsStatisticsRevenueByTicketTypeRetrieve,
  bookingsStatisticsRevenueOverviewRetrieve,
  bookingsStatisticsRevenueTrendsRetrieve,
  bookingsStatisticsTicketOverviewRetrieve,
  bookingsStatisticsTicketScopeRetrieve,
  bookingsStatisticsTicketStatusRetrieve,
  bookingsStatisticsTicketTypesRetrieve,
  bookingsStatisticsTicketUsageRetrieve,
} from '~/api/sdk.gen'
import type {
  BookingsStatisticsAttendeesPerBookingRetrieveData,
  BookingsStatisticsBookingOverviewRetrieveData,
  BookingsStatisticsBookingReferencesRetrieveData,
  BookingsStatisticsBookingStatusRetrieveData,
  BookingsStatisticsBookingTimelineRetrieveData,
  BookingsStatisticsBookingTrendsRetrieveData,
  BookingsStatisticsBookingsByPackageRetrieveData,
  BookingsStatisticsCompletionRateRetrieveData,
  BookingsStatisticsIntentConversionRetrieveData,
  BookingsStatisticsIntentOverviewRetrieveData,
  BookingsStatisticsIntentTrendsRetrieveData,
  BookingsStatisticsOverviewRetrieveData,
  BookingsStatisticsPackageOverviewRetrieveData,
  BookingsStatisticsPackagePopularityRetrieveData,
  BookingsStatisticsPackagePricingRetrieveData,
  BookingsStatisticsPackageRulesRetrieveData,
  BookingsStatisticsRevenueBreakdownRetrieveData,
  BookingsStatisticsRevenueByPackageRetrieveData,
  BookingsStatisticsRevenueByTicketTypeRetrieveData,
  BookingsStatisticsRevenueOverviewRetrieveData,
  BookingsStatisticsRevenueTrendsRetrieveData,
  BookingsStatisticsTicketOverviewRetrieveData,
  BookingsStatisticsTicketScopeRetrieveData,
  BookingsStatisticsTicketStatusRetrieveData,
  BookingsStatisticsTicketTypesRetrieveData,
  BookingsStatisticsTicketUsageRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['bookings', 'statistics'] as const

// ============================================================================
// BOOKING STATISTICS (8 endpoints)
// ============================================================================

/**
 * Get booking overview statistics
 * Provides: total bookings, total attendees, average attendees per booking, status breakdown
 */
export function useBookingOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get booking status distribution statistics
 * Returns distribution by payment status (COMPLETED, PENDING, FAILED, etc.)
 */
export function useBookingStatus(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingStatusRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-status', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingStatusRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get booking trends over time
 * Time-series data with day/week/month grouping support
 */
export function useBookingTrends(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get bookings distribution by package
 * Shows which booking packages are most used
 */
export function useBookingsByPackage(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingsByPackageRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'bookings-by-package', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingsByPackageRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get attendees per booking distribution
 * Shows booking size patterns (party sizes)
 */
export function useAttendeesPerBooking(
  params?: MaybeRefOrGetter<BookingsStatisticsAttendeesPerBookingRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'attendees-per-booking', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsAttendeesPerBookingRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get booking completion rate statistics
 * Intent-to-booking conversion funnel metrics
 */
export function useCompletionRate(
  params?: MaybeRefOrGetter<BookingsStatisticsCompletionRateRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'completion-rate', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsCompletionRateRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get booking reference pattern distribution
 * Booking volume grouped by event code
 */
export function useBookingReferences(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingReferencesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-references', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingReferencesRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get booking timeline distribution
 * Date distribution of booking creation
 */
export function useBookingTimeline(
  params?: MaybeRefOrGetter<BookingsStatisticsBookingTimelineRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'booking-timeline', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsBookingTimelineRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// TICKET STATISTICS (5 endpoints)
// ============================================================================

/**
 * Get ticket overview statistics
 * Status breakdown, scope breakdown, average uses remaining
 */
export function useTicketOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsTicketOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ticket-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsTicketOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get ticket status distribution
 * Distribution by status (ACTIVE, CANCELLED, USED)
 */
export function useTicketStatus(
  params?: MaybeRefOrGetter<BookingsStatisticsTicketStatusRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ticket-status', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsTicketStatusRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get ticket types distribution
 * Breakdown by ticket type and scope (FULL_EVENT, SINGLE_DAY, WORKSHOP_ONLY)
 */
export function useTicketTypes(
  params?: MaybeRefOrGetter<BookingsStatisticsTicketTypesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ticket-types', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsTicketTypesRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get ticket usage statistics
 * Valid, used, cancelled tickets and usage rate
 */
export function useTicketUsage(
  params?: MaybeRefOrGetter<BookingsStatisticsTicketUsageRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ticket-usage', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsTicketUsageRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get ticket scope distribution
 * Distribution by access scope
 */
export function useTicketScope(
  params?: MaybeRefOrGetter<BookingsStatisticsTicketScopeRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'ticket-scope', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsTicketScopeRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// PACKAGE STATISTICS (4 endpoints)
// ============================================================================

/**
 * Get package overview statistics
 * Total packages, active packages, packages with tickets, rules count
 */
export function usePackageOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsPackageOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'package-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsPackageOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get package popularity ranking
 * Top packages by usage/ticket count
 */
export function usePackagePopularity(
  params?: MaybeRefOrGetter<BookingsStatisticsPackagePopularityRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'package-popularity', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsPackagePopularityRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get package rules distribution
 * Distribution by rule type
 */
export function usePackageRules(
  params?: MaybeRefOrGetter<BookingsStatisticsPackageRulesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'package-rules', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsPackageRulesRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get package pricing distribution
 * Average, max, min base amounts and pricing table
 */
export function usePackagePricing(
  params?: MaybeRefOrGetter<BookingsStatisticsPackagePricingRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'package-pricing', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsPackagePricingRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// INTENT STATISTICS (3 endpoints)
// ============================================================================

/**
 * Get intent overview statistics
 * Total intents, status breakdown, capacity reserved
 */
export function useIntentOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsIntentOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'intent-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsIntentOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get intent conversion funnel statistics
 * Conversion, expiration, cancellation rates
 */
export function useIntentConversion(
  params?: MaybeRefOrGetter<BookingsStatisticsIntentConversionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'intent-conversion', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsIntentConversionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get intent trends over time
 * Time-series intent creation data
 */
export function useIntentTrends(
  params?: MaybeRefOrGetter<BookingsStatisticsIntentTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'intent-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsIntentTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// REVENUE STATISTICS (5 endpoints)
// ============================================================================

/**
 * Get revenue overview statistics
 * Total revenue, average, max, min from completed payments
 */
export function useRevenueOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsRevenueOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsRevenueOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get revenue distribution by package
 * Revenue contribution by package (approximated)
 */
export function useRevenueByPackage(
  params?: MaybeRefOrGetter<BookingsStatisticsRevenueByPackageRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-package', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsRevenueByPackageRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue distribution by ticket type
 * Revenue breakdown by ticket type and scope
 */
export function useRevenueByTicketType(
  params?: MaybeRefOrGetter<BookingsStatisticsRevenueByTicketTypeRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-ticket-type', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsRevenueByTicketTypeRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue trends over time
 * Time-series revenue and payment count data
 */
export function useRevenueTrends(
  params?: MaybeRefOrGetter<BookingsStatisticsRevenueTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsRevenueTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue breakdown by payment status
 * Revenue across all payment states (COMPLETED, PENDING, FAILED, etc.)
 */
export function useRevenueBreakdown(
  params?: MaybeRefOrGetter<BookingsStatisticsRevenueBreakdownRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-breakdown', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsRevenueBreakdownRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// COMBINED OVERVIEW (1 endpoint)
// ============================================================================

/**
 * Get dashboard overview statistics
 * Single request with summaries of bookings, tickets, packages, intents, revenue
 */
export function useDashboardOverview(
  params?: MaybeRefOrGetter<BookingsStatisticsOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'dashboard-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return bookingsStatisticsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
