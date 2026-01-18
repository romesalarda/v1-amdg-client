import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsClustersList,
  locationsLocationsClustersRetrieve,
  locationsLocationsClustersCreate,
  locationsLocationsClustersUpdate,
  locationsLocationsClustersPartialUpdate,
  locationsLocationsClustersDestroy,
  locationsLocationsClustersChaptersList,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsClustersListData,
  LocationsLocationsClustersCreateData,
  LocationsLocationsClustersUpdateData,
  LocationsLocationsClustersPartialUpdateData,
  LocationsLocationsClustersDestroyData,
  LocationsLocationsClustersChaptersListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationClusters'] as const

/**
 * List all cluster locations
 */
export function useLocationClusters(params?: MaybeRefOrGetter<LocationsLocationsClustersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsClustersList(queryParams ? { query: queryParams } : undefined)
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
      return locationsLocationsClustersRetrieve({ path: { id } })
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
      return locationsLocationsClustersChaptersList({ path: { id } })
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
    mutationFn: (body: LocationsLocationsClustersCreateData['body']) => locationsLocationsClustersCreate({ body }),
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
    mutationFn: ({ clusterId, body }: { clusterId: number; body: LocationsLocationsClustersUpdateData['body'] }) =>
      locationsLocationsClustersUpdate({ path: { id: clusterId }, body }),
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
    mutationFn: ({ clusterId, body }: { clusterId: number; body?: LocationsLocationsClustersPartialUpdateData['body'] }) =>
      locationsLocationsClustersPartialUpdate({ path: { id: clusterId }, body }),
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
    mutationFn: (clusterId: number) => locationsLocationsClustersDestroy({ path: { id: clusterId } }),
    onSuccess: (_, clusterId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', clusterId],
      })
    },
  })
}
