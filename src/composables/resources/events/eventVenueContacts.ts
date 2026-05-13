import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventVenueContactsList,
  eventVenueContactsRetrieve,
  eventVenueContactsCreate,
  eventVenueContactsUpdate,
  eventVenueContactsPartialUpdate,
  eventVenueContactsDestroy,
} from '~/api/sdk.gen'
import type {
  EventVenueContactsListData,
  EventVenueContactsCreateData,
  EventVenueContactsUpdateData,
  EventVenueContactsPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventVenueContacts'] as const

export function useEventVenueContacts(params?: MaybeRefOrGetter<EventVenueContactsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventVenueContactsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useEventVenueContact(contactId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', contactId] as const,
    queryFn: () => eventVenueContactsRetrieve({ path: { id: toValue(contactId) } }),
    enabled: () => !!toValue(contactId),
  })
}

export function useCreateEventVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventVenueContactsCreateData['body']) => eventVenueContactsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useUpdateEventVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body: EventVenueContactsUpdateData['body'] }) =>
      eventVenueContactsUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.contactId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function usePartialUpdateEventVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body?: EventVenueContactsPartialUpdateData['body'] }) =>
      eventVenueContactsPartialUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', variables.contactId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}

export function useDeleteEventVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: number) => eventVenueContactsDestroy({ path: { id: contactId } }),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...QUERY_KEY, 'detail', contactId] })
      queryClient.invalidateQueries({ queryKey: ['eventVenues'] })
    },
  })
}
