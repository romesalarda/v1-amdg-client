import { z } from 'zod'

export const EventApprovalSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'POSTPONED', 'CANCELLED'], {
    required_error: 'Authorization decision is required',
  }),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export type EventApprovalFormData = z.infer<typeof EventApprovalSchema>
