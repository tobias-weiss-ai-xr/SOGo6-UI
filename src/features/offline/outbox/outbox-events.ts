/**
 * Event types for outbox operations.
 * Used for communication between components and the outbox service.
 */
export interface OutboxEvent {
  type: 'OUTBOX_UPDATED' | 'OUTBOX_FLUSH_STARTED' | 'OUTBOX_FLUSH_COMPLETED' | 'OUTBOX_ERROR';
  payload?: unknown;
}

export interface OutboxEventListener {
  (event: OutboxEvent): void;
}

class OutboxEventBus {
  private listeners: Set<OutboxEventListener> = new Set();

  addListener(listener: OutboxEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: OutboxEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

// Singleton event bus
export const outboxEventBus = new OutboxEventBus();
