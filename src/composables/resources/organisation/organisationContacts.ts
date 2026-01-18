import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsContactsList,
  organisationsContactsRetrieve,
  organisationsContactsCreate,
  organisationsContactsUpdate,
  organisationsContactsPartialUpdate,
  organisationsContactsDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsContactsListData,
  OrganisationsContactsCreateData,
  OrganisationsContactsUpdateData,
  OrganisationsContactsPartialUpdateData,
  OrganisationsContactsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['organisationContacts'] as const

/**
 * List all organisation contacts
 */
export function useOrganisationContacts(params?: MaybeRefOrGetter<OrganisationsContactsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsContactsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single organisation contact by ID
 */
export function useOrganisationContact(contactId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', contactId] as const,
    queryFn: () => {
      const id = toValue(contactId)
      return organisationsContactsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(contactId),
  })
}

/**
 * Create a new organisation contact
 */
export function useCreateOrganisationContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsContactsCreateData['body']) => organisationsContactsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an organisation contact (full update)
 */
export function useUpdateOrganisationContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body: OrganisationsContactsUpdateData['body'] }) =>
      organisationsContactsUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.contactId],
      })
    },
  })
}

/**
 * Partially update an organisation contact
 */
export function usePartialUpdateOrganisationContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, body }: { contactId: number; body?: OrganisationsContactsPartialUpdateData['body'] }) =>
      organisationsContactsPartialUpdate({ path: { id: contactId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.contactId],
      })
    },
  })
}

/**
 * Delete an organisation contact
 */
export function useDeleteOrganisationContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: number) => organisationsContactsDestroy({ path: { id: contactId } }),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', contactId],
      })
    },
  })
}
