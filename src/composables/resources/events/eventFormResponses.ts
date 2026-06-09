import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventFormResponsesList,
  eventFormResponsesCreate,
  eventFormResponsesPartialUpdate,
  eventFormResponseAnswersList,
  eventFormResponseAnswersCreate,
  eventFormResponseAnswersPartialUpdate,
  eventFormResponseAnswersDestroy,
} from '~/api/sdk.gen'
import type {
  EventFormResponsesListData,
  EventFormResponsesCreateData,
  EventFormResponsesPartialUpdateData,
  EventFormResponseAnswersListData,
  EventFormResponseAnswersCreateData,
  EventFormResponseAnswersPartialUpdateData,
} from '~/api/types.gen'

const FORM_RESPONSES_KEY = ['eventFormResponses'] as const
const FORM_RESPONSE_ANSWERS_KEY = ['eventFormResponseAnswers'] as const

/**
 * List form responses, optionally filtered by form, attendee, or completion status.
 */
export function useEventFormResponses(
  params?: MaybeRefOrGetter<EventFormResponsesListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...FORM_RESPONSES_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventFormResponsesList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Create a new form response (starts the response for an attendee).
 */
export function useCreateEventFormResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventFormResponsesCreateData['body']) =>
      eventFormResponsesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSES_KEY })
    },
  })
}

/**
 * Partially update a form response (e.g. mark as complete).
 */
export function useUpdateEventFormResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ responseId, body }: { responseId: string; body: EventFormResponsesPartialUpdateData['body'] }) =>
      eventFormResponsesPartialUpdate({ path: { id: responseId }, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSES_KEY })
    },
  })
}

/**
 * List answers for a specific response.
 */
export function useEventFormResponseAnswers(
  params?: MaybeRefOrGetter<EventFormResponseAnswersListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...FORM_RESPONSE_ANSWERS_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventFormResponseAnswersList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Create an answer for a question within a response.
 */
export function useCreateEventFormResponseAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventFormResponseAnswersCreateData['body']) =>
      eventFormResponseAnswersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSE_ANSWERS_KEY })
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSES_KEY })
    },
  })
}

/**
 * Partially update an answer (e.g. change text or choices).
 */
export function useUpdateEventFormResponseAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ answerId, body }: { answerId: string; body: EventFormResponseAnswersPartialUpdateData['body'] }) =>
      eventFormResponseAnswersPartialUpdate({ path: { id: answerId }, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSE_ANSWERS_KEY })
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSES_KEY })
    },
  })
}

/**
 * Delete an answer.
 */
export function useDeleteEventFormResponseAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (answerId: string) =>
      eventFormResponseAnswersDestroy({ path: { id: answerId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSE_ANSWERS_KEY })
      queryClient.invalidateQueries({ queryKey: FORM_RESPONSES_KEY })
    },
  })
}
