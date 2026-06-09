import { z } from 'zod'

/**
 * Option schema for multiple/single choice questions
 */
export const formQuestionOptionSchema = z.object({
  id: z.number().optional(),
  option_text: z
    .string()
    .min(1, 'Option text cannot be empty')
    .max(255, 'Option text must be less than 255 characters')
    .trim(),
  order: z.number().optional(),
})

/**
 * Question validation schema supporting all 11 types in EventFormQuestionTypeChoices
 */
export const formQuestionSchema = z
  .object({
    id: z.number().optional(),
    tempId: z.string().optional(),
    question_title: z
      .string()
      .min(3, 'Question title must be at least 3 characters')
      .max(255, 'Question title must be less than 255 characters')
      .trim(),
    question_body: z
      .string()
      .trim()
      .max(2000, 'Question description must be less than 2000 characters')
      .default(''),
    question_type: z.enum([
      'short_answer',
      'long_answer',
      'upload',
      'multiple_choice',
      'single_choice',
      'slider',
      'date',
      'time',
      'email',
      'phone',
      'rating',
    ], {
      errorMap: () => ({ message: 'Invalid question type' }),
    }),
    order: z.number().min(0, 'Order must be non-negative').optional(),
    required: z.boolean().default(false),
    options: z
      .array(
        z.union([
          z.string().min(1, 'Option cannot be empty'),
          formQuestionOptionSchema,
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
    // Validate range questions (slider and rating) have min_value and max_value
    const rangeTypes = ['slider', 'rating']
    if (rangeTypes.includes(data.question_type)) {
      if (data.min_value === undefined || data.min_value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Min value is required for this question type',
          path: ['min_value'],
        })
      }
      if (data.max_value === undefined || data.max_value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max value is required for this question type',
          path: ['max_value'],
        })
      }
      if (
        data.min_value !== undefined &&
        data.min_value !== null &&
        data.max_value !== undefined &&
        data.max_value !== null
      ) {
        if (data.min_value >= data.max_value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Minimum value must be less than maximum value',
            path: ['min_value'],
          })
        }
      }
    }

    // Validate choice questions have options
    const choiceTypes = ['multiple_choice', 'single_choice']
    if (choiceTypes.includes(data.question_type)) {
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
 * Array schema for form questions validation
 */
export const formQuestionsArraySchema = z
  .array(formQuestionSchema)
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

export type FormQuestionFormData = z.infer<typeof formQuestionSchema>
export type FormQuestionsArrayFormData = z.infer<typeof formQuestionsArraySchema>
export type FormQuestionOptionFormData = z.infer<typeof formQuestionOptionSchema>
