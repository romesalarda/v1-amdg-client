import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventFormsList,
  eventFormsCreate,
  eventFormsDestroy,
  eventFormsRetrieve,
  eventFormsPartialUpdate,
  eventFormsUpdate,
  eventFormsBulkCreateQuestionsCreate,
  eventFormsCloseCreate,
  eventFormsPublishCreate,
  eventFormsReorderQuestionsCreate,
  eventFormQuestionsList,
  eventFormQuestionsCreate,
  eventFormQuestionsDestroy,
  eventFormQuestionsRetrieve,
  eventFormQuestionsPartialUpdate,
  eventFormQuestionsUpdate,
} from '~/api/sdk.gen'
import type {
  EventFormsListData,
  EventFormsCreateData,
  EventFormsDestroyData,
  EventFormsRetrieveData,
  EventFormsPartialUpdateData,
  EventFormsUpdateData,
  EventFormsBulkCreateQuestionsCreateData,
  EventFormsCloseCreateData,
  EventFormsPublishCreateData,
  EventFormsReorderQuestionsCreateData,
  EventFormQuestionsListData,
  EventFormQuestionsCreateData,
  EventFormQuestionsDestroyData,
  EventFormQuestionsRetrieveData,
  EventFormQuestionsPartialUpdateData,
  EventFormQuestionsUpdateData,
} from '~/api/types.gen'

const FORMS_QUERY_KEY = ['eventForms'] as const
const QUESTIONS_QUERY_KEY = ['eventFormQuestions'] as const

/**
 * List all forms for an event
 */
export function useEventForms(
  params?: MaybeRefOrGetter<EventFormsListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...FORMS_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventFormsList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Get details of a single form
 */
export function useEventForm(formId: MaybeRefOrGetter<string>, options?: { enabled?: MaybeRefOrGetter<boolean> }) {
  return useQuery({
    queryKey: [...FORMS_QUERY_KEY, 'detail', formId] as const,
    queryFn: () => {
      const id = toValue(formId)
      return eventFormsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(formId) && (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Create a new form
 */
export function useCreateEventForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventFormsCreateData['body']) => eventFormsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
    },
  })
}

/**
 * Update an existing form
 */
export function useUpdateEventForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, body }: { formId: string; body: EventFormsPartialUpdateData['body'] }) =>
      eventFormsPartialUpdate({ path: { id: formId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', variables.formId],
      })
    },
  })
}

/**
 * Delete a form
 */
export function useDeleteEventForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formId: string) => eventFormsDestroy({ path: { id: formId } }),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', formId],
      })
    },
  })
}

/**
 * Publish a form
 */
export function usePublishEventForm() {
  const queryClient = useQueryClient()

  return useMutation({
    // Publish is an action endpoint — body is not required by the backend.
    // The SDK incorrectly generates `body: EventFormRequest` for it, so we cast.
    mutationFn: (formId: string) =>
      eventFormsPublishCreate({ path: { id: formId }, body: {} as any }),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', formId],
      })
    },
  })
}

/**
 * Close a form
 */
export function useCloseEventForm() {
  const queryClient = useQueryClient()

  return useMutation({
    // Close is an action endpoint — body is not required by the backend.
    // The SDK incorrectly generates `body: EventFormRequest` for it, so we cast.
    mutationFn: (formId: string) =>
      eventFormsCloseCreate({ path: { id: formId }, body: {} as any }),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', formId],
      })
    },
  })
}

/**
 * Bulk create questions for a form
 */
export function useBulkCreateEventFormQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, body }: { formId: string; body: EventFormsBulkCreateQuestionsCreateData['body'] }) =>
      eventFormsBulkCreateQuestionsCreate({ path: { id: formId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', variables.formId],
      })
    },
  })
}

/**
 * Reorder questions for a form
 */
export function useReorderEventFormQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, body }: { formId: string; body: EventFormsReorderQuestionsCreateData['body'] }) =>
      eventFormsReorderQuestionsCreate({ path: { id: formId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...FORMS_QUERY_KEY, 'detail', variables.formId],
      })
    },
  })
}

/**
 * List all questions for a specific form
 */
export function useEventFormQuestions(
  params?: MaybeRefOrGetter<EventFormQuestionsListData['query'] | undefined>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: [...QUESTIONS_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventFormQuestionsList(queryParams ? { query: queryParams } : undefined)
    },
    enabled: () => (options?.enabled ? toValue(options.enabled) : true),
  })
}

/**
 * Create a new form question
 */
export function useCreateEventFormQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventFormQuestionsCreateData['body']) => eventFormQuestionsCreate({ body }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })
      if (response.data?.form) {
        queryClient.invalidateQueries({
          queryKey: [...FORMS_QUERY_KEY, 'detail', response.data.form],
        })
      }
    },
  })
}

/**
 * Partially update a form question
 */
export function useUpdateEventFormQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: EventFormQuestionsPartialUpdateData['body'] }) =>
      eventFormQuestionsPartialUpdate({ path: { id: questionId }, body }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, 'detail', variables.questionId],
      })
      if (response.data?.form) {
        queryClient.invalidateQueries({
          queryKey: [...FORMS_QUERY_KEY, 'detail', response.data.form],
        })
      }
    },
  })
}

/**
 * Delete a form question
 */
export function useDeleteEventFormQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, formId }: { questionId: number; formId?: string }) =>
      eventFormQuestionsDestroy({ path: { id: questionId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, 'detail', variables.questionId],
      })
      if (variables.formId) {
        queryClient.invalidateQueries({
          queryKey: [...FORMS_QUERY_KEY, 'detail', variables.formId],
        })
      }
    },
  })
}
