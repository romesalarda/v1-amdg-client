/**
 * Format an ISO date string to datetime-local input format (YYYY-MM-DDTHH:mm)
 * @param date - ISO date string or Date object
 * @returns Formatted string in YYYY-MM-DDTHH:mm format, or empty string if invalid
 */
export function formatDateTimeLocal(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) return ''

    // Format to YYYY-MM-DDTHH:mm (local timezone)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * Parse a datetime-local input string to ISO format
 * @param dateTimeString - String in YYYY-MM-DDTHH:mm format
 * @returns ISO date string, or null if invalid
 */
export function parseDateTimeLocal(dateTimeString: string | null | undefined): string | null {
  if (!dateTimeString) return null

  try {
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) return null

    return date.toISOString()
  } catch {
    return null
  }
}
