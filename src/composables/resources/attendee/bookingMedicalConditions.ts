import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  medicalConditionsList,
  medicalConditionsRetrieve,
  medicalConditionsCreate,
  medicalConditionsUpdate,
  medicalConditionsPartialUpdate,
  medicalConditionsDestroy,
} from '~/api/sdk.gen'
import type {
  MedicalConditionsListData,
  MedicalConditionsCreateData,
  MedicalConditionsUpdateData,
  MedicalConditionsPartialUpdateData,
  MedicalConditionsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['medicalConditions'] as const

/**
 * List all medical conditions
 */
export function useMedicalConditions(params?: MaybeRefOrGetter<MedicalConditionsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return medicalConditionsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single medical condition by ID
 */
export function useMedicalCondition(conditionId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', conditionId] as const,
    queryFn: () => {
      const id = toValue(conditionId)
      return medicalConditionsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(conditionId),
  })
}

/**
 * Create a new medical condition
 */
export function useCreateMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: MedicalConditionsCreateData['body']) => medicalConditionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing medical condition (full update)
 */
export function useUpdateMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conditionId, body }: { conditionId: number; body: MedicalConditionsUpdateData['body'] }) =>
      medicalConditionsUpdate({ path: { id: conditionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.conditionId],
      })
    },
  })
}

/**
 * Partially update an existing medical condition
 */
export function usePartialUpdateMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conditionId, body }: { conditionId: number; body?: MedicalConditionsPartialUpdateData['body'] }) =>
      medicalConditionsPartialUpdate({ path: { id: conditionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.conditionId],
      })
    },
  })
}

/**
 * Delete a medical condition
 */
export function useDeleteMedicalCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conditionId: number) => medicalConditionsDestroy({ path: { id: conditionId } }),
    onSuccess: (_, conditionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', conditionId],
      })
    },
  })
}
