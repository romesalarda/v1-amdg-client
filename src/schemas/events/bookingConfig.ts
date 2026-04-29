import { z } from 'zod'

// Ticket Type Scope Options
export const ticketScopeEnum = z.enum(['FULL_EVENT', 'SINGLE_DAY', 'CUSTOM_RANGE'], {
  errorMap: () => ({ message: 'Please select a valid scope' }),
})

// Ticket Type Schema
export const ticketTypeSchema = z.object({
  title: z.string().min(1, 'Ticket type title is required'),
  scope: ticketScopeEnum,
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  is_active: z.boolean().default(true),
  max_entries: z
    .coerce.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Max entries must be a positive number',
    })
    .optional(),
}).refine(
  (data) => {
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_from) < new Date(data.valid_until)
    }
    return true
  },
  { message: 'Valid until must be after valid from', path: ['valid_until'] }
)

// Booking Package Schema
export const bookingPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  ticket_type: z.number({ required_error: 'Ticket type is required' }),
  base_amount: z
  .coerce.string()
  .optional()
  .refine((val) => {
    if (val === undefined || val === '') return true; // allow missing/empty
    return !isNaN(Number(val)) && Number(val) >= 0;
  }, {
    message: 'Base amount must be a valid positive number',
  }),
  base_amount_currency: z.string().min(1, 'Currency is required').default('GBP'),
  is_active: z.boolean().default(true),
})

// Package Rule Schema
export const packageRuleSchema = z.object({
  rule_type: z.string().min(1, 'Rule type is required'),
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  value: z.string().min(1, 'Value is required'),
  active: z.boolean().default(true),
})

// Export TypeScript types
export type TicketScope = z.infer<typeof ticketScopeEnum>
export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>
export type BookingPackageFormData = z.infer<typeof bookingPackageSchema>
export type PackageRuleFormData = z.infer<typeof packageRuleSchema>
