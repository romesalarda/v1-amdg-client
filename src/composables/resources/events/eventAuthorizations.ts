import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventAuthorizationsList,
  eventAuthorizationsRetrieve,
  eventAuthorizationsCreate,
  eventAuthorizationsUpdate,
  eventAuthorizationsPartialUpdate,
  eventAuthorizationsDestroy,
} from '~/api/sdk.gen'
import type {
  EventAuthorizationsListData,
  EventAuthorizationsCreateData,
  EventAuthorizationsUpdateData,
  EventAuthorizationsPartialUpdateData,
  EventAuthorizationsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventAuthorizations'] as const

/**
 * List all event authorizations
 */
export function useEventAuthorizations(params?: MaybeRefOrGetter<EventAuthorizationsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventAuthorizationsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event authorization by ID
 */
export function useEventAuthorization(authorizationId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', authorizationId] as const,
    queryFn: () => {
      const id = toValue(authorizationId)
      return eventAuthorizationsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(authorizationId),
  })
}

/**
 * Create a new event authorization
 */
export function useCreateEventAuthorization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventAuthorizationsCreateData['body']) => eventAuthorizationsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event authorization (full update)
 */
export function useUpdateEventAuthorization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorizationId, body }: { authorizationId: number; body: EventAuthorizationsUpdateData['body'] }) =>
      eventAuthorizationsUpdate({ path: { id: authorizationId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.authorizationId],
      })
    },
  })
}

/**
 * Partially update an existing event authorization
 */
export function usePartialUpdateEventAuthorization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorizationId, body }: { authorizationId: number; body?: EventAuthorizationsPartialUpdateData['body'] }) =>
      eventAuthorizationsPartialUpdate({ path: { id: authorizationId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.authorizationId],
      })
    },
  })
}

/**
 * Delete an event authorization
 */
export function useDeleteEventAuthorization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (authorizationId: number) => eventAuthorizationsDestroy({ path: { id: authorizationId } }),
    onSuccess: (_, authorizationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', authorizationId],
      })
    },
  })
}
