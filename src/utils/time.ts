import { DateTime } from 'luxon';

export function formatDateTime(dateString: string, timeZone: string = 'Europe/London', options?: Intl.DateTimeFormatOptions): string {
  const dt = DateTime.fromISO(dateString, { zone: 'utc' });
  if (!dt.isValid) {
    return dateString; // Return the original string if invalid
  }

  const local = dt.setZone(timeZone);
  return local.toLocaleString(options || DateTime.DATETIME_MED);
}