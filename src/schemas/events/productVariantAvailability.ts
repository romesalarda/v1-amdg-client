import { z } from 'zod'

export const PRODUCT_VARIANT_AVAILABILITY_TYPES = [
  { value: 'PRODUCT_WINDOW', label: 'Purchase Window' },
  { value: 'PRODUCT_PREVIEW_WINDOW', label: 'Preview Window' },
] as const

export const ProductVariantAvailabilityWindowSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Window name is required')
      .max(100, 'Window name must be less than 100 characters'),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    availability_type: z.enum(['PRODUCT_WINDOW', 'PRODUCT_PREVIEW_WINDOW'], {
      errorMap: () => ({ message: 'Please select a window type' }),
    }),
    available_from: z.string().min(1, 'Start date and time is required'),
    available_to: z.string().min(1, 'End date and time is required'),
    timezone: z.string().trim().min(1, 'Timezone is required').default('UTC'),
  })
  .refine(
    (data) => {
      const from = new Date(data.available_from)
      const to = new Date(data.available_to)
      return Number.isFinite(from.getTime()) && Number.isFinite(to.getTime()) && to > from
    },
    {
      message: 'End date must be after start date',
      path: ['available_to'],
    }
  )

export type ProductVariantAvailabilityWindowFormData = z.infer<typeof ProductVariantAvailabilityWindowSchema>
