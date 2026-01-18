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
  locationsLocationsVenuesContactsList,
  locationsLocationsVenuesRoomsList,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsVenuesListData,
  LocationsLocationsVenuesCreateData,
  LocationsLocationsVenuesUpdateData,
  LocationsLocationsVenuesPartialUpdateData,
  LocationsLocationsVenuesDestroyData,
  LocationsLocationsVenuesContactsListData,
  LocationsLocationsVenuesRoomsListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationVenues'] as const

/**
 * List all venues
 */
export function useLocationVenues(params?: MaybeRefOrGetter<LocationsLocationsVenuesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsVenuesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single venue by ID
 */
export function useLocationVenue(venueId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', venueId] as const,
    queryFn: () => {
      const id = toValue(venueId)
      return locationsLocationsVenuesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(venueId),
  })
}

/**
 * Get contacts for a venue
 */
export function useLocationVenueContacts(venueId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'contacts', venueId] as const,
    queryFn: () => {
      const id = toValue(venueId)
      return locationsLocationsVenuesContactsList({ path: { id } })
    },
    enabled: () => !!toValue(venueId),
  })
}

/**
 * Get rooms for a venue
 */
export function useLocationVenueRooms(venueId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'rooms', venueId] as const,
    queryFn: () => {
      const id = toValue(venueId)
      return locationsLocationsVenuesRoomsList({ path: { id } })
    },
    enabled: () => !!toValue(venueId),
  })
}

/**
 * Create a new venue
 */
export function useCreateLocationVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsVenuesCreateData['body']) => locationsLocationsVenuesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a venue (full update)
 */
export function useUpdateLocationVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: number; body: LocationsLocationsVenuesUpdateData['body'] }) =>
      locationsLocationsVenuesUpdate({ path: { id: venueId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.venueId],
      })
    },
  })
}

/**
 * Partially update a venue
 */
export function usePartialUpdateLocationVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: number; body?: LocationsLocationsVenuesPartialUpdateData['body'] }) =>
      locationsLocationsVenuesPartialUpdate({ path: { id: venueId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.venueId],
      })
    },
  })
}

/**
 * Delete a venue
 */
export function useDeleteLocationVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (venueId: number) => locationsLocationsVenuesDestroy({ path: { id: venueId } }),
    onSuccess: (_, venueId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', venueId],
      })
    },
  })
}
