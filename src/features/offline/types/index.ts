/** Offline feature constants and types. */

// ---- Offline Outbox --------------------------------------------------------

export interface OutboxRecord {
  id: string;
  // The action that was attempted (compose, modify and send an existing draft, etc.)
  action: string;
  // JSON payload required to retry the action (e.g. mail body, recipients, subject)
  payload: unknown;
  // Unix timestamp (ms) when the record was queued
  createdAt: number;
  // Unix timestamp (ms) of the last retry attempt (0 if never attempted)
  lastAttemptAt: number;
  // Number of retry attempts so far
  attemptCount: number;
  // Short error message from the last failed attempt
  lastError: string;
}

// ---- Limits --------------------------------------------------------------

/** Maximum attachment size (bytes) allowed for composer drafts cached offline. */
export const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

/** Maximum number of attachments allowed for offline composer drafts. */
export const ATTACHMENT_MAX_COUNT = 10;

/** Maximum number of mail headers cached per folder. */
export const MAIL_CACHE_HEADERS_PER_FOLDER = 500;

/** Maximum number of mail bodies cached. */
export const MAIL_CACHE_BODIES_MAX = 200;

/** Time-to-live for cached mail data (milliseconds). */
export const MAIL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
