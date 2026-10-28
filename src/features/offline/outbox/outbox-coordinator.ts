/**
 * Coordinate outbox operations for offline capability.
 * Handles queuing, retrying, and processing of actions that need to sync to the server.
 */
import type { OutboxRecord } from '../types';
import { clearOutbox, deleteOutboxRecord, getAllOutboxRecords, saveOutboxRecord } from '../db/outbox-store';

export interface OutboxAction {
  type: string;
  payload: unknown;
}

let coordinator: OutboxCoordinator | null = null;

export class OutboxCoordinator {
  private processing = false;

  static get instance(): OutboxCoordinator {
    if (!coordinator) {
      coordinator = new OutboxCoordinator();
    }
    return coordinator;
  }

  /**
   * Queue an action for later processing when back online.
   */
  async queue(action: OutboxAction): Promise<OutboxRecord> {
    const record: OutboxRecord = {
      id: this.generateId(),
      action: action.type,
      payload: action.payload,
      createdAt: Date.now(),
      lastAttemptAt: 0,
      attemptCount: 0,
      lastError: '',
    };

    await saveOutboxRecord(record);
    return record;
  }

  /**
   * Process all queued outbox records.
   * Called when coming back online.
   */
  async processAll(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const records = await getAllOutboxRecords();
      for (const record of records) {
        try {
          await this.processRecord(record);
          await deleteOutboxRecord(record.id);
        } catch (error) {
          // Update retry count and last error
          record.lastAttemptAt = Date.now();
          record.attemptCount += 1;
          record.lastError = error instanceof Error ? error.message : String(error);
          await saveOutboxRecord(record);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single outbox record.
   * To be overridden by specific implementations for different action types.
   */
  protected async processRecord(_record: OutboxRecord): Promise<void> {
    // Base implementation does nothing
    // Subclasses override with actual processing logic
  }

  /**
   * Clear all outbox records.
   */
  async clear(): Promise<void> {
    await clearOutbox();
  }

  /**
   * Get the count of pending outbox records.
   */
  async count(): Promise<number> {
    const records = await getAllOutboxRecords();
    return records.length;
  }

  private generateId(): string {
    return `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
