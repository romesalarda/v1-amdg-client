import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsMembershipsRetrieve,
  organisationsMembershipsVerifyManuallyCreate,
} from '~/api/sdk.gen'
import type {
  OrganisationsMembershipsRetrieveData,
  OrganisationsMembershipsVerifyManuallyCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationMembershipDetails'] as const

export function useOrganisationMembershipDetails(membershipId: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: [...QUERY_KEY, membershipId] as const,
    queryFn: () => {
      const id = toValue(membershipId)
      if (!id) {
        throw new Error('Membership id is required')
      }
      return organisationsMembershipsRetrieve({ path: { id } } as OrganisationsMembershipsRetrieveData)
    },
    enabled: () => !!toValue(membershipId),
  })
}

export function useVerifyOrganisationMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: number) =>
      organisationsMembershipsVerifyManuallyCreate({ path: { id: membershipId } } as OrganisationsMembershipsVerifyManuallyCreateData),
    onSuccess: (_, membershipId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['organisationMemberships'] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, membershipId] })
    },
  })
}
