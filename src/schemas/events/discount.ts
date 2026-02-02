import { z } from 'zod'

// Discount Type Options
export const discountTypeEnum = z.enum(['PERCENTAGE', 'FIXED'], {
  errorMap: () => ({ message: 'Please select a valid discount type' }),
})

// Discount Rule Type Options
export const discountRuleTypeEnum = z.enum([
  'IS_EVENT_STAFF',
  'IS_AGE_LT',
  'IS_AGE_GT',
  'ORGANISATION_MATCHES',
  'VALUE_MATCHES',
  'EVENT_STAFF_ROLE_MATCHES',
  'NAME_MATCHES',
  'LOCATION_MATCHES',
  'CODE_MATCHES',
], {
  errorMap: () => ({ message: 'Please select a valid rule type' }),
})

// Discount Rule Schema with conditional validation
export const discountRuleSchema = z.object({
  rule_type: discountRuleTypeEnum,
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().nullable().optional(),
  value: z.string().optional(),
  active: z.boolean().default(true),
}).refine(
  (data) => {
    // Value is required for all rule types except IS_EVENT_STAFF
    if (data.rule_type !== 'IS_EVENT_STAFF') {
      return data.value !== undefined && data.value.length > 0
    }
    return true
  },
  {
    message: 'Value is required for this rule type',
    path: ['value'],
  }
).refine(
  (data) => {
    // Age rules should be valid integers
    if (data.rule_type === 'IS_AGE_LT' || data.rule_type === 'IS_AGE_GT') {
      if (data.value) {
        const age = parseInt(data.value)
        return !isNaN(age) && age > 0 && age < 150
      }
    }
    return true
  },
  {
    message: 'Age must be a valid integer between 1 and 149',
    path: ['value'],
  }
)

// Discount Schema with conditional validation
export const discountSchema = z.object({
  name: z.string().min(1, 'Discount name is required'),
  description: z.string().nullable().optional(),
  packageId: z.number().optional(),
  discount_type: discountTypeEnum,
  percentage: z.string().optional(),
  amount: z.string().optional(),
  active: z.boolean().default(true),
  rules: z.array(discountRuleSchema).default([]),
}).refine(
  (data) => {
    // If discount_type is PERCENTAGE, percentage is required
    if (data.discount_type === 'PERCENTAGE') {
      if (!data.percentage || data.percentage.length === 0) {
        return false
      }
      const pct = parseFloat(data.percentage)
      return !isNaN(pct) && pct >= 0 && pct <= 100
    }
    return true
  },
  {
    message: 'Percentage must be a number between 0 and 100',
    path: ['percentage'],
  }
).refine(
  (data) => {
    // If discount_type is FIXED, amount is required
    if (data.discount_type === 'FIXED') {
      if (!data.amount || data.amount.length === 0) {
        return false
      }
      const amt = parseFloat(data.amount)
      return !isNaN(amt) && amt > 0
    }
    return true
  },
  {
    message: 'Amount must be a positive number',
    path: ['amount'],
  }
)

// Export TypeScript types
export type DiscountType = z.infer<typeof discountTypeEnum>
export type DiscountRuleType = z.infer<typeof discountRuleTypeEnum>
export type DiscountRuleFormData = z.infer<typeof discountRuleSchema>
export type DiscountFormData = z.infer<typeof discountSchema>

// Discount type labels and descriptions
export const discountTypeLabels: Record<DiscountType, string> = {
  PERCENTAGE: 'Percentage',
  FIXED: 'Fixed Amount',
}

export const discountTypeDescriptions: Record<DiscountType, string> = {
  PERCENTAGE: 'Discount as a percentage of the total price',
  FIXED: 'Discount as a fixed dollar amount',
}

// Rule type labels and descriptions
export const discountRuleTypeLabels: Record<DiscountRuleType, string> = {
  IS_EVENT_STAFF: 'Is Event Staff',
  IS_AGE_LT: 'Age Less Than',
  IS_AGE_GT: 'Age Greater Than',
  ORGANISATION_MATCHES: 'Organisation Matches',
  VALUE_MATCHES: 'Value Matches',
  EVENT_STAFF_ROLE_MATCHES: 'Event Staff Role Matches',
  NAME_MATCHES: 'Name Matches',
  LOCATION_MATCHES: 'Location Matches',
  CODE_MATCHES: 'Code Matches',
}

export const discountRuleTypeDescriptions: Record<DiscountRuleType, string> = {
  IS_EVENT_STAFF: 'User must be registered as event staff',
  IS_AGE_LT: 'User age must be less than the specified value',
  IS_AGE_GT: 'User age must be greater than the specified value',
  ORGANISATION_MATCHES: 'User must belong to a specific organisation',
  VALUE_MATCHES: 'Custom field value must match',
  EVENT_STAFF_ROLE_MATCHES: 'User must have a specific staff role',
  NAME_MATCHES: 'User name must match pattern',
  LOCATION_MATCHES: 'User location must match',
  CODE_MATCHES: 'Must enter a specific discount code',
}

// Helper to get rule type requirements
export const ruleTypeRequiresValue: Record<DiscountRuleType, boolean> = {
  IS_EVENT_STAFF: false,
  IS_AGE_LT: true,
  IS_AGE_GT: true,
  ORGANISATION_MATCHES: true,
  VALUE_MATCHES: true,
  EVENT_STAFF_ROLE_MATCHES: true,
  NAME_MATCHES: true,
  LOCATION_MATCHES: true,
  CODE_MATCHES: true,
}

export const ruleTypeValuePlaceholders: Record<DiscountRuleType, string> = {
  IS_EVENT_STAFF: '',
  IS_AGE_LT: 'e.g. 18',
  IS_AGE_GT: 'e.g. 65',
  ORGANISATION_MATCHES: 'Organisation name or ID',
  VALUE_MATCHES: 'Value to match',
  EVENT_STAFF_ROLE_MATCHES: 'Staff role name',
  NAME_MATCHES: 'Name pattern',
  LOCATION_MATCHES: 'Location name',
  CODE_MATCHES: 'Discount code',
}
