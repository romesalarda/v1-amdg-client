/**
 * Discount eligibility checking utilities
 * 
 * These functions evaluate discount rules to determine if a discount
 * can be applied to a specific attendee/booking context.
 */

import type { DiscountDetail, DiscountRule } from '~/api/types.gen'

/**
 * Context for evaluating discount eligibility
 */
export interface DiscountEligibilityContext {
  age?: number
  isEventStaff?: boolean
  staffRole?: string
  organisations?: string[]
  name?: string
  location?: string
  discountCode?: string
  customValues?: Record<string, any>
}

/**
 * Evaluate a single discount rule against the context
 */
export function evaluateRule(rule: DiscountRule, context: DiscountEligibilityContext): boolean {
  // Inactive rules automatically fail
  if (rule.active === false) {
    return false
  }

  switch (rule.rule_type) {
    case 'IS_EVENT_STAFF':
      return context.isEventStaff === true

    case 'IS_AGE_LT':
      if (!rule.value || context.age === undefined) return false
      return context.age < parseInt(rule.value)

    case 'IS_AGE_GT':
      if (!rule.value || context.age === undefined) return false
      return context.age > parseInt(rule.value)

    case 'ORGANISATION_MATCHES':
      if (!rule.value || !context.organisations) return false
      return context.organisations.some(org => 
        org.toLowerCase().includes(rule.value!.toLowerCase())
      )

    case 'EVENT_STAFF_ROLE_MATCHES':
      if (!rule.value || !context.staffRole) return false
      return context.staffRole.toLowerCase() === rule.value.toLowerCase()

    case 'NAME_MATCHES':
      if (!rule.value || !context.name) return false
      return context.name.toLowerCase().includes(rule.value.toLowerCase())

    case 'LOCATION_MATCHES':
      if (!rule.value || !context.location) return false
      return context.location.toLowerCase().includes(rule.value.toLowerCase())

    case 'CODE_MATCHES':
      if (!rule.value || !context.discountCode) return false
      return context.discountCode.toLowerCase() === rule.value.toLowerCase()

    case 'VALUE_MATCHES':
      if (!rule.value || !context.customValues) return false
      // Check if any custom value matches
      return Object.values(context.customValues).some(val => 
        String(val).toLowerCase() === rule.value!.toLowerCase()
      )

    default:
      console.warn(`Unknown rule type: ${rule.rule_type}`)
      return false
  }
}

/**
 * Check if all rules of a discount pass (AND logic)
 */
export function canApplyDiscount(
  discount: DiscountDetail, 
  context: DiscountEligibilityContext
): boolean {
  // Inactive discounts cannot be applied
  if (discount.active === false) {
    return false
  }

  // If no rules, discount is available to everyone
  if (!discount.rules || discount.rules.length === 0) {
    return true
  }

  // All active rules must pass
  return discount.rules.every(rule => evaluateRule(rule, context))
}

/**
 * Filter a list of discounts to only those that are applicable
 */
export function getApplicableDiscounts(
  discounts: DiscountDetail[], 
  context: DiscountEligibilityContext
): DiscountDetail[] {
  return discounts.filter(discount => canApplyDiscount(discount, context))
}

/**
 * Calculate the discount amount for a given base price
 */
export function calculateDiscountAmount(discount: DiscountDetail, basePrice: number): number {
  if (discount.discount_type === 'PERCENTAGE' && discount.percentage) {
    const percentage = parseFloat(discount.percentage)
    return basePrice * (percentage / 100)
  } else if (discount.discount_type === 'FIXED' && discount.amount) {
    return parseFloat(discount.amount)
  }
  return 0
}

/**
 * Calculate the final price after applying a discount
 */
export function applyDiscount(basePrice: number, discount: DiscountDetail): number {
  const discountAmount = calculateDiscountAmount(discount, basePrice)
  return Math.max(0, basePrice - discountAmount)
}

/**
 * Get the best discount from a list (highest discount amount)
 */
export function getBestDiscount(
  discounts: DiscountDetail[], 
  basePrice: number,
  context: DiscountEligibilityContext
): DiscountDetail | null {
  const applicableDiscounts = getApplicableDiscounts(discounts, context)
  
  if (applicableDiscounts.length === 0) {
    return null
  }

  return applicableDiscounts.reduce((best, current) => {
    const bestAmount = calculateDiscountAmount(best, basePrice)
    const currentAmount = calculateDiscountAmount(current, basePrice)
    return currentAmount > bestAmount ? current : best
  })
}

/**
 * Get a human-readable summary of why a discount is not applicable
 */
export function getIneligibilityReasons(
  discount: DiscountDetail,
  context: DiscountEligibilityContext
): string[] {
  const reasons: string[] = []

  if (discount.active === false) {
    reasons.push('This discount is not currently active')
    return reasons
  }

  if (!discount.rules || discount.rules.length === 0) {
    return reasons // No rules means always eligible
  }

  discount.rules.forEach(rule => {
    if (rule.active === false) return // Skip inactive rules

    const passes = evaluateRule(rule, context)
    if (!passes) {
      reasons.push(rule.name || `Rule: ${rule.rule_type}`)
    }
  })

  return reasons
}
