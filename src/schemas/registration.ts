import { z } from 'zod'

export const attendeeValidationSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^@]+@[^@]+\.[^@]+$/.test(val),
      'Please enter a valid email address'
    ),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{10,}$/i.test(val),
      'Please enter a valid phone number'
    ),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => !val || new Date(val) < new Date(),
      'Date of birth cannot be in the future'
    ),
  gender: z.string().optional(),
  relationship_to_user: z.string().optional(),
})

/**
 * Utility function to determine if an attendee is a minor (under 18)
 */
export const isMinor = (dateOfBirthString: string): boolean => {
  try {
    const dob = new Date(dateOfBirthString)
    const today = new Date()
    
    // Check if the date is valid
    if (isNaN(dob.getTime())) {
      return false
    }
    
    // Calculate age
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    // If birthday hasn't occurred yet this year, subtract 1 from age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    
    return age < 18
  } catch {
    return false
  }
}

/**
 * Personal info item schema for dietary requirements, medical conditions, and accessibility requirements
 * Includes details (public-facing) and notes (internal for event admins)
 */
export const personalInfoItemSchema = z.object({
  id: z.number(),
  details: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? val : null)),
  notes: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? val : null)),
})

/**
 * Medical condition item schema with severity level
 */
export const medicalConditionItemSchema = personalInfoItemSchema.extend({
  severity: z
    .enum(['mild', 'moderate', 'severe'])
    .nullable()
    .optional(),
})

/**
 * Emergency contact schema with validation
 */
export const emergencyContactSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .transform((val) => val.trim()),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .transform((val) => val.trim()),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be less than 20 characters')
    .transform((val) => val.trim()),
  relationship: z
    .enum(['parent', 'sibling', 'child', 'spouse', 'friend', 'other'])
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  primary_contact: z.boolean().optional().default(true),
})

/**
 * Personal info draft schema with nested dietary, medical, and accessibility requirements
 */
export const personalInfoDraftSchema = z.object({
  dietaryRequirements: z.array(personalInfoItemSchema).default([]),
  medicalConditions: z.array(medicalConditionItemSchema).default([]),
  accessibilityRequirements: z.array(personalInfoItemSchema).default([]),
  emergencyContact: emergencyContactSchema.nullable().optional(),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
})

/**
 * Consent draft schema
 */
export const consentDraftSchema = z.object({
  consentId: z.number(),
  consentGiven: z.boolean(),
})

/**
 * Event question answer draft schema
 */
export const eventQuestionAnswerDraftSchema = z.object({
  questionId: z.string(),
  answerText: z
    .string()
    .nullable()
    .optional(),
  selectedOptionIds: z.array(z.number()).optional(),
  uploadResourceId: z.number().nullable().optional(),
  uploadUrl: z.string().nullable().optional(),
})

/**
 * Product selection draft schema
 */
export const productSelectionDraftSchema = z.object({
  packageProductId: z.number(),
  variantId: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

/**
 * Attendee draft schema with comprehensive validation
 */
export const attendeeDraftSchema = z
  .object({
    attendeeId: z.string().optional(),
    first_name: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .transform((val) => val.trim()),
    last_name: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
      .transform((val) => val.trim()),
    email: z
      .string()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),
    phone_number: z
      .string()
      .max(20, 'Phone number must be less than 20 characters')
      .optional()
      .or(z.literal('')),
    date_of_birth: z
      .string()
      .refine((val) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        return dateRegex.test(val)
      }, 'Date of birth must be in YYYY-MM-DD format'),
    gender: z
      .enum(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'])
      .optional()
      .or(z.literal('')),
    relationship_to_user: z
      .enum(['self', 'spouse', 'child', 'friend', 'parent', 'sibling', 'other'])
      .optional(),
    area_from: z.number().nullable().optional(),
    area_from_name: z.string().nullable().optional(),
    questionsComplete: z.boolean().optional().default(false),
    personalInfo: personalInfoDraftSchema,
    packageId: z.number().optional(),
    consents: z.array(consentDraftSchema).default([]),
    questionAnswers: z.array(eventQuestionAnswerDraftSchema).default([]),
    productSelections: z.array(productSelectionDraftSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Check if attendee is a minor
    const attendeeIsMinor = isMinor(data.date_of_birth)

    // Minors MUST have an emergency contact
    if (attendeeIsMinor) {
      if (!data.personalInfo.emergencyContact || !data.personalInfo.emergencyContact.first_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Emergency contact is required for minors (under 18)',
          path: ['personalInfo', 'emergencyContact'],
        })
      }
    }
  })

/**
 * Registration state schema
 */
export const registrationStateSchema = z.object({
  eventId: z.string().nullable(),
  ticketCount: z.number().min(1, 'At least 1 ticket is required'),
  registrarAttending: z.boolean(),
  bookingIntentId: z.string().nullable(),
  attendees: z.array(attendeeDraftSchema),
  currentIndex: z.number().min(0),
})

/**
 * Helper function to validate a single attendee
 */
export const validateAttendee = (attendee: unknown) => {
  return attendeeDraftSchema.safeParse(attendee)
}

/**
 * Helper function to validate if an attendee is ready for checkout
 * (has all required information)
 */
export const isAttendeeValidForCheckout = (
  attendee: unknown,
  requiredQuestionIds: number[] = [],
  requiredConsentIds: number[] = []
): boolean => {
  const validation = validateAttendee(attendee)
  if (!validation.success) return false

  const data = validation.data as any

  // Check required fields
  const hasNames = !!data.first_name && !!data.last_name
  const hasDob = !!data.date_of_birth
  const hasAreaFrom = !!data.area_from
  const hasPackage = !!data.packageId
  const hasRelationship = !!data.relationship_to_user

  // Check required questions
  const hasRequiredAnswers =
    requiredQuestionIds.length === 0 ||
    requiredQuestionIds.every((questionId) => {
      const answer = data.questionAnswers.find((a: any) => a.questionId === questionId)
      return !!answer && (answer.answerText || answer.selectedOptionIds?.length > 0 || answer.uploadResourceId)
    })

  // Check required consents
  const hasRequiredConsents =
    requiredConsentIds.length === 0 ||
    requiredConsentIds.every((consentId) =>
      data.consents.some((c: any) => c.consentId === consentId && c.consentGiven)
    )

  return hasNames && hasDob && hasAreaFrom && hasPackage && hasRelationship && hasRequiredAnswers && hasRequiredConsents
}

/**
 * Helper function to check if attendee has valid personal info items
 * Validates that if "OTHER" is selected (id: -1 or similar), details must be provided
 */
export const validatePersonalInfoItem = (item: any): { isValid: boolean; error?: string } => {
  // If it's an "OTHER" option (typically has a specific ID), details are required
  const isOtherOption = item.id === -1 || item.id === 'other'

  if (isOtherOption && (!item.details || item.details.trim() === '')) {
    return {
      isValid: false,
      error: 'Please provide details for this requirement',
    }
  }

  return { isValid: true }
}
