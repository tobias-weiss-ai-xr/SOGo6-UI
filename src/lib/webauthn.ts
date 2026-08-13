/**
 * WebAuthn/Passkeys Client Library
 *
 * This library provides client-side functionality for WebAuthn passkey
 * registration and authentication. Uses the existing Redux RTK Query API.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

// ============================================================================
// Types
// ============================================================================

/**
 * JSON-serializable WebAuthn options for the server
 */
export interface PublicKeyCredentialCreationOptionsJSON {
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
  challenge_id?: string;
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: string;
    transports: string[];
  }>;
  timeout: number;
  userVerification: string;
  challenge_id?: string;
}

/**
 * JSON representation for server communication
 */
export interface PublicKeyCredentialJSON {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject?: string;
    clientDataJSON: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
  };
  clientExtensionResults?: Record<string, unknown>;
}

export interface WebAuthnCredential {
  id: string;
  name: string;
  is_default: boolean;
  sign_count: number;
  last_used_at: string | null;
  created_at: string;
}

export interface WebAuthnSupport {
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if WebAuthn is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  // PublicKeyCredential is a runtime class in WebAuthn-capable browsers;
  // the static creation options type must NOT be used as a value here.
  return (
    typeof window !== 'undefined' &&
    'credentials' in window &&
    typeof window.PublicKeyCredential !== 'undefined'
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
export function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = 4 - (base64url.length % 4);
  const base64 = (padding !== 4 ? base64url + '='.repeat(padding) : base64url)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const bytes = atob(base64);
  return new Uint8Array(Array.from(bytes).map((c) => c.charCodeAt(0)));
}

/**
 * Convert base64url string to ArrayBuffer
 */
export function base64urlToBuffer(base64url: string): ArrayBuffer {
  return base64urlToUint8Array(base64url).buffer as ArrayBuffer;
}

/**
 * Convert ArrayBuffer to base64url string
 */
export function bufferToBase64url(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64url(new Uint8Array(buffer));
}

/**
 * Prepare PublicKeyCredentialCreationOptions for browser API
 */
export function prepareRegistrationOptions(
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64urlToBuffer(options.challenge),
    rp: {
      id: options.rp.id,
      name: options.rp.name,
    },
    user: {
      id: base64urlToBuffer(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName,
    },
    pubKeyCredParams: options.pubKeyCredParams.map((p) => ({
      type: p.type as PublicKeyCredentialType,
      alg: p.alg as number,
    })),
    timeout: options.timeout,
    attestation: options.attestation as AttestationConveyancePreference,
    // userVerification/authenticatorSelection are valid per the WebAuthn
    // spec; cast the whole object for older lib.dom typings.
    ...(options.userVerification
      ? { userVerification: options.userVerification as UserVerificationRequirement }
      : {}),
    authenticatorSelection: options.authenticatorSelection as AuthenticatorSelectionCriteria,
  } as PublicKeyCredentialCreationOptions;
}

/**
 * Prepare PublicKeyCredentialRequestOptions for browser API
 */
export function prepareAuthenticationOptions(
  options: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
  return {
    challenge: base64urlToBuffer(options.challenge),
    rpId: options.rpId,
    allowCredentials: options.allowCredentials.map((c) => ({
      id: base64urlToBuffer(c.id),
      type: c.type as PublicKeyCredentialType,
      transports: c.transports as AuthenticatorTransport[],
    })),
    timeout: options.timeout,
    userVerification: options.userVerification as UserVerificationRequirement,
  };
}

/**
 * Convert browser PublicKeyCredential to JSON-serializable format for server
 */
export function publicKeyCredentialToJSON(
  credential: PublicKeyCredential
): PublicKeyCredentialJSON {
  const { id, rawId, type, response } = credential;

  // NOTE: credential.id is ALREADY a base64url string per the WebAuthn spec
  // (NOT an ArrayBuffer). Passing it to bufferToBase64url would silently
  // produce an empty string (new Uint8Array(str) has length 0).
  return {
    id,
    rawId: bufferToBase64url(rawId),
    type,
    response: {
      attestationObject:
        response instanceof AuthenticatorAttestationResponse
          ? bufferToBase64url(response.attestationObject)
          : undefined,
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData:
        response instanceof AuthenticatorAssertionResponse
          ? bufferToBase64url(response.authenticatorData)
          : response instanceof AuthenticatorAttestationResponse
          ? bufferToBase64url(response.getAuthenticatorData())
          : undefined,
      signature:
        response instanceof AuthenticatorAssertionResponse
          ? bufferToBase64url(response.signature)
          : undefined,
      userHandle:
        response instanceof AuthenticatorAssertionResponse
          ? response.userHandle
            ? bufferToBase64url(response.userHandle)
            : null
          : undefined,
    },
    clientExtensionResults: credential.getClientExtensionResults?.() as Record<string, unknown>,
  };
}

/**
 * Simple HTTP GET request
 */
async function httpGet<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Simple HTTP POST request
 */
async function httpPost<T>(url: string, body: unknown): Promise<T | null> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || errorData?.message || response.statusText);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Simple HTTP DELETE request
 */
async function httpDelete(url: string): Promise<void> {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || errorData?.message || response.statusText);
  }
}

// ============================================================================
// Authentication Helper Types (for TypeScript)
// ============================================================================

declare global {
  namespace NodeJS {
    interface Global {
      PublicKeyCredential: typeof PublicKeyCredential;
    }
  }
}

// Extend window if needed
declare global {
  interface Window {
    PublicKeyCredential: typeof PublicKeyCredential;
  }
}
