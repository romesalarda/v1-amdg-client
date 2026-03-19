import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsRoomsList,
  locationsRoomsRetrieve,
  locationsRoomsCreate,
  locationsRoomsUpdate,
  locationsRoomsPartialUpdate,
  locationsRoomsDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsRoomsListData,
  LocationsRoomsCreateData,
  LocationsRoomsUpdateData,
  LocationsRoomsPartialUpdateData,
  LocationsRoomsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['locationRooms'] as const

/**
 * List all venue rooms
 */
export function useLocationRooms(params?: MaybeRefOrGetter<LocationsRoomsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsRoomsList(queryParams ? { query: queryParams } : undefined)
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
      return locationsRoomsRetrieve({ path: { id } })
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
    mutationFn: (body: LocationsRoomsCreateData['body']) => locationsRoomsCreate({ body }),
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
    mutationFn: ({ roomId, body }: { roomId: number; body: LocationsRoomsUpdateData['body'] }) =>
      locationsRoomsUpdate({ path: { id: roomId }, body }),
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
    mutationFn: ({ roomId, body }: { roomId: number; body?: LocationsRoomsPartialUpdateData['body'] }) =>
      locationsRoomsPartialUpdate({ path: { id: roomId }, body }),
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
    mutationFn: (roomId: number) => locationsRoomsDestroy({ path: { id: roomId } }),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', roomId],
      })
    },
  })
}
