// ── Types ──────────────────────────────────────────────────────────────────

export interface SendMailAttachment {
  filename: string
  contentType: string
  /** Base64-encoded content */
  content: string
}

export interface SendMailBody {
  from: string
  to: string[]
  subject: string
  body: string
  cc?: string[]
  bcc?: string[]
  /** null = no receipt requested */
  return_receipt?: boolean | null
  attachments?: SendMailAttachment[]
  priority?: number
  is_html?: boolean
  reply_to?: string | null
  /** ISO 8601 datetime for scheduled delivery */
  send_at?: string | null
}

export interface SendMailArg {
  /** The mailbox account ID — derived from the selected identity's account */
  accountId: string
  mail: SendMailBody
  mailKey?: string | null
}

/** Result of a send request — may be immediate, scheduled, or held for Undo Send. */
export interface SendMailResult {
  /** 'sent' = delivered now, 'scheduled' = queued via send_at, 'pending' = held for Undo Send */
  status?: 'sent' | 'scheduled' | 'pending'
  /** Present when status === 'pending' — used to cancel the send (Undo Send). */
  pending_key?: string
  /** Epoch seconds until which the undo window stays open. */
  undo_available_until?: number
  scheduled_at?: string
  job_id?: string
}

export interface CancelPendingSendArg {
  accountId: string
  pendingKey: string
}

export interface SaveDraftArg {
  accountId: string // The mailbox account ID — derived from the selected identity's account
  mailKey: string | null // The mail key, if updating an existing draft. Null when creating a new draft.
  mail: SendMailBody
  close?: boolean // Whether to close the compose window after saving
  displayNotificationOnSuccess?: boolean
  displayNotificationOnError?: boolean
}

export interface UploadAttachmentArg {
  accountId: string
  mailKey: string | null
  file: File
}

export interface DeleteAttachmentArg {
  accountId: string
  mailKey: string
  filename: string
}

export interface DownloadAttachmentArg {
  accountId: string
  mailKey: string
  filename: string
}

export interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

export interface CurrentMailItem {
  key: string
  locked: boolean
  mail_server_uid: string
}

export interface GetCurrentMailArg {
  accountId: string
}
