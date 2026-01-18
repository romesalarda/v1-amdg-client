import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  guardiansList,
  guardiansRetrieve,
  guardiansCreate,
  guardiansUpdate,
  guardiansPartialUpdate,
  guardiansDestroy,
} from '~/api/sdk.gen'
import type {
  GuardiansListData,
  GuardiansCreateData,
  GuardiansUpdateData,
  GuardiansPartialUpdateData,
  GuardiansDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['guardians'] as const

/**
 * List all guardian relationships
 */
export function useGuardians(params?: MaybeRefOrGetter<GuardiansListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return guardiansList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single guardian relationship by ID
 */
export function useGuardian(guardianId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', guardianId] as const,
    queryFn: () => {
      const id = toValue(guardianId)
      return guardiansRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(guardianId),
  })
}

/**
 * Create a new guardian relationship
 */
export function useCreateGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: GuardiansCreateData['body']) => guardiansCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a guardian relationship (full update)
 */
export function useUpdateGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guardianId, body }: { guardianId: number; body: GuardiansUpdateData['body'] }) =>
      guardiansUpdate({ path: { id: guardianId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.guardianId],
      })
    },
  })
}

/**
 * Partially update a guardian relationship
 */
export function usePartialUpdateGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guardianId, body }: { guardianId: number; body?: GuardiansPartialUpdateData['body'] }) =>
      guardiansPartialUpdate({ path: { id: guardianId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.guardianId],
      })
    },
  })
}

/**
 * Delete a guardian relationship
 */
export function useDeleteGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (guardianId: number) => guardiansDestroy({ path: { id: guardianId } }),
    onSuccess: (_, guardianId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', guardianId],
      })
    },
  })
}
