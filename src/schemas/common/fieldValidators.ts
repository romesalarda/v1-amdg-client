import { z } from 'zod'

const phoneWithCountryCodeRegex = /^\+\d{2}\s\d{6,15}$/

function isValidDateString(value: string): boolean {
  if (!value) return false
  const parsed = new Date(`${value}T00:00:00`)
  return !Number.isNaN(parsed.getTime())
}

function isFutureDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsed.getTime() > today.getTime()
}

export const optionalInternationalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    value => !value || phoneWithCountryCodeRegex.test(value),
    'Phone number must follow +XX 123456 format',
  )

export const requiredPastOrTodayDateSchema = z
  .string()
  .trim()
  .min(1, 'Date of birth is required')
  .refine(isValidDateString, 'Enter a valid date of birth')
  .refine(value => !isFutureDate(value), 'Date of birth cannot be in the future')
