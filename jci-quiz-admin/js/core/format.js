// @ts-check
/**
 * Dates, times and numbers for display. Times are shown in the admin's device
 * time zone with its label (e.g. "WAT"); the API always uses ISO 8601 UTC.
 * All functions are pure apart from reading the device's time zone and clock.
 */

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_SHORT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const NUMBER = new Intl.NumberFormat('en-GB');

/** @param {string | Date | null | undefined} value */
export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The device time zone's short label. "en-NG" gives "WAT" for Nigeria, where
 * "en-GB" would say "GMT+1".
 * @param {Date} [date]
 */
export function timeZoneLabel(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-NG', { timeZoneName: 'short' }).formatToParts(date);
    return parts.find((part) => part.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

/**
 * "31 Oct 2026". Dates in the current year drop the year: "31 Oct".
 * @param {string | Date | null | undefined} value
 * @param {{ now?: Date }} [options]
 */
export function formatDate(value, { now = new Date() } = {}) {
  const date = toDate(value);
  if (!date) return '';
  return date.getFullYear() === now.getFullYear() ? DATE_SHORT.format(date) : DATE.format(date);
}

/**
 * "31 Oct, 17:00 WAT" (year added when it isn't this year).
 * @param {string | Date | null | undefined} value
 * @param {{ now?: Date, zone?: boolean }} [options]
 */
export function formatDateTime(value, { now = new Date(), zone = true } = {}) {
  const date = toDate(value);
  if (!date) return '';
  const label = zone ? timeZoneLabel(date) : '';
  return `${formatDate(date, { now })}, ${TIME.format(date)}${label ? ` ${label}` : ''}`;
}

/** @type {Array<[Intl.RelativeTimeFormatUnit, number]>} */
const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60]
];

/**
 * "just now", "5 minutes ago", "yesterday", "in 2 days".
 * @param {string | Date | null | undefined} value
 * @param {{ now?: Date }} [options]
 */
export function formatRelative(value, { now = new Date() } = {}) {
  const date = toDate(value);
  if (!date) return '';
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  if (Math.abs(seconds) < 45) return 'just now';
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === 'minute') {
      return RELATIVE.format(Math.round(seconds / size), unit);
    }
  }
  return 'just now';
}

/**
 * Whole hours until a date (negative when it's in the past).
 * @param {string | Date | null | undefined} value
 * @param {{ now?: Date }} [options]
 */
export function hoursUntil(value, { now = new Date() } = {}) {
  const date = toDate(value);
  return date ? (date.getTime() - now.getTime()) / 3_600_000 : Number.NaN;
}

/** @param {number} value */
export function formatNumber(value) {
  return NUMBER.format(value);
}

/**
 * "1 question", "12 questions".
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 */
export function plural(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
