import { computed, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { organisationsListMyPermissionsRetrieve } from '~/api/sdk.gen'

export type LeaderPermissionCode =
  | 'allow_event_approval'
  | 'allow_manage_leaders'
  | 'allow_manage_organisation'
  | 'allow_membership_access'
  | 'allow_organisation_sponsor'
  | 'allow_policy_management'
  | 'allow_data_management'
  | 'allow_review_access'
  | 'allow_monetary_access'
  | 'allow_landing_page_management'

export type LeaderPermissionCRUDAction = 'create' | 'read' | 'update' | 'delete'

export interface CurrentLeaderPermission {
  permission_code: LeaderPermissionCode
  allow_create: boolean
  allow_read: boolean
  allow_update: boolean
  allow_delete: boolean
}

/**
 * Get the current user's leader/controller permissions for an organisation.
 *
 * Controllers bypass all permission checks. Leaders are restricted to their
 * explicitly granted permission codes and CRUD flags.
 *
 * @param organisationId - The url_safe_title of the organisation
 */
export function useCurrentLeaderPermissions(organisationId: MaybeRefOrGetter<string>) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['org', 'myPermissions', organisationId] as const,
    queryFn: () =>
      organisationsListMyPermissionsRetrieve({
        path: { url_safe_title: toValue(organisationId) },
      }),
    enabled: () => !!toValue(organisationId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const isController = computed(() => data.value?.data?.is_controller ?? false)
  const isLeader = computed(() => data.value?.data?.is_leader ?? false)

  const leaderPermissions = computed<CurrentLeaderPermission[]>(() => {
    const raw = data.value?.data?.leader_permissions
    if (!Array.isArray(raw)) return []
    return raw as CurrentLeaderPermission[]
  })

  /**
   * Check if the current user can perform an action under a permission code.
   * Controllers always return true. Leaders must have the code assigned AND
   * the corresponding CRUD flag set (if an action is specified).
   */
  function hasLeaderPermission(
    code: LeaderPermissionCode,
    action?: LeaderPermissionCRUDAction,
  ) {
    return computed(() => {
      if (isController.value) return true

      const match = leaderPermissions.value.find(
        (p) => p.permission_code === code,
      )
      if (!match) return false
      if (!action) return true

      switch (action) {
        case 'create': return match.allow_create
        case 'read':   return match.allow_read
        case 'update': return match.allow_update
        case 'delete': return match.allow_delete
        default:       return false
      }
    })
  }

  /** True if user can manage leader assignments and permissions */
  const canManageLeaders = computed(
    () => isController.value || leaderPermissions.value.some(
      (p) => p.permission_code === 'allow_manage_leaders',
    ),
  )

  /** True if user can manage organisation-level settings */
  const canManageOrganisation = computed(
    () => isController.value || leaderPermissions.value.some(
      (p) => p.permission_code === 'allow_manage_organisation',
    ),
  )

  /** True if user can manage policies */
  const canManagePolicy = computed(
    () => isController.value || leaderPermissions.value.some(
      (p) => p.permission_code === 'allow_policy_management',
    ),
  )

  return {
    isController,
    isLeader,
    leaderPermissions,
    isLoading,
    hasLeaderPermission,
    canManageLeaders,
    canManageOrganisation,
    canManagePolicy,
    refresh: refetch,
  }
}
