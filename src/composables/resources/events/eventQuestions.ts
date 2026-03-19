import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventQuestionsList,
  eventQuestionsRetrieve,
  eventQuestionsCreate,
  eventQuestionsUpdate,
  eventQuestionsPartialUpdate,
  eventQuestionsDestroy,
} from '~/api/sdk.gen'
import type {
  EventQuestionsListData,
  EventQuestionsCreateData,
  EventQuestionsUpdateData,
  EventQuestionsPartialUpdateData,
  EventQuestionsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventQuestions'] as const

/**
 * List all event questions
 */
export function useEventQuestions(
  params?: MaybeRefOrGetter<EventQuestionsListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventQuestionsList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Get a single event question by ID
 */
export function useEventQuestion(questionId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', questionId] as const,
    queryFn: () => {
      const id = toValue(questionId)
      return eventQuestionsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(questionId),
  })
}

/**
 * Create a new event question
 */
export function useCreateEventQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventQuestionsCreateData['body']) => eventQuestionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event question (full update)
 */
export function useUpdateEventQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: EventQuestionsUpdateData['body'] }) =>
      eventQuestionsUpdate({ path: { id: String(questionId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.questionId],
      })
    },
  })
}

/**
 * Partially update an existing event question
 */
export function usePartialUpdateEventQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: string; body?: EventQuestionsPartialUpdateData['body'] }) =>
      eventQuestionsPartialUpdate({ path: { id: questionId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.questionId],
      })
    },
  })
}

/**
 * Delete an event question
 */
export function useDeleteEventQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: string) => eventQuestionsDestroy({ path: { id: questionId } }),
    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', questionId],
      })
    },
  })
}
