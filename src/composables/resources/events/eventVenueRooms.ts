import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventVenueRoomsList,
  eventVenueRoomsRetrieve,
  eventVenueRoomsCreate,
  eventVenueRoomsUpdate,
  eventVenueRoomsPartialUpdate,
  eventVenueRoomsDestroy,
} from '~/api/sdk.gen'
import type {
  EventVenueRoomsListData,
  EventVenueRoomsCreateData,
  EventVenueRoomsUpdateData,
  EventVenueRoomsPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventVenueRooms'] as const

export function useEventVenueRooms(params?: MaybeRefOrGetter<EventVenueRoomsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventVenueRoomsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useEventVenueRoom(roomId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', roomId] as const,
    queryFn: () => eventVenueRoomsRetrieve({ path: { id: toValue(roomId) } }),
    enabled: () => !!toValue(roomId),
  })
}

export function useCreateEventVenueRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventVenueRoomsCreateData['body']) => eventVenueRoomsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useUpdateEventVenueRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body: EventVenueRoomsUpdateData['body'] }) =>
      eventVenueRoomsUpdate({ path: { id: roomId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.roomId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function usePartialUpdateEventVenueRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body?: EventVenueRoomsPartialUpdateData['body'] }) =>
      eventVenueRoomsPartialUpdate({ path: { id: roomId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.roomId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useDeleteEventVenueRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: number) => eventVenueRoomsDestroy({ path: { id: roomId } }),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', roomId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}
