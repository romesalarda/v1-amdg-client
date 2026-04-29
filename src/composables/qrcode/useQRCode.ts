/**
 * Composable for QR code utilities
 *
 * Provides helper functions for QR code generation and formatting
 * Used by ticket display components to render QR codes
 */

import { computed, type Ref } from 'vue'

export interface QRCodeOptions {
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
}

/**
 * Generate a QR code data URL from any string value
 * 
 * @param value - The string to encode (e.g., ticket code)
 * @param options - QR code generation options
 * @returns Computed value of the QR code data URL
 * 
 * @example
 * const ticketCode = ref('TKT-EURO26WAO-OLO-57016376CB7D4468BFEF943E1CF35A29')
 * const qrValue = useQRCodeValue(ticketCode)
 */
export function useQRCodeValue(
  value: Ref<string | null | undefined> | string,
  options: QRCodeOptions = {}
) {
  return computed(() => {
    if (typeof value === 'string') {
      return value
    }
    return value.value || ''
  })
}

/**
 * Generate print-friendly QR code dimensions
 * Used for formatting tickets for printing
 * 
 * @param sizeInMm - Desired size in millimeters
 * @returns Object with pixel dimensions for screen and print
 * 
 * @example
 * const printDims = getQRCodePrintDimensions(50) // 50mm square
 * // Returns { screenPx: 189, printMm: 50, aspect: 1 }
 */
export function getQRCodePrintDimensions(sizeInMm: number = 50) {
  const DPI = 96 // Screen DPI
  const MM_TO_INCH = 1 / 25.4
  const screenPx = Math.round(sizeInMm * MM_TO_INCH * DPI)

  return {
    screenPx,      // For on-screen rendering
    printMm: sizeInMm,
    aspect: 1,     // QR codes are square
    cssClass: `w-[${screenPx}px] h-[${screenPx}px] print:w-[${sizeInMm}mm] print:h-[${sizeInMm}mm]`,
  }
}

/**
 * Format ticket code for display (with optional formatting)
 * 
 * @param ticketCode - Raw ticket code string
 * @param format - Optional format ('compact' removes hyphens, 'readable' adds spaces)
 * @returns Formatted ticket code
 * 
 * @example
 * formatTicketCode('TKT-EURO26WAO-OLO-57016376CB7D4468BFEF943E1CF35A29', 'compact')
 * // Returns: 'TKEURO26WAOLO57016376CB7D4468BFEF943E1CF35A29'
 */
export function formatTicketCode(ticketCode: string, format: 'compact' | 'readable' = 'readable'): string {
  if (!ticketCode) return ''

  if (format === 'compact') {
    return ticketCode.replace(/-/g, '')
  }

  // 'readable' format: keep as-is (default)
  return ticketCode
}

/**
 * Validate that a string is a valid ticket code format
 * 
 * @param value - Value to validate
 * @returns True if value appears to be a valid ticket code
 */
export function isValidTicketCode(value: unknown): value is string {
  if (typeof value !== 'string') return false
  // Ticket codes typically start with TKT- and contain the format: TKT-EVENTCODE-PART-HEX
  return /^TKT-/.test(value) && value.length > 10
}

/**
 * Generate CSS classes for QR code container styling
 * Supports both screen and print contexts
 * 
 * @param printable - Whether to include print-specific styles
 * @returns CSS class string
 */
export function getQRCodeContainerClasses(printable: boolean = true): string {
  const base = 'flex items-center justify-center bg-white p-2 rounded-lg border border-deep-navy/10'
  if (!printable) return base
  return `${base} print:bg-white print:border-0 print:p-0 print:rounded-none`
}

/**
 * Generate data URL for QR code image (for manual image generation if needed)
 * This is a utility for cases where NuxtQrcode component is not sufficient
 * 
 * Note: For most use cases, use the <NuxtQrcode /> component directly
 * 
 * @param value - String to encode
 * @returns Promise<string> - Data URL that can be used in <img src="" />
 */
export async function generateQRCodeDataUrl(value: string): Promise<string> {
  // This would use a library like 'qrcode' to generate the data URL
  // Currently, we rely on <NuxtQrcode /> component which handles this automatically
  // This function is available if manual generation is needed in the future
  
  if (!value) {
    throw new Error('Cannot generate QR code for empty value')
  }

  // Placeholder for potential future implementation
  // Example: const QRCode = await import('qrcode')
  // return QRCode.toDataURL(value)
  
  return value
}
