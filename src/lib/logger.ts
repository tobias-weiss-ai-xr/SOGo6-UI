/**
 * Professional frontend logging utility.
 *
 * - Guards all output behind ``NODE_ENV`` checks (no console noise in production).
 * - In production, …error still reaches the console so error monitoring works.
 * - Structured payload for future log-shipping integration.
 */

const IS_DEV = process.env.NODE_ENV === 'development'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogPayload = Record<string, any>

function _log(level: 'debug' | 'info' | 'warn' | 'error', message: string, payload?: LogPayload): void {
  // Error-level is always visible so monitoring tools (Sentry, etc.) can pick it up
  if (level === 'error') {
    if (payload) {
      console.error(`[sogo] ${message}`, payload)
    } else {
      console.error(`[sogo] ${message}`)
    }
    return
  }

  // Warn-level visible for now (can be gated later when log-shipping is wired)
  if (level === 'warn') {
    if (payload) {
      console.warn(`[sogo] ${message}`, payload)
    } else {
      console.warn(`[sogo] ${message}`)
    }
    return
  }

  // Debug / info only in development
  if (!IS_DEV) return

  const fn = level === 'debug' ? console.debug : console.info
  if (payload) {
    fn(`[sogo] ${message}`, payload)
  } else {
    fn(`[sogo] ${message}`)
  }
}

export const logger = {
  debug: (message: string, payload?: LogPayload) => _log('debug', message, payload),
  info: (message: string, payload?: LogPayload) => _log('info', message, payload),
  warn: (message: string, payload?: LogPayload) => _log('warn', message, payload),
  error: (message: string, payload?: LogPayload) => _log('error', message, payload),
}
