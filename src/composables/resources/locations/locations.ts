import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsVenuesList,
  locationsLocationsVenuesRetrieve,
  locationsLocationsVenuesCreate,
  locationsLocationsVenuesUpdate,
  locationsLocationsVenuesPartialUpdate,
  locationsLocationsVenuesDestroy,
  locationsLocationsChaptersList,
  locationsLocationsChaptersRetrieve,
  locationsLocationsAreasList,
  locationsLocationsAreasRetrieve,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsVenuesListData,
  LocationsLocationsVenuesCreateData,
  LocationsLocationsVenuesUpdateData,
  LocationsLocationsVenuesPartialUpdateData,
  LocationsLocationsVenuesDestroyData,
  LocationsLocationsChaptersListData,
  LocationsLocationsAreasListData,
} from '~/api/types.gen'

const VENUES_KEY = ['venues'] as const
const CHAPTERS_KEY = ['chapters'] as const
const AREAS_KEY = ['areas'] as const

/**
 * List all venues
 */
export function useVenues(params?: MaybeRefOrGetter<LocationsLocationsVenuesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...VENUES_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsVenuesList(queryParams ? { query: queryParams } : undefined)
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
      return locationsLocationsVenuesRetrieve({ path: { id } })
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
    mutationFn: (body: LocationsLocationsVenuesCreateData['body']) => locationsLocationsVenuesCreate({ body }),
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
    mutationFn: ({ venueId, body }: { venueId: number; body: LocationsLocationsVenuesUpdateData['body'] }) =>
      locationsLocationsVenuesUpdate({ path: { id: venueId }, body }),
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
    mutationFn: ({ venueId, body }: { venueId: number; body?: LocationsLocationsVenuesPartialUpdateData['body'] }) =>
      locationsLocationsVenuesPartialUpdate({ path: { id: venueId }, body }),
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
    mutationFn: (venueId: number) => locationsLocationsVenuesDestroy({ path: { id: venueId } }),
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
export function useChapters(params?: MaybeRefOrGetter<LocationsLocationsChaptersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...CHAPTERS_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsChaptersList(queryParams ? { query: queryParams } : undefined)
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
      return locationsLocationsChaptersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(chapterId),
  })
}

/**
 * List all areas
 */
export function useAreas(params?: MaybeRefOrGetter<LocationsLocationsAreasListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...AREAS_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsAreasList(queryParams ? { query: queryParams } : undefined)
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
      return locationsLocationsAreasRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(areaId),
  })
}
