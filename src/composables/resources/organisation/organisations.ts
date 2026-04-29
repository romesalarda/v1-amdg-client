import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsListList,
  organisationsListRetrieve,
  organisationsListCreate,
  organisationsListUpdate,
  organisationsListPartialUpdate,
  organisationsListDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsListListData,
  OrganisationsListCreateData,
  OrganisationsListUpdateData,
  OrganisationsListPartialUpdateData,
  OrganisationsListDestroyData,
} from '~/api/types.gen'
import { uploadMultipart, isFormData } from '~/utils/upload'

const QUERY_KEY = ['organisations'] as const

/**
 * List all organisations
 */
export function useOrganisations(params?: MaybeRefOrGetter<OrganisationsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single organisation by url_safe_title (or compatible identifier)
 */
export function useOrganisation(organisationIdentifier: MaybeRefOrGetter<string | number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', organisationIdentifier] as const,
    queryFn: () => {
      const identifier = toValue(organisationIdentifier)
      return organisationsListRetrieve({ path: { url_safe_title: String(identifier) } })
    },
    enabled: () => !!toValue(organisationIdentifier),
  })
}

/**
 * Create a new organisation
 */
export function useCreateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsListCreateData['body']) => organisationsListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing organisation (full update)
 */
export function useUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organisationId, body }: { organisationId: string | number; body: OrganisationsListUpdateData['body'] }) =>
      organisationsListUpdate({ path: { url_safe_title: String(organisationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.organisationId],
      })
    },
  })
}

/**
 * Partially update an existing organisation
 * Supports both JSON updates (via SDK) and multipart/form-data (for file uploads)
 */
export function usePartialUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organisationId, body }: { organisationId: string | number; body?: OrganisationsListPartialUpdateData['body'] | FormData }) => {
      // Handle multipart uploads (e.g., with logo or landing_image)
      if (isFormData(body)) {
        return uploadMultipart(`/api/organisations/list/${encodeURIComponent(String(organisationId))}/`, body, { method: 'PATCH' })
      }
      
      // Handle regular JSON updates via SDK
      return organisationsListPartialUpdate({ path: { url_safe_title: String(organisationId) }, body })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.organisationId],
      })
    },
  })
}

/**
 * Delete an organisation
 */
export function useDeleteOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (organisationId: string | number) => organisationsListDestroy({ path: { url_safe_title: String(organisationId) } }),
    onSuccess: (_, organisationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', organisationId],
      })
    },
  })
}
