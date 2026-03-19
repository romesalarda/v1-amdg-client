import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsVenueMetadataList,
  locationsVenueMetadataRetrieve,
  locationsVenueMetadataCreate,
  locationsVenueMetadataUpdate,
  locationsVenueMetadataPartialUpdate,
  locationsVenueMetadataDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsVenueMetadataListData,
  LocationsVenueMetadataCreateData,
  LocationsVenueMetadataUpdateData,
  LocationsVenueMetadataPartialUpdateData,
  LocationsVenueMetadataDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationVenueMetadata'] as const

/**
 * List all venue metadata
 */
export function useLocationVenueMetadata(params?: MaybeRefOrGetter<LocationsVenueMetadataListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsVenueMetadataList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single venue metadata entry by ID
 */
export function useLocationVenueMetadataEntry(metadataId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', metadataId] as const,
    queryFn: () => {
      const id = toValue(metadataId)
      return locationsVenueMetadataRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(metadataId),
  })
}

/**
 * Create a new venue metadata entry
 */
export function useCreateLocationVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsVenueMetadataCreateData['body']) => locationsVenueMetadataCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a venue metadata entry (full update)
 */
export function useUpdateLocationVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ metadataId, body }: { metadataId: number; body: LocationsVenueMetadataUpdateData['body'] }) =>
      locationsVenueMetadataUpdate({ path: { id: metadataId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.metadataId],
      })
    },
  })
}

/**
 * Partially update a venue metadata entry
 */
export function usePartialUpdateLocationVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ metadataId, body }: { metadataId: number; body?: LocationsVenueMetadataPartialUpdateData['body'] }) =>
      locationsVenueMetadataPartialUpdate({ path: { id: metadataId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.metadataId],
      })
    },
  })
}

/**
 * Delete a venue metadata entry
 */
export function useDeleteLocationVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metadataId: number) => locationsVenueMetadataDestroy({ path: { id: metadataId } }),
    onSuccess: (_, metadataId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', metadataId],
      })
    },
  })
}
