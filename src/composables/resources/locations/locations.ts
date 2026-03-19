import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsVenuesList,
  locationsVenuesRetrieve,
  locationsVenuesCreate,
  locationsVenuesUpdate,
  locationsVenuesPartialUpdate,
  locationsVenuesDestroy,
  locationsChaptersList,
  locationsChaptersRetrieve,
  locationsAreasList,
  locationsAreasRetrieve,
} from '~/api/sdk.gen'
import type {
  LocationsVenuesListData,
  LocationsVenuesCreateData,
  LocationsVenuesUpdateData,
  LocationsVenuesPartialUpdateData,
  LocationsVenuesDestroyData,
  LocationsChaptersListData,
  LocationsAreasListData
} from '~/api/types.gen'

const VENUES_KEY = ['venues'] as const
const CHAPTERS_KEY = ['chapters'] as const
const AREAS_KEY = ['areas'] as const

/**
 * List all venues
 */
export function useVenues(params?: MaybeRefOrGetter<LocationsVenuesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...VENUES_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsVenuesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single venue by ID
 */
export function useVenue(venueId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...VENUES_KEY, 'detail', venueId] as const,
    queryFn: () => {
      const id = toValue(venueId)
      return locationsVenuesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(venueId),
  })
}

/**
 * Create a new venue
 */
export function useCreateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsVenuesCreateData['body']) => locationsVenuesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_KEY })
    },
  })
}

/**
 * Update an existing venue (full update)
 */
export function useUpdateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: number; body: LocationsVenuesUpdateData['body'] }) =>
      locationsVenuesUpdate({ path: { id: venueId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...VENUES_KEY, 'detail', variables.venueId],
      })
    },
  })
}

/**
 * Partially update an existing venue
 */
export function usePartialUpdateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: number; body?: LocationsVenuesPartialUpdateData['body'] }) =>
      locationsVenuesPartialUpdate({ path: { id: venueId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...VENUES_KEY, 'detail', variables.venueId],
      })
    },
  })
}

/**
 * Delete a venue
 */
export function useDeleteVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (venueId: number) => locationsVenuesDestroy({ path: { id: venueId } }),
    onSuccess: (_, venueId) => {
      queryClient.invalidateQueries({ queryKey: VENUES_KEY })
      queryClient.removeQueries({
        queryKey: [...VENUES_KEY, 'detail', venueId],
      })
    },
  })
}

/**
 * List all chapters
 */
export function useChapters(params?: MaybeRefOrGetter<LocationsChaptersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...CHAPTERS_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsChaptersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single chapter by ID
 */
export function useChapter(chapterId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...CHAPTERS_KEY, 'detail', chapterId] as const,
    queryFn: () => {
      const id = toValue(chapterId)
      return locationsChaptersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(chapterId),
  })
}

/**
 * List all areas
 */
export function useAreas(params?: MaybeRefOrGetter<LocationsAreasListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...AREAS_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsAreasList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single area by ID
 */
export function useArea(areaId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...AREAS_KEY, 'detail', areaId] as const,
    queryFn: () => {
      const id = toValue(areaId)
      return locationsAreasRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(areaId),
  })
}
