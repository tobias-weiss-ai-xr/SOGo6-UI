/**
 * Common API Types
 * Shared type definitions used across the API client library
 */

// ======================================
// Response Types
// ======================================

/**
 * Standard paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

/**
 * Standard list response with metadata
 */
export interface ListResponse<T> {
  data: T[];
  count: number;
  offset: number;
  limit: number;
  total: number;
}

/**
 * Standard success/error response
 */
export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  data?: any;
}

/**
 * Sort order for list requests
 */
export type SortOrder = 'asc' | 'desc';

/**
 * ID or UUID string
 */
export type Identifier = string;

/**
 * Timestamp string (ISO 8601)
 */
export type Timestamp = string;

/**
 * Optional timestamp
 */
export type OptionalTimestamp = Timestamp | null;

/**
 * Date string (YYYY-MM-DD)
 */
export type DateString = string;

/**
 * Time string (HH:MM:SS)
 */
export type TimeString = string;

// ======================================
// Entity Types
// ======================================

/**
 * Entity metadata (common to all entities)
 */
export interface EntityMetadata {
  id: Identifier;
  created_at: Timestamp;
  updated_at: Timestamp;
  version?: number;
}

/**
 * Soft-deletable entity
 */
export interface SoftDeletable {
  deleted_at: OptionalTimestamp;
  is_deleted: boolean;
}

/**
 * Entity with owner
 */
export interface OwnedEntity {
  owner_id: Identifier;
  owner: {
    id: Identifier;
    username: string;
    display_name: string;
    email: string;
  };
}

/**
 * Entity with permissions
 */
export interface PermissibleEntity {
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
    admin: boolean;
  };
  is_owner: boolean;
}

// ======================================
// Filter / Sort / Pagination Types
// ======================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
  offset?: number;
  limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams<T extends string = string> {
  sort?: T;
  order?: SortOrder;
}

/**
 * Search parameters
 */
export interface SearchParams {
  search?: string;
  query?: string;
  q?: string;
}

/**
 * Filter parameters (generic)
 */
export interface FilterParams {
  filter?: Record<string, any>;
  filters?: Record<string, any>[];
}

/**
 * Combined request parameters
 */
export interface RequestParams<TFilters extends Record<string, any> = Record<string, any>>
  extends PaginationParams, SortParams, SearchParams {
  // Additional filters specific to the resource
  filters?: TFilters[];
}

// ======================================
// Error Types
// ======================================

/**
 * API error with code and message
 */
export interface ApiErrorWithCode {
  code: string;
  message: string;
  error_code?: string;
  error_msg?: string;
  data?: any;
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  errors: FieldError[];
  message: string;
}

// ======================================
// Metadata Types
// ======================================

/**
 * Quota information
 */
export interface Quota {
  used: number;       // Used space in bytes
  limit: number | null; // Total allowed space in bytes (null = unlimited)
  available: number;  // Available space in bytes
  usage_percent: number; // 0-100
}

/**
 * Storage quota with additional metadata
 */
export interface StorageQuota extends Quota {
  total_messages?: number;
  total_attachments?: number;
  attachment_size?: number;
}

/**
 * Capabilities/Features
 */
export interface Capabilities {
  mail: boolean;
  calendar: boolean;
  contacts: boolean;
  tasks: boolean;
  notes: boolean;
  chat: boolean;
  video_conferencing: boolean;
  file_storage: boolean;
  shared_mailboxes: boolean;
  delegation: boolean;
  mobile_sync: boolean;
  webhooks: boolean;
  ai_assistant: boolean;
}

/**
 * Statistics
 */
export interface Statistics {
  count: number;
  unread_count: number;
  flagged_count: number;
  total_size: number;
}

// ======================================
// Parsing Types
// ======================================

/**
 * Simple date range
 */
export interface DateRange {
  start: DateString;
  end: DateString;
}

/**
 * Date range with time
 */
export interface DateTimeRange {
  start: Timestamp;
  end: Timestamp;
}

/**
 * Recurrence pattern
 */
export interface RecurrencePattern {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  interval?: number;
  byday?: string[]; // e.g., ['MO', 'Tu', 'WE', 'TH', 'FR']
  bymonthday?: number[];
  bymonth?: number[];
  until?: DateString;
  count?: number;
  exceptions?: DateString[];
}

/**
 * Timezone information
 */
export interface TimezoneInfo {
  id: string;
  name: string;
  offset: number; // in minutes
  is_dst: boolean;
  current_time: Timestamp;
}

// ======================================
// Attachment Types
// ======================================

/**
 * File attachment
 */
export interface Attachment {
  id: Identifier;
  name: string;
  filename: string;
  mime_type: string;
  size: number; // in bytes
  url?: string; // Download URL
  inline_url?: string; // Inline display URL
  cid?: string; // Content ID for inline images
  is_inline: boolean;
  created_at: Timestamp;
}

/**
 * Upload progress
 */
export interface UploadProgress {
  id: Identifier;
  filename: string;
  size: number;
  uploaded: number;
  progress: number; // 0-100
  status: 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

// ======================================
// Utility Types
// ======================================

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties required
 */
export type RequiredAll<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Deep partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Pick properties from T that are of type U
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit properties from T that are of type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Merge two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Value of an object type
 */
export type ValueOf<T> = T[keyof T];

// ======================================
// Constants
// ======================================

/**
 * MIME type constants
 */
export const MIME_TYPES = {
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  TEXT_MARKDOWN: 'text/markdown',
  APPLICATION_JSON: 'application/json',
  APPLICATION_XML: 'application/xml',
  APPLICATION_PDF: 'application/pdf',
  APPLICATION_OCTET_STREAM: 'application/octet-stream',
  IMAGE_PNG: 'image/png',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_GIF: 'image/gif',
  IMAGE_SVG: 'image/svg+xml',
  IMAGE_WEBP: 'image/webp',
  IMAGE_AVIF: 'image/avif',
} as const;

/**
 * File size constants
 */
export const FILE_SIZES = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
} as const;

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  ISO_8601: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_TIME: 'HH:mm:ss',
  RFC_2822: 'ddd, DD MMM YYYY HH:mm:ss ZZZ',
  SHORT_DATE: 'MMM D, YYYY',
  LONG_DATE: 'MMMM D, YYYY',
  FULL_DATE: 'dddd, MMMM D, YYYY',
  SHORT_TIME: 'h:mm A',
  LONG_TIME: 'h:mm:ss A',
} as const;
