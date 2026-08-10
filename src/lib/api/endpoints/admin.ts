/**
 * Admin API Endpoints
 * All endpoints under /api/admin/v1/admin/*
 * Requires admin privileges
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Admin User
 */
export interface AdminUser {
  id: string;
  uid: string;
  username: string;
  email: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'user' | 'superadmin' | 'custom';
  roles: string[]; // Detailed roles
  is_active: boolean;
  is_locked: boolean;
  is_verified: boolean;
  email_verified: boolean;
  can_login: boolean;
  last_login_at: string | null;
  last_activity_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  password_changed_at: string | null;
  domain_id: string | null;
  domain: string | null;
  settings: Record<string, any>;
  custom_attributes: Record<string, string>;
  quota: {
    mail: number;
    used: number;
    limit: number | null;
  };
  mailboxes: number;
  calendars: number;
  addressbooks: number;
}

/**
 * Create User Request
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'user' | 'superadmin' | 'custom';
  roles?: string[];
  domain_id?: string;
  send_welcome_email?: boolean;
  settings?: Record<string, any>;
  custom_attributes?: Record<string, string>;
}

/**
 * Update User Request
 */
export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'username' | 'password'>> {
  email_verified?: boolean;
  reset_password?: boolean;
  new_password?: string;
  quota_limit?: number | null;
  is_active?: boolean;
  is_locked?: boolean;
  can_login?: boolean;
}

/**
 * Domain
 */
export interface Domain {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_primary: boolean;
  max_users: number | null;
  max_storage: number | null;
  used_storage: number;
  user_count: number;
  settings: {
    AUTH_SETTINGS?: any;
    MAIL_SETTINGS?: any;
    CALENDAR_SETTINGS?: any;
    CONTACT_SETTINGS?: any;
    DISPLAY_SETTINGS?: any;
  };
  dns_records: Array<{
    type: string;
    name: string;
    value: string;
    priority: number | null;
    ttl: number | null;
    verified: boolean;
    verification_error: string | null;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    common_name: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    is_active: boolean;
    is_wildcard: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * System Settings
 */
export interface SystemSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  category: string;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  is_encrypted: boolean;
  is_required: boolean;
  default_value: any;
  validation_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * System Statistics
 */
export interface SystemStatistics {
  total_users: number;
  active_users: number;
  disabled_users: number;
  total_emails_sent_today: number;
  total_emails_received_today: number;
  total_storage_used: number;
  total_storage_available: number;
  storage_usage_percent: number;
  active_sessions: number;
  cpu_usage: number;
  memory_usage: number;
  memory_total: number;
  disk_usage: number;
  disk_total: number;
  uptime: number;
  last_check: string;
}

/**
 * User Activity (Admin View)
 */
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    email: string;
  };
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  category: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: AdminUser | null;
}

/**
 * Active Session
 */
export interface ActiveSession {
  id: string;
  user_id: string;
  jwt_token_hash: string;
  refresh_token_hash: string;
  ip_address: string;
  user_agent: string;
  device: string;
  device_info: Record<string, any>;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  is_active: boolean;
  user: {
    id: string;
    username: string;
    display_name: string;
    email: string;
  };
}

/**
 * Backup Job
 */
export interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  start_time: string | null;
  end_time: string | null;
  file_path: string | null;
  file_size: number | null;
  checksum: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Migration Job
 */
export interface MigrationJob {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  processed_items: number;
  total_items: number;
  start_time: string | null;
  end_time: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * License Information
 */
export interface LicenseInfo {
  id: string;
  license_key: string;
  product: string;
  edition: string;
  max_users: number | null;
  max_domains: number | null;
  max_storage: number | null;
  is_valid: boolean;
  is_active: boolean;
  expires_at: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  support_expiry: string | null;
  features: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Server Health Detailed
 */
export interface ServerHealthDetailed {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  checks: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error' | 'skipped';
    message: string;
    duration: number;
    details: Record<string, any>;
    last_checked: string;
  }>;
  overall_health: number; // 0-100
  health_details: {
    database: {
      connection: boolean;
      latency_ms: number;
      status: string;
      tables_count: number;
      size_mb: number;
    };
    cache: {
      connection: boolean;
      latency_ms: number;
      status: string;
      used_memory_mb: number;
      max_memory_mb: number;
      hit_rate: number;
    };
    storage: {
      available_gb: number;
      used_gb: number;
      usage_percent: number;
      status: string;
    };
    smtp: {
      connection: boolean;
      latency_ms: number;
      status: string;
      last_error: string | null;
    };
    imap: {
      connection: boolean;
      latency_ms: number;
      status: string;
      last_error: string | null;
    };
    ldap: {
      connection: boolean;
      latency_ms: number;
      status: string;
      last_error: string | null;
    };
  };
}

// ========== Admin API Class ==========

/**
 * Admin API Client
 * Handles all administrative endpoints
 * Note: Requires admin privileges and valid JWT token
 */
export class AdminApi {
  // ========== User Management ==========

  /**
   * List all users
   */
  async listUsers(params: {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: string;
    role?: string;
    domain_id?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<{ users: AdminUser[]; total: number; page: number; per_page: number; total_pages: number }> {
    const response = await apiClient.get<BackendResponse<{
      users: AdminUser[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>>(
      '/api/admin/v1/admin/users',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific user
   */
  async getUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.get<BackendResponse<AdminUser>>(
      `/api/admin/v1/admin/users/${userId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<{ success: boolean; user: AdminUser; message?: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; user: AdminUser; message?: string }>>(
      '/api/admin/v1/admin/users',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<AdminUser> {
    const response = await apiClient.put<BackendResponse<AdminUser>>(
      `/api/admin/v1/admin/users/${userId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, purge_data: boolean = false): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/admin/v1/admin/users/${userId}`,
      { params: { purge_data: purge_data ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Enable/disable a user
   */
  async setUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; user: AdminUser }> {
    const endpoint = isActive ? 'enable' : 'disable';
    const response = await apiClient.post<BackendResponse<{ success: boolean; user: AdminUser }>>(
      `/api/admin/v1/admin/users/${userId}/${endpoint}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Lock/unlock a user
   */
  async setUserLock(userId: string, isLocked: boolean): Promise<{ success: boolean; user: AdminUser }> {
    const endpoint = isLocked ? 'lock' : 'unlock';
    const response = await apiClient.post<BackendResponse<{ success: boolean; user: AdminUser }>>(
      `/api/admin/v1/admin/users/${userId}/${endpoint}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; message: string }>>(
      `/api/admin/v1/admin/users/${userId}/password/reset`,
      { new_password: newPassword }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordResetEmail(userId: string, redirectUrl?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; message: string }>>(
      `/api/admin/v1/admin/users/${userId}/password/reset-email`,
      { redirect_url: redirectUrl }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Terminate all user sessions
   */
  async terminateUserSessions(userId: string): Promise<{ success: boolean; terminated_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; terminated_count: number }>>(
      `/api/admin/v1/admin/users/${userId}/sessions/terminate`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List user sessions
   */
  async listUserSessions(userId: string): Promise<ActiveSession[]> {
    const response = await apiClient.get<BackendResponse<ActiveSession[]>>(
      `/api/admin/v1/admin/users/${userId}/sessions`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Impersonate a user (get access token)
   */
  async impersonateUser(userId: string): Promise<{ success: boolean; jwt_token: string; refresh_token: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; jwt_token: string; refresh_token: string }>>(
      `/api/admin/v1/admin/users/${userId}/impersonate`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Domain Management ==========

  /**
   * List all domains
   */
  async listDomains(params: {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    is_active?: boolean;
  } = {}): Promise<{ domains: Domain[]; total: number; page: number; per_page: number; total_pages: number }> {
    const response = await apiClient.get<BackendResponse<{
      domains: Domain[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>>(
      '/api/admin/v1/admin/domains',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific domain
   */
  async getDomain(domainId: string): Promise<Domain> {
    const response = await apiClient.get<BackendResponse<Domain>>(
      `/api/admin/v1/admin/domains/${domainId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new domain
   */
  async createDomain(data: Partial<Domain> & { name: string }): Promise<Domain> {
    const response = await apiClient.post<BackendResponse<Domain>>(
      '/api/admin/v1/admin/domains',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a domain
   */
  async updateDomain(domainId: string, data: Partial<Domain>): Promise<Domain> {
    const response = await apiClient.put<BackendResponse<Domain>>(
      `/api/admin/v1/admin/domains/${domainId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a domain
   */
  async deleteDomain(domainId: string, move_users_to?: string): Promise<{ success: boolean; message: string; moved_users?: number }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string; moved_users?: number }>>(
      `/api/admin/v1/admin/domains/${domainId}`,
      move_users_to ? { move_users_to } : undefined
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Settings Management ==========

  /**
   * Get all system settings
   */
  async getAllSettings(params: {
    category?: string;
    page?: number;
    per_page?: number;
    search?: string;
  } = {}): Promise<{ settings: SystemSettings[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ settings: SystemSettings[]; total: number }>>(
      '/api/admin/v1/admin/config',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific setting
   */
  async getSetting(key: string): Promise<SystemSettings> {
    const response = await apiClient.get<BackendResponse<SystemSettings>>(
      `/api/admin/v1/admin/config/${key}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a setting
   */
  async updateSetting(key: string, value: any): Promise<SystemSettings> {
    const response = await apiClient.put<BackendResponse<SystemSettings>>(
      `/api/admin/v1/admin/config/${key}`,
      { value }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update multiple settings
   */
  async updateSettings(data: Record<string, any>): Promise<{ success: boolean; updated_count: number; settings: SystemSettings[] }> {
    const response = await apiClient.put<BackendResponse<{ success: boolean; updated_count: number; settings: SystemSettings[] }>>(
      '/api/admin/v1/admin/config',
      { settings: data }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Export configuration
   */
  async exportConfig(format: 'json' | 'yaml' | 'env' = 'json'): Promise<{ download_url: string; expires_at: string }> {
    const response = await apiClient.post<BackendResponse<{ download_url: string; expires_at: string }>>(
      '/api/admin/v1/admin/config/export',
      { format }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Import configuration
   */
  async importConfig(file: File, format: 'json' | 'yaml' | 'env' = 'json'): Promise<{ success: boolean; imported_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const response = await apiClient.post<BackendResponse<{ success: boolean; imported_count: number; errors: string[] }>>(
      '/api/admin/v1/admin/config/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== System Information ==========

  /**
   * Get system information and statistics
   */
  async getSystemInfo(): Promise<{
    version: string;
    build_date: string;
    build_commit: string;
    node_version: string;
    os_platform: string;
    os_release: string;
    os_arch: string;
    cpu_cores: number;
    total_memory: number;
    free_memory: number;
    uptime: number;
    start_time: string;
    timezone: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      version: string;
      build_date: string;
      build_commit: string;
      node_version: string;
      os_platform: string;
      os_release: string;
      os_arch: string;
      cpu_cores: number;
      total_memory: number;
      free_memory: number;
      uptime: number;
      start_time: string;
      timezone: string;
    }>>(
      '/api/admin/v1/admin/system'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get system statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    const response = await apiClient.get<BackendResponse<SystemStatistics>>(
      '/api/admin/v1/admin/statistics'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get license information
   */
  async getLicense(): Promise<LicenseInfo> {
    const response = await apiClient.get<BackendResponse<LicenseInfo>>(
      '/api/admin/v1/admin/license'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update license
   */
  async updateLicense(licenseKey: string): Promise<{ success: boolean; license: LicenseInfo; message?: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; license: LicenseInfo; message?: string }>>(
      '/api/admin/v1/admin/license',
      { license_key: licenseKey }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Health & Monitoring ==========

  /**
   * Get detailed health information
   */
  async getHealth(): Promise<ServerHealthDetailed> {
    const response = await apiClient.get<BackendResponse<ServerHealthDetailed>>(
      '/api/admin/v1/admin/health'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Run health check
   */
  async runHealthCheck(include_details: boolean = true): Promise<ServerHealthDetailed> {
    const response = await apiClient.post<BackendResponse<ServerHealthDetailed>>(
      '/api/admin/v1/admin/health/check',
      { include_details }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List active sessions
   */
  async listActiveSessions(params: {
    page?: number;
    per_page?: number;
    user_id?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ sessions: ActiveSession[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ sessions: ActiveSession[]; total: number }>>(
      '/api/admin/v1/admin/sessions',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/admin/v1/admin/sessions/${sessionId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Terminate all inactive sessions
   */
  async terminateInactiveSessions(maxInactiveHours: number = 24): Promise<{ success: boolean; terminated_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; terminated_count: number }>>(
      '/api/admin/v1/admin/sessions/cleanup',
      { max_inactive_hours: maxInactiveHours }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Audit Log ==========

  /**
   * Get audit log
   */
  async getAuditLog(params: {
    page?: number;
    per_page?: number;
    user_id?: string;
    action?: string;
    category?: string;
    entity_type?: string;
    entity_id?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ entries: AuditLogEntry[]; total: number }>>(
      '/api/admin/v1/admin/audit-log',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get user activity log
   */
  async getUserActivity(params: {
    page?: number;
    per_page?: number;
    user_id?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ activities: UserActivity[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ activities: UserActivity[]; total: number }>>(
      '/api/admin/v1/admin/activity-log',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Backup & Restore ==========

  /**
   * List all backups
   */
  async listBackups(params: {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    status?: string;
  } = {}): Promise<{ backups: BackupJob[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ backups: BackupJob[]; total: number }>>(
      '/api/admin/v1/admin/backup',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a backup
   */
  async createBackup(data: {
    name?: string;
    type?: 'full' | 'incremental' | 'differential';
    description?: string;
    include_databases?: boolean;
    include_storage?: boolean;
    include_config?: boolean;
  } = {}): Promise<BackupJob> {
    const response = await apiClient.post<BackendResponse<BackupJob>>(
      '/api/admin/v1/admin/backup',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get backup status
   */
  async getBackup(jobId: string): Promise<BackupJob> {
    const response = await apiClient.get<BackendResponse<BackupJob>>(
      `/api/admin/v1/admin/backup/${jobId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Download backup
   */
  async downloadBackup(jobId: string): Promise<{ download_url: string; expires_at: string }> {
    const response = await apiClient.get<BackendResponse<{ download_url: string; expires_at: string }>>(
      `/api/admin/v1/admin/backup/${jobId}/download`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete backup
   */
  async deleteBackup(jobId: string, keep_files: boolean = false): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/admin/v1/admin/backup/${jobId}`,
      { params: { keep_files: keep_files ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Database Migration ==========

  /**
   * List available migrations
   */
  async listMigrations(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    is_applied: boolean;
    can_roll_back: boolean;
    applied_at: string | null;
  }>> {
    const response = await apiClient.get<BackendResponse<Array<{
      id: string;
      name: string;
      description: string;
      version: string;
      is_applied: boolean;
      can_roll_back: boolean;
      applied_at: string | null;
    }>>>(
      '/api/admin/v1/admin/migration'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Run migrations
   */
  async runMigrations(data: {
    version?: string;
    dry_run?: boolean;
  } = {}): Promise<{
    success: boolean;
    applied: Array<{ id: string; version: string }>;
    errors: string[];
  }> {
    const response = await apiClient.post<BackendResponse<{
      success: boolean;
      applied: Array<{ id: string; version: string }>;
      errors: string[];
    }>>(
      '/api/admin/v1/admin/migration',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Rollback migrations
   */
  async rollbackMigrations(data: {
    version: string;
    dry_run?: boolean;
  }): Promise<{
    success: boolean;
    rolled_back: Array<{ id: string; version: string }>;
    errors: string[];
  }> {
    const response = await apiClient.post<BackendResponse<{
      success: boolean;
      rolled_back: Array<{ id: string; version: string }>;
      errors: string[];
    }>>(
      '/api/admin/v1/admin/migration/rollback',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Maintenance ==========

  /**
   * Clean up old data
   */
  async runCleanup(data: {
    cleanup_tasks: Array<{
      type: 'old_emails' | 'old_attachments' | 'old_sessions' | 'tmp_files' | 'logs';
      older_than_days: number;
    }>;
    dry_run?: boolean;
  }): Promise<{
    success: boolean;
    results: Record<string, { deleted_count: number; size_freed: number }>;
  }> {
    const response = await apiClient.post<BackendResponse<{
      success: boolean;
      results: Record<string, { deleted_count: number; size_freed: number }>;
    }>>(
      '/api/admin/v1/admin/maintenance/cleanup',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Optimize database
   */
  async optimizeDatabase(): Promise<{
    success: boolean;
    optimized_tables: string[];
    total_size_reduced: number;
  }> {
    const response = await apiClient.post<BackendResponse<{
      success: boolean;
      optimized_tables: string[];
      total_size_reduced: number;
    }>>(
      '/api/admin/v1/admin/maintenance/database/optimize'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<{
    has_update: boolean;
    current_version: string;
    latest_version: string;
    changelog_url: string;
    download_url: string;
    update_notes: string[];
    is_security_update: boolean;
    released_at: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      has_update: boolean;
      current_version: string;
      latest_version: string;
      changelog_url: string;
      download_url: string;
      update_notes: string[];
      is_security_update: boolean;
      released_at: string;
    }>>(
      '/api/admin/v1/admin/updates/check'
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Admin API instance
 */
export const adminApi = new AdminApi();

export default adminApi;
