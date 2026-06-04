/**
 * Composables for FloorPlan resources scoped to an EventVenue (UUID).
 *
 * Calls the nested REST endpoints:
 *   GET/POST  /api/event/event-venues/{eventVenueId}/floor-plans/
 *   GET/PUT/PATCH/DELETE  /api/event/event-venues/{eventVenueId}/floor-plans/{id}/
 *
 * The eventVenueId is the UUID primary key of the EventVenue record.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { formDataBodySerializer } from '@hey-api/client-axios'
import {
  eventEventVenuesFloorPlansList,
  eventEventVenuesFloorPlansRetrieve,
  eventEventVenuesFloorPlansCreate,
  eventEventVenuesFloorPlansPartialUpdate,
  eventEventVenuesFloorPlansDestroy,
} from '~/api/sdk.gen'
import type { FloorPlanListItem, FloorPlanDetail, FloorPlanAnnotationItem } from './floorPlans'

export type { FloorPlanListItem, FloorPlanDetail, FloorPlanAnnotationItem }

export interface EventVenueFloorPlanCreateBody {
  name: string
  level?: number
  level_label?: string
  image: File
  /** Optional override — resolved automatically from event_venue.source_venue_id if omitted */
  venue?: number
}

const QUERY_KEY = ['eventVenueFloorPlans'] as const

// ── Queries ────────────────────────────────────────────────────────────────

export function useEventVenueFloorPlans(eventVenueId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventVenueId] as const,
    queryFn: () =>
      eventEventVenuesFloorPlansList({
        path: { event_venue_pk: toValue(eventVenueId) },
        query: { page_size: 50 },
      }),
    enabled: () => !!toValue(eventVenueId),
  })
}

export function useEventVenueFloorPlan(
  eventVenueId: MaybeRefOrGetter<string>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', eventVenueId, floorPlanId] as const,
    queryFn: () =>
      eventEventVenuesFloorPlansRetrieve({
        path: { event_venue_pk: toValue(eventVenueId), id: Number(toValue(floorPlanId)) },
      }),
    enabled: () => !!toValue(eventVenueId) && !!toValue(floorPlanId),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateEventVenueFloorPlan(eventVenueId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: EventVenueFloorPlanCreateBody) =>
      eventEventVenuesFloorPlansCreate({
        path: { event_venue_pk: toValue(eventVenueId) },
        body: body as any,
        bodySerializer: formDataBodySerializer.bodySerializer,
        headers: { 'Content-Type': null as any },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId)] })
    },
  })
}

export function useUpdateEventVenueFloorPlan(eventVenueId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<{ name: string; level: number; level_label: string }> }) =>
      eventEventVenuesFloorPlansPartialUpdate({
        path: { event_venue_pk: toValue(eventVenueId), id },
        body: body as any,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId)] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', toValue(eventVenueId), variables.id] })
    },
  })
}

export function useDeleteEventVenueFloorPlan(eventVenueId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      eventEventVenuesFloorPlansDestroy({
        path: { event_venue_pk: toValue(eventVenueId), id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(eventVenueId)] })
    },
  })
}
