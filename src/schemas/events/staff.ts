import { z } from 'zod'

export const eventStaffSchema = z.object({
  user: z.number({ required_error: 'User is required' }),
  role: z.number().optional().nullable(),
})

export const eventRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
})

export type EventStaffFormData = z.infer<typeof eventStaffSchema>
export type EventRoleFormData = z.infer<typeof eventRoleSchema>
