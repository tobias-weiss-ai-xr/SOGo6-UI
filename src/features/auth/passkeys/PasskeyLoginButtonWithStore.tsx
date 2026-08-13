/**
 * PasskeyLoginButtonWithStore.tsx - Passkey Login Button using Redux Store
 *
 * Integrates with the existing Redux-based auth system.
 * Uses the RTK Query API endpoints from auth.api.ts
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button, ButtonProps } from '@/components/ui/button';
import { Key, Loader2 } from 'lucide-react';

import {
  useWebauthnBeginLoginMutation,
  useWebauthnCompleteLoginMutation,
  useLoginMutation,
} from '@/features/auth/components/store/auth.api';
import { setCredentials } from '@/features/auth/components/store/auth.slice';
import { useAppDispatch } from '@/lib/redux/hooks';
import { getErrorMessage } from '@/lib/redux/api/error-handlers';

// ============================================================================
// Types
// ============================================================================

interface JwtPayload {
  uid: string;
  cn: string;
  email: string;
}

interface PasskeyLoginButtonWithStoreProps
  extends Omit<ButtonProps, 'variant'> {
  /**
   * Email to use for login (optional, may be required by server)
   */
  email?: string;
  
  /**
   * Callback when login starts
   */
  onLoginStart?: () => void;
  
  /**
   * Callback when login succeeds
   */
  onLoginSuccess?: () => void;
  
  /**
   * Callback when login fails
   */
  onLoginError?: (error: Error) => void;
  
  /**
   * Whether to show the button even if WebAuthn may not be supported
   */
  showAlways?: boolean;
  
  /**
   * Display mode: 'default', 'icon', or 'ghost'
   */
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
}

// ============================================================================
// Helper Functions
// ============================================================================

function decodeJwtPayload(token: string): JwtPayload {
  const [, payloadB64] = token.split('.');
  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as JwtPayload;
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============================================================================
// Main Component
// ============================================================================

export function PasskeyLoginButtonWithStore({
  email,
  onLoginStart,
  onLoginSuccess,
  onLoginError,
  showAlways = false,
  variant = 'outline',
  className,
  ...props
}: PasskeyLoginButtonWithStoreProps) {
  const t = useTranslations('AUTH');
  const dispatch = useAppDispatch();
  
  const [beginLogin] = useWebauthnBeginLoginMutation();
  const [completeLogin] = useWebauthnCompleteLoginMutation();
  const [login] = useLoginMutation();
  
  const [loggingIn, setLoggingIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'error' | 'success'>('idle');

  // Check if WebAuthn is supported
  const isSupported = typeof window !== 'undefined' && 
    'credentials' in window && 
    'PublicKeyCredential' in window;

  // Render nothing if not supported and not forced
  if (!isSupported && !showAlways) {
    return null;
  }

  const handleLogin = useCallback(async () => {
    if (!isSupported) {
      toast.error(t('passkey.error.not_supported.string'));
      return;
    }

    try {
      setLoggingIn(true);
      setStatus('waiting');
      onLoginStart?.();

      // Step 1: Get login challenge from server
      const beginResult = await beginLogin().unwrap();
      const publicKey = beginResult.data.publicKey as PublicKeyCredentialRequestOptions;
      
      // Convert challenge and allowCredentials from base64url to ArrayBuffer
      publicKey.challenge = base64urlToBuffer(publicKey.challenge as unknown as string);
      
      if (publicKey.allowCredentials) {
        publicKey.allowCredentials = publicKey.allowCredentials.map((cred) => ({
          ...cred,
          id: base64urlToBuffer(cred.id as unknown as string),
          type: 'public-key' as const,
        }));
      }

      // Step 2: Trigger browser's WebAuthn API
      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        // User cancelled
        setStatus('idle');
        setLoggingIn(false);
        return;
      }

      // Step 3: Convert credential to JSON format for server
      const credentialResponse = credential.response as AuthenticatorAssertionResponse;
      const credentialData = {
        id: credential.id,
        rawId: base64urlEncode(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: base64urlEncode(credentialResponse.clientDataJSON),
          authenticatorData: base64urlEncode(credentialResponse.authenticatorData),
          signature: base64urlEncode(credentialResponse.signature),
          userHandle: credentialResponse.userHandle
            ? base64urlEncode(credentialResponse.userHandle)
            : null,
        },
        clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
      };

      // Step 4: Complete login on server
      const completeResult = await completeLogin({ credential: credentialData }).unwrap();
      const userUid = completeResult.data.user_uid;

      // Step 5: Perform actual login with JWT token
      const loginResult = await login({
        username: userUid,
        password: 'webauthn', // Special flag to indicate WebAuthn login
      }).unwrap();

      if (loginResult.data?.jwt_token) {
        // Step 6: Store credentials in Redux
        const payload = decodeJwtPayload(loginResult.data.jwt_token);
        dispatch(
          setCredentials({
            token: loginResult.data.jwt_token,
            user: {
              uid: payload.uid,
              cn: payload.cn,
              email: payload.email,
            },
            rememberMe: true,
          })
        );

        setStatus('success');
        onLoginSuccess?.();
      }

    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error) || t('passkey.error.authentication_failed.string');
      setStatus('error');
      toast.error(errorMsg);
      onLoginError?.(new Error(errorMsg));
    } finally {
      setLoggingIn(false);
    }
  }, [isSupported, beginLogin, completeLogin, login, dispatch, onLoginStart, onLoginSuccess, onLoginError, t]);

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLogin}
        disabled={loggingIn || !isSupported}
        className={className}
        {...props}
      >
        {loggingIn ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Key className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // Default render
  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogin}
      disabled={loggingIn || !isSupported}
      className={className}
      {...props}
    >
      {loggingIn ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t('passkey.authenticating.string')}
        </>
      ) : (
        <>
          <Key className="h-4 w-4 mr-2" />
          {t('passkey.sign_in.string')}
        </>
      )}
    </Button>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default PasskeyLoginButtonWithStore;
