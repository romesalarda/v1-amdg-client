import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsLocationsRoomsList,
  locationsLocationsRoomsRetrieve,
  locationsLocationsRoomsCreate,
  locationsLocationsRoomsUpdate,
  locationsLocationsRoomsPartialUpdate,
  locationsLocationsRoomsDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsLocationsRoomsListData,
  LocationsLocationsRoomsCreateData,
  LocationsLocationsRoomsUpdateData,
  LocationsLocationsRoomsPartialUpdateData,
  LocationsLocationsRoomsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationRooms'] as const

/**
 * List all venue rooms
 */
export function useLocationRooms(params?: MaybeRefOrGetter<LocationsLocationsRoomsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsLocationsRoomsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single venue room by ID
 */
export function useLocationRoom(roomId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', roomId] as const,
    queryFn: () => {
      const id = toValue(roomId)
      return locationsLocationsRoomsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(roomId),
  })
}

/**
 * Create a new venue room
 */
export function useCreateLocationRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsLocationsRoomsCreateData['body']) => locationsLocationsRoomsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a venue room (full update)
 */
export function useUpdateLocationRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body: LocationsLocationsRoomsUpdateData['body'] }) =>
      locationsLocationsRoomsUpdate({ path: { id: roomId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.roomId],
      })
    },
  })
}

/**
 * Partially update a venue room
 */
export function usePartialUpdateLocationRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body?: LocationsLocationsRoomsPartialUpdateData['body'] }) =>
      locationsLocationsRoomsPartialUpdate({ path: { id: roomId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.roomId],
      })
    },
  })
}

/**
 * Delete a venue room
 */
export function useDeleteLocationRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: number) => locationsLocationsRoomsDestroy({ path: { id: roomId } }),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', roomId],
      })
    },
  })
}
