import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventQuestionAnswersList,
  eventQuestionAnswersRetrieve,
  eventQuestionAnswersCreate,
  eventQuestionAnswersUpdate,
  eventQuestionAnswersPartialUpdate,
  eventQuestionAnswersDestroy,
} from '~/api/sdk.gen'
import type {
  EventQuestionAnswersListData,
  EventQuestionAnswersCreateData,
  EventQuestionAnswersUpdateData,
  EventQuestionAnswersPartialUpdateData,
  EventQuestionAnswersDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventQuestionAnswers'] as const

/**
 * List all event question answers
 */
export function useEventQuestionAnswers(params?: MaybeRefOrGetter<EventQuestionAnswersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventQuestionAnswersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event question answer by ID
 */
export function useEventQuestionAnswer(answerId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', answerId] as const,
    queryFn: () => {
      const id = toValue(answerId)
      return eventQuestionAnswersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(answerId),
  })
}

/**
 * Create a new event question answer
 */
export function useCreateEventQuestionAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventQuestionAnswersCreateData['body']) => eventQuestionAnswersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event question answer (full update)
 */
export function useUpdateEventQuestionAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, body }: { answerId: number; body: EventQuestionAnswersUpdateData['body'] }) =>
      eventQuestionAnswersUpdate({ path: { id: answerId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.answerId],
      })
    },
  })
}

/**
 * Partially update an existing event question answer
 */
export function usePartialUpdateEventQuestionAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, body }: { answerId: number; body?: EventQuestionAnswersPartialUpdateData['body'] }) =>
      eventQuestionAnswersPartialUpdate({ path: { id: answerId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.answerId],
      })
    },
  })
}

/**
 * Delete an event question answer
 */
export function useDeleteEventQuestionAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (answerId: number) => eventQuestionAnswersDestroy({ path: { id: answerId } }),
    onSuccess: (_, answerId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', answerId],
      })
    },
  })
}
