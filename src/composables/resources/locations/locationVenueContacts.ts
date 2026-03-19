import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsVenueContactsList,
  locationsVenueContactsRetrieve,
  locationsVenueContactsCreate,
  locationsVenueContactsUpdate,
  locationsVenueContactsPartialUpdate,
  locationsVenueContactsDestroy,
} from '~/api/sdk.gen'
import type {
  LocationsVenueContactsListData,
  LocationsVenueContactsCreateData,
  LocationsVenueContactsUpdateData,
  LocationsVenueContactsPartialUpdateData,
  LocationsVenueContactsDestroyData
} from '~/api/types.gen'

const QUERY_KEY = ['locationVenueContacts'] as const

/**
 * List all venue contacts
 */
export function useLocationVenueContacts(params?: MaybeRefOrGetter<LocationsVenueContactsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return locationsVenueContactsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single venue contact by ID
 */
export function useLocationVenueContact(contactId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', contactId] as const,
    queryFn: () => {
      const id = toValue(contactId)
      return locationsVenueContactsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(contactId),
  })
}

/**
 * Create a new venue contact
 */
export function useCreateLocationVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LocationsVenueContactsCreateData['body']) => locationsVenueContactsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a venue contact (full update)
 */
export function useUpdateLocationVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body: LocationsVenueContactsUpdateData['body'] }) =>
      locationsVenueContactsUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.contactId],
      })
    },
  })
}

/**
 * Partially update a venue contact
 */
export function usePartialUpdateLocationVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body?: LocationsVenueContactsPartialUpdateData['body'] }) =>
      locationsVenueContactsPartialUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.contactId],
      })
    },
  })
}

/**
 * Delete a venue contact
 */
export function useDeleteLocationVenueContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: number) => locationsVenueContactsDestroy({ path: { id: contactId } }),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', contactId],
      })
    },
  })
}
