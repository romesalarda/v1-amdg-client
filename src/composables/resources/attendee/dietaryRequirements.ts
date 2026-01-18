import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  dietaryRequirementsList,
  dietaryRequirementsRetrieve,
  dietaryRequirementsCreate,
  dietaryRequirementsUpdate,
  dietaryRequirementsDestroy,
} from '~/api/sdk.gen'
import type {
  DietaryRequirementsListData,
  DietaryRequirementsCreateData,
  DietaryRequirementsUpdateData,
  DietaryRequirementsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['dietaryRequirements'] as const

/**
 * List all dietary requirements
 */
export function useDietaryRequirements(params?: MaybeRefOrGetter<DietaryRequirementsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return dietaryRequirementsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single dietary requirement by ID
 */
export function useDietaryRequirement(requirementId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', requirementId] as const,
    queryFn: () => {
      const id = toValue(requirementId)
      return dietaryRequirementsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(requirementId),
  })
}

/**
 * Create a new dietary requirement
 */
export function useCreateDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DietaryRequirementsCreateData['body']) => dietaryRequirementsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing dietary requirement
 */
export function useUpdateDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requirementId, body }: { requirementId: number; body: DietaryRequirementsUpdateData['body'] }) =>
      dietaryRequirementsUpdate({ path: { id: requirementId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.requirementId],
      })
    },
  })
}

/**
 * Delete a dietary requirement
 */
export function useDeleteDietaryRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requirementId: number) => dietaryRequirementsDestroy({ path: { id: requirementId } }),
    onSuccess: (_, requirementId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', requirementId],
      })
    },
  })
}
