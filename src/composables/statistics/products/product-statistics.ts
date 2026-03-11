import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  productsStatisticsOverviewRetrieve,
  productsStatisticsProductOverviewRetrieve,
  productsStatisticsCategoryDistributionRetrieve,
  productsStatisticsStatusDistributionRetrieve,
  productsStatisticsProductTrendsRetrieve,
  productsStatisticsVariantStockOverviewRetrieve,
  productsStatisticsSizeDistributionRetrieve,
  productsStatisticsColorDistributionRetrieve,
  productsStatisticsStockLevelsRetrieve,
  productsStatisticsOrderStatusDistributionRetrieve,
  productsStatisticsOrderTrendsRetrieve,
  productsStatisticsOrdersByProductRetrieve,
  productsStatisticsOrdersByCategoryRetrieve,
  productsStatisticsRevenueOverviewRetrieve,
  productsStatisticsRevenueByProductRetrieve,
  productsStatisticsRevenueByCategoryRetrieve,
  productsStatisticsRevenueTrendsRetrieve,
  productsStatisticsRevenueBreakdownRetrieve,
} from '~/api/sdk.gen'
import type {
  ProductsStatisticsOverviewRetrieveData,
  ProductsStatisticsProductOverviewRetrieveData,
  ProductsStatisticsCategoryDistributionRetrieveData,
  ProductsStatisticsStatusDistributionRetrieveData,
  ProductsStatisticsProductTrendsRetrieveData,
  ProductsStatisticsVariantStockOverviewRetrieveData,
  ProductsStatisticsSizeDistributionRetrieveData,
  ProductsStatisticsColorDistributionRetrieveData,
  ProductsStatisticsStockLevelsRetrieveData,
  ProductsStatisticsOrderStatusDistributionRetrieveData,
  ProductsStatisticsOrderTrendsRetrieveData,
  ProductsStatisticsOrdersByProductRetrieveData,
  ProductsStatisticsOrdersByCategoryRetrieveData,
  ProductsStatisticsRevenueOverviewRetrieveData,
  ProductsStatisticsRevenueByProductRetrieveData,
  ProductsStatisticsRevenueByCategoryRetrieveData,
  ProductsStatisticsRevenueTrendsRetrieveData,
  ProductsStatisticsRevenueBreakdownRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['products', 'statistics'] as const

/**
 * Get comprehensive overview dashboard combining product, variant, order, and revenue metrics
 * 
 * @param params - Query parameters including event_id filter
 * @example
 * const { data, isLoading } = useProductsOverview(computed(() => ({ 
 *   event_id: eventId.value 
 * })))
 */
export function useProductsOverview(
  params: MaybeRefOrGetter<ProductsStatisticsOverviewRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsOverviewRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get product counts overview (active/inactive/verified)
 * 
 * @param params - Query parameters including event_id, category_id, is_active, verified
 * @example
 * const { data, isLoading } = useProductOverview(computed(() => ({
 *   event_id: eventId.value,
 *   category_id: selectedCategory.value
 * })))
 */
export function useProductOverview(
  params: MaybeRefOrGetter<ProductsStatisticsProductOverviewRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'product-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsProductOverviewRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get distribution of products across categories
 * 
 * @param params - Query parameters including event_id
 * @example
 * const { data, isLoading } = useCategoryDistribution(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useCategoryDistribution(
  params: MaybeRefOrGetter<ProductsStatisticsCategoryDistributionRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'category-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsCategoryDistributionRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get distribution of products by status (active/inactive × verified/unverified)
 * 
 * @param params - Query parameters including event_id
 * @example
 * const { data, isLoading } = useStatusDistribution(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useStatusDistribution(
  params: MaybeRefOrGetter<ProductsStatisticsStatusDistributionRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'status-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsStatusDistributionRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get product creation trends over time
 * 
 * @param params - Query parameters including event_id, group_by (day/week/month), date_from, date_to
 * @example
 * const { data, isLoading } = useProductTrends(computed(() => ({
 *   event_id: eventId.value,
 *   group_by: 'week',
 *   date_from: '2026-01-01',
 *   date_to: '2026-03-11'
 * })))
 */
export function useProductTrends(
  params: MaybeRefOrGetter<ProductsStatisticsProductTrendsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'product-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsProductTrendsRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get variant stock overview (low stock, out of stock counts)
 * 
 * @param params - Query parameters including event_id
 * @example
 * const { data, isLoading } = useVariantStockOverview(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useVariantStockOverview(
  params: MaybeRefOrGetter<ProductsStatisticsVariantStockOverviewRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'variant-stock-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsVariantStockOverviewRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for stock
  })
}

/**
 * Get distribution of variants by size
 * 
 * @param params - Query parameters including event_id, category_id
 * @example
 * const { data, isLoading } = useSizeDistribution(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useSizeDistribution(
  params: MaybeRefOrGetter<ProductsStatisticsSizeDistributionRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'size-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsSizeDistributionRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get distribution of variants by color (with hex codes)
 * 
 * @param params - Query parameters including event_id, category_id
 * @example
 * const { data, isLoading } = useColorDistribution(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useColorDistribution(
  params: MaybeRefOrGetter<ProductsStatisticsColorDistributionRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'color-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsColorDistributionRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get distribution of variants by stock level ranges (0, 1-10, 11-50, 51-100, 100+)
 * 
 * @param params - Query parameters including event_id, category_id
 * @example
 * const { data, isLoading } = useStockLevels(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useStockLevels(
  params: MaybeRefOrGetter<ProductsStatisticsStockLevelsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'stock-levels', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsStockLevelsRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for stock
  })
}

/**
 * Get distribution of orders by status (draft, pending, processing, completed, cancelled, refunded)
 * 
 * @param params - Query parameters including event_id, status, date_from, date_to
 * @example
 * const { data, isLoading } = useOrderStatusDistribution(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useOrderStatusDistribution(
  params: MaybeRefOrGetter<ProductsStatisticsOrderStatusDistributionRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'order-status-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsOrderStatusDistributionRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get order creation trends over time (with optional cumulative counts)
 * 
 * @param params - Query parameters including event_id, group_by (day/week/month), cumulative, date_from, date_to
 * @example
 * const { data, isLoading } = useOrderTrends(computed(() => ({
 *   event_id: eventId.value,
 *   group_by: 'week',
 *   cumulative: false
 * })))
 */
export function useOrderTrends(
  params: MaybeRefOrGetter<ProductsStatisticsOrderTrendsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'order-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsOrderTrendsRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get top products ranked by order count
 * 
 * @param params - Query parameters including event_id, limit (default: 10), date_from, date_to
 * @example
 * const { data, isLoading } = useOrdersByProduct(computed(() => ({
 *   event_id: eventId.value,
 *   limit: 10
 * })))
 */
export function useOrdersByProduct(
  params: MaybeRefOrGetter<ProductsStatisticsOrdersByProductRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'orders-by-product', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsOrdersByProductRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get order counts grouped by product category
 * 
 * @param params - Query parameters including event_id, limit (default: 10), date_from, date_to
 * @example
 * const { data, isLoading } = useOrdersByCategory(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useOrdersByCategory(
  params: MaybeRefOrGetter<ProductsStatisticsOrdersByCategoryRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'orders-by-category', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsOrdersByCategoryRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get revenue overview (total revenue, completed orders, average order value)
 * NOTE: Only completed orders are included in revenue calculations
 * 
 * @param params - Query parameters including event_id, date_from, date_to
 * @example
 * const { data, isLoading } = useRevenueOverview(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useRevenueOverview(
  params: MaybeRefOrGetter<ProductsStatisticsRevenueOverviewRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsRevenueOverviewRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get top products ranked by revenue (completed orders only)
 * 
 * @param params - Query parameters including event_id, limit (default: 10), date_from, date_to
 * @example
 * const { data, isLoading } = useRevenueByProduct(computed(() => ({
 *   event_id: eventId.value,
 *   limit: 10
 * })))
 */
export function useRevenueByProduct(
  params: MaybeRefOrGetter<ProductsStatisticsRevenueByProductRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-product', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsRevenueByProductRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get revenue breakdown by category (completed orders only)
 * 
 * @param params - Query parameters including event_id, limit (default: 10), date_from, date_to
 * @example
 * const { data, isLoading } = useRevenueByCategory(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useRevenueByCategory(
  params: MaybeRefOrGetter<ProductsStatisticsRevenueByCategoryRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-by-category', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsRevenueByCategoryRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get revenue trends over time (completed orders only)
 * 
 * @param params - Query parameters including event_id, group_by (day/week/month), date_from, date_to
 * @example
 * const { data, isLoading } = useRevenueTrends(computed(() => ({
 *   event_id: eventId.value,
 *   group_by: 'week'
 * })))
 */
export function useRevenueTrends(
  params: MaybeRefOrGetter<ProductsStatisticsRevenueTrendsRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsRevenueTrendsRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get revenue breakdown by source (standalone vs package-linked products)
 * 
 * @param params - Query parameters including event_id, date_from, date_to
 * @example
 * const { data, isLoading } = useRevenueBreakdown(computed(() => ({
 *   event_id: eventId.value
 * })))
 */
export function useRevenueBreakdown(
  params: MaybeRefOrGetter<ProductsStatisticsRevenueBreakdownRetrieveData['query']>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'revenue-breakdown', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return productsStatisticsRevenueBreakdownRetrieve({ query: queryParams })
    },
    enabled: computed(() => {
      const queryParams = toValue(params)
      return !!queryParams?.event_id
    }),
    staleTime: 5 * 60 * 1000,
  })
}
