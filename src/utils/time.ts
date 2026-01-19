import { DateTime } from 'luxon';

export function formatDateTime(dateString: string, timeZone: string = 'Europe/London', options?: Intl.DateTimeFormatOptions): string {
  const dt = DateTime.fromISO(dateString, { zone: 'utc' });
  if (!dt.isValid) {
    return dateString; // Return the original string if invalid
  }

  const local = dt.setZone(timeZone);
  return local.toLocaleString(options || DateTime.DATETIME_MED);
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param format - Output format (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, format: string = 'MMM d, yyyy'): string {
  try {
    const dt = DateTime.fromISO(dateString);
    if (!dt.isValid) {
      return dateString;
    }
    return dt.toFormat(format);
  } catch {
    return dateString;
  }
}

/**
 * Calculate the difference in days between a date and now
 * @param dateString - ISO date string
 * @returns Number of days (negative if in the past)
 */
export function daysDifference(dateString: string): number {
  try {
    const dt = DateTime.fromISO(dateString);
    const now = DateTime.now();
    if (!dt.isValid) {
      return 0;
    }
    return Math.floor(dt.diff(now, 'days').days);
  } catch {
    return 0;
  }
}

/**
 * Check if a date is expiring soon (within 3 days)
 * @param dateString - ISO date string
 * @returns True if expiring within 3 days
 */
export function isExpiringSoon(dateString: string): boolean {
  const days = daysDifference(dateString);
  return days <= 3 && days >= 0;
}