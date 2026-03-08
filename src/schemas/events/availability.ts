import { z } from 'zod'

/**
 * Availability window type options
 */
export const AVAILABILITY_TYPES = [
  { value: 'REFUND_WINDOW', label: 'Refund Window' },
  { value: 'REGISTRATION_WINDOW', label: 'Registration Window' },
  { value: 'MERCHANDISE_WINDOW', label: 'Merchandise Window' },
  { value: 'DONATION_WINDOW', label: 'Donation Window' },
  { value: 'PAYMENT_WINDOW', label: 'Payment Window' },
  { value: 'PRODUCT_WINDOW', label: 'Product Window' },
  { value: 'PRODUCT_PREVIEW_WINDOW', label: 'Product Preview Window' },
  { value: 'DISCOUNT_WINDOW', label: 'Discount Window' },
  { value: 'RESOURCE_WINDOW', label: 'Resource Window' },
  { value: 'PAYMENT_PACKAGE_WINDOW', label: 'Payment Package Window' },
  { value: 'PAYMENT_PACKAGE_PREVIEW_WINDOW', label: 'Payment Package Preview Window' },
]

export const REDUCED_AVAILABILITY_TYPES = AVAILABILITY_TYPES.filter(type =>
  ['REFUND_WINDOW', 'REGISTRATION_WINDOW', 'MERCHANDISE_WINDOW', 'DONATION_WINDOW'].includes(type.value)
)

/**
 * Availability window schema for create/update forms
 */
export const AvailabilityWindowSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Window name is required')
      .max(100, 'Window name must be less than 100 characters')
      .trim(),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    availability_type: z.enum(
      [
        'REFUND_WINDOW',
        'REGISTRATION_WINDOW',
        'MERCHANDISE_WINDOW',
        'DONATION_WINDOW',
        'PAYMENT_WINDOW',
        'PRODUCT_WINDOW',
        'PRODUCT_PREVIEW_WINDOW',
        'DISCOUNT_WINDOW',
        'RESOURCE_WINDOW',
        'PAYMENT_PACKAGE_WINDOW',
        'PAYMENT_PACKAGE_PREVIEW_WINDOW',
      ],
      { errorMap: () => ({ message: 'Please select a window type' }) }
    ),
    available_from: z
      .string()
      .min(1, 'Start date and time is required'),
    available_to: z
      .string()
      .min(1, 'End date and time is required'),
    timezone: z
      .string()
      .min(1, 'Timezone is required')
      .default('Europe/London'),
  })
  .refine(
    (data) => {
      // Validate that available_to is after available_from
      if (data.available_from && data.available_to) {
        const from = new Date(data.available_from)
        const to = new Date(data.available_to)
        return to > from
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['available_to'],
    }
  )

/**
 * Form data type inferred from schema
 */
export type AvailabilityWindowFormData = z.infer<typeof AvailabilityWindowSchema>
