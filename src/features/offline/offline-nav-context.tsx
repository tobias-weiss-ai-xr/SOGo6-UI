'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNetworkStatus } from './network';

interface OfflineNavContextValue {
  /** True if the current page was loaded from the service worker's offline cache */
  isOfflineFallback: boolean;
  /** Called when we detect we're on an offline fallback page */
  setOfflineFallback: (value: boolean) => void;
}

const OfflineNavContext = createContext<OfflineNavContextValue | null>(null);

export function OfflineNavProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isOfflineFallback, setOfflineFallback] = useState(false);
  const { online } = useNetworkStatus();

  // Detect if the current page is an offline fallback
  // This is triggered by the service worker when it serves a cached response
  // or the offline page due to network failure
  useEffect(() => {
    if (!online) {
      // Check if the service worker served this page from its offline cache
      // This is a heuristic - we do not have a reliable signal from SW in browser
      void navigator?.serviceWorker?.controller?.state;
      // For simplicity: mark as offline when browser is offline
      const timer = setTimeout(() => setOfflineFallback(true), 0);
      return () => clearTimeout(timer);
    }
    // Online - never a fallback
    const timer = setTimeout(() => setOfflineFallback(false), 0);
    return () => clearTimeout(timer);
  }, [online]);

  return (
    <OfflineNavContext.Provider value={{ isOfflineFallback, setOfflineFallback }}>
      {children}
    </OfflineNavContext.Provider>
  );
}

export function useOfflineNav(): OfflineNavContextValue {
  const ctx = useContext(OfflineNavContext);
  if (!ctx) throw new Error('useOfflineNav must be used inside OfflineNavProvider');
  return ctx;
}
