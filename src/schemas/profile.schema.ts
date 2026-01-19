import { z } from 'zod'

/**
 * Profile Schema for form validation
 * Combines user fields (first_name, last_name) and profile fields
 */
export const ProfileSchema = z.object({
  // User fields
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(150, 'First name must be less than 150 characters')
    .trim(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(150, 'Last name must be less than 150 characters')
    .trim(),
  
  // Profile fields
  preferred_name: z
    .string()
    .max(100, 'Preferred name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  contact_phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +44 1234567890)')
    .optional()
    .or(z.literal('')),
  preferred_language: z
    .string()
    .max(50, 'Preferred language must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .regex(/^[A-Z][a-z]+\/[A-Z][a-z_]+$/, 'Please enter a valid timezone (e.g., Europe/London, America/New_York)'),
})

export type ProfileFormData = z.infer<typeof ProfileSchema>