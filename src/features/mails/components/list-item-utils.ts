/**
 * Utility functions for mail list item rendering.
 */

/**
 * Format a date string into a human-friendly relative/absolute representation.
 *
 * - < 1 hour ago today → "Xm"
 * - Today → "HH:MM AM/PM"
 * - This week → Weekday name (e.g. "Monday")
 * - This year → "MMM D" (e.g. "Jan 8")
 * - Previous year → "MMM D, YYYY" (e.g. "Jan 8, 2024")
 */
export function formatDate(
  isoString: string,
  locale: string = 'en-US',
  tMinutesAgo?: (minutes: number) => string,
): string {
  // Guard against empty/invalid date strings (e.g. missing Date header)
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  const now = new Date()

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  // Less than 1 hour ago today
  if (date >= startOfToday && diffMinutes < 60 && diffMinutes >= 0) {
    return tMinutesAgo ? tMinutesAgo(diffMinutes) : `${diffMinutes}m`
  }

  // Today → time format
  if (date >= startOfToday) {
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // This week (Mon–Sun of current week)
  const startOfWeek = new Date(startOfToday)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday = 0
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

  if (date >= startOfWeek) {
    return date.toLocaleDateString(locale, { weekday: 'long' })
  }

  // This year → "MMM D"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    })
  }

  // Previous year → "MMM D, YYYY"
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
