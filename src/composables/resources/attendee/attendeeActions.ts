import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  actionsList,
  actionsRetrieve,
  actionsCreate,
} from '~/api/sdk.gen'
import type {
  ActionsListData,
  ActionsCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['attendeeActions'] as const

/**
 * List all attendee actions
 */
export function useAttendeeActions(params?: MaybeRefOrGetter<ActionsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return actionsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single attendee action by ID
 */
export function useAttendeeAction(actionId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', actionId] as const,
    queryFn: () => {
      const id = toValue(actionId)
      return actionsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(actionId),
  })
}

/**
 * Create a new attendee action
 */
export function useCreateAttendeeAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ActionsCreateData['body']) => actionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
