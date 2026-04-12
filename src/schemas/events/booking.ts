import { z } from 'zod'

export const bookingAttendeeRelationshipOptions = ['self', 'spouse', 'child', 'friend', 'parent', 'sibling', 'other'] as const

export const bookingAttendeeFormSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  phone_number: z.string().trim().optional().or(z.literal('')),
  date_of_birth: z.string().trim().min(1, 'Date of birth is required'),
  gender: z.string().trim().min(1, 'Gender is required'),
  relationship_to_user: z.enum(bookingAttendeeRelationshipOptions).or(z.literal('')).refine(value => value !== '', 'Relationship is required'),
  area_from: z.number().int().positive('Area is required').optional(),
  area_from_name: z.string().trim().min(1, 'Area is required'),
})

export type BookingAttendeeFormData = z.infer<typeof bookingAttendeeFormSchema>