import { z } from 'zod'

// Payment Method Type Options
export const paymentMethodTypeEnum = z.enum(['STRIPE', 'BANK_TRANSFER', 'CASH'], {
  errorMap: () => ({ message: 'Please select a valid payment method type' }),
})

// Payment Method Schema
export const paymentMethodSchema = z.object({
  title: z.string().min(1, 'Payment method title is required'),
  description: z.string().optional(),
  method_type: paymentMethodTypeEnum,
  is_active: z.boolean().default(true),
  
  // Bank transfer fields - optional with optional inner fields
  provided_details: z.object({
    account_name: z.string().optional(),
    sort_code: z.string().optional(),
    account_number: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    // If method_type is BANK_TRANSFER, require provided_details with all fields
    if (data.method_type === 'BANK_TRANSFER') {
      return data.provided_details !== undefined && 
             data.provided_details.account_name && 
             data.provided_details.account_name.length > 0 &&
             data.provided_details.sort_code && 
             data.provided_details.sort_code.length > 0 &&
             data.provided_details.account_number && 
             data.provided_details.account_number.length > 0
    }
    return true
  },
  { 
    message: 'Bank transfer details are required for bank transfer payment methods', 
    path: ['provided_details'] 
  }
)

// Export TypeScript types
export type PaymentMethodType = z.infer<typeof paymentMethodTypeEnum>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

// Method type labels and descriptions
export const paymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  STRIPE: 'Stripe',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
}

export const paymentMethodTypeDescriptions: Record<PaymentMethodType, string> = {
  STRIPE: 'Accept card payments online',
  BANK_TRANSFER: 'Manual bank transfer with verification',
  CASH: 'In-person cash payments',
}
