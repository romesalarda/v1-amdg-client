import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsChaptersList,
  locationsLocationsChaptersRetrieve,
  locationsLocationsChaptersCreate,
  locationsLocationsChaptersUpdate,
  locationsLocationsChaptersPartialUpdate,
  locationsLocationsChaptersDestroy,
  locationsLocationsChaptersAreasList,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsChaptersListData,
  LocationsLocationsChaptersCreateData,
  LocationsLocationsChaptersUpdateData,
  LocationsLocationsChaptersPartialUpdateData,
  LocationsLocationsChaptersDestroyData,
  LocationsLocationsChaptersAreasListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationChapters'] as const

/**
 * List all chapter locations
 */
export function useLocationChapters(params?: MaybeRefOrGetter<LocationsLocationsChaptersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsChaptersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single chapter location by ID
 */
export function useLocationChapter(chapterId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', chapterId] as const,
    queryFn: () => {
      const id = toValue(chapterId)
      return locationsLocationsChaptersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(chapterId),
  })
}

/**
 * Get areas for a chapter location
 */
export function useLocationChapterAreas(chapterId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'areas', chapterId] as const,
    queryFn: () => {
      const id = toValue(chapterId)
      return locationsLocationsChaptersAreasList({ path: { id } })
    },
    enabled: () => !!toValue(chapterId),
  })
}

/**
 * Create a new chapter location
 */
export function useCreateLocationChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsChaptersCreateData['body']) => locationsLocationsChaptersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a chapter location (full update)
 */
export function useUpdateLocationChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, body }: { chapterId: number; body: LocationsLocationsChaptersUpdateData['body'] }) =>
      locationsLocationsChaptersUpdate({ path: { id: chapterId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.chapterId],
      })
    },
  })
}

/**
 * Partially update a chapter location
 */
export function usePartialUpdateLocationChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, body }: { chapterId: number; body?: LocationsLocationsChaptersPartialUpdateData['body'] }) =>
      locationsLocationsChaptersPartialUpdate({ path: { id: chapterId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.chapterId],
      })
    },
  })
}

/**
 * Delete a chapter location
 */
export function useDeleteLocationChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chapterId: number) => locationsLocationsChaptersDestroy({ path: { id: chapterId } }),
    onSuccess: (_, chapterId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', chapterId],
      })
    },
  })
}
