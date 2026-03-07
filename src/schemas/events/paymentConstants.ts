// Payment Status Constants
export const paymentStatusChoices = {
  DRAFTING: 'DRAFTING',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  PENDING_REFUND: 'PENDING_REFUND',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatus = typeof paymentStatusChoices[keyof typeof paymentStatusChoices]

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  DRAFTING: 'Drafting',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  PENDING_REFUND: 'Pending Refund',
  REFUNDED: 'Refunded',
}

export const paymentStatusColors: Record<PaymentStatus, string> = {
  DRAFTING: 'gray',
  PENDING: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'gray',
  FAILED: 'red',
  PENDING_REFUND: 'orange',
  REFUNDED: 'blue',
}

// Refund Status Constants
export const refundStatusChoices = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  PROCESSED: 'PROCESSED',
} as const

export type RefundStatus = typeof refundStatusChoices[keyof typeof refundStatusChoices]

export const refundStatusLabels: Record<RefundStatus, string> = {
  PENDING: 'Pending Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
}

export const refundStatusColors: Record<RefundStatus, string> = {
  PENDING: 'amber',
  VERIFIED: 'blue',
  REJECTED: 'red',
  PROCESSED: 'green',
}

// Donation Status Constants
export const donationStatusChoices = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const

export type DonationStatus = typeof donationStatusChoices[keyof typeof donationStatusChoices]

export const donationStatusLabels: Record<DonationStatus, string> = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
}

export const donationStatusColors: Record<DonationStatus, string> = {
  PENDING: 'amber',
  VERIFIED: 'green',
  REJECTED: 'red',
}

// Export helpers
export function getPaymentStatusLabel(status: string): string {
  return paymentStatusLabels[status as PaymentStatus] || status
}

export function getPaymentStatusColor(status: string): string {
  return paymentStatusColors[status as PaymentStatus] || 'gray'
}

export function getRefundStatusLabel(status: string): string {
  return refundStatusLabels[status as RefundStatus] || status
}

export function getRefundStatusColor(status: string): string {
  return refundStatusColors[status as RefundStatus] || 'gray'
}

export function getDonationStatusLabel(status: string): string {
  return donationStatusLabels[status as DonationStatus] || status
}

export function getDonationStatusColor(status: string): string {
  return donationStatusColors[status as DonationStatus] || 'gray'
}
