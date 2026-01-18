import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsCountriesList,
  locationsLocationsCountriesRetrieve,
  locationsLocationsCountriesCreate,
  locationsLocationsCountriesUpdate,
  locationsLocationsCountriesPartialUpdate,
  locationsLocationsCountriesDestroy,
  locationsLocationsCountriesClustersList,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsCountriesListData,
  LocationsLocationsCountriesCreateData,
  LocationsLocationsCountriesUpdateData,
  LocationsLocationsCountriesPartialUpdateData,
  LocationsLocationsCountriesDestroyData,
  LocationsLocationsCountriesClustersListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationCountries'] as const

/**
 * List all country locations
 */
export function useLocationCountries(params?: MaybeRefOrGetter<LocationsLocationsCountriesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsCountriesList(queryParams ? { query: queryParams } : undefined)
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
      return locationsLocationsCountriesRetrieve({ path: { id } })
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
      return locationsLocationsCountriesClustersList({ path: { id } })
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
    mutationFn: (body: LocationsLocationsCountriesCreateData['body']) => locationsLocationsCountriesCreate({ body }),
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
    mutationFn: ({ countryId, body }: { countryId: number; body: LocationsLocationsCountriesUpdateData['body'] }) =>
      locationsLocationsCountriesUpdate({ path: { id: countryId }, body }),
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
    mutationFn: ({ countryId, body }: { countryId: number; body?: LocationsLocationsCountriesPartialUpdateData['body'] }) =>
      locationsLocationsCountriesPartialUpdate({ path: { id: countryId }, body }),
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
    mutationFn: (countryId: number) => locationsLocationsCountriesDestroy({ path: { id: countryId } }),
    onSuccess: (_, countryId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', countryId],
      })
    },
  })
}
