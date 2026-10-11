import { useMutation } from '@tanstack/vue-query'
import { bookingsPersonalInfoCheck } from '~/api/sdk.gen'
import type { AttendeeDraft } from '~/stores/registration'
import { buildAttendeeDraft } from './checkout'

export type PersonalInfoCheckIssue = {
  attendee_index: number
  category: string
  item_id: number | null
  errors: unknown
}

export type PersonalInfoCheckResult = {
  valid: boolean
  issues: PersonalInfoCheckIssue[]
}

const CATEGORY_LABELS: Record<string, string> = {
  dietary_requirements: 'Dietary requirement',
  medical_conditions: 'Medical condition',
  accessibility_requirements: 'Accessibility requirement',
}

const isCheckResult = (value: unknown): value is PersonalInfoCheckResult => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.valid === 'boolean' && Array.isArray(record.issues)
}

export const extractPersonalInfoCheckResult = (source: unknown): PersonalInfoCheckResult | undefined => {
  const input = source as Record<string, unknown> | undefined
  for (const candidate of [source, input?.data, input?.error]) {
    if (isCheckResult(candidate)) return candidate
  }
  return undefined
}

const flattenErrors = (errors: unknown): string[] => {
  if (typeof errors === 'string') return [errors]
  if (Array.isArray(errors)) return errors.flatMap(flattenErrors)
  if (errors && typeof errors === 'object') return Object.values(errors).flatMap(flattenErrors)
  return []
}

export const formatPersonalInfoIssue = (
  issue: PersonalInfoCheckIssue,
  labelFor?: (category: string, itemId: number | null) => string | undefined,
): string => {
  const base = labelFor?.(issue.category, issue.item_id) || CATEGORY_LABELS[issue.category] || 'Personal information'
  const detail = flattenErrors(issue.errors)[0] || 'Please check this entry.'
  return `${base}: ${detail}`
}

export function usePersonalInfoCheck() {
  return useMutation({
    mutationFn: (attendees: AttendeeDraft[]) =>
      bookingsPersonalInfoCheck({
        body: {
          attendees: attendees.map((attendee) => ({
            personal_info: buildAttendeeDraft(attendee).personal_info ?? null,
          })),
        },
      }),
  })
}
