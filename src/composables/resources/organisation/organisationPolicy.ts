import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsListPolicyRetrieve,
  organisationsListPolicyPartialUpdate,
} from '~/api/sdk.gen'
import type { OrganisationsListPolicyPartialUpdateData } from '~/api/types.gen'

const QUERY_KEY = ['organisationPolicy'] as const

/**
 * Fetch the OrganisationEventPolicy for an organisation.
 * The policy is auto-created on first access by the backend.
 */
export function useOrganisationPolicy(orgId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, orgId] as const,
    queryFn: () =>
      organisationsListPolicyRetrieve({ path: { url_safe_title: toValue(orgId) } }),
    enabled: () => !!toValue(orgId),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Partially update the OrganisationEventPolicy.
 * Requires controller or leader with allow_policy_management.
 */
export function useUpdateOrganisationPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orgId,
      body,
    }: {
      orgId: string
      body: OrganisationsListPolicyPartialUpdateData['body']
    }) =>
      organisationsListPolicyPartialUpdate({
        path: { url_safe_title: orgId },
        body,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.orgId],
      })
    },
  })
}
