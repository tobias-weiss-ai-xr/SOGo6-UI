/**
 * Passkeys Feature Index
 *
 * Exports all passkey-related components and utilities.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

export { PasskeyManager } from './PasskeyManager';
export { PasskeyLoginButton } from './PasskeyLoginButton';

// Re-export types and utilities
export type { WebAuthnCredential } from './PasskeyManager';
