import { ref, computed } from 'vue'
import { useValidateOrderDiscountCode, usePreviewOrderPricing } from '~/composables/resources/products/productOrders'
import type { OrderItem } from '~/api/types.gen'

export type DiscountPreviewItem = {
  product_variant_id: string
  quantity: number
  unit_price: string
  line_total: string
  line_discount: string
  applied_discounts: Array<{
    discount_id: number
    name: string
    discount_type: string
    value: string
    amount: string
    currency: string
  }>
}

export type DiscountPreviewResult = {
  attendee_id: string
  discount_code_applied: string | null
  total_amount: string
  total_discount: string
  currency: string
  items: DiscountPreviewItem[]
}

type ValidationState = 'idle' | 'valid' | 'invalid'

/**
 * Manages discount code input, validation, and pricing preview for order checkout.
 *
 * Usage:
 *   const discount = useOrderDiscountCode()
 *   // User types code into discount.codeInput.value
 *   // Call discount.applyCode(orderId, attendeeId, orderItems) on "Apply" click
 *   // Pass discount.appliedCode.value as discount_code in checkout body
 */
export function useOrderDiscountCode() {
  const codeInput = ref('')
  const appliedCode = ref<string | null>(null)
  const validationState = ref<ValidationState>('idle')
  const validationError = ref('')
  const previewResult = ref<DiscountPreviewResult | null>(null)
  const isValidating = ref(false)
  const isPreviewLoading = ref(false)

  const validateMutation = useValidateOrderDiscountCode()
  const previewMutation = usePreviewOrderPricing()

  const hasAppliedDiscount = computed(
    () => appliedCode.value !== null && previewResult.value !== null,
  )

  const discountAmount = computed(() => {
    if (!previewResult.value) return null
    const raw = previewResult.value.total_discount
    const amount = parseFloat(raw)
    if (isNaN(amount) || amount <= 0) return null
    return { raw, amount }
  })

  const discountedTotal = computed(() => {
    if (!previewResult.value) return null
    return previewResult.value.total_amount
  })

  /**
   * Validate the current codeInput against the order, and if valid, fetch a pricing preview.
   */
  async function applyCode(
    orderId: string,
    attendeeId: string,
    orderItems: Array<OrderItem>,
  ) {
    const code = codeInput.value.trim()
    if (!code) {
      validationError.value = 'Enter a discount code.'
      validationState.value = 'invalid'
      return
    }

    isValidating.value = true
    validationError.value = ''
    validationState.value = 'idle'

    try {
      const validateResponse = await validateMutation.mutateAsync({
        code,
        order_id: orderId,
      })

      const validateData = (validateResponse as { data?: Record<string, unknown> }).data || {}
      const isValid = Boolean(validateData.valid)

      if (!isValid) {
        validationState.value = 'invalid'
        validationError.value = 'This code is not valid for your order.'
        appliedCode.value = null
        previewResult.value = null
        return
      }

      validationState.value = 'valid'
      appliedCode.value = code

      // Fetch pricing preview with the validated code
      isPreviewLoading.value = true
      const previewItems = orderItems
        .filter((item) => item.product_variant != null)
        .map((item) => ({
          product_variant_id: String(item.product_variant_details?.variant_id ?? item.product_variant),
          quantity: Number(item.quantity),
        }))

      const previewResponse = await previewMutation.mutateAsync({
        attendee_id: attendeeId,
        discount_code: code,
        items: previewItems,
      })

      previewResult.value = ((previewResponse as { data?: DiscountPreviewResult }).data ?? null)
    }
    catch {
      validationState.value = 'invalid'
      validationError.value = 'Unable to validate code. Please try again.'
      appliedCode.value = null
      previewResult.value = null
    }
    finally {
      isValidating.value = false
      isPreviewLoading.value = false
    }
  }

  function clearCode() {
    codeInput.value = ''
    appliedCode.value = null
    validationState.value = 'idle'
    validationError.value = ''
    previewResult.value = null
  }

  return {
    codeInput,
    appliedCode,
    validationState,
    validationError,
    previewResult,
    isValidating,
    isPreviewLoading,
    hasAppliedDiscount,
    discountAmount,
    discountedTotal,
    applyCode,
    clearCode,
  }
}
