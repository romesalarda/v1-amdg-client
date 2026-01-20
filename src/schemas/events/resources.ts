import { z } from 'zod'

export const eventResourceSchema = z.object({
  name: z.string().min(1, 'Resource name is required'),
  description: z.string().optional(),
  resource_type: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'LINK', 'OTHER']),
  tag: z.string().optional(),
  public: z.boolean().default(true),
})

export type EventResourceFormData = z.infer<typeof eventResourceSchema>
