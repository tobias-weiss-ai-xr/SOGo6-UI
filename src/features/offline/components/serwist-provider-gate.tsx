'use client';

import { ReactNode } from 'react';

import { isPwaEnabled } from '../flags';

export interface SerwistProviderGateProps {
  children: ReactNode;
}

/**
 * Wrap the app with service worker registration and update handling.
 * Only active when PWA is enabled via NEXT_PUBLIC_PWA_ENABLED.
 *
 * When PWA is disabled (default), this is a transparent passthrough.
 *
 * ponytail: PWA is off by default → passthrough; the outbox flush + update
 * toast wiring can be added when a specific offline feature ships.
 */
export function SerwistProviderGate({ children }: SerwistProviderGateProps): JSX.Element {
  if (!isPwaEnabled()) {
    return <>{children}</>;
  }
  return <>{children}</>;
}
