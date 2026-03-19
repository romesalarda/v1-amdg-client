import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsClustersList,
  locationsClustersRetrieve,
  locationsClustersCreate,
  locationsClustersUpdate,
  locationsClustersPartialUpdate,
  locationsClustersDestroy,
  locationsClustersChaptersList,
} from '~/api/sdk.gen'
import type {
  LocationsClustersListData,
  LocationsClustersCreateData,
  LocationsClustersUpdateData,
  LocationsClustersPartialUpdateData,
  LocationsClustersDestroyData,
  LocationsClustersChaptersListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationClusters'] as const

/**
 * List all cluster locations
 */
export function useLocationClusters(params?: MaybeRefOrGetter<LocationsClustersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsClustersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single cluster location by ID
 */
export function useLocationCluster(clusterId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', clusterId] as const,
    queryFn: () => {
      const id = toValue(clusterId)
      return locationsClustersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(clusterId),
  })
}

/**
 * Get chapters for a cluster location
 */
export function useLocationClusterChapters(clusterId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'chapters', clusterId] as const,
    queryFn: () => {
      const id = toValue(clusterId)
      return locationsClustersChaptersList({ path: { id } })
    },
    enabled: () => !!toValue(clusterId),
  })
}

/**
 * Create a new cluster location
 */
export function useCreateLocationCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsClustersCreateData['body']) => locationsClustersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a cluster location (full update)
 */
export function useUpdateLocationCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clusterId, body }: { clusterId: number; body: LocationsClustersUpdateData['body'] }) =>
      locationsClustersUpdate({ path: { id: clusterId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.clusterId],
      })
    },
  })
}

/**
 * Partially update a cluster location
 */
export function usePartialUpdateLocationCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clusterId, body }: { clusterId: number; body?: LocationsClustersPartialUpdateData['body'] }) =>
      locationsClustersPartialUpdate({ path: { id: clusterId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.clusterId],
      })
    },
  })
}

/**
 * Delete a cluster location
 */
export function useDeleteLocationCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clusterId: number) => locationsClustersDestroy({ path: { id: clusterId } }),
    onSuccess: (_, clusterId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', clusterId],
      })
    },
  })
}
