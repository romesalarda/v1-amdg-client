import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  familyAttendeesList,
  familyAttendeesRetrieve,
  familyAttendeesCreate,
  familyAttendeesUpdate,
  familyAttendeesPartialUpdate,
  familyAttendeesDestroy,
} from '~/api/sdk.gen'
import type {
  FamilyAttendeesListData,
  FamilyAttendeesCreateData,
  FamilyAttendeesUpdateData,
  FamilyAttendeesPartialUpdateData,
  FamilyAttendeesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['familyAttendees'] as const

/**
 * List all family attendee memberships
 */
export function useFamilyAttendees(params?: MaybeRefOrGetter<FamilyAttendeesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return familyAttendeesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single family attendee membership by ID
 */
export function useFamilyAttendee(membershipId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', membershipId] as const,
    queryFn: () => {
      const id = toValue(membershipId)
      return familyAttendeesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(membershipId),
  })
}

/**
 * Add an attendee to a family
 */
export function useCreateFamilyAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: FamilyAttendeesCreateData['body']) => familyAttendeesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a family attendee membership (full update)
 */
export function useUpdateFamilyAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ membershipId, body }: { membershipId: number; body: FamilyAttendeesUpdateData['body'] }) =>
      familyAttendeesUpdate({ path: { id: membershipId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.membershipId],
      })
    },
  })
}

/**
 * Partially update a family attendee membership
 */
export function usePartialUpdateFamilyAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ membershipId, body }: { membershipId: number; body?: FamilyAttendeesPartialUpdateData['body'] }) =>
      familyAttendeesPartialUpdate({ path: { id: membershipId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.membershipId],
      })
    },
  })
}

/**
 * Remove an attendee from a family
 */
export function useDeleteFamilyAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: number) => familyAttendeesDestroy({ path: { id: membershipId } }),
    onSuccess: (_, membershipId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', membershipId],
      })
    },
  })
}
