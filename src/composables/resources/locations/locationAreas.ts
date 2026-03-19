import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsAreasList,
  locationsAreasRetrieve,
  locationsAreasCreate,
  locationsAreasUpdate,
  locationsAreasPartialUpdate,
  locationsAreasDestroy,
  locationsAreasRelativeAreasList,
} from '~/api/sdk.gen'
import type {
  LocationsAreasListData,
  LocationsAreasCreateData,
  LocationsAreasUpdateData,
  LocationsAreasPartialUpdateData,
  LocationsAreasDestroyData,
  LocationsAreasRelativeAreasListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationAreas'] as const

/**
 * List all area locations
 */
export function useLocationAreas(params?: MaybeRefOrGetter<LocationsAreasListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsAreasList(queryParams ? { query: queryParams } : undefined)
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
      return locationsAreasRetrieve({ path: { id } })
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
      return locationsAreasRelativeAreasList({ path: { id } })
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
    mutationFn: (body: LocationsAreasCreateData['body']) => locationsAreasCreate({ body }),
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
    mutationFn: ({ areaId, body }: { areaId: number; body: LocationsAreasUpdateData['body'] }) =>
      locationsAreasUpdate({ path: { id: areaId }, body }),
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
    mutationFn: ({ areaId, body }: { areaId: number; body?: LocationsAreasPartialUpdateData['body'] }) =>
      locationsAreasPartialUpdate({ path: { id: areaId }, body }),
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
    mutationFn: (areaId: number) => locationsAreasDestroy({ path: { id: areaId } }),
    onSuccess: (_, areaId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', areaId],
      })
    },
  })
}
