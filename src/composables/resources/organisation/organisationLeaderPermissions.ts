import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsLeaderPermissionsList,
  organisationsLeaderPermissionsCreate,
  organisationsLeaderPermissionsPartialUpdate,
  organisationsLeaderPermissionsDestroy,
} from '~/api/sdk.gen'
import type {
  OrganisationsLeaderPermissionsListData,
  OrganisationsLeaderPermissionsCreateData,
  OrganisationsLeaderPermissionsPartialUpdateData,
} from '~/api/types.gen'

const QUERY_KEY = ['leaderPermissions'] as const

/**
 * List leader permissions with optional filters.
 * Accepts query params like: leader, user, organisation, permission_code
 */
export function useLeaderPermissions(
  params?: MaybeRefOrGetter<OrganisationsLeaderPermissionsListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsLeaderPermissionsList(
        queryParams ? { query: queryParams } : undefined,
      )
    },
    enabled: () => {
      const p = toValue(params)
      return !!p?.leader || !!p?.user || !!p?.organisation
    },
  })
}

/**
 * Assign a new permission to a leader (controller only).
 */
export function useCreateLeaderPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsLeaderPermissionsCreateData['body']) =>
      organisationsLeaderPermissionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Partially update an existing leader permission (controller only).
 */
export function useUpdateLeaderPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      permissionId,
      body,
    }: {
      permissionId: number
      body: OrganisationsLeaderPermissionsPartialUpdateData['body']
    }) =>
      organisationsLeaderPermissionsPartialUpdate({ path: { id: permissionId }, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Delete a leader permission grant (controller only).
 */
export function useDeleteLeaderPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (permissionId: number) =>
      organisationsLeaderPermissionsDestroy({ path: { id: permissionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
