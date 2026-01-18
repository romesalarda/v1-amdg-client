import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  familyGroupsList,
  familyGroupsRetrieve,
  familyGroupsCreate,
  familyGroupsUpdate,
  familyGroupsPartialUpdate,
  familyGroupsDestroy,
  familyGroupsMembersList,
} from '~/api/sdk.gen'
import type {
  FamilyGroupsListData,
  FamilyGroupsCreateData,
  FamilyGroupsUpdateData,
  FamilyGroupsPartialUpdateData,
  FamilyGroupsDestroyData,
  FamilyGroupsMembersListData,
} from '~/api/types.gen'

const QUERY_KEY = ['familyGroups'] as const

/**
 * List all family groups
 */
export function useFamilyGroups(params?: MaybeRefOrGetter<FamilyGroupsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return familyGroupsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single family group by ID
 */
export function useFamilyGroup(groupId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', groupId] as const,
    queryFn: () => {
      const id = toValue(groupId)
      return familyGroupsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(groupId),
  })
}

/**
 * Get members of a family group
 */
export function useFamilyGroupMembers(groupId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'members', groupId] as const,
    queryFn: () => {
      const id = toValue(groupId)
      return familyGroupsMembersList({ path: { id } })
    },
    enabled: () => !!toValue(groupId),
  })
}

/**
 * Create a new family group
 */
export function useCreateFamilyGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: FamilyGroupsCreateData['body']) => familyGroupsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a family group (full update)
 */
export function useUpdateFamilyGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: number; body: FamilyGroupsUpdateData['body'] }) =>
      familyGroupsUpdate({ path: { id: groupId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.groupId],
      })
    },
  })
}

/**
 * Partially update a family group
 */
export function usePartialUpdateFamilyGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: number; body?: FamilyGroupsPartialUpdateData['body'] }) =>
      familyGroupsPartialUpdate({ path: { id: groupId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.groupId],
      })
    },
  })
}

/**
 * Delete a family group
 */
export function useDeleteFamilyGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => familyGroupsDestroy({ path: { id: groupId } }),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', groupId],
      })
    },
  })
}
