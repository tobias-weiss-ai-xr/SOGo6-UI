/**
 * Background sync service for flushing the outbox when the browser comes back online.
 * Uses the Background Sync API if available, falls back to a visibility change handler.
 */
import { OutboxCoordinator } from './outbox-coordinator';

export class OutboxFlushService {
  private channel: BroadcastChannel | null = null;
  private coordinator = OutboxCoordinator.instance;

  start(): void {
    this.setupOnlineListener();
    this.setupBackgroundSync();
    this.setupMessageListener();
  }

  stop(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleOnline = (): void => {
    this.flush();
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      this.flush();
    }
  };

  private setupBackgroundSync(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('SyncManager' in window)) {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('sogo6-outbox-sync');
    });

    navigator.serviceWorker.addEventListener('sync', (event) => {
      if (event.tag === 'sogo6-outbox-sync') {
        event.waitUntil(this.coordinator.processAll());
      }
    });
  }

  private setupMessageListener(): void {
    this.channel = new BroadcastChannel('sogo6-offline');
    this.channel.addEventListener('message', (event) => {
      if (event.data?.type === 'FLUSH_OUTBOX') {
        this.flush();
      }
    });
  }

  private flush(): void {
    // Debounce rapid online/visibility events
    const debouncedFlush = (): void => {
      this.coordinator.processAll();
    };

    if (typeof window !== 'undefined') {
      // Simple debounce: wait 1 second for the connection to stabilize
      setTimeout(debouncedFlush, 1000);
    }
  }
}

// Singleton instance
export const outboxFlushService = new OutboxFlushService();
