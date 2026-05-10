import { z } from 'zod'

export const bookingLimitPerBookingSchema = z.coerce
  .number()
  .int('Max attendees per booking must be a whole number')
  .min(0, 'Max attendees per booking cannot be lower than 0')
  .max(10, 'Max attendees per booking cannot be greater than 10')

export const bookingLimitPerUserSchema = z.coerce
  .number()
  .int('Max attendees per user must be a whole number')
  .min(0, 'Max attendees per user cannot be lower than 0')
  .max(20, 'Max attendees per user cannot be greater than 20')
