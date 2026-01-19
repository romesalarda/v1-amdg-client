import { z } from 'zod'

export const EventSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  short_description: z.string().max(255).optional(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  timezone: z.string(),
  maximum_attendance: z.number().int().positive().optional(),
})