/**
 * Helper to convert outbox records to list items for display.
 * Placeholder for future implementation.
 */
import type { OutboxRecord } from '../types';

interface OutboxListItem {
  id: string;
  action: string;
  createdAt: Date;
  status: 'pending' | 'failed';
  error?: string;
}

export function outboxToListItem(record: OutboxRecord): OutboxListItem {
  return {
    id: record.id,
    action: record.action,
    createdAt: new Date(record.createdAt),
    status: record.lastError ? 'failed' : 'pending',
    error: record.lastError,
  };
}
