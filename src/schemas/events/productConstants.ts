// Product Size Constants
export const productSizeChoices = {
  XS: 'XS',
  SM: 'SM',
  MD: 'MD',
  LG: 'LG',
  XL: 'XL',
  OS: 'OS',
  NA: 'NA',
} as const

export type ProductSize = typeof productSizeChoices[keyof typeof productSizeChoices]

export const productSizeLabels: Record<ProductSize, string> = {
  XS: 'Extra Small',
  SM: 'Small',
  MD: 'Medium',
  LG: 'Large',
  XL: 'Extra Large',
  OS: 'One Size',
  NA: 'Not Applicable',
}

// Order Status Constants
export const orderStatusChoices = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING_REFUND: 'pending_refund',
  REFUNDED: 'refunded',
} as const

export type OrderStatus = typeof orderStatusChoices[keyof typeof orderStatusChoices]

export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending_refund: 'Pending Refund',
  refunded: 'Refunded',
}

export const orderStatusColors: Record<OrderStatus, string> = {
  draft: 'gray',
  pending: 'amber',
  processing: 'yellow',
  completed: 'green',
  cancelled: 'gray',
  pending_refund: 'orange',
  refunded: 'blue',
}

// Stock Status Types
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export const stockStatusLabels: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
}

export const stockStatusColors: Record<StockStatus, string> = {
  'in-stock': 'green',
  'low-stock': 'amber',
  'out-of-stock': 'red',
}

// Publication Status Types
export type PublicationStatus = 'draft' | 'active' | 'inactive'

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
}

export const publicationStatusColors: Record<PublicationStatus, string> = {
  draft: 'gray',
  active: 'green',
  inactive: 'red',
}

// Helper Functions
export function getProductSizeLabel(size: string): string {
  return productSizeLabels[size as ProductSize] || size
}

export function getOrderStatusLabel(status: string): string {
  return orderStatusLabels[status as OrderStatus] || status
}

export function getOrderStatusColor(status: string): string {
  return orderStatusColors[status as OrderStatus] || 'gray'
}

export function getStockStatus(stockQuantity: number, lowStockThreshold = 10): StockStatus {
  if (stockQuantity === 0) return 'out-of-stock'
  if (stockQuantity <= lowStockThreshold) return 'low-stock'
  return 'in-stock'
}

export function getStockStatusLabel(status: StockStatus): string {
  return stockStatusLabels[status]
}

export function getStockStatusColor(status: StockStatus): string {
  return stockStatusColors[status]
}

export function getPublicationStatus(verified: boolean, isActive: boolean): PublicationStatus {
  if (!verified) return 'draft'
  if (isActive) return 'active'
  return 'inactive'
}

export function getPublicationStatusLabel(status: PublicationStatus): string {
  return publicationStatusLabels[status]
}

export function getPublicationStatusColor(status: PublicationStatus): string {
  return publicationStatusColors[status]
}
