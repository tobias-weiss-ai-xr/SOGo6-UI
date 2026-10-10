'use client';

import { ReactNode, useEffect, useState } from 'react';

import { PwaUpdateToast } from './pwa-update-toast';
import { isPwaEnabled } from '../flags';

export interface SerwistProviderGateProps {
  children: ReactNode;
}

/**
 * Wrap the app with service worker registration and update handling.
 * Only active when PWA is enabled via NEXT_PUBLIC_PWA_ENABLED.
 */
export function SerwistProviderGate({ children }: SerwistProviderGateProps): JSX.Element {
  if (!isPwaEnabled()) {
    return <>{children}</>;
  }

  return <SerwistGateInternal>{children}</SerwistGateInternal>;
}

function SerwistGateInternal({ children }: SerwistProviderGateProps): JSX.Element {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    /*
     * This is a minimal manual update check.
     * The @serwist/turbopack plugin handles the service worker registration
     * and update detection, but we need to listen for the update ready message.
     */
    const channel = new BroadcastChannel('sogo6-sw-messages');
    channel.addEventListener('message', (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_READY') {
        setUpdateReady(true);
      }
    });

    return () => channel.close();
  }, []);

  return (
    <>
      {children}
      <PwaUpdateToast visible={updateReady} onDismiss={() => setUpdateReady(false)} />
    </>
  );
}
