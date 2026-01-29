import { z } from 'zod'

/**
 * Question option schema for multiple/single choice questions
 */
export const questionOptionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  option_text: z
    .string()
    .min(1, 'Option text cannot be empty')
    .max(500, 'Option text must be less than 500 characters')
    .trim(),
  order: z.number().optional(),
})

/**
 * Base event question schema with comprehensive validation
 */
export const eventQuestionSchema = z
  .object({
    id: z.string().optional(),
    tempId: z.string().optional(),
    question_title: z
      .string()
      .min(1, 'Question title is required')
      .max(500, 'Question title must be less than 500 characters')
      .trim(),
    question_body: z
      .string()
      .trim()
      .max(2000, 'Question description must be less than 2000 characters')
      .default(''),
    question_type: z.enum(
      ['short_answer', 'long_answer', 'multiple_choice', 'single_choice', 'upload', 'slider'],
      { errorMap: () => ({ message: 'Invalid question type' }) }
    ),
    order: z.number().min(0, 'Order must be non-negative').optional(),
    required: z.boolean().default(false),
    options: z
      .array(
        z.union([
          z.string().min(1, 'Option cannot be empty'),
          questionOptionSchema,
        ])
      )
      .optional(),
    min_value: z.number().nullable().optional(),
    max_value: z.number().nullable().optional(),
    isNew: z.boolean().optional(),
    isExpanded: z.boolean().optional(),
    isEditing: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate slider questions have min_value and max_value
    if (data.question_type === 'slider') {
      if (data.min_value === undefined || data.min_value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Slider questions must have a minimum value',
          path: ['min_value'],
        })
      }
      if (data.max_value === undefined || data.max_value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Slider questions must have a maximum value',
          path: ['max_value'],
        })
      }
      if (data.min_value !== undefined && data.max_value !== undefined && data.min_value !== null && data.max_value !== null) {

        if (
          data.min_value !== undefined &&
          data.max_value !== undefined &&
          data.min_value >= data.max_value
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Minimum value must be less than maximum value',
            path: ['min_value'],
          })
        }
      }
    }

    // Validate choice questions have options
    if (['multiple_choice', 'single_choice'].includes(data.question_type)) {
      if (!data.options || data.options.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choice questions must have at least one option',
          path: ['options'],
        })
      } else {
        // Check for duplicate options
        const optionTexts = data.options.map((opt) =>
          typeof opt === 'string' ? opt.toLowerCase().trim() : opt.option_text.toLowerCase().trim()
        )
        const uniqueOptions = new Set(optionTexts)
        if (uniqueOptions.size !== optionTexts.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Options must be unique (case-insensitive)',
            path: ['options'],
          })
        }

        // Validate minimum number of options
        if (data.options.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Choice questions must have at least 2 options',
            path: ['options'],
          })
        }
      }
    }
  })

/**
 * Schema for validating all questions in a form
 * Checks for duplicate question titles
 */
export const eventQuestionsArraySchema = z
  .array(eventQuestionSchema)
  .superRefine((questions, ctx) => {
    // Check for duplicate question titles (case-insensitive)
    const titleCounts = new Map<string, number[]>()
    
    questions.forEach((question, index) => {
      const normalizedTitle = question.question_title.toLowerCase().trim()
      if (!titleCounts.has(normalizedTitle)) {
        titleCounts.set(normalizedTitle, [])
      }
      titleCounts.get(normalizedTitle)!.push(index)
    })

    // Add issues for duplicate titles
    titleCounts.forEach((indices, title) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate question title: "${questions[index].question_title}". Each question must have a unique title.`,
            path: [index, 'question_title'],
          })
        })
      }
    })
  })

export type EventQuestionFormData = z.infer<typeof eventQuestionSchema>
export type EventQuestionsArrayFormData = z.infer<typeof eventQuestionsArraySchema>
export type QuestionOptionFormData = z.infer<typeof questionOptionSchema>
