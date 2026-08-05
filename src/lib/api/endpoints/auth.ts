/**
 * Authentication API Endpoints
 * All endpoints under /api/user/v1/auth/*
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Login request body
 */
export interface LoginRequest {
  login: string;
  password: string;
  device_data?: {
    user_agent?: string;
    ip_address?: string;
    device_name?: string;
  };
}

/**
 * Login response (contains JWT token)
 */
export interface LoginResponse {
  jwt_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    uid: string;
    display_name: string;
    email: string;
  };
  device_id: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string;
  revoked: boolean;
}

/**
 * Auth mode request
 */
export interface AuthModeRequest {
  username: string;
  redirect?: string;
}

/**
 * Auth mode response
 */
export interface AuthModeResponse {
  mode: 'none' | 'plain' | 'saml2' | 'oidc' | 'webauthn' | 'cas' | 'ldap';
  provider?: string;
  redirect_url?: string;
  auth_url?: string;
}

/**
 * WebAuthn registration start response
 */
export interface WebAuthnRegistrationStartResponse {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment?: string;
    requireResidentKey: boolean;
    userVerification: string;
  };
  timeout: number;
}

/**
 * WebAuthn registration finish request
 */
export interface WebAuthnRegistrationFinishRequest {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
}

/**
 * WebAuthn registration finish response
 */
export interface WebAuthnRegistrationFinishResponse {
  success: boolean;
  credential_id: string;
  public_key: string;
}

/**
 * WebAuthn authentication start response
 */
export interface WebAuthnAuthStartResponse {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  timeout: number;
  userVerification: string;
}

/**
 * WebAuthn authentication finish request
 */
export interface WebAuthnAuthFinishRequest {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticationResponse: string;
    clientDataJSON: string;
  };
}

/**
 * WebAuthn authentication finish response
 */
export interface WebAuthnAuthFinishResponse {
  success: boolean;
  jwt_token: string;
  refresh_token: string;
}

/**
 * Password reset request (initiate)
 */
export interface PasswordResetRequest {
  email: string;
  recaptcha_token?: string;
}

/**
 * Password reset response (initiate)
 */
export interface PasswordResetResponse {
  message: string;
  reset_token: string; // Only if same session
}

/**
 * Password reset confirm request
 */
export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

/**
 * OIDC callback query parameters
 */
export interface OIDCCallbackParams {
  code: string;
  state?: string;
  error?: string;
  error_description?: string;
}

/**
 * SSO callback response
 */
export interface SSOCallbackResponse {
  jwt_token: string;
  refresh_token: string;
  user: {
    uid: string;
    display_name: string;
    email: string;
  };
}

// ========== Auth API Class ==========

/**
 * Authentication API Client
 * Handles all authentication-related endpoints
 */
export class AuthApi {
  /**
   * Get authentication mode for a user
   */
  async getAuthMode(username: string, redirect?: string): Promise<AuthModeResponse> {
    const response = await apiClient.get<BackendResponse<AuthModeResponse>>(
      '/api/user/v1/auth/mode',
      { params: { username, redirect } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Login with username/password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<BackendResponse<LoginResponse>>(
      '/api/user/v1/auth/login',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Logout and invalidate session
   */
  async logout(deviceId?: string): Promise<LogoutResponse> {
    const params: Record<string, string> = {};
    if (deviceId) {
      params.device_id = deviceId;
    }
    
    const response = await apiClient.post<BackendResponse<LogoutResponse>>(
      '/api/user/v1/auth/logout',
      undefined,
      { params }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Start WebAuthn registration
   */
  async webAuthnRegistrationStart(username: string): Promise<WebAuthnRegistrationStartResponse> {
    const response = await apiClient.post<BackendResponse<WebAuthnRegistrationStartResponse>>(
      '/api/user/v1/auth/webauthn/registration/start',
      { username }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Finish WebAuthn registration
   */
  async webAuthnRegistrationFinish(data: WebAuthnRegistrationFinishRequest): Promise<WebAuthnRegistrationFinishResponse> {
    const response = await apiClient.post<BackendResponse<WebAuthnRegistrationFinishResponse>>(
      '/api/user/v1/auth/webauthn/registration/finish',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Start WebAuthn authentication
   */
  async webAuthnAuthStart(username: string): Promise<WebAuthnAuthStartResponse> {
    const response = await apiClient.post<BackendResponse<WebAuthnAuthStartResponse>>(
      '/api/user/v1/auth/webauthn/authentication/start',
      { username }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Finish WebAuthn authentication
   */
  async webAuthnAuthFinish(data: WebAuthnAuthFinishRequest): Promise<WebAuthnAuthFinishResponse> {
    const response = await apiClient.post<BackendResponse<WebAuthnAuthFinishResponse>>(
      '/api/user/v1/auth/webauthn/authentication/finish',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get SAML2 metadata
   */
  async getSaml2Metadata(provider: string): Promise<string> {
    const response = await apiClient.get<string>(
      `/api/user/v1/auth/saml2/metadata`,
      { params: { provider } }
    );
    return response.data;
  }

  /**
   * Start SAML2 login
   */
  async saml2Start(provider: string, redirectUrl?: string): Promise<{ auth_url: string; state: string }> {
    const params: Record<string, string> = { provider };
    if (redirectUrl) {
      params.redirect = redirectUrl;
    }
    
    const response = await apiClient.get<BackendResponse<{ auth_url: string; state: string }>>(
      '/api/user/v1/auth/saml2/start',
      { params }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * SAML2 Assertion Consumer Service (callback)
   */
  async saml2Callback(provider: string, data: URLSearchParams | Record<string, string>): Promise<SSOCallbackResponse> {
    const response = await apiClient.post<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/saml2/acs`,
      Object.fromEntries(data instanceof URLSearchParams ? data.entries() : Object.entries(data))
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Handle OIDC/SAML2 callback (GET method)
   */
  async handleCallback(domain: string, params: URLSearchParams): Promise<SSOCallbackResponse> {
    const response = await apiClient.get<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/callback/${domain}`,
      { params: Object.fromEntries(params.entries()) }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Handle OIDC/SAML2 callback (POST method - for SAML2 HTTP-POST)
   */
  async handleCallbackPost(domain: string, data: Record<string, string>): Promise<SSOCallbackResponse> {
    const response = await apiClient.post<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/callback/${domain}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    const response = await apiClient.post<BackendResponse<PasswordResetResponse>>(
      '/api/user/v1/auth/password/reset',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(data: PasswordResetConfirmRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; message: string }>>(
      '/api/user/v1/auth/password/reset/confirm',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<BackendResponse<LoginResponse>>(
      '/api/user/v1/auth/token/refresh',
      { refresh_token: refreshToken }
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Auth API instance
 */
export const authApi = new AuthApi();

export default authApi;
