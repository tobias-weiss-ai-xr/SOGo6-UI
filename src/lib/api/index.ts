/**
 * API Client Index
 * Central export point for all API modules
 */

// Base client and configuration
export { BaseApiClient, type HttpMethod, type RequestOptions, type ApiResponse, type ApiError } from './client/base-client';
export { apiClient, createApiClient } from './client/base-client';
export { getConfig, setConfig, createConfig, getUseFakeApi, buildUrl, type ApiConfig } from './client/config';
export { type BackendResponse, unwrapBackendResponse } from './backend-response';

// API Endpoint Modules
export * as auth from './endpoints/auth';
export * as mail from './endpoints/mail';
export * as calendar from './endpoints/calendar';
export * as contact from './endpoints/contact';
export * as user from './endpoints/user';
export * as admin from './endpoints/admin';
export * as system from './endpoints/system';
export * as health from './endpoints/health';

// Singleton instances for convenient import
export { authApi } from './endpoints/auth';
export { mailApi } from './endpoints/mail';
export { calendarApi } from './endpoints/calendar';
export { contactApi } from './endpoints/contact';
export { userApi } from './endpoints/user';
export { adminApi } from './endpoints/admin';
export { systemApi } from './endpoints/system';
export { healthApi } from './endpoints/health';

// Re-export types from all modules for convenience
export type {
  // Auth types
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  AuthModeRequest,
  AuthModeResponse,
  WebAuthnRegistrationStartResponse,
  WebAuthnRegistrationFinishRequest,
  WebAuthnRegistrationFinishResponse,
  WebAuthnAuthStartResponse,
  WebAuthnAuthFinishRequest,
  WebAuthnAuthFinishResponse,
  OIDCCallbackParams,
  SSOCallbackResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
} from './endpoints/auth';

export type {
  // Mail types
  Mailbox,
  MailMessageSummary,
  MailMessageFull,
  MailAttachment,
  SendMailRequest,
  SendMailResponse,
  MessageMoveOperation,
  MailSearchRequest,
  MailSearchResponse,
  BatchMessageOperation,
  MailFilter,
  MailboxQuota,
} from './endpoints/mail';

export type {
  // Calendar types
  Calendar,
  CalendarEvent,
  CalendarEventSummary,
  CalendarAttendee,
  CalendarAlarm,
  CalendarAttachment,
  FreeBusyInfo,
  AppointmentSlot,
  SchedulingPoll,
  CreateEventRequest,
  UpdateEventRequest,
  FreeBusyQuery,
} from './endpoints/calendar';

export type {
  // Contact types
  AddressBook,
  Contact,
  ContactEmail,
  ContactPhone,
  ContactAddress,
  ContactUrl,
  ContactImpp,
  ContactSearchResult,
  ContactGroup,
  ContactImportJob,
  ContactExportJob,
  CreateContactRequest,
  UpdateContactRequest,
  ContactAutocompleteRequest,
  ContactSearchRequest,
} from './endpoints/contact';

export type {
  // User types
  UserProfile,
  UserPreferences,
  UserApiToken,
  UserAppPassword,
  UserCustomization,
  PushNotificationSubscription,
  UserPGPKey,
  UserOAuthApplication,
  UserAISettings,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateApiTokenRequest,
  CreateAppPasswordRequest,
  SetVacationRequest,
} from './endpoints/user';

export type {
  // Admin types
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  Domain,
  SystemSettings,
  SystemStatistics,
  UserActivity,
  AuditLogEntry,
  ActiveSession,
  BackupJob,
  MigrationJob,
  LicenseInfo,
  ServerHealthDetailed,
} from './endpoints/admin';

export type {
  // System types
  SystemParameters,
  UserAuthMechanism,
  VersionInfo,
} from './endpoints/system';

export type {
  // Health types
  HealthCheck,
  ReadinessCheck,
  LivenessCheck,
  ComponentHealth,
  SystemMetrics,
  PingResponse,
} from './endpoints/health';
