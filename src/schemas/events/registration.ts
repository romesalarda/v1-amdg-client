import { z } from 'zod'

export const eventQuestionSchema = z.object({
  question_title: z.string().min(1, 'Question title is required'),
  question_body: z.string().optional(),
  question_type: z.enum(['short_answer', 'long_answer', 'multiple_choice', 'single_choice', 'upload', 'slider']),
  order: z.number().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

export type EventQuestionFormData = z.infer<typeof eventQuestionSchema>
