import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsPoisList,
  locationsPoisRetrieve,
  locationsPoisCreate,
  locationsPoisUpdate,
  locationsPoisPartialUpdate,
  locationsPoisDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsPoisListData,
  LocationsPoisCreateData,
  LocationsPoisUpdateData,
  LocationsPoisPartialUpdateData,
  LocationsPoisDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationPois'] as const

/**
 * List all points of interest
 */
export function useLocationPois(params?: MaybeRefOrGetter<LocationsPoisListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsPoisList(queryParams ? { query: queryParams } : undefined)
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
      return locationsPoisRetrieve({ path: { id } })
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
    mutationFn: (body: LocationsPoisCreateData['body']) => locationsPoisCreate({ body }),
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
    mutationFn: ({ poiId, body }: { poiId: number; body: LocationsPoisUpdateData['body'] }) =>
      locationsPoisUpdate({ path: { id: poiId }, body }),
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
    mutationFn: ({ poiId, body }: { poiId: number; body?: LocationsPoisPartialUpdateData['body'] }) =>
      locationsPoisPartialUpdate({ path: { id: poiId }, body }),
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
    mutationFn: (poiId: number) => locationsPoisDestroy({ path: { id: poiId } }),
    onSuccess: (_, poiId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', poiId],
      })
    },
  })
}
