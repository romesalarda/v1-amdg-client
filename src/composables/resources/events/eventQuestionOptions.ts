import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventQuestionOptionsList,
  eventQuestionOptionsRetrieve,
  eventQuestionOptionsCreate,
  eventQuestionOptionsUpdate,
  eventQuestionOptionsPartialUpdate,
  eventQuestionOptionsDestroy,
} from '~/api/sdk.gen'
import type {
  EventQuestionOptionsListData,
  EventQuestionOptionsCreateData,
  EventQuestionOptionsUpdateData,
  EventQuestionOptionsPartialUpdateData,
  EventQuestionOptionsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventQuestionOptions'] as const

/**
 * List all event question options
 */
export function useEventQuestionOptions(params?: MaybeRefOrGetter<EventQuestionOptionsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventQuestionOptionsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event question option by ID
 */
export function useEventQuestionOption(optionId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', optionId] as const,
    queryFn: () => {
      const id = toValue(optionId)
      return eventQuestionOptionsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(optionId),
  })
}

/**
 * Create a new event question option
 */
export function useCreateEventQuestionOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventQuestionOptionsCreateData['body']) => eventQuestionOptionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event question option (full update)
 */
export function useUpdateEventQuestionOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ optionId, body }: { optionId: number; body: EventQuestionOptionsUpdateData['body'] }) =>
      eventQuestionOptionsUpdate({ path: { id: optionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.optionId],
      })
    },
  })
}

/**
 * Partially update an existing event question option
 */
export function usePartialUpdateEventQuestionOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ optionId, body }: { optionId: number; body?: EventQuestionOptionsPartialUpdateData['body'] }) =>
      eventQuestionOptionsPartialUpdate({ path: { id: optionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.optionId],
      })
    },
  })
}

/**
 * Delete an event question option
 */
export function useDeleteEventQuestionOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (optionId: number) => eventQuestionOptionsDestroy({ path: { id: optionId } }),
    onSuccess: (_, optionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', optionId],
      })
    },
  })
}
