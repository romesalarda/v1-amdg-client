import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsMembershipsList,
  organisationsMembershipsRetrieve,
  organisationsMembershipsCreate,
//   organisationsMembershipsUpdate,
//   organisationsMembershipsPartialUpdate,
  organisationsMembershipsDestroy,
  organisationsMembershipsVerifyManuallyCreate,
  organisationsMembershipsVerifyWithCodeCreate,
} from '~/api/sdk.gen'
import type {
  OrganisationsMembershipsListData,
  OrganisationsMembershipsCreateData,
  OrganisationsMembershipsDestroyData,
  OrganisationsMembershipsVerifyManuallyCreateData,
  OrganisationsMembershipsVerifyWithCodeCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationMemberships'] as const

/**
 * List all organisation memberships
 */
export function useOrganisationMemberships(params?: MaybeRefOrGetter<OrganisationsMembershipsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsMembershipsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single membership by ID
 */
export function useOrganisationMembership(membershipId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', membershipId] as const,
    queryFn: () => {
      const id = toValue(membershipId)
      return organisationsMembershipsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(membershipId),
  })
}

/**
 * Create a new organisation membership
 */
export function useCreateOrganisationMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsMembershipsCreateData['body']) => organisationsMembershipsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

// /**
//  * Update an organisation membership (full update)
//  */
// export function useUpdateOrganisationMembership() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ membershipId, body }: { membershipId: number; body: OrganisationsMembershipsUpdateData['body'] }) =>
//       organisationsMembershipsUpdate({ path: { id: membershipId }, body }),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEY })
//       queryClient.invalidateQueries({
//         queryKey: [...QUERY_KEY, 'detail', variables.membershipId],
//       })
//     },
//   })
// }

// /**
//  * Partially update an organisation membership
//  */
// export function usePartialUpdateOrganisationMembership() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ membershipId, body }: { membershipId: number; body?: OrganisationsMembershipsPartialUpdateData['body'] }) =>
//       organisationsMembershipsPartialUpdate({ path: { id: membershipId }, body }),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEY })
//       queryClient.invalidateQueries({
//         queryKey: [...QUERY_KEY, 'detail', variables.membershipId],
//       })
//     },
//   })
// }

/**
 * Delete an organisation membership
 */
export function useDeleteOrganisationMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: number) => organisationsMembershipsDestroy({ path: { id: membershipId } }),
    onSuccess: (_, membershipId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', membershipId],
      })
    },
  })
}

/**
 * Manually verify a membership (admin action)
 */
export function useVerifyOrganisationMembershipManually() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: number) => organisationsMembershipsVerifyManuallyCreate({ path: { id: membershipId } }),
    onSuccess: (_, membershipId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', membershipId],
      })
    },
  })
}

/**
 * Verify a membership using an acceptance code
 */
export function useVerifyOrganisationMembershipWithCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ membershipId, body }: { membershipId: number; body: OrganisationsMembershipsVerifyWithCodeCreateData['body'] }) =>
      organisationsMembershipsVerifyWithCodeCreate({ path: { id: membershipId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.membershipId],
      })
    },
  })
}
