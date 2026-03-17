import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsStatisticsOverviewRetrieve,
  organisationsStatisticsLeadersDistributionRetrieve,
  organisationsStatisticsEventPerformanceRetrieve,
  organisationsStatisticsPaymentsBySourceRetrieve,
  organisationsStatisticsSponsorsOverviewRetrieve,
  organisationsStatisticsSponsorPackagesPerformanceRetrieve,
  organisationsStatisticsSponsorInviteConversionRetrieve,
} from '~/api/sdk.gen'
import type {
  OrganisationsStatisticsOverviewRetrieveData,
  OrganisationsStatisticsLeadersDistributionRetrieveData,
  OrganisationsStatisticsEventPerformanceRetrieveData,
  OrganisationsStatisticsPaymentsBySourceRetrieveData,
  OrganisationsStatisticsSponsorsOverviewRetrieveData,
  OrganisationsStatisticsSponsorPackagesPerformanceRetrieveData,
  OrganisationsStatisticsSponsorInviteConversionRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisations', 'statistics'] as const
const REFRESH_INTERVAL_MS = 60 * 1000

type OverviewQuery = OrganisationsStatisticsOverviewRetrieveData['query']
type LeadersQuery = OrganisationsStatisticsLeadersDistributionRetrieveData['query']
type EventPerformanceQuery = OrganisationsStatisticsEventPerformanceRetrieveData['query']
type PaymentSourcesQuery = OrganisationsStatisticsPaymentsBySourceRetrieveData['query']
type SponsorsOverviewQuery = OrganisationsStatisticsSponsorsOverviewRetrieveData['query']
type SponsorPackagesPerformanceQuery = OrganisationsStatisticsSponsorPackagesPerformanceRetrieveData['query']
type SponsorInviteConversionQuery = OrganisationsStatisticsSponsorInviteConversionRetrieveData['query']

/**
 * Overview metrics for organisation, events, attendance, members and payments.
 */
export function useOrganisationOverviewStatistics(
  params?: MaybeRefOrGetter<OverviewQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Leader distribution split by location hierarchy and area.
 */
export function useOrganisationLeadersDistributionStatistics(
  params?: MaybeRefOrGetter<LeadersQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'leaders-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsLeadersDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Per-event attendee and payment performance metrics.
 */
export function useOrganisationEventPerformanceStatistics(
  params?: MaybeRefOrGetter<EventPerformanceQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'event-performance', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsEventPerformanceRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Revenue and completed payment totals split by source.
 */
export function useOrganisationPaymentsBySourceStatistics(
  params?: MaybeRefOrGetter<PaymentSourcesQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'payments-by-source', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsPaymentsBySourceRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Sponsor funnel overview including commitments, realized revenue and invite outcomes.
 */
export function useOrganisationSponsorsOverviewStatistics(
  params?: MaybeRefOrGetter<SponsorsOverviewQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'sponsors-overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsSponsorsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Sponsor package performance split by package and event.
 */
export function useOrganisationSponsorPackagesPerformanceStatistics(
  params?: MaybeRefOrGetter<SponsorPackagesPerformanceQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'sponsor-packages-performance', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsSponsorPackagesPerformanceRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

/**
 * Sponsor invite acceptance and conversion metrics.
 */
export function useOrganisationSponsorInviteConversionStatistics(
  params?: MaybeRefOrGetter<SponsorInviteConversionQuery | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'sponsor-invite-conversion', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsStatisticsSponsorInviteConversionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    staleTime: 30 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
