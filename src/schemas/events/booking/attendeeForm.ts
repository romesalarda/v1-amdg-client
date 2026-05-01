import { z } from 'zod'
import { bookingAttendeeRelationshipOptions } from './relationships'
import { optionalInternationalPhoneSchema, requiredPastOrTodayDateSchema } from '~/schemas/common/fieldValidators'

export const bookingAttendeeFormSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  phone_number: optionalInternationalPhoneSchema,
  date_of_birth: requiredPastOrTodayDateSchema,
  gender: z.string().trim().min(1, 'Gender is required'),
  relationship_to_user: z.enum(bookingAttendeeRelationshipOptions).or(z.literal('')).refine(value => value !== '', 'Relationship is required'),
  area_from: z.number().int().positive('Area is required').optional(),
  area_from_name: z.string().trim().min(1, 'Area is required'),
})

export type BookingAttendeeFormData = z.infer<typeof bookingAttendeeFormSchema>
