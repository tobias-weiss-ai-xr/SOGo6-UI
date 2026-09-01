/**
 * System API Endpoints
 * All endpoints under /api/v1/system/*
 * Non-authenticated endpoints (available before login)
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * System parameters needed by UI before login
 */
export interface SystemParameters {
  version: string;
  build_date: string;
  build_commit: string;
  product_name: string;
  edge_sogod_host: string;
  ldap_epoch: number;
  clear_url: boolean;
  status_url: string;
  time_format: string;
  date_format: string;
  week_start_day: number; // 0 = Sunday, 1 = Monday, etc.
  timezone: string;
  auth_mechanisms: string[];
  sso_providers: Array<{
    id: string;
    name: string;
    type: 'saml2' | 'oidc' | 'cas' | 'webauthn';
    display_name: string;
    button_text: string;
    button_color: string;
    button_icon: string;
    auth_url: string;
    is_enabled: boolean;
    is_default: boolean;
    order: number;
  }>;
  default_domain: string | null;
  domains: string[];
  locale: string;
  available_languages: Array<{
    code: string;
    name: string;
    native_name: string;
    flag: string;
    is_default: boolean;
  }>;
  available_timezones: string[];
  features: {
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
  };
  customization: {
    logo: string | null;
    logo_dark: string | null;
    favicon: string | null;
    primary_color: string;
    secondary_color: string;
    background_image: string | null;
    site_name: string;
    custom_css: string | null;
    allow_user_themes: boolean;
  };
  modules: Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    is_enabled: boolean;
    is_core: boolean;
    settings: Record<string, any>;
  }>;
  integrations: Array<{
    id: string;
    name: string;
    type: 'opencloud' | 'matrix' | 'jitsi' | 'element' | 'mattermost' | 'slack' | 'teams' | 'zoom' | 'webex' | string;
    is_enabled: boolean;
    config: Record<string, any>;
  }>;
  maintenance: {
    mode: boolean;
    message: string | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
  };
  oidc_providers: any[];
  portal_config: any;
  intercom_url: string | null;
}

/**
 * User authentication mechanism information
 */
export interface UserAuthMechanism {
  user_uid: string;
  username: string;
  mechanisms: string[];
  redirect_url: string | null;
  sso_providers: Array<{
    id: string;
    name: string;
    type: string;
    auth_url: string;
  }>;
  default_priority: string | null;
}

/**
 * Version information
 */
export interface VersionInfo {
  version: string;
  build_date: string;
  build_commit: string;
  git_branch: string | null;
  node_version: string;
  dependencies: Record<string, string>;
}

// ========== System API Class ==========

/**
 * System API Client
 * Handles system-level endpoints (no authentication required for most)
 */
export class SystemApi {
  /**
   * Get system parameters needed by UI before login
   * This is the most important endpoint - called on every page load before authentication
   */
  async getSystemParameters(): Promise<SystemParameters> {
    const response = await apiClient.get<BackendResponse<SystemParameters>>(
      '/api/user/v1/system'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Ping endpoint - simple health check
   * Returns "pong" if server is alive
   */
  async ping(): Promise<{ pong: string; timestamp: number; uptime: number }> {
    const response = await apiClient.get<BackendResponse<{ pong: string; timestamp: number; uptime: number }>>(
      '/api/user/v1/system/ping'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get authentication mode/mechanisms for a specific user
   */
  async getAuthMechanism(
    username: string,
    redirect?: string
  ): Promise<UserAuthMechanism> {
    const response = await apiClient.get<BackendResponse<UserAuthMechanism>>(
      '/api/user/v1/system/auth-mech',
      { params: { username, redirect } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get version information
   */
  async getVersion(): Promise<VersionInfo> {
    const response = await apiClient.get<BackendResponse<VersionInfo>>(
      '/api/user/v1/system/version'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get server capabilities
   */
  async getCapabilities(): Promise<{
    capabilities: string[];
    modules: string[];
    api_versions: string[];
    auth_methods: string[];
  }> {
    const response = await apiClient.get<BackendResponse<{
      capabilities: string[];
      modules: string[];
      api_versions: string[];
      auth_methods: string[];
    }>>(
      '/api/user/v1/system/capabilities'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get available SSO providers
   */
  async getSSOProviders(): Promise<Array<{
    id: string;
    name: string;
    type: 'saml2' | 'oidc' | 'cas' | 'webauthn';
    display_name: string;
    description: string | null;
    button_text: string;
    button_color: string;
    button_icon: string | null;
    auth_url: string;
    is_enabled: boolean;
    is_default: boolean;
    order: number;
    config: Record<string, any>;
  }>> {
    const response = await apiClient.get<BackendResponse<Array<{
      id: string;
      name: string;
      type: 'saml2' | 'oidc' | 'cas' | 'webauthn';
      display_name: string;
      description: string | null;
      button_text: string;
      button_color: string;
      button_icon: string | null;
      auth_url: string;
      is_enabled: boolean;
      is_default: boolean;
      order: number;
      config: Record<string, any>;
    }>>>(
      '/api/user/v1/system/sso/providers'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get portal configuration (for Nubus integration)
   */
  async getPortalConfig(): Promise<{
    app_id: string;
    name: string;
    description: string;
    icon_url: string;
    launch_url: string;
    intercom_url: string | null;
    scopes: string[];
    category: string;
    is_available: boolean;
    version: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      app_id: string;
      name: string;
      description: string;
      icon_url: string;
      launch_url: string;
      intercom_url: string | null;
      scopes: string[];
      category: string;
      is_available: boolean;
      version: string;
    }>>(
      '/api/user/v1/system/portal/config'
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton System API instance
 * Note: No authentication required for most of these endpoints
 */
export const systemApi = new SystemApi();

export default systemApi;
