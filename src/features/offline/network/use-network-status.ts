'use client';

import { useEffect, useState } from 'react';

export interface NetworkStatus {
  online: boolean;
}

/** Track the browser's online/offline state using navigator.onLine. */
export function useNetworkStatus(): NetworkStatus {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { online };
}
