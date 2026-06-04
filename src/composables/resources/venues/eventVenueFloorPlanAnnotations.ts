/**
 * Composables for FloorPlanAnnotation resources scoped to an EventVenue (UUID).
 *
 * Calls the nested REST endpoints:
 *   GET/POST  /api/event/event-venues/{eventVenueId}/floor-plans/{floorPlanId}/annotations/
 *   GET/PUT/PATCH/DELETE  .../annotations/{id}/
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventEventVenuesFloorPlansAnnotationsList,
  eventEventVenuesFloorPlansAnnotationsCreate,
  eventEventVenuesFloorPlansAnnotationsPartialUpdate,
  eventEventVenuesFloorPlansAnnotationsDestroy,
} from '~/api/sdk.gen'
import type { FloorPlanAnnotationItem } from './floorPlans'
import type { AnnotationCreateBody, AnnotationUpdateBody } from './floorPlanAnnotations'

export type { AnnotationCreateBody, AnnotationUpdateBody }

const QUERY_KEY = ['eventVenueFloorPlanAnnotations'] as const

// ── Queries ────────────────────────────────────────────────────────────────

export function useEventVenueFloorPlanAnnotations(
  eventVenueId: MaybeRefOrGetter<string>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventVenueId, floorPlanId] as const,
    queryFn: () =>
      eventEventVenuesFloorPlansAnnotationsList({
        path: { event_venue_pk: toValue(eventVenueId), floor_plan_pk: Number(toValue(floorPlanId)) },
        query: { page_size: 200 },
      }),
    enabled: () => !!toValue(eventVenueId) && !!toValue(floorPlanId),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateEventVenueFloorPlanAnnotation(
  eventVenueId: MaybeRefOrGetter<string>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AnnotationCreateBody) =>
      eventEventVenuesFloorPlansAnnotationsCreate({
        path: { event_venue_pk: toValue(eventVenueId), floor_plan_pk: Number(toValue(floorPlanId)) },
        body: body as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['eventVenueFloorPlans', 'detail', toValue(eventVenueId), toValue(floorPlanId)] })
    },
  })
}

export function useUpdateEventVenueFloorPlanAnnotation(
  eventVenueId: MaybeRefOrGetter<string>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AnnotationUpdateBody }) =>
      eventEventVenuesFloorPlansAnnotationsPartialUpdate({
        path: { event_venue_pk: toValue(eventVenueId), floor_plan_pk: Number(toValue(floorPlanId)), id },
        body: body as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['eventVenueFloorPlans', 'detail', toValue(eventVenueId), toValue(floorPlanId)] })
    },
  })
}

export function useDeleteEventVenueFloorPlanAnnotation(
  eventVenueId: MaybeRefOrGetter<string>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      eventEventVenuesFloorPlansAnnotationsDestroy({
        path: { event_venue_pk: toValue(eventVenueId), floor_plan_pk: Number(toValue(floorPlanId)), id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['eventVenueFloorPlans', 'detail', toValue(eventVenueId), toValue(floorPlanId)] })
    },
  })
}
