import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsStatisticsRevenueOverviewRetrieve,
  paymentsStatisticsRevenueTrendsRetrieve,
  paymentsStatisticsRevenueBreakdownRetrieve,
  paymentsStatisticsRevenueByMethodRetrieve,
  paymentsStatisticsPaymentOverviewRetrieve,
  paymentsStatisticsPaymentStatusRetrieve,
  paymentsStatisticsPaymentMethodsRetrieve,
  paymentsStatisticsPaymentTrendsRetrieve,
  paymentsStatisticsDonationsRetrieve,
  paymentsStatisticsDonationTrendsRetrieve,
  paymentsStatisticsTopDonorsRetrieve,
  paymentsStatisticsDiscountUsageRetrieve,
  paymentsStatisticsDiscountRulesRetrieve,
  paymentsStatisticsTopDiscountsRetrieve,
  paymentsStatisticsRefundRequestsRetrieve,
  paymentsStatisticsRefundTrendsRetrieve,
  paymentsStatisticsRefundProcessingRetrieve,
  paymentsStatisticsOverviewRetrieve,
} from '~/api/sdk.gen'
import type {
  PaymentsStatisticsRevenueOverviewRetrieveData,
  PaymentsStatisticsRevenueTrendsRetrieveData,
  PaymentsStatisticsRevenueBreakdownRetrieveData,
  PaymentsStatisticsRevenueByMethodRetrieveData,
  PaymentsStatisticsPaymentOverviewRetrieveData,
  PaymentsStatisticsPaymentStatusRetrieveData,
  PaymentsStatisticsPaymentMethodsRetrieveData,
  PaymentsStatisticsPaymentTrendsRetrieveData,
  PaymentsStatisticsDonationsRetrieveData,
  PaymentsStatisticsDonationTrendsRetrieveData,
  PaymentsStatisticsTopDonorsRetrieveData,
  PaymentsStatisticsDiscountUsageRetrieveData,
  PaymentsStatisticsDiscountRulesRetrieveData,
  PaymentsStatisticsTopDiscountsRetrieveData,
  PaymentsStatisticsRefundRequestsRetrieveData,
  PaymentsStatisticsRefundTrendsRetrieveData,
  PaymentsStatisticsRefundProcessingRetrieveData,
  PaymentsStatisticsOverviewRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['payments', 'statistics'] as const

// ============================================================================
// REVENUE STATISTICS
// ============================================================================

/**
 * Get revenue overview statistics
 */
export function useRevenueOverview(
  params?: MaybeRefOrGetter<PaymentsStatisticsRevenueOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRevenueOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue trends over time
 */
export function useRevenueTrends(
  params?: MaybeRefOrGetter<PaymentsStatisticsRevenueTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRevenueTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue breakdown by source
 */
export function useRevenueBreakdown(
  params?: MaybeRefOrGetter<PaymentsStatisticsRevenueBreakdownRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-breakdown', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRevenueBreakdownRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get revenue by payment method
 */
export function useRevenueByMethod(
  params?: MaybeRefOrGetter<PaymentsStatisticsRevenueByMethodRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-method', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRevenueByMethodRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// PAYMENT STATISTICS
// ============================================================================

/**
 * Get payment overview statistics
 */
export function usePaymentOverview(
  params?: MaybeRefOrGetter<PaymentsStatisticsPaymentOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payment-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsPaymentOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get payment status distribution
 */
export function usePaymentStatus(
  params?: MaybeRefOrGetter<PaymentsStatisticsPaymentStatusRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payment-status', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsPaymentStatusRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get payment method distribution
 */
export function usePaymentMethods(
  params?: MaybeRefOrGetter<PaymentsStatisticsPaymentMethodsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payment-methods', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsPaymentMethodsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get payment trends over time
 */
export function usePaymentTrends(
  params?: MaybeRefOrGetter<PaymentsStatisticsPaymentTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payment-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsPaymentTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// DONATION STATISTICS
// ============================================================================

/**
 * Get donation statistics
 */
export function useDonationStats(
  params?: MaybeRefOrGetter<PaymentsStatisticsDonationsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'donations', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsDonationsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get donation trends over time
 */
export function useDonationTrends(
  params?: MaybeRefOrGetter<PaymentsStatisticsDonationTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'donation-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsDonationTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get top donors
 */
export function useTopDonors(
  params?: MaybeRefOrGetter<PaymentsStatisticsTopDonorsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'top-donors', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsTopDonorsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// DISCOUNT STATISTICS
// ============================================================================

/**
 * Get discount usage statistics
 */
export function useDiscountUsage(
  params?: MaybeRefOrGetter<PaymentsStatisticsDiscountUsageRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'discount-usage', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsDiscountUsageRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get discount rule effectiveness
 */
export function useDiscountRules(
  params?: MaybeRefOrGetter<PaymentsStatisticsDiscountRulesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'discount-rules', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsDiscountRulesRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get top discounts
 */
export function useTopDiscounts(
  params?: MaybeRefOrGetter<PaymentsStatisticsTopDiscountsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'top-discounts', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsTopDiscountsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// REFUND STATISTICS
// ============================================================================

/**
 * Get refund request statistics
 */
export function useRefundRequests(
  params?: MaybeRefOrGetter<PaymentsStatisticsRefundRequestsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'refund-requests', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRefundRequestsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get refund trends over time
 */
export function useRefundTrends(
  params?: MaybeRefOrGetter<PaymentsStatisticsRefundTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'refund-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRefundTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get refund processing time statistics
 */
export function useRefundProcessing(
  params?: MaybeRefOrGetter<PaymentsStatisticsRefundProcessingRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'refund-processing', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsRefundProcessingRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

// ============================================================================
// OVERVIEW STATISTICS
// ============================================================================

/**
 * Get comprehensive payment statistics overview
 */
export function usePaymentStatisticsOverview(
  params?: MaybeRefOrGetter<PaymentsStatisticsOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsStatisticsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}
