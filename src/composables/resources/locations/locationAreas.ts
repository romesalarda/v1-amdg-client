import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsAreasList,
  locationsLocationsAreasRetrieve,
  locationsLocationsAreasCreate,
  locationsLocationsAreasUpdate,
  locationsLocationsAreasPartialUpdate,
  locationsLocationsAreasDestroy,
  locationsLocationsAreasRelativeAreasList,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsAreasListData,
  LocationsLocationsAreasCreateData,
  LocationsLocationsAreasUpdateData,
  LocationsLocationsAreasPartialUpdateData,
  LocationsLocationsAreasDestroyData,
  LocationsLocationsAreasRelativeAreasListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationAreas'] as const

/**
 * List all area locations
 */
export function useLocationAreas(params?: MaybeRefOrGetter<LocationsLocationsAreasListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsAreasList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single area location by ID
 */
export function useLocationArea(areaId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', areaId] as const,
    queryFn: () => {
      const id = toValue(areaId)
      return locationsLocationsAreasRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(areaId),
  })
}

/**
 * Get relative areas for an area location
 */
export function useLocationAreaRelativeAreas(areaId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'relativeAreas', areaId] as const,
    queryFn: () => {
      const id = toValue(areaId)
      return locationsLocationsAreasRelativeAreasList({ path: { id } })
    },
    enabled: () => !!toValue(areaId),
  })
}

/**
 * Create a new area location
 */
export function useCreateLocationArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsAreasCreateData['body']) => locationsLocationsAreasCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an area location (full update)
 */
export function useUpdateLocationArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ areaId, body }: { areaId: number; body: LocationsLocationsAreasUpdateData['body'] }) =>
      locationsLocationsAreasUpdate({ path: { id: areaId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.areaId],
      })
    },
  })
}

/**
 * Partially update an area location
 */
export function usePartialUpdateLocationArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ areaId, body }: { areaId: number; body?: LocationsLocationsAreasPartialUpdateData['body'] }) =>
      locationsLocationsAreasPartialUpdate({ path: { id: areaId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.areaId],
      })
    },
  })
}

/**
 * Delete an area location
 */
export function useDeleteLocationArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (areaId: number) => locationsLocationsAreasDestroy({ path: { id: areaId } }),
    onSuccess: (_, areaId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', areaId],
      })
    },
  })
}
