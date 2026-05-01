export function useBookingOrderDisplay() {
  function canCancelOrder(status?: string): boolean {
    const normalized = String(status || '').toLowerCase()
    return normalized === 'draft' || normalized === 'pending'
  }

  function getOrderItemDetails(item: any): Record<string, any> | null {
    const details = item?.product_variant_details
    if (!details || typeof details !== 'object') return null
    return details as Record<string, any>
  }

  function getOrderItemTitle(item: any): string {
    const details = getOrderItemDetails(item)
    return details?.product_title || `Variant ${details?.variant_id || item?.product_variant || 'N/A'}`
  }

  function getOrderItemCode(item: any): string {
    const details = getOrderItemDetails(item)
    if (details?.product_display_code) return String(details.product_display_code)
    if (details?.variant_id) return `Variant ${details.variant_id}`
    return `Variant ${item?.product_variant || 'N/A'}`
  }

  function getOrderItemImageUrl(item: any): string | null {
    const details = getOrderItemDetails(item)
    return details?.image_url || details?.variant_image_url || details?.product_image_url || null
  }

  function getOrderItemSize(item: any): string | null {
    const details = getOrderItemDetails(item)
    return details?.size || null
  }

  function getOrderItemColor(item: any): string | null {
    const details = getOrderItemDetails(item)
    return details?.color || null
  }

  function getOrderItemColorStyle(item: any): Record<string, string> | undefined {
    const color = getOrderItemColor(item)
    if (!color) return undefined
    return { backgroundColor: color }
  }

  function getOrderStatusBadgeClass(status?: string): string {
    const normalized = String(status || '').toLowerCase()
    const classes: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-blue-100 text-blue-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      pending_refund: 'bg-orange-100 text-orange-700',
      refunded: 'bg-purple-100 text-purple-700',
    }
    return classes[normalized] || 'bg-gray-100 text-gray-700'
  }

  return {
    canCancelOrder,
    getOrderItemDetails,
    getOrderItemTitle,
    getOrderItemCode,
    getOrderItemImageUrl,
    getOrderItemSize,
    getOrderItemColor,
    getOrderItemColorStyle,
    getOrderStatusBadgeClass,
  }
}
