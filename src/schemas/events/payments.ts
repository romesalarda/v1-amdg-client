import { z } from 'zod'

export const bookingPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  base_amount: z.coerce.string().min(1, 'Base amount is required'),
  ticket_type: z.number({ required_error: 'Ticket type is required' }),
  capacity: z.string().optional(),
  is_default: z.boolean().default(false),
})

export const ticketTypeSchema = z.object({
  title: z.string().min(1, 'Ticket type name is required'),
  is_active: z.boolean().default(true),
})

export const alternativeSignInSchema = z.object({
  title: z.string().min(1, 'Method name is required'),
  description: z.string().optional(),
})

export type BookingPackageFormData = z.infer<typeof bookingPackageSchema>
export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>
export type AlternativeSignInFormData = z.infer<typeof alternativeSignInSchema>
