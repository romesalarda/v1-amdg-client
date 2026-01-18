import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  accessibilityRequirementsList,
  accessibilityRequirementsRetrieve,
  accessibilityRequirementsCreate,
  accessibilityRequirementsUpdate,
  accessibilityRequirementsDestroy,
} from '~/api/sdk.gen'
import type {
  AccessibilityRequirementsListData,
  AccessibilityRequirementsCreateData,
  AccessibilityRequirementsUpdateData,
  AccessibilityRequirementsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['accessibilityRequirements'] as const

/**
 * List all accessibility requirements
 */
export function useAccessibilityRequirements(params?: MaybeRefOrGetter<AccessibilityRequirementsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return accessibilityRequirementsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single accessibility requirement by ID
 */
export function useAccessibilityRequirement(requirementId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', requirementId] as const,
    queryFn: () => {
      const id = toValue(requirementId)
      return accessibilityRequirementsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(requirementId),
  })
}

/**
 * Create a new accessibility requirement
 */
export function useCreateAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AccessibilityRequirementsCreateData['body']) => accessibilityRequirementsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing accessibility requirement
 */
export function useUpdateAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requirementId, body }: { requirementId: number; body: AccessibilityRequirementsUpdateData['body'] }) =>
      accessibilityRequirementsUpdate({ path: { id: requirementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.requirementId],
      })
    },
  })
}

/**
 * Delete an accessibility requirement
 */
export function useDeleteAccessibilityRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requirementId: number) => accessibilityRequirementsDestroy({ path: { id: requirementId } }),
    onSuccess: (_, requirementId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', requirementId],
      })
    },
  })
}
