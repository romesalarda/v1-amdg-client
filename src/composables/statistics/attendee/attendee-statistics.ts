import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  attendeesStatisticsAgeDistributionRetrieve,
  attendeesStatisticsGenderDistributionRetrieve,
  attendeesStatisticsRelationshipDistributionRetrieve,
  attendeesStatisticsAreaDistributionRetrieve,
  attendeesStatisticsLocationBreakdownRetrieve,
  attendeesStatisticsDemographicsRetrieve,
  attendeesStatisticsMedicalConditionsRetrieve,
  attendeesStatisticsAccessibilityRetrieve,
  attendeesStatisticsDietaryRetrieve,
  attendeesStatisticsEmergencyContactsRetrieve,
  attendeesStatisticsPersonalInfoRetrieve,
  attendeesStatisticsConsentsRetrieve,
  attendeesStatisticsRegistrationTrendsRetrieve,
  attendeesStatisticsAttendanceRetrieve,
  attendeesStatisticsOverviewRetrieve,
} from '~/api/sdk.gen'
import type {
  AttendeesStatisticsAgeDistributionRetrieveData,
  AttendeesStatisticsGenderDistributionRetrieveData,
  AttendeesStatisticsRelationshipDistributionRetrieveData,
  AttendeesStatisticsAreaDistributionRetrieveData,
  AttendeesStatisticsLocationBreakdownRetrieveData,
  AttendeesStatisticsDemographicsRetrieveData,
  AttendeesStatisticsMedicalConditionsRetrieveData,
  AttendeesStatisticsAccessibilityRetrieveData,
  AttendeesStatisticsDietaryRetrieveData,
  AttendeesStatisticsEmergencyContactsRetrieveData,
  AttendeesStatisticsPersonalInfoRetrieveData,
  AttendeesStatisticsConsentsRetrieveData,
  AttendeesStatisticsRegistrationTrendsRetrieveData,
  AttendeesStatisticsAttendanceRetrieveData,
  AttendeesStatisticsOverviewRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendees', 'statistics'] as const

/**
 * Get age distribution statistics for attendees
 */
export function useAgeDistribution(
  params?: MaybeRefOrGetter<AttendeesStatisticsAgeDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'age-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsAgeDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get gender distribution statistics for attendees
 */
export function useGenderDistribution(
  params?: MaybeRefOrGetter<AttendeesStatisticsGenderDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'gender-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsGenderDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get relationship distribution statistics for attendees
 */
export function useRelationshipDistribution(
  params?: MaybeRefOrGetter<AttendeesStatisticsRelationshipDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'relationship-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsRelationshipDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get area distribution statistics for attendees
 */
export function useAreaDistribution(
  params?: MaybeRefOrGetter<AttendeesStatisticsAreaDistributionRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'area-distribution', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsAreaDistributionRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get combined location breakdown statistics (area/chapter/cluster/country)
 */
export function useLocationBreakdown(
  params?: MaybeRefOrGetter<AttendeesStatisticsLocationBreakdownRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'location-breakdown', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsLocationBreakdownRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get combined demographics statistics (age, gender, relationships, areas)
 */
export function useDemographics(
  params?: MaybeRefOrGetter<AttendeesStatisticsDemographicsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'demographics', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsDemographicsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get medical conditions statistics for attendees
 */
export function useMedicalConditions(
  params?: MaybeRefOrGetter<AttendeesStatisticsMedicalConditionsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'medical-conditions', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsMedicalConditionsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get accessibility requirements statistics for attendees
 */
export function useAccessibility(
  params?: MaybeRefOrGetter<AttendeesStatisticsAccessibilityRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'accessibility', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsAccessibilityRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get dietary requirements statistics for attendees
 */
export function useDietary(
  params?: MaybeRefOrGetter<AttendeesStatisticsDietaryRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'dietary', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsDietaryRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get emergency contacts statistics for attendees
 */
export function useEmergencyContacts(
  params?: MaybeRefOrGetter<AttendeesStatisticsEmergencyContactsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'emergency-contacts', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsEmergencyContactsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get combined personal info statistics (medical, accessibility, dietary, emergency contacts)
 */
export function usePersonalInfo(
  params?: MaybeRefOrGetter<AttendeesStatisticsPersonalInfoRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'personal-info', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsPersonalInfoRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get consent statistics for attendees (requires event_id)
 */
export function useConsents(
  params?: MaybeRefOrGetter<AttendeesStatisticsConsentsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'consents', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsConsentsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
    enabled: () => {
      const queryParams = toValue(params)
      // Consents require event_id
      return !!(queryParams && queryParams.event_id)
    },
  })
}

/**
 * Get registration trends statistics for attendees
 */
export function useRegistrationTrends(
  params?: MaybeRefOrGetter<AttendeesStatisticsRegistrationTrendsRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'registration-trends', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsRegistrationTrendsRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get attendance/check-in statistics for attendees
 */
export function useAttendance(
  params?: MaybeRefOrGetter<AttendeesStatisticsAttendanceRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'attendance', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsAttendanceRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}

/**
 * Get overview statistics for attendees (combined dashboard view)
 */
export function useOverview(
  params?: MaybeRefOrGetter<AttendeesStatisticsOverviewRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return attendeesStatisticsOverviewRetrieve(
        queryParams ? { query: queryParams } : undefined
      )
    },
  })
}
