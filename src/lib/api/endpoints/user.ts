/**
 * User Profile API Endpoints
 * All endpoints under /api/user/v1/user/*
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * User Profile
 */
export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  department: string | null;
  organization: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;
  week_start_day: number; // 0 = Sunday, 1 = Monday, etc.
  avatar: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  login_count: number;
  roles: string[];
  permissions: string[];
  groups: string[];
}

/**
 * User Preferences
 */
export interface UserPreferences {
  timezone: string;
  language: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
  week_start_day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  show_week_numbers: boolean;
  start_of_week: number;
  default_view: 'day' | 'week' | 'month' | 'agenda' | 'list';
  default_calendar: string | null;
  default_mailbox: string | null;
  items_per_page: number;
  starred_on_top: boolean;
  show_preview: boolean;
  preview_size: 'small' | 'medium' | 'large';
  email_signature: string | null;
  reply_to: string | null;
  auto_cc: string | null;
  auto_bcc: string | null;
  vacation_enabled: boolean;
  vacation_message: string | null;
  vacation_subject: string | null;
  vacation_start: string | null;
  vacation_end: string | null;
  vacation_exception_emails: string[];
  spam_threshold: number;
  move_to_spam: boolean;
  theme: string;
  custom_css: string | null;
  keyboard_shortcuts_enabled: boolean;
  notifications: {
    email: boolean;
    desktop: boolean;
    push: boolean;
    daily_digest: boolean;
    weekly_digest: boolean;
    meeting_reminders: boolean;
    meeting_reminder_minutes: number[];
    email_notifications: boolean;
  };
  sidebar_collapsed: boolean;
  sidebar_visible_menus: string[];
  quick_actions: string[];
  dashboard_widgets: Array<{
    id: string;
    type: string;
    config: any;
    order: number;
    visible: boolean;
  }>;
}

/**
 * User API Token
 */
export interface UserApiToken {
  id: string;
  name: string;
  token: string; // Only returned on creation
  token_hash: string; // Stored hash
  scopes: string[];
  ip_restrictions: string[] | null;
  expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

/**
 * User App Password
 */
export interface UserAppPassword {
  id: string;
  name: string;
  password: string; // Only returned on creation
  password_hash: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

/**
 * User Customization Settings
 */
export interface UserCustomization {
  theme: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_image: string | null;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size: string;
  border_radius: string;
  animations: boolean;
  layout_mode: 'auto' | 'light' | 'dark';
  icon_set: string;
}

/**
 * User Push Notification Subscription
 */
export interface PushNotificationSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string;
  created_at: string;
  is_active: boolean;
}

/**
 * User PGP Key
 */
export interface UserPGPKey {
  id: string;
  public_key: string;
  private_key: string; // Only returned on creation, encrypted
  private_key_salt: string | null;
  key_id: string;
  fingerprint: string;
  user_ids: string[];
  algorithm: string;
  bits: number;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  encryption_capable: boolean;
  signing_capable: boolean;
}

/**
 * User OAuth Application
 */
export interface UserOAuthApplication {
  id: string;
  client_id: string;
  client_secret: string; // Only returned on creation
  name: string;
  description: string | null;
  redirect_uris: string[];
  scopes: string[];
  confidential: boolean;
  authorized_grant_types: string[];
  access_token_lifetime: number;
  refresh_token_lifetime: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * User AI Settings
 */
export interface UserAISettings {
  ai_enabled: boolean;
  smart_compose: boolean;
  smart_reply: boolean;
  meeting_summaries: boolean;
  email_categories: boolean;
  preferred_model: string;
  max_tokens: number;
  temperature: number;
  system_prompt: string | null;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  display_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  organization?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country?: string | null;
  timezone?: string;
  language?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password?: string;
}

/**
 * Create API token request
 */
export interface CreateApiTokenRequest {
  name: string;
  scopes?: string[];
  ip_restrictions?: string[];
  expires_at?: string | null;
}

/**
 * Create app password request
 */
export interface CreateAppPasswordRequest {
  name: string;
  scopes?: string[];
}

/**
 * Set vacation request
 */
export interface SetVacationRequest {
  enabled: boolean;
  message?: string | null;
  subject?: string | null;
  start?: string | null;
  end?: string | null;
  exception_emails?: string[];
}

// ========== User API Class ==========

/**
 * User Profile API Client
 * Handles all user profile and settings endpoints
 */
export class UserApi {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<BackendResponse<UserProfile>>(
      '/api/user/v1/user/profile'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<BackendResponse<UserProfile>>(
      '/api/user/v1/user/profile',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Preferences ==========

  /**
   * Get all user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<BackendResponse<UserPreferences>>(
      '/api/user/v1/user/preferences'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<BackendResponse<UserPreferences>>(
      '/api/user/v1/user/preferences',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific preference
   */
  async getPreference(key: string): Promise<any> {
    const response = await apiClient.get<BackendResponse<any>>(
      `/api/user/v1/user/preferences/${key}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a specific preference
   */
  async updatePreference(key: string, value: any): Promise<{ success: boolean }> {
    const response = await apiClient.put<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/user/preferences/${key}`,
      { value }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Password ==========

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; message: string }>>(
      '/api/user/v1/user/password/change',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== API Tokens ==========

  /**
   * List all API tokens
   */
  async listApiTokens(): Promise<UserApiToken[]> {
    const response = await apiClient.get<BackendResponse<UserApiToken[]>>(
      '/api/user/v1/user/api-tokens'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new API token
   */
  async createApiToken(data: CreateApiTokenRequest): Promise<UserApiToken> {
    const response = await apiClient.post<BackendResponse<UserApiToken>>(
      '/api/user/v1/user/api-tokens',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific API token
   */
  async getApiToken(tokenId: string): Promise<UserApiToken> {
    const response = await apiClient.get<BackendResponse<UserApiToken>>(
      `/api/user/v1/user/api-tokens/${tokenId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update an API token
   */
  async updateApiToken(
    tokenId: string,
    data: Partial<CreateApiTokenRequest>
  ): Promise<UserApiToken> {
    const response = await apiClient.put<BackendResponse<UserApiToken>>(
      `/api/user/v1/user/api-tokens/${tokenId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Revoke an API token
   */
  async revokeApiToken(tokenId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/user/v1/user/api-tokens/${tokenId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Revoke all API tokens
   */
  async revokeAllApiTokens(): Promise<{ success: boolean; revoked_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; revoked_count: number }>>(
      '/api/user/v1/user/api-tokens/revoke-all'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== App Passwords ==========

  /**
   * List all app passwords
   */
  async listAppPasswords(): Promise<UserAppPassword[]> {
    const response = await apiClient.get<BackendResponse<UserAppPassword[]>>(
      '/api/user/v1/user/app-passwords'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new app password
   */
  async createAppPassword(data: CreateAppPasswordRequest): Promise<UserAppPassword> {
    const response = await apiClient.post<BackendResponse<UserAppPassword>>(
      '/api/user/v1/user/app-passwords',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Revoke an app password
   */
  async revokeAppPassword(passwordId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/user/v1/user/app-passwords/${passwordId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Revoke all app passwords
   */
  async revokeAllAppPasswords(): Promise<{ success: boolean; revoked_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; revoked_count: number }>>(
      '/api/user/v1/user/app-passwords/revoke-all'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Customization ==========

  /**
   * Get user customization settings
   */
  async getCustomization(): Promise<UserCustomization> {
    const response = await apiClient.get<BackendResponse<UserCustomization>>(
      '/api/user/v1/user/customization'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update user customization settings
   */
  async updateCustomization(data: Partial<UserCustomization>): Promise<UserCustomization> {
    const response = await apiClient.put<BackendResponse<UserCustomization>>(
      '/api/user/v1/user/customization',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Push Notifications ==========

  /**
   * Get VAPID public key for push notifications
   */
  async getVapidPublicKey(): Promise<{ public_key: string }> {
    const response = await apiClient.get<BackendResponse<{ public_key: string }>>(
      '/api/user/v1/user/push/vapid-public-key'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribePush(subscription: Omit<PushNotificationSubscription, 'id' | 'created_at' | 'is_active'>): Promise<PushNotificationSubscription> {
    const response = await apiClient.post<BackendResponse<PushNotificationSubscription>>(
      '/api/user/v1/user/push/subscribe',
      subscription
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribePush(subscriptionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean }>>(
      '/api/user/v1/user/push/unsubscribe',
      { subscription_id: subscriptionId }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get all push notification subscriptions
   */
  async listPushSubscriptions(): Promise<PushNotificationSubscription[]> {
    const response = await apiClient.get<BackendResponse<PushNotificationSubscription[]>>(
      '/api/user/v1/user/push/subscriptions'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== PGP Encryption ==========

  /**
   * Get user's PGP key
   */
  async getPGPKey(): Promise<UserPGPKey | null> {
    const response = await apiClient.get<BackendResponse<UserPGPKey | null>>(
      '/api/user/v1/user/pgp/key'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Upload/import PGP key
   */
  async uploadPGPKey(
    armoredKey: string,
    passphrase?: string
  ): Promise<UserPGPKey> {
    const response = await apiClient.post<BackendResponse<UserPGPKey>>(
      '/api/user/v1/user/pgp/key',
      { armored_key: armoredKey, passphrase }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Generate new PGP key
   */
  async generatePGPKey(data: {
    name: string;
    email: string;
    comment?: string;
    algorithm?: string;
    bits?: number;
    passphrase?: string;
    expires_in?: number; // Days
  }): Promise<UserPGPKey> {
    const response = await apiClient.post<BackendResponse<UserPGPKey>>(
      '/api/user/v1/user/pgp/key/generate',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete PGP key
   */
  async deletePGPKey(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      '/api/user/v1/user/pgp/key'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Encrypt message with user's PGP key
   */
  async pgpEncrypt(data: { message: string; recipient_key?: string }): Promise<{ encrypted: string }> {
    const response = await apiClient.post<BackendResponse<{ encrypted: string }>>(
      '/api/user/v1/user/pgp/encrypt',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Decrypt message with user's PGP key
   */
  async pgpDecrypt(data: { encrypted: string; passphrase?: string }): Promise<{ decrypted: string }> {
    const response = await apiClient.post<BackendResponse<{ decrypted: string }>>(
      '/api/user/v1/user/pgp/decrypt',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== OAuth Provider ==========

  /**
   * List OAuth applications
   */
  async listOAuthApplications(): Promise<UserOAuthApplication[]> {
    const response = await apiClient.get<BackendResponse<UserOAuthApplication[]>>(
      '/api/user/v1/user/oauth/applications'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new OAuth application
   */
  async createOAuthApplication(data: Omit<UserOAuthApplication, 'id' | 'client_id' | 'client_secret' | 'created_at' | 'updated_at' | 'is_active'> & {
    name: string;
    redirect_uris: string[];
  }): Promise<UserOAuthApplication> {
    const response = await apiClient.post<BackendResponse<UserOAuthApplication>>(
      '/api/user/v1/user/oauth/applications',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific OAuth application
   */
  async getOAuthApplication(applicationId: string): Promise<UserOAuthApplication> {
    const response = await apiClient.get<BackendResponse<UserOAuthApplication>>(
      `/api/user/v1/user/oauth/applications/${applicationId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update an OAuth application
   */
  async updateOAuthApplication(
    applicationId: string,
    data: Partial<UserOAuthApplication>
  ): Promise<UserOAuthApplication> {
    const response = await apiClient.put<BackendResponse<UserOAuthApplication>>(
      `/api/user/v1/user/oauth/applications/${applicationId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete an OAuth application
   */
  async deleteOAuthApplication(applicationId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/user/oauth/applications/${applicationId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Vacation/Out of Office ==========

  /**
   * Get vacation settings
   */
  async getVacation(): Promise<SetVacationRequest & { enabled: boolean }> {
    const response = await apiClient.get<BackendResponse<SetVacationRequest & { enabled: boolean }>>(
      '/api/user/v1/user/vacation'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Set vacation/out of office message
   */
  async setVacation(data: SetVacationRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<BackendResponse<{ success: boolean; message: string }>>(
      '/api/user/v1/user/vacation',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Disable vacation
   */
  async disableVacation(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      '/api/user/v1/user/vacation'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== AI Settings ==========

  /**
   * Get AI settings
   */
  async getAISettings(): Promise<UserAISettings> {
    const response = await apiClient.get<BackendResponse<UserAISettings>>(
      '/api/user/v1/user/ai'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update AI settings
   */
  async updateAISettings(data: Partial<UserAISettings>): Promise<UserAISettings> {
    const response = await apiClient.put<BackendResponse<UserAISettings>>(
      '/api/user/v1/user/ai',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Sessions ==========

  /**
   * List active sessions
   */
  async listSessions(): Promise<Array<{
    id: string;
    device: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    last_activity_at: string;
    is_current: boolean;
  }>> {
    const response = await apiClient.get<BackendResponse<Array<{
      id: string;
      device: string;
      ip_address: string;
      user_agent: string;
      created_at: string;
      last_activity_at: string;
      is_current: boolean;
    }>>>(
      '/api/user/v1/user/sessions'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/user/sessions/${sessionId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Terminate all other sessions
   */
  async terminateOtherSessions(): Promise<{ success: boolean; terminated_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; terminated_count: number }>>(
      '/api/user/v1/user/sessions/terminate-other'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Activity Log ==========

  /**
   * Get user activity log
   */
  async getActivityLog(params: {
    limit?: number;
    offset?: number;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{
    activities: Array<{
      id: string;
      action: string;
      resource_type: string;
      resource_id: string;
      details: any;
      ip_address: string;
      user_agent: string;
      created_at: string;
    }>;
    total: number;
  }> {
    const response = await apiClient.get<BackendResponse<{
      activities: Array<any>;
      total: number;
    }>>(
      '/api/user/v1/user/activity-log',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Backup ==========

  /**
   * Export user data
   */
  async exportData(data: {
    format: 'json' | 'zip' | 'tgz';
    include: {
      emails?: boolean;
      calendars?: boolean;
      contacts?: boolean;
      settings?: boolean;
    };
  }): Promise<{ success: boolean; download_url: string; expires_at: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; download_url: string; expires_at: string }>>(
      '/api/user/v1/user/export',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get export job status
   */
  async getExportJob(jobId: string): Promise<{
    status: string;
    download_url: string | null;
    expires_at: string | null;
    created_at: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      status: string;
      download_url: string | null;
      expires_at: string | null;
      created_at: string;
    }>>(
      `/api/user/v1/user/export/${jobId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton User API instance
 */
export const userApi = new UserApi();

export default userApi;
