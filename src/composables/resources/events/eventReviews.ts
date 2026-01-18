import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventReviewsList,
  eventReviewsRetrieve,
  eventReviewsCreate,
  eventReviewsUpdate,
  eventReviewsPartialUpdate,
  eventReviewsDestroy,
  eventReviewsApproveCreate,
} from '~/api/sdk.gen'
import type {
  EventReviewsListData,
  EventReviewsCreateData,
  EventReviewsUpdateData,
  EventReviewsPartialUpdateData,
  EventReviewsDestroyData,
  EventReviewsApproveCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventReviews'] as const

/**
 * List all event reviews
 */
export function useEventReviews(params?: MaybeRefOrGetter<EventReviewsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventReviewsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single event review by ID
 */
export function useEventReview(reviewId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', reviewId] as const,
    queryFn: () => {
      const id = toValue(reviewId)
      return eventReviewsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(reviewId),
  })
}

/**
 * Create a new event review
 */
export function useCreateEventReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventReviewsCreateData['body']) => eventReviewsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing event review (full update)
 */
export function useUpdateEventReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: EventReviewsUpdateData['body'] }) =>
      eventReviewsUpdate({ path: { id: reviewId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.reviewId],
      })
    },
  })
}

/**
 * Partially update an existing event review
 */
export function usePartialUpdateEventReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body?: EventReviewsPartialUpdateData['body'] }) =>
      eventReviewsPartialUpdate({ path: { id: reviewId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.reviewId],
      })
    },
  })
}

/**
 * Delete an event review
 */
export function useDeleteEventReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: number) => eventReviewsDestroy({ path: { id: reviewId } }),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', reviewId],
      })
    },
  })
}

/**
 * Approve an event review
 */
export function useApproveEventReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: EventReviewsApproveCreateData['body'] }) =>
      eventReviewsApproveCreate({ path: { id: reviewId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.reviewId],
      })
    },
  })
}
