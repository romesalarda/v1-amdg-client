import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  workshopsInterestSubmissionsList,
  workshopsInterestSubmissionsCreate,
  workshopsInterestSubmissionsRetrieve,
  workshopsInterestSubmissionsPartialUpdate,
  workshopsInterestSubmissionsUpdate,
  workshopsInterestSubmissionsDestroy,
  workshopsInterestSubmissionsFinaliseCreate,
  workshopsInterestSubmissionsUnfinalizeCreate,
} from '~/api/sdk.gen'
import type {
  WorkshopsInterestSubmissionsListData,
  WorkshopsInterestSubmissionsCreateData,
  WorkshopsInterestSubmissionsPartialUpdateData,
  WorkshopsInterestSubmissionsUpdateData,
} from '~/api/types.gen'
import { WORKSHOPS_QUERY_KEY } from './workshops'

const INTEREST_QUERY_KEY = [...WORKSHOPS_QUERY_KEY, 'interest'] as const

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useWorkshopInterestSubmissions(
  params?: MaybeRefOrGetter<WorkshopsInterestSubmissionsListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...INTEREST_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return workshopsInterestSubmissionsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useWorkshopInterestSubmission(submissionId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...INTEREST_QUERY_KEY, 'detail', submissionId] as const,
    queryFn: () => {
      const submission_id = toValue(submissionId)
      return workshopsInterestSubmissionsRetrieve({ path: { submission_id } })
    },
    enabled: () => !!toValue(submissionId),
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateWorkshopInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WorkshopsInterestSubmissionsCreateData['body']) =>
      workshopsInterestSubmissionsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
    },
  })
}

export function useUpdateWorkshopInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      submissionId,
      body,
    }: {
      submissionId: string
      body: WorkshopsInterestSubmissionsUpdateData['body']
    }) =>
      workshopsInterestSubmissionsUpdate({ path: { submission_id: submissionId }, body }),
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INTEREST_QUERY_KEY, 'detail', submissionId],
      })
    },
  })
}

export function usePartialUpdateWorkshopInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      submissionId,
      body,
    }: {
      submissionId: string
      body: WorkshopsInterestSubmissionsPartialUpdateData['body']
    }) =>
      workshopsInterestSubmissionsPartialUpdate({
        path: { submission_id: submissionId },
        body,
      }),
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INTEREST_QUERY_KEY, 'detail', submissionId],
      })
    },
  })
}

export function useDeleteWorkshopInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionId: string) =>
      workshopsInterestSubmissionsDestroy({ path: { submission_id: submissionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
    },
  })
}

export function useFinaliseInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionId: string) =>
      workshopsInterestSubmissionsFinaliseCreate({
        path: { submission_id: submissionId },
        body: {} as any,
      }),
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INTEREST_QUERY_KEY, 'detail', submissionId],
      })
    },
  })
}

export function useUnfinaliseInterestSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionId: string) =>
      workshopsInterestSubmissionsUnfinalizeCreate({
        path: { submission_id: submissionId },
        body: {} as any,
      }),
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({ queryKey: INTEREST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INTEREST_QUERY_KEY, 'detail', submissionId],
      })
    },
  })
}
