import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsSponsorPackagesList,
  organisationsSponsorPackagesRetrieve,
  organisationsSponsorPackagesCreate,
  organisationsSponsorPackagesUpdate,
  organisationsSponsorPackagesPartialUpdate,
  organisationsSponsorPackagesDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsSponsorPackagesListData,
  OrganisationsSponsorPackagesCreateData,
  OrganisationsSponsorPackagesUpdateData,
  OrganisationsSponsorPackagesPartialUpdateData,
  OrganisationsSponsorPackagesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationSponsorPackages'] as const

/**
 * List all sponsor packages
 */
export function useOrganisationSponsorPackages(params?: MaybeRefOrGetter<OrganisationsSponsorPackagesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsSponsorPackagesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single sponsor package by ID
 */
export function useOrganisationSponsorPackage(packageId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', packageId] as const,
    queryFn: () => {
      const id = toValue(packageId)
      return organisationsSponsorPackagesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(packageId),
  })
}

/**
 * Create a new sponsor package
 */
export function useCreateOrganisationSponsorPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsSponsorPackagesCreateData['body']) => organisationsSponsorPackagesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a sponsor package (full update)
 */
export function useUpdateOrganisationSponsorPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, body }: { packageId: number; body: OrganisationsSponsorPackagesUpdateData['body'] }) =>
      organisationsSponsorPackagesUpdate({ path: { id: packageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.packageId],
      })
    },
  })
}

/**
 * Partially update a sponsor package
 */
export function usePartialUpdateOrganisationSponsorPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, body }: { packageId: number; body?: OrganisationsSponsorPackagesPartialUpdateData['body'] }) =>
      organisationsSponsorPackagesPartialUpdate({ path: { id: packageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.packageId],
      })
    },
  })
}

/**
 * Delete a sponsor package
 */
export function useDeleteOrganisationSponsorPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (packageId: number) => organisationsSponsorPackagesDestroy({ path: { id: packageId } }),
    onSuccess: (_, packageId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', packageId],
      })
    },
  })
}
