'use client';

import { useCallback, useEffect } from 'react';

import { PwaStatusBar } from './pwa-status-bar';

export interface PwaUpdateToastProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Toast shown when a PWA update is available and has been downloaded.
 * Prompts the user to reload to activate the new version.
 */
export function PwaUpdateToast({ visible, onDismiss }: PwaUpdateToastProps): JSX.Element | null {
  useEffect(() => {
    if (!visible) return;
    // Auto-dismiss after 10 seconds if user doesn't act
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <PwaStatusBar
      message="A new version is available. Reload to update."
      type="info"
      onDismiss={onDismiss}
    />
  );
}
