/**
 * Mail API Endpoints
 * All endpoints under /api/user/v1/mail/*
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Mailbox/Folder
 */
export interface Mailbox {
  id: string;
  user_id: string;
  name: string;
  path: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'custom' | 'shared';
  delimiter: string;
  parent_id: string | null;
  is_subscribed: boolean;
  is_special: boolean;
  message_count: number;
  unread_count: number;
  total_messages: number;
  sync_state: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Message summary (for list views)
 */
export interface MailMessageSummary {
  id: string;
  uid: number;
  subject: string;
  sender: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  bcc: Array<{ name: string; email: string }>;
  date: string;
  size: number;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  is_draft: boolean;
  has_attachments: boolean;
  attachment_count: number;
  tags: string[];
  folder_id: string;
  snippet: string;
}

/**
 * Full message with body
 */
export interface MailMessageFull {
  id: string;
  uid: number;
  subject: string;
  sender: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  bcc: Array<{ name: string; email: string }>;
  date: string;
  size: number;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  is_draft: boolean;
  has_attachments: boolean;
  attachment_count: number;
  tags: string[];
  folder_id: string;
  html_body: string;
  text_body: string;
  headers: Record<string, string>;
  in_reply_to: string | null;
  references: string[];
  attachments: MailAttachment[];
}

/**
 * Mail attachment
 */
export interface MailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  is_inline: boolean;
  cid: string | null;
  download_url: string;
}

/**
 * Send email request
 */
export interface SendMailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html_body?: string;
  text_body?: string;
  in_reply_to?: string;
  references?: string[];
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string; // base64 encoded
  }>;
  draft_id?: string; // For sending draft
  folder_id?: string; // For saving to specific folder
}

/**
 * Send email response
 */
export interface SendMailResponse {
  message_id: string;
  date: string;
  saved_to: string;
  size: number;
}

/**
 * Message move/copy operation
 */
export interface MessageMoveOperation {
  message_ids: string[];
  target_folder_id: string;
  is_copy?: boolean; // If true, copy instead of move
}

/**
 * Mail search request
 */
export interface MailSearchRequest {
  query: string;
  folders?: string[];
  date_from?: string;
  date_to?: string;
  has_attachments?: boolean;
  is_unread?: boolean;
  is_starred?: boolean;
  is_imported?: boolean;
  label?: string;
  tags?: string[];
}

/**
 * Mail search response
 */
export interface MailSearchResponse {
  results: MailMessageSummary[];
  total: number;
  query: string;
  took: number;
}

/**
 * Batch message operation
 */
export interface BatchMessageOperation {
  message_ids: string[];
  action: 'read' | 'unread' | 'star' | 'unstar' | 'important' | 'unimportant' | 'delete' | 'archive' | 'spam' | 'move' | 'copy';
  target_folder_id?: string;
  label?: string;
}

/**
 * Mail filter
 */
export interface MailFilter {
  id: string;
  name: string;
  criteria: {
    from?: string;
    to?: string;
    subject?: string;
    has_attachment?: boolean;
    size_greater?: number;
    size_less?: number;
  };
  actions: Array<{
    type: 'move' | 'copy' | 'forward' | 'discard' | 'mark_read' | 'mark_starred' | 'add_tag' | 'remove_tag';
    value?: string;
  }>;
  is_active: boolean;
  order: number;
}

/**
 * Mailbox quota
 */
export interface MailboxQuota {
  used: number;
  total: number;
  percentage: number;
  message_count: number;
  max_messages: number | null;
}

// ========== Mail API Class ==========

/**
 * Mail API Client
 * Handles all mail-related endpoints
 */
export class MailApi {
  /**
   * List all mailboxes/folders
   */
  async listMailboxes(include_shared: boolean = false): Promise<Mailbox[]> {
    const response = await apiClient.get<BackendResponse<Mailbox[]>>(
      '/api/user/v1/mail/mailboxes',
      { params: { include_shared: include_shared ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific mailbox
   */
  async getMailbox(mailboxId: string): Promise<Mailbox> {
    const response = await apiClient.get<BackendResponse<Mailbox>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new mailbox/folder
   */
  async createMailbox(name: string, parentId?: string, mailboxType: 'custom' = 'custom'): Promise<Mailbox> {
    const response = await apiClient.post<BackendResponse<Mailbox>>(
      '/api/user/v1/mail/mailboxes',
      { name, parent_id: parentId, type: mailboxType }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a mailbox
   */
  async updateMailbox(mailboxId: string, data: { name?: string; is_subscribed?: boolean }): Promise<Mailbox> {
    const response = await apiClient.put<BackendResponse<Mailbox>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a mailbox
   */
  async deleteMailbox(mailboxId: string, recursive: boolean = false): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}`,
      { params: { recursive: recursive ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List messages in a mailbox
   */
  async listMessages(
    mailboxId: string,
    params: {
      page?: number;
      per_page?: number;
      sort?: 'date_desc' | 'date_asc' | 'subject_asc' | 'subject_desc';
      is_unread?: boolean;
      is_starred?: boolean;
      query?: string;
    } = {}
  ): Promise<{ messages: MailMessageSummary[]; pagination: { page: number; per_page: number; total: number; total_pages: number } }> {
    const response = await apiClient.get<BackendResponse<{
      messages: MailMessageSummary[];
      pagination: { page: number; per_page: number; total: number; total_pages: number };
    }>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages`,
      { params }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a single message
   */
  async getMessage(mailboxId: string, messageId: string, params: { raw?: boolean } = {}): Promise<MailMessageFull> {
    const response = await apiClient.get<BackendResponse<MailMessageFull>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}`,
      { params }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get raw message source (EML format)
   */
  async getRawMessage(mailboxId: string, messageId: string): Promise<string> {
    const response = await apiClient.get<string>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}/raw`
    );
    return response.data;
  }

  /**
   * Update a message (mark as read/unread, star, etc.)
   */
  async updateMessage(
    mailboxId: string,
    messageId: string,
    data: {
      is_read?: boolean;
      is_starred?: boolean;
      is_important?: boolean;
      tags?: string[],
    }
  ): Promise<MailMessageSummary> {
    const response = await apiClient.put<BackendResponse<MailMessageSummary>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a message
   */
  async deleteMessage(mailboxId: string, messageId: string, purge: boolean = false): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}`,
      { params: { purge: purge ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Move or copy messages to a different mailbox
   */
  async moveMessages(operation: MessageMoveOperation): Promise<{ success: boolean; moved_count: number }> {
    const endpoint = operation.is_copy 
      ? `/api/user/v1/mail/mailboxes/${operation.target_folder_id}/messages`
      : `/api/user/v1/mail/mailboxes/move`;
    
    const response = await apiClient.post<BackendResponse<{ success: boolean; moved_count: number }>>(
      endpoint,
      { message_ids: operation.message_ids }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Send a new email
   */
  async sendMail(data: SendMailRequest): Promise<SendMailResponse> {
    const response = await apiClient.post<BackendResponse<SendMailResponse>>(
      '/api/user/v1/mail/messages/send',
      data as any as SendMailRequest // Cast to handle optional fields
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Save a draft
   */
  async saveDraft(data: Omit<SendMailRequest, 'draft_id'> & { id?: string }): Promise<{ id: string; date: string }> {
    const response = await apiClient.post<BackendResponse<{ id: string; date: string }>>(
      '/api/user/v1/mail/messages/save',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update an existing draft
   */
  async updateDraft(draftId: string, data: Partial<SendMailRequest>): Promise<{ id: string; date: string }> {
    const response = await apiClient.put<BackendResponse<{ id: string; date: string }>>(
      `/api/user/v1/mail/messages/${draftId}/save`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List attachments for a message
   */
  async listAttachments(mailboxId: string, messageId: string): Promise<MailAttachment[]> {
    const response = await apiClient.get<BackendResponse<MailAttachment[]>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}/attachments`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get attachment download URL
   */
  async getAttachment(
    mailboxId: string,
    messageId: string,
    attachmentId: string
  ): Promise<{ url: string; filename: string; size: number; content_type: string }> {
    const response = await apiClient.get<BackendResponse<{
      url: string;
      filename: string;
      size: number;
      content_type: string;
    }>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}/attachments/${attachmentId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Search messages
   */
  async searchMessages(params: MailSearchRequest): Promise<MailSearchResponse> {
    const response = await apiClient.get<BackendResponse<MailSearchResponse>>(
      '/api/user/v1/mail/search',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Batch operations on messages (mark read, star, delete, etc.)
   */
  async batchMessageOperation(data: BatchMessageOperation): Promise<{ success: boolean; affected: number }> {
    const endpointMap: Record<string, string> = {
      read: '/api/user/v1/mail/messages/mark-read',
      unread: '/api/user/v1/mail/messages/mark-unread',
      star: '/api/user/v1/mail/messages/star',
      unstar: '/api/user/v1/mail/messages/unstar',
      important: '/api/user/v1/mail/messages/mark-important',
      unimportant: '/api/user/v1/mail/messages/mark-unimportant',
      delete: '/api/user/v1/mail/messages/delete',
      archive: '/api/user/v1/mail/messages/archive',
      spam: '/api/user/v1/mail/messages/mark-spam',
      move: '/api/user/v1/mail/mailboxes/move',
      copy: '/api/user/v1/mail/mailboxes/copy',
    };

    const endpoint = endpointMap[data.action];
    if (!endpoint) {
      throw new Error(`Unknown batch action: ${data.action}`);
    }

    const payload: any = { message_ids: data.message_ids };
    if (data.target_folder_id) {
      payload.target_folder_id = data.target_folder_id;
    }
    if (data.label) {
      payload.label = data.label;
    }

    const response = await apiClient.post<BackendResponse<{ success: boolean; affected: number }>>(
      endpoint,
      payload
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List mail filters
   */
  async listFilters(): Promise<MailFilter[]> {
    const response = await apiClient.get<BackendResponse<MailFilter[]>>(
      '/api/user/v1/mail/filters'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a mail filter
   */
  async createFilter(filter: Omit<MailFilter, 'id'>): Promise<MailFilter> {
    const response = await apiClient.post<BackendResponse<MailFilter>>(
      '/api/user/v1/mail/filters',
      filter as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a mail filter
   */
  async updateFilter(filterId: string, data: Partial<MailFilter>): Promise<MailFilter> {
    const response = await apiClient.put<BackendResponse<MailFilter>>(
      `/api/user/v1/mail/filters/${filterId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a mail filter
   */
  async deleteFilter(filterId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/mail/filters/${filterId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get mailbox quota
   */
  async getQuota(): Promise<MailboxQuota> {
    const response = await apiClient.get<BackendResponse<MailboxQuota>>(
      '/api/user/v1/mail/quota'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Subscribe to a shared mailbox
   */
  async subscribeToMailbox(mailboxId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean }>>(
      '/api/user/v1/mail/folders/subscribe',
      { mailbox_id: mailboxId }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unsubscribe from a shared mailbox
   */
  async unsubscribeFromMailbox(mailboxId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean }>>(
      '/api/user/v1/mail/folders/unsubscribe',
      { mailbox_id: mailboxId }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Import a message (EML format)
   */
  async importMessage(
    emlContent: string,
    targetMailboxId?: string
  ): Promise<{ message_id: string; success: boolean }> {
    const response = await apiClient.post<BackendResponse<{ message_id: string; success: boolean }>>(
      '/api/user/v1/mail/messages/import',
      { eml: emlContent, target_mailbox_id: targetMailboxId }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Forward a message
   */
  async forwardMessage(
    mailboxId: string,
    messageId: string,
    data: Omit<SendMailRequest, 'subject' | 'in_reply_to' | 'references'> & { mode?: 'inline' | 'attachment' }
  ): Promise<SendMailResponse> {
    const response = await apiClient.post<BackendResponse<SendMailResponse>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}/forward`,
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    mailboxId: string,
    messageId: string,
    data: Omit<SendMailRequest, 'to' | 'subject' | 'in_reply_to' | 'references'>
  ): Promise<SendMailResponse> {
    const response = await apiClient.post<BackendResponse<SendMailResponse>>(
      `/api/user/v1/mail/mailboxes/${mailboxId}/messages/${messageId}/reply`,
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Mail API instance
 */
export const mailApi = new MailApi();

export default mailApi;
