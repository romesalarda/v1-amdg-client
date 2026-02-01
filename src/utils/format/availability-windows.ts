import type { AvailabilityWindow } from '~/api/types.gen'
import { AVAILABILITY_TYPES } from '~/schemas/events/availability'

/**
 * Color mappings for different availability window types
 */
export const AVAILABILITY_TYPE_COLORS = {
  REFUND_WINDOW: {
    bg: 'bg-red-500',
    bgHover: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-white',
    badge: 'red',
    solid: 'bg-red-500 text-white border-red-600',
  },
  REGISTRATION_WINDOW: {
    bg: 'bg-blue-500',
    bgHover: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-white',
    badge: 'blue',
    solid: 'bg-blue-500 text-white border-blue-600',
  },
  REGISTRATION: {
    bg: 'bg-green-500',
    bgHover: 'bg-green-600',
    border: 'border-green-600',
    text: 'text-white',
    badge: 'green',
    solid: 'bg-green-500 text-white border-green-600',
  },
  MERCHANDISE_WINDOW: {
    bg: 'bg-purple-500',
    bgHover: 'bg-purple-600',
    border: 'border-purple-600',
    text: 'text-white',
    badge: 'purple',
    solid: 'bg-purple-500 text-white border-purple-600',
  },
  MERCHANDISE: {
    bg: 'bg-purple-500',
    bgHover: 'bg-purple-600',
    border: 'border-purple-600',
    text: 'text-white',
    badge: 'purple',
    solid: 'bg-purple-500 text-white border-purple-600',
  },
  DONATION_WINDOW: {
    bg: 'bg-yellow-500',
    bgHover: 'bg-yellow-600',
    border: 'border-yellow-600',
    text: 'text-white',
    badge: 'yellow',
    solid: 'bg-yellow-500 text-white border-yellow-600',
  },
  PAYMENT_WINDOW: {
    bg: 'bg-green-500',
    bgHover: 'bg-green-600',
    border: 'border-green-600',
    text: 'text-white',
    badge: 'green',
    solid: 'bg-green-500 text-white border-green-600',
  },
  PRODUCT_WINDOW: {
    bg: 'bg-indigo-500',
    bgHover: 'bg-indigo-600',
    border: 'border-indigo-600',
    text: 'text-white',
    badge: 'indigo',
    solid: 'bg-indigo-500 text-white border-indigo-600',
  },
  DISCOUNT_WINDOW: {
    bg: 'bg-pink-500',
    bgHover: 'bg-pink-600',
    border: 'border-pink-600',
    text: 'text-white',
    badge: 'pink',
    solid: 'bg-pink-500 text-white border-pink-600',
  },
  RESOURCE_WINDOW: {
    bg: 'bg-teal-500',
    bgHover: 'bg-teal-600',
    border: 'border-teal-600',
    text: 'text-white',
    badge: 'teal',
    solid: 'bg-teal-500 text-white border-teal-600',
  },
  PAYMENT_PACKAGE_WINDOW: {
    bg: 'bg-orange-500',
    bgHover: 'bg-orange-600',
    border: 'border-orange-600',
    text: 'text-white',
    badge: 'orange',
    solid: 'bg-orange-500 text-white border-orange-600',
  },
  BOOKING: {
    bg: 'bg-orange-500',
    bgHover: 'bg-orange-600',
    border: 'border-orange-600',
    text: 'text-white',
    badge: 'orange',
    solid: 'bg-orange-500 text-white border-orange-600',
  },
  REFUNDS: {
    bg: 'bg-red-500',
    bgHover: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-white',
    badge: 'red',
    solid: 'bg-red-500 text-white border-red-600',
  },
  DEFAULT: {
    bg: 'bg-gray-500',
    bgHover: 'bg-gray-600',
    border: 'border-gray-600',
    text: 'text-white',
    badge: 'gray',
    solid: 'bg-gray-500 text-white border-gray-600',
  },
} as const

/**
 * Get the color configuration for a window type
 */
export function getTypeColors(type?: string) {
  if (!type) return AVAILABILITY_TYPE_COLORS.DEFAULT
  return (AVAILABILITY_TYPE_COLORS as any)[type] || AVAILABILITY_TYPE_COLORS.DEFAULT
}

/**
 * Get background color class with hover state for timeline view
 * @param type - The availability window type
 * @returns Tailwind CSS classes for background color
 */
export function getWindowColorClass(type?: string): string {
  const colors = getTypeColors(type)
  return `${colors.bg} ${colors.bgHover.replace('bg-', 'hover:bg-')}`
}

/**
 * Get all styling classes for calendar view (includes border and text)
 * @param type - The availability window type
 * @returns Tailwind CSS classes for full styling
 */
export function getWindowSolidClasses(type?: string): string {
  const colors = getTypeColors(type)
  return `shadow-sm border ${colors.solid}`
}

/**
 * Get badge color for window type
 * @param type - The availability window type
 * @returns Badge color name (for UBadge component)
 */
export function getTypeBadgeColor(type?: string): string {
  const colors = getTypeColors(type)
  return colors.badge
}

/**
 * Get human-readable label for window type
 * @param type - The availability window type
 * @returns Display label for the type
 */
export function getTypeLabel(type?: string): string {
  if (!type) return 'Unknown'
  
  const typeOption = AVAILABILITY_TYPES.find(t => t.value === type)
  return typeOption?.label || type
}

/**
 * Get status label for a window based on current time
 * @param window - The availability window
 * @returns Status label (Active, Upcoming, or Ended)
 */
export function getStatusLabel(window: AvailabilityWindow): string {
  if (window.is_active) return 'Active'
  
  const now = new Date()
  const start = new Date(window.available_from || '')
  const end = new Date(window.available_to || '')
  
  if (now < start) return 'Upcoming'
  if (now > end) return 'Ended'
  
  return 'Active'
}

/**
 * Get badge color for window status
 * @param window - The availability window
 * @returns Badge color name
 */
export function getStatusColor(window: AvailabilityWindow): string {
  if (window.is_active) return 'green'
  
  const now = new Date()
  const start = new Date(window.available_from || '')
  const end = new Date(window.available_to || '')
  
  if (now < start) return 'blue'
  if (now > end) return 'gray'
  
  return 'green'
}

/**
 * Generate tooltip text for a window
 * @param window - The availability window
 * @returns Formatted tooltip text
 */
export function getWindowTooltip(window: AvailabilityWindow): string {
  if (!window.available_from || !window.available_to) {
    return window.name || 'Unnamed Window'
  }
  
  const start = new Date(window.available_from).toLocaleString()
  const end = new Date(window.available_to).toLocaleString()
  return `${window.name}\n${getTypeLabel(window.availability_type)}\n${start} - ${end}`
}

/**
 * Legend items for displaying color meanings
 */
export const WINDOW_TYPE_LEGEND = [
  { type: 'REGISTRATION', label: 'Registration', color: 'bg-green-500' },
  { type: 'REFUNDS', label: 'Refunds', color: 'bg-red-500' },
  { type: 'MERCHANDISE', label: 'Merchandise', color: 'bg-purple-500' },
  { type: 'BOOKING', label: 'Booking', color: 'bg-orange-500' },
  { type: 'DEFAULT', label: 'Other', color: 'bg-blue-500' },
] as const
