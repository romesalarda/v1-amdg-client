/**
 * Composables for FloorPlan resources.
 *
 * Calls the nested REST endpoints:
 *   GET/POST  /api/locations/venues/{venueId}/floor-plans/
 *   GET/PUT/PATCH/DELETE  /api/locations/venues/{venueId}/floor-plans/{id}/
 *
 * Uses the shared `client` from api/client.gen so the same auth interceptors
 * (session cookie + token refresh) apply automatically.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { formDataBodySerializer } from '@hey-api/client-axios'
import {
  locationsVenuesFloorPlansList,
  locationsVenuesFloorPlansRetrieve,
  locationsVenuesFloorPlansCreate,
  locationsVenuesFloorPlansPartialUpdate,
  locationsVenuesFloorPlansDestroy,
} from '~/api/sdk.gen'

export interface FloorPlanCreateBody {
  venue: number
  name: string
  level?: number
  level_label?: string
  image: File
}

const QUERY_KEY = ['floorPlans'] as const

// ── Types ──────────────────────────────────────────────────────────────────

export interface FloorPlanListItem {
  id: number
  name: string
  level: number
  level_label: string
  image_url: string | null
  original_width: number
  original_height: number
  venue_name: string
  added_at: string
  updated_at: string
}

export interface FloorPlanAnnotationItem {
  id: number
  floor_plan: number
  room_venue: number | null
  room_venue_name: string | null
  label: string
  colour: string
  vertices: { x: number; y: number }[]
  metadata: { id: number; label: string; value: string; added_by: string | null; added_at: string }[]
  added_by: string | null
  added_at: string
  updated_at: string
}

export interface FloorPlanDetail extends FloorPlanListItem {
  annotations: FloorPlanAnnotationItem[]
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useFloorPlans(venueId: MaybeRefOrGetter<string | number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', venueId] as const,
    queryFn: () =>
      locationsVenuesFloorPlansList({
        path: { venue_pk: Number(toValue(venueId)) },
        query: { page_size: 50 },
      }),
    enabled: () => !!toValue(venueId),
  })
}

export function useFloorPlan(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', venueId, floorPlanId] as const,
    queryFn: () =>
      locationsVenuesFloorPlansRetrieve({
        path: { venue_pk: Number(toValue(venueId)), id: Number(toValue(floorPlanId)) },
      }),
    enabled: () => !!toValue(venueId) && !!toValue(floorPlanId),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateFloorPlan(venueId: MaybeRefOrGetter<string | number>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FloorPlanCreateBody) =>
      locationsVenuesFloorPlansCreate({
        path: { venue_pk: Number(toValue(venueId)) },
        body: body as any,
        // Let formDataBodySerializer build the FormData (with boundary);
        // clear the SDK's hardcoded Content-Type so axios infers multipart.
        bodySerializer: formDataBodySerializer.bodySerializer,
        headers: { 'Content-Type': null as any },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId)] })
    },
  })
}

export function useUpdateFloorPlan(venueId: MaybeRefOrGetter<string | number>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<{ name: string; level: number; level_label: string }> }) =>
      locationsVenuesFloorPlansPartialUpdate({
        path: { venue_pk: Number(toValue(venueId)), id },
        body: body as any,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId)] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', toValue(venueId), variables.id] })
    },
  })
}

export function useDeleteFloorPlan(venueId: MaybeRefOrGetter<string | number>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      locationsVenuesFloorPlansDestroy({
        path: { venue_pk: Number(toValue(venueId)), id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', toValue(venueId)] })
    },
  })
}
