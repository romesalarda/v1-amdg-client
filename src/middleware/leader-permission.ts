/**
 * Leader Permission Middleware
 *
 * Enforces organisation-level leader access control using route meta configuration.
 * Allows through: controllers unconditionally, or leaders who hold the required
 * permission code.
 *
 * Usage in pages:
 * ```ts
 * definePageMeta({
 *   middleware: ['auth', 'leader-permission'],
 *   leaderPermission: {
 *     code: 'allow_policy_management',
 *   }
 * })
 * ```
 *
 * If no `leaderPermission` meta is set, the middleware simply passes through.
 * This allows the middleware to be used as a drop-in replacement for
 * organisation-controller on pages that also need granular permission checks.
 */

import { organisationsListMyPermissionsRetrieve } from '~/api/sdk.gen'
import type { LeaderPermissionCode } from '~/composables/permissions/useCurrentLeaderPermissions'
import type { QueryClient } from '@tanstack/vue-query'

interface LeaderPermissionMeta {
  /** The permission code the leader must hold (controllers bypass this). */
  code: LeaderPermissionCode
}

export default defineNuxtRouteMiddleware(async (to) => {
  const permissionMeta = to.meta.leaderPermission as LeaderPermissionMeta | undefined

  const orgId = to.params.id as string | undefined

  if (!orgId) {
    console.error('[leader-permission] No organisation ID found in route params')
    return navigateTo('/403')
  }

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  try {
    const { $queryClient } = useNuxtApp()
    const queryKey = ['org', 'myPermissions', orgId]

    // Use cached data if available to avoid a redundant network request
    let permData = ($queryClient as QueryClient | undefined)?.getQueryData(queryKey) as any

    if (!permData) {
      const response = await organisationsListMyPermissionsRetrieve({
        path: { url_safe_title: orgId },
      })
      permData = response.data

      if ($queryClient) {
        ($queryClient as QueryClient).setQueryData(queryKey, permData)
      }
    }

    const isController: boolean = permData?.is_controller ?? false
    const isLeader: boolean = permData?.is_leader ?? false

    // Controllers always have access
    if (isController) return

    // If no specific permission code is required, any leader can access
    if (!permissionMeta) {
      if (isLeader) return
      return navigateTo('/403')
    }

    // For pages with a specific permission code, check the leader's grants
    const leaderPermissions: Array<{ permission_code: string }> =
      permData?.leader_permissions ?? []

    const hasRequiredPermission = leaderPermissions.some(
      (p) => p.permission_code === permissionMeta.code,
    )

    if (!isLeader || !hasRequiredPermission) {
      return navigateTo('/403')
    }
  }
  catch (error) {
    console.error('[leader-permission] Permission check failed:', error)
    return navigateTo('/403')
  }
})
