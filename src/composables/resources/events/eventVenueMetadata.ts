import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventVenueMetadataList,
  eventVenueMetadataRetrieve,
  eventVenueMetadataCreate,
  eventVenueMetadataUpdate,
  eventVenueMetadataPartialUpdate,
  eventVenueMetadataDestroy,
} from '~/api/sdk.gen'
import type {
  EventVenueMetadataListData,
  EventVenueMetadataCreateData,
  EventVenueMetadataUpdateData,
  EventVenueMetadataPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventVenueMetadata'] as const

export function useEventVenueMetadata(params?: MaybeRefOrGetter<EventVenueMetadataListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventVenueMetadataList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useEventVenueMetadataItem(metadataId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', metadataId] as const,
    queryFn: () => eventVenueMetadataRetrieve({ path: { id: toValue(metadataId) } }),
    enabled: () => !!toValue(metadataId),
  })
}

export function useCreateEventVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventVenueMetadataCreateData['body']) => eventVenueMetadataCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useUpdateEventVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ metadataId, body }: { metadataId: number; body: EventVenueMetadataUpdateData['body'] }) =>
      eventVenueMetadataUpdate({ path: { id: metadataId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.metadataId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function usePartialUpdateEventVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ metadataId, body }: { metadataId: number; body?: EventVenueMetadataPartialUpdateData['body'] }) =>
      eventVenueMetadataPartialUpdate({ path: { id: metadataId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.metadataId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useDeleteEventVenueMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metadataId: number) => eventVenueMetadataDestroy({ path: { id: metadataId } }),
    onSuccess: (_, metadataId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', metadataId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}
