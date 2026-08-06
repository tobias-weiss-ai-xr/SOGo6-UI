/**
 * WebAuthn/Passkeys Client Library
 *
 * This library provides client-side functionality for WebAuthn passkey
 * registration and authentication.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

import { get, post } from './api-client';

// ============================================================================
// Types
// ============================================================================

interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  timeout: number;
  attestation: string;
  userVerification: string;
  authenticatorSelection?: {
    residentKey: string;
    userVerification: string;
    requireResidentKey?: boolean;
  };
  challenge_id?: string; // Our custom addition
}

interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: string;
    transports: string[];
  }>;
  timeout: number;
  userVerification: string;
  challenge_id?: string; // Our custom addition
}

interface AuthenticatorAttestationResponseJSON {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
}

interface AuthenticatorAssertionResponseJSON {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  };
}

interface PublicKeyCredentialJSON {
  id: string;
  rawId: string;
  type: string;
  response: AuthenticatorAttestationResponseJSON | AuthenticatorAssertionResponseJSON;
}

interface WebAuthnCredential {
  id: string;
  name: string;
  is_default: boolean;
  sign_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface WebAuthnSupport {
  supported: boolean;
  require_webauthn: boolean;
  allow_password_fallback: boolean;
  user_has_passkeys: boolean;
  passkey_count: number;
}

// ============================================================================
// Constants
// ============================================================================

const API_BASE = '/user/v1/webauthn';

const DEFAULT_RELIANCE_PARTY_ID = window.location.hostname;
const DEFAULT_RELIANCE_PARTY_NAME = 'SOGo6';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if WebAuthn is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  return (
    'credentials' in navigator &&
    'PublicKeyCredential' in window &&
    'authenticatorSelection' in PublicKeyCredentialCreationOptions.prototype
  );
}

/**
 * Convert Uint8Array to base64url string
 */
function uint8ArrayToBase64url(buffer: Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert base64url string to Uint8Array
 */
function base64urlToUint8Array(base64url: string): Uint8Array {
  // Add padding if needed
  const padding = 4 - (base64url.length % 4);
  const base64 = (padding !== 4 ? base64url + '='.repeat(padding) : base64url)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const bytes = atob(base64);
  return new Uint8Array(Array.from(bytes).map((c) => c.charCodeAt(0)));
}

/**
 * Prepare PublicKeyCredentialCreationOptions for browser API
 */
function prepareRegistrationOptions(
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64urlToUint8Array(options.challenge),
    rp: {
      id: options.rp.id,
      name: options.rp.name
    },
    user: {
      id: base64urlToUint8Array(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName
    },
    pubKeyCredParams: options.pubKeyCredParams.map(p => ({
      type: p.type as PublicKeyCredentialType,
      alg: p.alg as COSE.Algorithm
    })),
    timeout: options.timeout,
    attestation: options.attestation as AttestationConveyancePreference,
    userVerification: options.userVerification as UserVerificationRequirement,
    authenticatorSelection: options.authenticatorSelection as AuthenticatorSelectionCriteria
  };
}

/**
 * Prepare PublicKeyCredentialRequestOptions for browser API
 */
function prepareAuthenticationOptions(
  options: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
  return {
    challenge: base64urlToUint8Array(options.challenge),
    rpId: options.rpId,
    allowCredentials: options.allowCredentials.map(c => ({
      id: base64urlToUint8Array(c.id),
      type: c.type as PublicKeyCredentialType,
      transports: c.transports as AuthenticationExtensionsClientOutputs['transports']
    })),
    timeout: options.timeout,
    userVerification: options.userVerification as UserVerificationRequirement
  };
}

/**
 * Convert browser response to JSON-serializable format for server
 */
function publicKeyCredentialToJSON(
  credential: PublicKeyCredential
): PublicKeyCredentialJSON {
  const { id, rawId, type, response } = credential;
  
  return {
    id: uint8ArrayToBase64url(new Uint8Array(id)),
    rawId: uint8ArrayToBase64url(new Uint8Array(rawId)),
    type,
    response: {
      attestationObject: response instanceof AuthenticatorAttestationResponse 
        ? uint8ArrayToBase64url(new Uint8Array(response.attestationObject))
        : undefined,
      clientDataJSON: uint8ArrayToBase64url(new Uint8Array(response.clientDataJSON)),
      authenticatorData: response instanceof AuthenticatorAssertionResponse
        ? uint8ArrayToBase64url(new Uint8Array(response.authenticatorData))
        : response instanceof AuthenticatorAttestationResponse
          ? uint8ArrayToBase64url(new Uint8Array(response.getAuthenticatorData()))
          : undefined,
      signature: response instanceof AuthenticatorAssertionResponse
        ? uint8ArrayToBase64url(new Uint8Array(response.signature))
        : undefined,
      userHandle: response instanceof AuthenticatorAssertionResponse
        ? response.userHandle ? uint8ArrayToBase64url(new Uint8Array(response.userHandle)) : null
        : undefined
    }
  };
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Check WebAuthn support status
 */
export async function checkWebAuthnSupport(): Promise<WebAuthnSupport> {
  const response = await get(`${API_BASE}`);
  return response?.data || {
    supported: isWebAuthnSupported(),
    require_webauthn: false,
    allow_password_fallback: true,
    user_has_passkeys: false,
    passkey_count: 0
  };
}

/**
 * Get registration options from server
 */
export async function getRegistrationOptions(
  userVerification: UserVerificationRequirement = 'preferred'
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const params = new URLSearchParams();
  if (userVerification) {
    params.append('user_verification', userVerification);
  }
  
  const response = await get(`${API_BASE}/challenge/register?${params.toString()}`);
  return response?.data;
}

/**
 * Register a new passkey
 */
export async function registerPasskey(
  options: PublicKeyCredentialCreationOptionsJSON,
  passkeyName?: string
): Promise<WebAuthnCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }
  
  const challengeId = options.challenge_id;
  if (!challengeId) {
    throw new Error('Missing challenge_id in registration options');
  }
  
  // Prepare options for browser API
  const publicKeyCredentialOptions = prepareRegistrationOptions(options);
  
  // Create credential
  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialOptions
  });
  
  if (!credential) {
    throw new Error('Passkey registration was cancelled');
  }
  
  // Convert to JSON for server
  const credentialJSON = publicKeyCredentialToJSON(
    credential as PublicKeyCredential
  );
  
  // Send to server
  const response = await post(`${API_BASE}/register`, {
    credential: credentialJSON,
    name: passkeyName,
    is_default: false,
    challenge_id: challengeId
  });
  
  return response?.data;
}

/**
 * Get login options from server
 */
export async function getLoginOptions(
  userVerification: UserVerificationRequirement = 'preferred'
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const params = new URLSearchParams();
  if (userVerification) {
    params.append('user_verification', userVerification);
  }
  
  const response = await get(`${API_BASE}/challenge/login?${params.toString()}`);
  return response?.data;
}

/**
 * Login with a passkey
 */
export async function loginWithPasskey(
  options: PublicKeyCredentialRequestOptionsJSON
): Promise<WebAuthnCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }
  
  const challengeId = options.challenge_id;
  if (!challengeId) {
    throw new Error('Missing challenge_id in login options');
  }
  
  // Prepare options for browser API
  const publicKeyCredentialOptions = prepareAuthenticationOptions(options);
  
  // Get credential
  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialOptions
  });
  
  if (!credential) {
    throw new Error('Passkey login was cancelled');
  }
  
  // Convert to JSON for server
  const credentialJSON = publicKeyCredentialToJSON(
    credential as PublicKeyCredential
  );
  
  // Send to server
  const response = await post(`${API_BASE}/login`, {
    credential: credentialJSON,
    challenge_id: challengeId
  });
  
  return response?.data;
}

/**
 * List all passkeys for the current user
 */
export async function listPasskeys(): Promise<{ credentials: WebAuthnCredential[]; count: number }> {
  const response = await get(`${API_BASE}/credentials`);
  return response?.data || { credentials: [], count: 0 };
}

/**
 * Get passkey details
 */
export async function getPasskey(credentialId: string): Promise<WebAuthnCredential> {
  const response = await get(`${API_BASE}/credentials/${credentialId}`);
  return response?.data;
}

/**
 * Update passkey (rename, set as default)
 */
export async function updatePasskey(
  credentialId: string,
  updates: { name?: string; is_default?: boolean }
): Promise<WebAuthnCredential> {
  const response = await post(`${API_BASE}/credentials/${credentialId}`, updates);
  return response?.data;
}

/**
 * Remove a passkey
 */
export async function removePasskey(credentialId: string): Promise<void> {
  await post(`${API_BASE}/credentials/${credentialId}`, {}, { method: 'DELETE' });
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Complete passkey registration flow
 */
export async function completeRegistration(
  passkeyName?: string,
  userVerification?: UserVerificationRequirement
): Promise<WebAuthnCredential> {
  // 1. Get registration options
  const options = await getRegistrationOptions(userVerification);
  
  // 2. Register passkey
  return registerPasskey(options, passkeyName);
}

/**
 * Complete passkey login flow
 */
export async function completeLogin(
  userVerification?: UserVerificationRequirement
): Promise<WebAuthnCredential> {
  // 1. Get login options
  const options = await getLoginOptions(userVerification);
  
  // 2. Login with passkey
  return loginWithPasskey(options);
}

// ============================================================================
// Type Extensions
// ============================================================================

declare global {
  interface Window {
    PublicKeyCredential: typeof PublicKeyCredential;
  }
}

// Ensure Typescript knows about WebAuthn types
export {};
