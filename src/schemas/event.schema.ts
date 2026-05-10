import { z } from 'zod'

export const EventBaseSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  short_description: z.string().max(255).optional(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  timezone: z.string(),
  maximum_attendance: z.number().int().positive().optional(),
  external_link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  external_event: z.boolean().optional(),
})

export const EventSchema = EventBaseSchema.refine(
  (data) => {
    // external_event can only be true if external_link is provided
    if (data.external_event && (!data.external_link || data.external_link === '')) {
      return false
    }
    return true
  },
  {
    message: 'A valid external link is required to mark this event as external',
    path: ['external_event'],
  }
)