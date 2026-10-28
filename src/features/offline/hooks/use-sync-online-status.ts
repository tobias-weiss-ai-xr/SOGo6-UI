'use client';

import { useEffect } from 'react';
import { outboxFlushService } from '../outbox';

/**
 * Sync online status changes to trigger outbox flushing.
 * Call this in the root layout or similar high-level component.
 */
export function useSyncOnlineStatus(): void {
  useEffect(() => {
    outboxFlushService.start();
    return () => outboxFlushService.stop();
  }, []);
}
