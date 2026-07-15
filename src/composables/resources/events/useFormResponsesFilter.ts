/**
 * Composable for POST /api/event/form-responses/filter/ (advanced filter endpoint).
 *
 * Uses the generated SDK function and types directly so it stays in sync with the schema.
 */
import { useMutation } from '@tanstack/vue-query'
import { eventFormResponsesFilterCreate } from '~/api/sdk.gen'
import type {
  FormResponseFilterRequestRequest,
  FormResponseQuestionFilterRequest,
  DemographicsFilterRequest,
  StatusFilterRequest,
  EventFormResponse,
} from '~/api/types.gen'

// Re-export generated types so consumers can import them from one place
export type {
  FormResponseFilterRequestRequest,
  FormResponseQuestionFilterRequest,
  DemographicsFilterRequest,
  StatusFilterRequest,
}

// ── Response shape (backend returns a custom paginated dict, not the DRF page model) ──

export interface FormResponseFilterResult {
  count: number
  total_pages: number
  page: number
  page_size: number
  results: EventFormResponse[]
}

// ── Composable ────────────────────────────────────────────────────────────────

export function useFormResponsesFilterPost() {
  return useMutation({
    mutationFn: async (body: FormResponseFilterRequestRequest): Promise<FormResponseFilterResult> => {
      const res = await eventFormResponsesFilterCreate({ body })
      // The SDK types the response as `unknown` since the schema has a generic 200
      return res.data as FormResponseFilterResult
    },
  })
}

// ── Active filter count helper ────────────────────────────────────────────────

export interface FormResponseAdvancedFilters {
  demographics?: DemographicsFilterRequest
  status?: StatusFilterRequest
  question_filter?: FormResponseQuestionFilterRequest
}

export function countActiveAdvancedFilters(filters: FormResponseAdvancedFilters): number {
  let count = 0
  const d = filters.demographics
  const s = filters.status
  const qf = filters.question_filter

  if (d) {
    if (d.gender) count++
    if (d.age_min != null || d.age_max != null) count++
    if (d.is_minor != null) count++
    if ((d.organisation ?? []).length) count++
    if (
      (d.area_from ?? []).length ||
      (d.chapter_from ?? []).length ||
      (d.cluster_from ?? []).length ||
      (d.country_from ?? []).length
    ) count++
    if (d.has_dietary_requirements != null || (d.dietary_requirement ?? []).length) count++
    if (d.has_medical_conditions != null || (d.medical_condition ?? []).length) count++
    if (d.has_accessibility_requirements != null || (d.accessibility_requirement ?? []).length) count++
  }

  if (s) {
    if (s.is_checked_in != null) count++
    if (s.is_registered != null) count++
    if (s.is_cancelled != null) count++
    if (s.is_staff != null) count++
  }

  if (qf) count += (qf.conditions ?? []).length

  return count
}

export function hasActiveAdvancedFilters(filters: FormResponseAdvancedFilters): boolean {
  return countActiveAdvancedFilters(filters) > 0
}

export function makeEmptyAdvancedFilters(): FormResponseAdvancedFilters {
  return { demographics: {}, status: {}, question_filter: { operator: 'AND', conditions: [] } }
}
