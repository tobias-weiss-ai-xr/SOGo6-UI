/**
 * Type for a share operation pending while offline.
 */
export interface PendingShare {
  id: string;
  resourceType: 'calendar' | 'addressbook';
  resourceKey: string;
  userId: string;
  rights: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

/**
 * Generate a unique ID for a pending share.
 */
export function generatePendingShareId(): string {
  return `pending-share-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
