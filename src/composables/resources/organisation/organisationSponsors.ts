import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsSponsorsList,
  organisationsSponsorsRetrieve,
  organisationsSponsorsCreate,
  organisationsSponsorsUpdate,
  organisationsSponsorsPartialUpdate,
  organisationsSponsorsDestroy,
  organisationsSponsorsPackagesList,
} from '~/api/sdk.gen'
import type {
  OrganisationsSponsorsListData,
  OrganisationsSponsorsCreateData,
  OrganisationsSponsorsUpdateData,
  OrganisationsSponsorsPartialUpdateData,
  OrganisationsSponsorsDestroyData,
  OrganisationsSponsorsPackagesListData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationSponsors'] as const

/**
 * List all sponsors
 */
export function useOrganisationSponsors(params?: MaybeRefOrGetter<OrganisationsSponsorsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsSponsorsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single sponsor by ID
 */
export function useOrganisationSponsor(sponsorId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', sponsorId] as const,
    queryFn: () => {
      const id = toValue(sponsorId)
      return organisationsSponsorsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(sponsorId),
  })
}

/**
 * Get sponsor packages for a specific sponsor
 */
export function useOrganisationSponsorPackages(sponsorId: MaybeRefOrGetter<number>, params?: MaybeRefOrGetter<OrganisationsSponsorsPackagesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'packages', sponsorId, params] as const,
    queryFn: () => {
      const id = toValue(sponsorId)
      const queryParams = toValue(params)
      return organisationsSponsorsPackagesList({
        path: { id },
        ...(queryParams ? { query: queryParams } : {}),
      })
    },
    enabled: () => !!toValue(sponsorId),
  })
}

/**
 * Create a new sponsor
 */
export function useCreateOrganisationSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsSponsorsCreateData['body']) => organisationsSponsorsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a sponsor (full update)
 */
export function useUpdateOrganisationSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sponsorId, body }: { sponsorId: number; body: OrganisationsSponsorsUpdateData['body'] }) =>
      organisationsSponsorsUpdate({ path: { id: sponsorId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.sponsorId],
      })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'packages', variables.sponsorId],
      })
    },
  })
}

/**
 * Partially update a sponsor
 */
export function usePartialUpdateOrganisationSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sponsorId, body }: { sponsorId: number; body?: OrganisationsSponsorsPartialUpdateData['body'] }) =>
      organisationsSponsorsPartialUpdate({ path: { id: sponsorId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.sponsorId],
      })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'packages', variables.sponsorId],
      })
    },
  })
}

/**
 * Delete a sponsor
 */
export function useDeleteOrganisationSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sponsorId: number) => organisationsSponsorsDestroy({ path: { id: sponsorId } }),
    onSuccess: (_, sponsorId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', sponsorId],
      })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'packages', sponsorId],
      })
    },
  })
}
