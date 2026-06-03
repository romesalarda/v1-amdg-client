/**
 * Composables for FloorPlanAnnotation resources.
 *
 * Calls the nested REST endpoints:
 *   GET/POST  /api/locations/venues/{venueId}/floor-plans/{floorPlanId}/annotations/
 *   GET/PUT/PATCH/DELETE  .../annotations/{id}/
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsVenuesFloorPlansAnnotationsList,
  locationsVenuesFloorPlansAnnotationsCreate,
  locationsVenuesFloorPlansAnnotationsPartialUpdate,
  locationsVenuesFloorPlansAnnotationsDestroy,
} from '~/api/sdk.gen'
import type { FloorPlanAnnotationItem } from './floorPlans'

const QUERY_KEY = ['floorPlanAnnotations'] as const

// ── Types ──────────────────────────────────────────────────────────────────

export interface AnnotationCreateBody {
  room_venue?: number | null
  label: string
  colour?: string
  vertices: { x: number; y: number }[]
  metadata_write?: { label: string; value: string }[]
}

export interface AnnotationUpdateBody extends Partial<AnnotationCreateBody> {}

// ── Queries ────────────────────────────────────────────────────────────────

export function useFloorPlanAnnotations(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', venueId, floorPlanId] as const,
    queryFn: () =>
      locationsVenuesFloorPlansAnnotationsList({
        path: { venue_pk: Number(toValue(venueId)), floor_plan_pk: Number(toValue(floorPlanId)) },
        query: { page_size: 200 },
      }),
    enabled: () => !!toValue(venueId) && !!toValue(floorPlanId),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateFloorPlanAnnotation(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AnnotationCreateBody) =>
      locationsVenuesFloorPlansAnnotationsCreate({
        path: { venue_pk: Number(toValue(venueId)), floor_plan_pk: Number(toValue(floorPlanId)) },
        body: body as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['floorPlans', 'detail', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}

export function useUpdateFloorPlanAnnotation(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AnnotationUpdateBody }) =>
      locationsVenuesFloorPlansAnnotationsPartialUpdate({
        path: { venue_pk: Number(toValue(venueId)), floor_plan_pk: Number(toValue(floorPlanId)), id },
        body: body as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['floorPlans', 'detail', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}

export function useDeleteFloorPlanAnnotation(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      locationsVenuesFloorPlansAnnotationsDestroy({
        path: { venue_pk: Number(toValue(venueId)), floor_plan_pk: Number(toValue(floorPlanId)), id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId), toValue(floorPlanId)] })
      queryClient.invalidateQueries({ queryKey: ['floorPlans', 'detail', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}
