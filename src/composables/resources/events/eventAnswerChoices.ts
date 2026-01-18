import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventAnswerChoicesList,
  eventAnswerChoicesRetrieve,
  eventAnswerChoicesCreate,
  eventAnswerChoicesUpdate,
  eventAnswerChoicesPartialUpdate,
  eventAnswerChoicesDestroy,
} from '~/api/sdk.gen'
import type {
  EventAnswerChoicesListData,
  EventAnswerChoicesCreateData,
  EventAnswerChoicesUpdateData,
  EventAnswerChoicesPartialUpdateData,
  EventAnswerChoicesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventAnswerChoices'] as const

/**
 * List all event question answer choices
 */
export function useEventAnswerChoices(params?: MaybeRefOrGetter<EventAnswerChoicesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventAnswerChoicesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event answer choice by ID
 */
export function useEventAnswerChoice(choiceId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', choiceId] as const,
    queryFn: () => {
      const id = toValue(choiceId)
      return eventAnswerChoicesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(choiceId),
  })
}

/**
 * Create a new event answer choice
 */
export function useCreateEventAnswerChoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventAnswerChoicesCreateData['body']) => eventAnswerChoicesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event answer choice (full update)
 */
export function useUpdateEventAnswerChoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ choiceId, body }: { choiceId: number; body: EventAnswerChoicesUpdateData['body'] }) =>
      eventAnswerChoicesUpdate({ path: { id: choiceId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.choiceId],
      })
    },
  })
}

/**
 * Partially update an existing event answer choice
 */
export function usePartialUpdateEventAnswerChoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ choiceId, body }: { choiceId: number; body?: EventAnswerChoicesPartialUpdateData['body'] }) =>
      eventAnswerChoicesPartialUpdate({ path: { id: choiceId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.choiceId],
      })
    },
  })
}

/**
 * Delete an event answer choice
 */
export function useDeleteEventAnswerChoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (choiceId: number) => eventAnswerChoicesDestroy({ path: { id: choiceId } }),
    onSuccess: (_, choiceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', choiceId],
      })
    },
  })
}
