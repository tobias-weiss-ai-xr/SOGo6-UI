/**
 * Authentication API Endpoints
 * All endpoints under /api/user/v1/auth/*
 */

import type { BackendResponse } from '../backend-response'
import { apiClient } from '../client/base-client'

// ========== Types ==========

/**
 * Login request body
 */
export interface LoginRequest {
  login: string
  password: string
  device_data?: {
    user_agent?: string
    ip_address?: string
    device_name?: string
  }
}

/**
 * Login response (contains JWT token)
 */
export interface LoginResponse {
  jwt_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: {
    uid: string
    display_name: string
    email: string
  }
  device_id: string
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string
  revoked: boolean
}

/**
 * Auth mode request
 */
export interface AuthModeRequest {
  username: string
  redirect?: string
}

/**
 * Auth mode response
 */
export interface AuthModeResponse {
  mode: 'none' | 'plain' | 'saml2' | 'oidc' | 'webauthn' | 'cas' | 'ldap'
  provider?: string
  redirect_url?: string
  auth_url?: string
}

/**
 * WebAuthn registration start response
 */
export interface WebAuthnRegistrationStartResponse {
  challenge: string
  rp: {
    name: string
    id: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: Array<{
    type: string
    alg: number
  }>
  authenticatorSelection: {
    authenticatorAttachment?: string
    requireResidentKey: boolean
    userVerification: string
  }
  timeout: number
}

/**
 * WebAuthn registration finish request
 */
export interface WebAuthnRegistrationFinishRequest {
  id: string
  rawId: string
  type: string
  response: {
    attestationObject: string
    clientDataJSON: string
  }
}

/**
 * WebAuthn registration finish response
 */
export interface WebAuthnRegistrationFinishResponse {
  success: boolean
  credential_id: string
  public_key: string
}

/**
 * WebAuthn authentication start response
 */
export interface WebAuthnAuthStartResponse {
  challenge: string
  rpId: string
  allowCredentials: Array<{
    id: string
    type: string
    transports?: string[]
  }>
  timeout: number
  userVerification: string
}

/**
 * WebAuthn authentication finish request
 */
export interface WebAuthnAuthFinishRequest {
  id: string
  rawId: string
  type: string
  response: {
    authenticationResponse: string
    clientDataJSON: string
  }
}

/**
 * WebAuthn authentication finish response
 */
export interface WebAuthnAuthFinishResponse {
  success: boolean
  jwt_token: string
  refresh_token: string
}

/**
 * Password reset request (initiate)
 */
export interface PasswordResetRequest {
  email: string
  recaptcha_token?: string
}

/**
 * Password reset response (initiate)
 */
export interface PasswordResetResponse {
  message: string
  reset_token: string // Only if same session
}

/**
 * Password reset confirm request
 */
export interface PasswordResetConfirmRequest {
  token: string
  new_password: string
}

/**
 * OIDC callback query parameters
 */
export interface OIDCCallbackParams {
  code: string
  state?: string
  error?: string
  error_description?: string
}

/**
 * SSO callback response
 */
export interface SSOCallbackResponse {
  jwt_token: string
  refresh_token: string
  user: {
    uid: string
    display_name: string
    email: string
  }
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
  async getAuthMode(
    username: string,
    redirect?: string
  ): Promise<AuthModeResponse> {
    const response = await apiClient.get<BackendResponse<AuthModeResponse>>(
      '/api/user/v1/auth/mode',
      { params: { username, redirect } }
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Login with username/password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<BackendResponse<LoginResponse>>(
      '/api/user/v1/auth/login',
      data
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Logout and invalidate session
   */
  async logout(deviceId?: string): Promise<LogoutResponse> {
    const params: Record<string, string> = {}
    if (deviceId) {
      params.device_id = deviceId
    }

    const response = await apiClient.post<BackendResponse<LogoutResponse>>(
      '/api/user/v1/auth/logout',
      undefined,
      { params }
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Start WebAuthn registration
   */
  async webAuthnRegistrationStart(
    username: string
  ): Promise<WebAuthnRegistrationStartResponse> {
    const response = await apiClient.post<
      BackendResponse<WebAuthnRegistrationStartResponse>
    >('/api/user/v1/auth/webauthn/registration/start', { username })
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Finish WebAuthn registration
   */
  async webAuthnRegistrationFinish(
    data: WebAuthnRegistrationFinishRequest
  ): Promise<WebAuthnRegistrationFinishResponse> {
    const response = await apiClient.post<
      BackendResponse<WebAuthnRegistrationFinishResponse>
    >('/api/user/v1/auth/webauthn/registration/finish', data)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Start WebAuthn authentication
   */
  async webAuthnAuthStart(
    username: string
  ): Promise<WebAuthnAuthStartResponse> {
    const response = await apiClient.post<
      BackendResponse<WebAuthnAuthStartResponse>
    >('/api/user/v1/auth/webauthn/authentication/start', { username })
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Finish WebAuthn authentication
   */
  async webAuthnAuthFinish(
    data: WebAuthnAuthFinishRequest
  ): Promise<WebAuthnAuthFinishResponse> {
    const response = await apiClient.post<
      BackendResponse<WebAuthnAuthFinishResponse>
    >('/api/user/v1/auth/webauthn/authentication/finish', data)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * SAML2 Assertion Consumer Service (callback)
   */
  async saml2Callback(
    provider: string,
    data: URLSearchParams | Record<string, string>
  ): Promise<SSOCallbackResponse> {
    const response = await apiClient.post<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/saml2/acs`,
      Object.fromEntries(
        data instanceof URLSearchParams ? data.entries() : Object.entries(data)
      )
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Handle OIDC/SAML2 callback (GET method)
   */
  async handleCallback(
    domain: string,
    params: URLSearchParams
  ): Promise<SSOCallbackResponse> {
    const response = await apiClient.get<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/callback/${domain}`,
      { params: Object.fromEntries(params.entries()) }
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Handle OIDC/SAML2 callback (POST method - for SAML2 HTTP-POST)
   */
  async handleCallbackPost(
    domain: string,
    data: Record<string, string>
  ): Promise<SSOCallbackResponse> {
    const response = await apiClient.post<BackendResponse<SSOCallbackResponse>>(
      `/api/user/v1/auth/callback/${domain}`,
      data
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(
    data: PasswordResetRequest
  ): Promise<PasswordResetResponse> {
    const response = await apiClient.post<
      BackendResponse<PasswordResetResponse>
    >('/api/user/v1/auth/password/reset', data)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(
    data: PasswordResetConfirmRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<
      BackendResponse<{ success: boolean; message: string }>
    >('/api/user/v1/auth/password/reset/confirm', data)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<BackendResponse<LoginResponse>>(
      '/api/user/v1/auth/token/refresh',
      { refresh_token: refreshToken }
    )
    return apiClient.unwrapBackendResponse(response)
  }

  // ========== SAML2 SSO ==========

  /**
   * Get SAML2 SP metadata XML
   */
  async getSaml2Metadata(domain?: string): Promise<string> {
    const url = domain
      ? `/api/user/v1/auth/saml2/metadata/${domain}`
      : '/api/user/v1/auth/saml2/metadata'
    const response = await apiClient.get<BackendResponse<string>>(url)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Initiate SAML2 SSO — returns redirect URL to IdP
   */
  async saml2Start(params: {
    domain?: string
    provider?: string
    relayState?: string
  }): Promise<{ redirect_url: string }> {
    const searchParams = new URLSearchParams()
    if (params.domain) searchParams.set('domain', params.domain)
    if (params.provider) searchParams.set('provider', params.provider)
    if (params.relayState) searchParams.set('relay_state', params.relayState)
    // This endpoint returns a 302 redirect — follow it to get the IdP URL
    const response = await apiClient.get<
      BackendResponse<{ redirect_url: string }>
    >(`/api/user/v1/auth/saml2/start?${searchParams.toString()}`)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Get SAML2 discovery (WAYF) — list available IdPs
   */
  async saml2Discovery(): Promise<Saml2DiscoveryResponse> {
    const response = await apiClient.get<
      BackendResponse<Saml2DiscoveryResponse>
    >('/api/user/v1/auth/saml2/discovery')
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Select an IdP from discovery and get the AuthnRequest redirect URL
   */
  async saml2SelectIdp(data: {
    entity_id: string
    relay_state?: string
    domain?: string
  }): Promise<{ redirect_url: string; entity_id: string }> {
    const response = await apiClient.post<
      BackendResponse<{ redirect_url: string; entity_id: string }>
    >('/api/user/v1/auth/saml2/discovery', data)
    return apiClient.unwrapBackendResponse(response)
  }

  // ========== SAML2 Admin Provider Management ==========

  /**
   * List all SAML2 providers (admin)
   */
  async listSaml2Providers(): Promise<Saml2ProviderListResponse> {
    const response = await apiClient.get<
      BackendResponse<Saml2ProviderListResponse>
    >('/api/admin/v1/auth/saml2/providers')
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Get a single SAML2 provider (admin)
   */
  async getSaml2Provider(providerId: string): Promise<Saml2Provider> {
    const response = await apiClient.get<BackendResponse<Saml2Provider>>(
      `/api/admin/v1/auth/saml2/providers/${providerId}`
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Create a SAML2 provider (admin)
   */
  async createSaml2Provider(data: Saml2ProviderCreate): Promise<Saml2Provider> {
    const response = await apiClient.post<BackendResponse<Saml2Provider>>(
      '/api/admin/v1/auth/saml2/providers',
      data
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Update a SAML2 provider (admin)
   */
  async updateSaml2Provider(
    providerId: string,
    data: Partial<Saml2ProviderCreate>
  ): Promise<Saml2Provider> {
    const response = await apiClient.put<BackendResponse<Saml2Provider>>(
      `/api/admin/v1/auth/saml2/providers/${providerId}`,
      data
    )
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Delete a SAML2 provider (admin)
   */
  async deleteSaml2Provider(
    providerId: string
  ): Promise<{ deleted: boolean; id: string }> {
    const response = await apiClient.delete<
      BackendResponse<{ deleted: boolean; id: string }>
    >(`/api/admin/v1/auth/saml2/providers/${providerId}`)
    return apiClient.unwrapBackendResponse(response)
  }

  /**
   * Refresh a provider's metadata from its metadata_url (admin)
   */
  async refreshSaml2ProviderMetadata(
    providerId: string
  ): Promise<Saml2Provider> {
    const response = await apiClient.post<BackendResponse<Saml2Provider>>(
      `/api/admin/v1/auth/saml2/providers/${providerId}/refresh`
    )
    return apiClient.unwrapBackendResponse(response)
  }
}

/**
 * Singleton Auth API instance
 */
export const authApi = new AuthApi()

export default authApi

// ========== SAML2 Types ==========

/**
 * SAML2 IdP entry in the discovery (WAYF) response
 */
export interface Saml2IdpEntry {
  entity_id: string
  name: string
  sso_url: string
  logo_url?: string
}

/**
 * SAML2 discovery response
 */
export interface Saml2DiscoveryResponse {
  idps: Saml2IdpEntry[]
  total: number
}

/**
 * SAML2 provider (admin view)
 */
export interface Saml2Provider {
  id: string
  name: string
  entity_id: string
  sso_url: string
  sso_binding?: string
  sls_url?: string
  sls_binding?: string
  certificate?: string
  fingerprint?: string
  metadata_url?: string
  metadata_xml?: string
  nameid_format?: string
  attribute_map?: Record<string, string>
  acs_url?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

/**
 * SAML2 provider create payload
 */
export interface Saml2ProviderCreate {
  id: string
  name: string
  entity_id: string
  sso_url: string
  sso_binding?: string
  sls_url?: string
  sls_binding?: string
  certificate?: string
  fingerprint?: string
  metadata_url?: string
  metadata_xml?: string
  nameid_format?: string
  attribute_map?: Record<string, string>
  acs_url?: string
  is_active?: boolean
}

/**
 * SAML2 provider list response
 */
export interface Saml2ProviderListResponse {
  providers: Saml2Provider[]
  total: number
}
