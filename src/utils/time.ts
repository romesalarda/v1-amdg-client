import { DateTime } from 'luxon';

export function formatDateTime(dateString: string | undefined, timeZone: string = 'Europe/London', options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) {
    return '';
  }
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
export function formatDate(dateString: string | undefined, format: string = 'MMM d, yyyy'): string {
  if (!dateString) {
    return '';
  }
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

/**
 * Format a date string to a compact format with time
 * @param dateString - ISO date string
 * @param timeZone - Timezone (default: 'UTC')
 * @returns Formatted date string (e.g., "Jan 15, 2026, 3:30 PM")
 */
export function formatDateTimeCompact(dateString: string, timeZone: string = 'UTC'): string {
  return formatDateTime(dateString, timeZone, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate countdown to a specific date
 * @param targetDate - ISO date string or DateTime
 * @param timezone - Timezone (default: 'UTC')
 * @returns Object with days, hours, minutes, seconds
 */
export function calculateCountdown(targetDate: string, timezone: string = 'UTC'): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  try {
    const target = DateTime.fromISO(targetDate, { zone: timezone });
    const now = DateTime.now().setZone(timezone);
    
    if (!target.isValid) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalMilliseconds = target.toMillis() - now.toMillis();

    if (totalMilliseconds <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
}

/**
 * Create a reactive countdown composable
 * @param targetDate - ISO date string or ref to date string
 * @param timezone - Timezone (default: 'UTC')
 * @returns Reactive countdown values
 */
export function useCountdown(
  targetDate: MaybeRefOrGetter<string | undefined>,
  timezone: MaybeRefOrGetter<string | undefined> = 'UTC'
) {
  const countdown = ref(calculateCountdown(toValue(targetDate) || '', toValue(timezone) || 'UTC'));
  
  let intervalId: number | null = null;

  const startCountdown = () => {
    if (intervalId) return;

    intervalId = setInterval(() => {
      const date = toValue(targetDate);
      const tz = toValue(timezone);
      if (date) {
        countdown.value = calculateCountdown(date, tz || 'UTC');
      } else {
        countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  onMounted(() => {
    startCountdown();
  });

  onBeforeUnmount(() => {
    stopCountdown();
  });

  return {
    countdown: readonly(countdown),
    startCountdown,
    stopCountdown,
  };
}

export const formatTime = (dateString: string | undefined, timezone: string = 'UTC'): string => {
  if (!dateString) {
    return '';
  }
  try {
    const dt = DateTime.fromISO(dateString, { zone: 'utc' }).setZone(timezone)
    return dt.toLocaleString(DateTime.TIME_SIMPLE)
  } catch {
    return ''
  }
}

/**
 * Format date to a compact human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "2 days ago", "Jan 15", "15 Jan 2025")
 */
export function formatCompactDateTime(dateString: string | undefined): string {
  if (!dateString) {
    return '';
  }
  try {
    const dt = DateTime.fromISO(dateString);
    if (!dt.isValid) {
      return dateString;
    }
    
    const now = DateTime.now();
    const diff = now.diff(dt, ['days', 'hours', 'minutes']);
    
    // Less than 1 minute
    if (diff.as('minutes') < 1) {
      return 'Just now';
    }
    // Less than 1 hour
    if (diff.as('hours') < 1) {
      const mins = Math.floor(diff.as('minutes'));
      return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    }
    // Less than 24 hours
    if (diff.as('hours') < 24) {
      const hours = Math.floor(diff.as('hours'));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    // Less than 7 days
    if (diff.as('days') < 7) {
      const days = Math.floor(diff.as('days'));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    // Same year
    if (dt.year === now.year) {
      return dt.toFormat('MMM d');
    }
    // Different year
    return dt.toFormat('MMM d, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format a date range compactly
 * @param from - Start datetime ISO string
 * @param to - End datetime ISO string  
 * @param timezone - Timezone string
 * @returns Formatted range like "Jan 15 - Jan 20, 2026"
 */
export function formatDateRange(from: string, to: string, timezone: string = 'UTC'): string {
  try {
    const dtFrom = DateTime.fromISO(from, { zone: timezone });
    const dtTo = DateTime.fromISO(to, { zone: timezone });
    
    if (!dtFrom.isValid || !dtTo.isValid) {
      return '';
    }
    
    // Same day
    if (dtFrom.hasSame(dtTo, 'day')) {
      return dtFrom.toFormat('MMM d, yyyy');
    }
    
    // Same month and year
    if (dtFrom.hasSame(dtTo, 'month') && dtFrom.hasSame(dtTo, 'year')) {
      return `${dtFrom.toFormat('MMM d')} - ${dtTo.toFormat('d, yyyy')}`;
    }
    
    // Same year
    if (dtFrom.hasSame(dtTo, 'year')) {
      return `${dtFrom.toFormat('MMM d')} - ${dtTo.toFormat('MMM d, yyyy')}`;
    }
    
    // Different years
    return `${dtFrom.toFormat('MMM d, yyyy')} - ${dtTo.toFormat('MMM d, yyyy')}`;
  } catch {
    return '';
  }
}