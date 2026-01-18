import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsRelativeAreasList,
  locationsLocationsRelativeAreasRetrieve,
  locationsLocationsRelativeAreasCreate,
  locationsLocationsRelativeAreasUpdate,
  locationsLocationsRelativeAreasPartialUpdate,
  locationsLocationsRelativeAreasDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsRelativeAreasListData,
  LocationsLocationsRelativeAreasCreateData,
  LocationsLocationsRelativeAreasUpdateData,
  LocationsLocationsRelativeAreasPartialUpdateData,
  LocationsLocationsRelativeAreasDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationRelativeAreas'] as const

/**
 * List all relative search areas
 */
export function useLocationRelativeAreas(params?: MaybeRefOrGetter<LocationsLocationsRelativeAreasListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsRelativeAreasList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single relative area by ID
 */
export function useLocationRelativeArea(relativeAreaId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', relativeAreaId] as const,
    queryFn: () => {
      const id = toValue(relativeAreaId)
      return locationsLocationsRelativeAreasRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(relativeAreaId),
  })
}

/**
 * Create a new relative search area
 */
export function useCreateLocationRelativeArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsRelativeAreasCreateData['body']) => locationsLocationsRelativeAreasCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a relative area (full update)
 */
export function useUpdateLocationRelativeArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ relativeAreaId, body }: { relativeAreaId: number; body: LocationsLocationsRelativeAreasUpdateData['body'] }) =>
      locationsLocationsRelativeAreasUpdate({ path: { id: relativeAreaId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.relativeAreaId],
      })
    },
  })
}

/**
 * Partially update a relative area
 */
export function usePartialUpdateLocationRelativeArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ relativeAreaId, body }: { relativeAreaId: number; body?: LocationsLocationsRelativeAreasPartialUpdateData['body'] }) =>
      locationsLocationsRelativeAreasPartialUpdate({ path: { id: relativeAreaId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.relativeAreaId],
      })
    },
  })
}

/**
 * Delete a relative area
 */
export function useDeleteLocationRelativeArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (relativeAreaId: number) => locationsLocationsRelativeAreasDestroy({ path: { id: relativeAreaId } }),
    onSuccess: (_, relativeAreaId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', relativeAreaId],
      })
    },
  })
}
