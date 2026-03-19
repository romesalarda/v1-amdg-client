import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsCountriesList,
  locationsCountriesRetrieve,
  locationsCountriesCreate,
  locationsCountriesUpdate,
  locationsCountriesPartialUpdate,
  locationsCountriesDestroy,
  locationsCountriesClustersList,
} from '~/api/sdk.gen'
import type {
  LocationsCountriesListData,
  LocationsCountriesCreateData,
  LocationsCountriesUpdateData,
  LocationsCountriesPartialUpdateData,
  LocationsCountriesDestroyData,
  LocationsCountriesClustersListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationCountries'] as const

/**
 * List all country locations
 */
export function useLocationCountries(params?: MaybeRefOrGetter<LocationsCountriesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsCountriesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single country location by ID
 */
export function useLocationCountry(countryId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', countryId] as const,
    queryFn: () => {
      const id = toValue(countryId)
      return locationsCountriesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(countryId),
  })
}

/**
 * Get clusters for a country location
 */
export function useLocationCountryClusters(countryId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'clusters', countryId] as const,
    queryFn: () => {
      const id = toValue(countryId)
      return locationsCountriesClustersList({ path: { id } })
    },
    enabled: () => !!toValue(countryId),
  })
}

/**
 * Create a new country location
 */
export function useCreateLocationCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsCountriesCreateData['body']) => locationsCountriesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a country location (full update)
 */
export function useUpdateLocationCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ countryId, body }: { countryId: number; body: LocationsCountriesUpdateData['body'] }) =>
      locationsCountriesUpdate({ path: { id: countryId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.countryId],
      })
    },
  })
}

/**
 * Partially update a country location
 */
export function usePartialUpdateLocationCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ countryId, body }: { countryId: number; body?: LocationsCountriesPartialUpdateData['body'] }) =>
      locationsCountriesPartialUpdate({ path: { id: countryId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.countryId],
      })
    },
  })
}

/**
 * Delete a country location
 */
export function useDeleteLocationCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (countryId: number) => locationsCountriesDestroy({ path: { id: countryId } }),
    onSuccess: (_, countryId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', countryId],
      })
    },
  })
}
