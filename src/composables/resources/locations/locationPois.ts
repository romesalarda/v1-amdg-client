import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsPoisList,
  locationsLocationsPoisRetrieve,
  locationsLocationsPoisCreate,
  locationsLocationsPoisUpdate,
  locationsLocationsPoisPartialUpdate,
  locationsLocationsPoisDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsPoisListData,
  LocationsLocationsPoisCreateData,
  LocationsLocationsPoisUpdateData,
  LocationsLocationsPoisPartialUpdateData,
  LocationsLocationsPoisDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationPois'] as const

/**
 * List all points of interest
 */
export function useLocationPois(params?: MaybeRefOrGetter<LocationsLocationsPoisListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsPoisList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single point of interest by ID
 */
export function useLocationPoi(poiId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', poiId] as const,
    queryFn: () => {
      const id = toValue(poiId)
      return locationsLocationsPoisRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(poiId),
  })
}

/**
 * Create a new point of interest
 */
export function useCreateLocationPoi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsPoisCreateData['body']) => locationsLocationsPoisCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a point of interest (full update)
 */
export function useUpdateLocationPoi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ poiId, body }: { poiId: number; body: LocationsLocationsPoisUpdateData['body'] }) =>
      locationsLocationsPoisUpdate({ path: { id: poiId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.poiId],
      })
    },
  })
}

/**
 * Partially update a point of interest
 */
export function usePartialUpdateLocationPoi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ poiId, body }: { poiId: number; body?: LocationsLocationsPoisPartialUpdateData['body'] }) =>
      locationsLocationsPoisPartialUpdate({ path: { id: poiId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.poiId],
      })
    },
  })
}

/**
 * Delete a point of interest
 */
export function useDeleteLocationPoi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (poiId: number) => locationsLocationsPoisDestroy({ path: { id: poiId } }),
    onSuccess: (_, poiId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', poiId],
      })
    },
  })
}
