/**
 * PasskeyLoginButton.tsx - Passkey Login Button Component
 *
 * A button component that initiates passkey-based login.
 * Falls back to showing "not supported" or hides if WebAuthn is unavailable.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button, ButtonProps } from '@/components/ui/button';
import { Key, Loader2 } from 'lucide-react';

import { checkWebAuthnSupport, completeLogin } from '@/lib/webauthn';

// ============================================================================
// Types
// ============================================================================

interface PasskeyLoginButtonProps extends ButtonProps {
  /**
   * Callback when login starts
   */
  onLoginStart?: () => void;
  
  /**
   * Callback when login succeeds
   */
  onLoginSuccess?: (credential: any) => void;
  
  /**
   * Callback when login fails
   */
  onLoginError?: (error: Error) => void;
  
  /**
   * Workflow: 'auto' (check support and show button), 'always' (always show), 'condensed' (icon only)
   */
  variant?: 'auto' | 'always' | 'icon';
  
  /**
   * Show loading state
   */
  showLoading?: boolean;
  
  /**
   * User verification requirement
   */
  userVerification?: 'preferred' | 'required' | 'discouraged';
  
  /**
   * Whether to redirect after success
   */
  redirectTo?: string;
  
  /**
   * Text to show when WebAuthn is not supported
   */
  _fallbackText?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function PasskeyLoginButton({
  onLoginStart,
  onLoginSuccess,
  onLoginError,
  variant = 'auto',
  showLoading = true,
  userVerification = 'preferred',
  redirectTo,
  fallbackText,
  className,
  children,
  ...props
}: PasskeyLoginButtonProps) {
  const { t } = useTranslation('auth');
  const router = useRouter();
  
  // State
  const [supported, setSupported] = useState<boolean | null>(null);
  const [policy, setPolicy] = useState<{ require_webauthn: boolean; allow_password_fallback: boolean } | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  
  // Check support on mount
  useEffect(() => {
    if (variant === 'always') {
      setSupported(true);
      return;
    }
    
    const check = async () => {
      try {
        const result = await checkWebAuthnSupport();
        setSupported(result.supported);
        // Policy not currently used, keeping for future enhancement
        // setPolicy({
        //   require_webauthn: result.require_webauthn,
        //   allow_password_fallback: result.allow_password_fallback
        // });
      } catch {
        setSupported(false);
      }
    };
    
    check();
  }, [variant]);
  
  // Handle login
  const handleLogin = useCallback(async () => {
    try {
      setLoggingIn(true);
      onLoginStart?.();
      
      // Complete login flow
      const credential = await completeLogin(userVerification);
      
      // Success!
      onLoginSuccess?.(credential);
      
      // Redirect if specified
      if (redirectTo) {
        router.push(redirectTo);
      }
      
    } catch (error: any) {
      console.error('Passkey login failed:', error);
      
      let message = t('passkeys.loginFailed');
      if (error.message.includes('cancelled') || error.message.includes('cancel')) {
        // User cancelled - this is not really an error
        message = t('passkeys.loginCancelled');
      } else if (error.message.includes('not supported')) {
        message = t('passkeys.browserNotSupported');
      } else if (error.message.includes('credential not found')) {
        message = t('passkeys.noCredentials');
      }
      
      toast.error(message);
      onLoginError?.(error);
      
    } finally {
      setLoggingIn(false);
    }
  }, [onLoginStart, onLoginSuccess, onLoginError, userVerification, redirectTo, router, t]);
  
  // Render nothing if variant is 'auto' and not supported
  if (variant === 'auto' && supported === false) {
    return null;
  }
  
  // Show loading state
  if (supported === null && variant !== 'always') {
    return (
      <Button variant="outline" disabled className={className} {...props}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {t('common.loading')}
      </Button>
    );
  }
  
  // Handle icon-only variant
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogin}
        disabled={loggingIn || supported === false}
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
  
  // Main render
  return (
    <Button
      onClick={handleLogin}
      disabled={loggingIn || supported === false}
      className={className}
      {...props}
    >
      {loggingIn && showLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t('common.processing')}
        </>
      ) : (
        <>
          <Key className="h-4 w-4 mr-2" />
          {children || t('passkeys.loginWithPasskey')}
        </>
      )}
    </Button>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default PasskeyLoginButton;
