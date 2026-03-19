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
  locationsVenuesContactsList,
  locationsVenuesRoomsList,
} from '~/api/sdk.gen'
import type {
  LocationsVenuesListData,
  LocationsVenuesCreateData,
  LocationsVenuesUpdateData,
  LocationsVenuesPartialUpdateData,
  LocationsVenuesDestroyData,
  LocationsVenuesContactsListData,
  LocationsVenuesRoomsListData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationVenues'] as const

/**
 * List all venues
 */
export function useLocationVenues(params?: MaybeRefOrGetter<LocationsVenuesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsVenuesList(queryParams ? { query: queryParams } : undefined)
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
      return locationsVenuesRetrieve({ path: { id } })
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
      return locationsVenuesContactsList({ path: { id } })
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
      return locationsVenuesRoomsList({ path: { id } })
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
    mutationFn: (body: LocationsVenuesCreateData['body']) => locationsVenuesCreate({ body }),
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
    mutationFn: ({ venueId, body }: { venueId: number; body: LocationsVenuesUpdateData['body'] }) =>
      locationsVenuesUpdate({ path: { id: venueId }, body }),
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
    mutationFn: ({ venueId, body }: { venueId: number; body?: LocationsVenuesPartialUpdateData['body'] }) =>
      locationsVenuesPartialUpdate({ path: { id: venueId }, body }),
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
    mutationFn: (venueId: number) => locationsVenuesDestroy({ path: { id: venueId } }),
    onSuccess: (_, venueId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', venueId],
      })
    },
  })
}
