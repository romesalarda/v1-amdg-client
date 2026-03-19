import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsChaptersList,
  locationsChaptersRetrieve,
  locationsChaptersCreate,
  locationsChaptersUpdate,
  locationsChaptersPartialUpdate,
  locationsChaptersDestroy,
  locationsChaptersAreasList,
} from '~/api/sdk.gen'
import type {
  LocationsChaptersListData,
  LocationsChaptersCreateData,
  LocationsChaptersUpdateData,
  LocationsChaptersPartialUpdateData,
  LocationsChaptersDestroyData,
  LocationsChaptersAreasListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationChapters'] as const

/**
 * List all chapter locations
 */
export function useLocationChapters(params?: MaybeRefOrGetter<LocationsChaptersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsChaptersList(queryParams ? { query: queryParams } : undefined)
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
      return locationsChaptersRetrieve({ path: { id } })
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
      return locationsChaptersAreasList({ path: { id } })
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
    mutationFn: (body: LocationsChaptersCreateData['body']) => locationsChaptersCreate({ body }),
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
    mutationFn: ({ chapterId, body }: { chapterId: number; body: LocationsChaptersUpdateData['body'] }) =>
      locationsChaptersUpdate({ path: { id: chapterId }, body }),
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
    mutationFn: ({ chapterId, body }: { chapterId: number; body?: LocationsChaptersPartialUpdateData['body'] }) =>
      locationsChaptersPartialUpdate({ path: { id: chapterId }, body }),
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
    mutationFn: (chapterId: number) => locationsChaptersDestroy({ path: { id: chapterId } }),
    onSuccess: (_, chapterId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', chapterId],
      })
    },
  })
}
