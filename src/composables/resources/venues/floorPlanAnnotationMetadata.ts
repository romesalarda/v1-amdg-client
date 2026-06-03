/**
 * Composables for FloorPlanAnnotationMetadata resources.
 *
 * Calls the deeply nested REST endpoints:
 *   GET/POST  .../annotations/{annotationId}/metadata/
 *   GET/PUT/PATCH/DELETE  .../annotations/{annotationId}/metadata/{id}/
 */
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  locationsVenuesFloorPlansAnnotationsMetadataCreate,
  locationsVenuesFloorPlansAnnotationsMetadataPartialUpdate,
  locationsVenuesFloorPlansAnnotationsMetadataDestroy,
} from '~/api/sdk.gen'

export interface AnnotationMetadataBody {
  label: string
  value?: string
}

export function useCreateAnnotationMetadata(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
  annotationId: MaybeRefOrGetter<number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AnnotationMetadataBody) =>
      locationsVenuesFloorPlansAnnotationsMetadataCreate({
        path: {
          venue_pk: Number(toValue(venueId)),
          floor_plan_pk: Number(toValue(floorPlanId)),
          annotation_pk: Number(toValue(annotationId)),
        },
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlanAnnotations', 'list', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}

export function useUpdateAnnotationMetadata(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
  annotationId: MaybeRefOrGetter<number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<AnnotationMetadataBody> }) =>
      locationsVenuesFloorPlansAnnotationsMetadataPartialUpdate({
        path: {
          venue_pk: Number(toValue(venueId)),
          floor_plan_pk: Number(toValue(floorPlanId)),
          annotation_pk: Number(toValue(annotationId)),
          id,
        },
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlanAnnotations', 'list', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}

export function useDeleteAnnotationMetadata(
  venueId: MaybeRefOrGetter<string | number>,
  floorPlanId: MaybeRefOrGetter<string | number>,
  annotationId: MaybeRefOrGetter<number>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      locationsVenuesFloorPlansAnnotationsMetadataDestroy({
        path: {
          venue_pk: Number(toValue(venueId)),
          floor_plan_pk: Number(toValue(floorPlanId)),
          annotation_pk: Number(toValue(annotationId)),
          id,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlanAnnotations', 'list', toValue(venueId), toValue(floorPlanId)] })
    },
  })
}
