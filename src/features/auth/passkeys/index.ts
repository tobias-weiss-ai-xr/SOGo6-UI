/**
 * Passkeys Feature Index
 *
 * Exports all passkey-related components that integrate with the existing Redux store.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

// Components that integrate with Redux/RTK Query
export { PasskeyManagerWithStore as PasskeyManager } from './PasskeyManagerWithStore';
export { PasskeyLoginButtonWithStore as PasskeyLoginButton } from './PasskeyLoginButtonWithStore';

// Also export the raw components for advanced use cases
export { PasskeyManagerWithStore } from './PasskeyManagerWithStore';
export { PasskeyLoginButtonWithStore } from './PasskeyLoginButtonWithStore';

// WebAuthn utility library
export * from '@/lib/webauthn';
