'use client';

import { ReactNode } from 'react';

import { OfflineUnavailable } from './offline-unavailable';

export interface OfflineModuleGateProps {
  enabled: boolean;
  feature: string;
  children: ReactNode;
}

/**
 * Gate that only renders children when the offline feature is enabled.
 * Otherwise shows an unavailable notice.
 */
export function OfflineModuleGate({
  enabled,
  feature,
  children,
}: OfflineModuleGateProps): JSX.Element {
  if (!enabled) {
    return <OfflineUnavailable feature={feature} />;
  }
  return <>{children}</>;
}
