import { useMutation } from '@tanstack/vue-query'
import { bookingsAttendeePrecheck } from '~/api/sdk.gen'
import type { AttendeePrecheckItemRequest } from '~/api/types.gen'
import type { AttendeeDraft } from '~/stores/registration'
import { buildAttendeeDraft } from './checkout'

export type PrecheckAttendeeError = {
  index: number
  codes: string[]
}

type PrecheckCodeMessage = {
  code?: string
  message?: string
}

type PrecheckAttendeeErrorRaw = {
  index?: number
  codes?: string[]
  messages?: string[]
}

export type PrecheckResult = {
  valid: boolean
  booking_errors: Array<string | PrecheckCodeMessage>
  attendee_errors: Array<PrecheckAttendeeErrorRaw> | Record<string, string[]>
  limits: {
    max_attendees_per_booking?: number | null
    max_attendees_per_user?: number | null
    requested_attendee_count?: number
    existing_user_attendee_count?: number
    projected_user_attendee_count?: number
    remaining_slots_for_user?: number | null
  }
}

const PRECHECK_ERROR_MESSAGES: Record<string, string> = {
  DUPLICATE_EMAIL: 'An attendee with this email is already registered for this event.',
  DUPLICATE_PHONE: 'An attendee with this phone number is already registered for this event.',
  DUPLICATE_IDENTITY: 'An attendee with this name and date of birth is already registered.',
  SELF_ALREADY_REGISTERED: 'You are already registered as an attendee for this event.',
  MAX_PER_BOOKING_EXCEEDED: 'You have exceeded the maximum number of attendees per booking.',
  MAX_PER_USER_EXCEEDED: 'You have reached the maximum number of registrations allowed for this event.',
  DUPLICATE_IN_REQUEST: 'Duplicate attendee detected within this booking.',
}

export const formatPrecheckErrorCode = (code: string): string =>
  PRECHECK_ERROR_MESSAGES[code] ?? `Validation error: ${code}`

export const parsePrecheckBookingErrorCodes = (result: PrecheckResult): string[] => {
  const bookingErrors = Array.isArray(result.booking_errors) ? result.booking_errors : []
  return bookingErrors
    .map((entry) => (typeof entry === 'string' ? entry : entry?.code || ''))
    .filter((code): code is string => Boolean(code))
}

export const parsePrecheckAttendeeErrors = (result: PrecheckResult): PrecheckAttendeeError[] =>
  Array.isArray(result.attendee_errors)
    ? result.attendee_errors
        .map((item) => ({
          index: Number(item.index ?? -1),
          codes: Array.isArray(item.codes) ? item.codes : [],
        }))
        .filter((item) => item.index >= 0 && item.codes.length > 0)
    : Object.entries(result.attendee_errors || {}).map(([indexStr, codes]) => ({
        index: Number(indexStr),
        codes: Array.isArray(codes) ? codes : [],
      }))

const isPrecheckLike = (value: unknown): value is PrecheckResult => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.valid === 'boolean' ||
    Array.isArray(record.booking_errors) ||
    Array.isArray(record.attendee_errors)
  )
}

export const extractPrecheckResult = (source: unknown): PrecheckResult | undefined => {
  const input = source as Record<string, unknown> | undefined
  const candidates: unknown[] = [
    source,
    input?.data,
    input?.error,
    (input?.response as Record<string, unknown> | undefined)?._data,
    (input?.response as Record<string, unknown> | undefined)?.data,
  ]

  for (const candidate of candidates) {
    if (isPrecheckLike(candidate)) return candidate
  }

  return undefined
}

const buildPrecheckItem = (attendee: AttendeeDraft): AttendeePrecheckItemRequest => {
  if (attendee.attendeeId) {
    return { attendee_id: attendee.attendeeId }
  }
  return { attendee: buildAttendeeDraft(attendee) }
}

export function usePrecheckBooking() {
  return useMutation({
    mutationFn: (payload: { bookingIntentId: string; attendees: AttendeeDraft[] }) =>
      bookingsAttendeePrecheck({
        body: {
          booking_intent_id: payload.bookingIntentId,
          attendees: payload.attendees.map(buildPrecheckItem),
        },
      }),
  })
}
