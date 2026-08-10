/**
 * Contact API Endpoints
 * All endpoints under /api/user/v1/contacts/*
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Address Book
 */
export interface AddressBook {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: 'personal' | 'shared' | 'external' | 'global';
  is_active: boolean;
  is_subscribed: boolean;
  is_writable: boolean;
  color: string | null;
  external_id: string | null;
  external_type: 'carddav' | 'ldap' | 'google' | 'outlook' | null;
  sync_state: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
  };
  contact_count: number;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Contact
 */
export interface Contact {
  id: string;
  addressbook_id: string;
  uid: string;
  prefix: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  suffix: string | null;
  nicknames: string[];
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  urls: ContactUrl[];
  impps: ContactImpp[];
  organization: string | null;
  department: string | null;
  job_title: string | null;
  role: string | null;
  birthday: string | null;
  anniversary: string | null;
  note: string | null;
  photo: string | null; // URL to photo
  photo_etag: string | null;
  photo_last_modified: string | null;
  categories: string[];
  custom_fields: Record<string, string[]>;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  etag: string;
  version: string;
}

/**
 * Contact Email
 */
export interface ContactEmail {
  id: string;
  address: string;
  type: 'home' | 'work' | 'other' | string;
  is_primary: boolean;
}

/**
 * Contact Phone
 */
export interface ContactPhone {
  id: string;
  number: string;
  type: 'home' | 'work' | 'mobile' | 'fax' | 'pager' | 'other' | string;
  is_primary: boolean;
}

/**
 * Contact Address
 */
export interface ContactAddress {
  id: string;
  type: 'home' | 'work' | 'other' | string;
  is_primary: boolean;
  street: string;
  city: string;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  formatted: string;
  lat: number | null;
  lon: number | null;
}

/**
 * Contact URL
 */
export interface ContactUrl {
  id: string;
  type: 'home' | 'work' | 'profile' | 'blog' | 'homepage' | 'other' | string;
  url: string;
  is_primary: boolean;
}

/**
 * Contact IMPP (Instant Messaging Presence Protocol)
 */
export interface ContactImpp {
  id: string;
  type: 'home' | 'work' | 'mobile' | 'other' | string;
  address: string;
  protocol: 'xmpp' | 'irc' | 'sip' | 'matrix' | 'signal' | 'telegram' | string;
  is_primary: boolean;
}

/**
 * Contact Search Result
 */
export interface ContactSearchResult {
  id: string;
  addressbook_id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  emails: string[];
  phones: string[];
  organization: string | null;
  job_title: string | null;
  photo: string | null;
  is_favorite: boolean;
  match_score: number;
}

/**
 * Contact Group / Distribution List
 */
export interface ContactGroup {
  id: string;
  addressbook_id: string;
  name: string;
  description: string | null;
  members: Array<{
    type: 'contact' | 'email' | 'group';
    value: string; // contact ID, email address, or group ID
  }>;
  is_expanded: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Contact Import Job
 */
export interface ContactImportJob {
  id: string;
  addressbook_id: string;
  format: 'vcf' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_contacts: number;
  processed_contacts: number;
  failed_contacts: number;
  errors: string[];
  created_at: string;
  completed_at: string | null;
  download_url: string | null; // For failed contacts
}

/**
 * Contact Export Job
 */
export interface ContactExportJob {
  id: string;
  addressbook_id: string | null; // null for all address books
  format: 'vcf' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url: string | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Create contact request
 */
export interface CreateContactRequest {
  addressbook_id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  emails?: ContactEmail[];
  phones?: ContactPhone[];
  addresses?: ContactAddress[];
  urls?: ContactUrl[];
  impps?: ContactImpp[];
  organization?: string | null;
  department?: string | null;
  job_title?: string | null;
  role?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  note?: string | null;
  categories?: string[];
  custom_fields?: Record<string, string[]>;
  tags?: string[];
}

/**
 * Update contact request
 */
export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  id: string;
}

/**
 * Contact autocomplete request
 */
export interface ContactAutocompleteRequest {
  query: string;
  limit?: number;
  addressbook_ids?: string[];
}

/**
 * Contact search request
 */
export interface ContactSearchRequest {
  query: string;
  addressbook_ids?: string[];
  limit?: number;
  offset?: number;
  sort?: 'name_asc' | 'name_desc' | 'updated_desc' | 'updated_asc';
  fields?: string[]; // Fields to search in
}

// ========== Contact API Class ==========

/**
 * Contact API Client
 * Handles all contact-related endpoints
 */
export class ContactApi {
  /**
   * List all address books
   */
  async listAddressBooks(include_shared: boolean = false): Promise<AddressBook[]> {
    const response = await apiClient.get<BackendResponse<AddressBook[]>>(
      '/api/user/v1/contacts/addressbooks',
      { params: { include_shared: include_shared ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific address book
   */
  async getAddressBook(addressbookId: string): Promise<AddressBook> {
    const response = await apiClient.get<BackendResponse<AddressBook>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new address book
   */
  async createAddressBook(data: Omit<AddressBook, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'contact_count' | 'permissions'> & {
    name: string;
  }): Promise<AddressBook> {
    const response = await apiClient.post<BackendResponse<AddressBook>>(
      '/api/user/v1/contacts/addressbooks',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update an address book
   */
  async updateAddressBook(
    addressbookId: string,
    data: Partial<AddressBook>
  ): Promise<AddressBook> {
    const response = await apiClient.put<BackendResponse<AddressBook>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete an address book
   */
  async deleteAddressBook(
    addressbookId: string,
    purge_contacts: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}`,
      { params: { purge_contacts: purge_contacts ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List contacts in an address book
   */
  async listContacts(
    addressbookId: string,
    params: {
      limit?: number;
      offset?: number;
      sort?: 'name_asc' | 'name_desc' | 'updated_desc' | 'updated_asc';
      query?: string;
      tag?: string;
      favorite?: boolean;
    } = {}
  ): Promise<{ contacts: Contact[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ contacts: Contact[]; total: number }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/contacts`,
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List all contacts across all address books
   */
  async listAllContacts(params: {
    limit?: number;
    offset?: number;
    sort?: 'name_asc' | 'name_desc' | 'updated_desc' | 'updated_asc';
    query?: string;
    tag?: string;
    favorite?: boolean;
  } = {}): Promise<{ contacts: Contact[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ contacts: Contact[]; total: number }>>(
      '/api/user/v1/contacts/contacts',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific contact
   */
  async getContact(addressbookId: string, contactId: string): Promise<Contact> {
    const response = await apiClient.get<BackendResponse<Contact>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/contacts/${contactId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a contact by UID (across all address books)
   */
  async getContactByUid(uid: string): Promise<Contact | null> {
    const response = await apiClient.get<BackendResponse<Contact | null>>(
      `/api/user/v1/contacts/contacts/uid/${uid}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a contact by email
   */
  async getContactByEmail(email: string): Promise<Contact | null> {
    const response = await apiClient.get<BackendResponse<Contact | null>>(
      `/api/user/v1/contacts/contacts/email/${encodeURIComponent(email)}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new contact
   */
  async createContact(data: CreateContactRequest): Promise<Contact> {
    // Default to first writable address book if not specified
    if (!data.addressbook_id) {
      const addressbooks = await this.listAddressBooks();
      const writable = addressbooks.find(ab => ab.is_writable);
      if (writable) {
        data.addressbook_id = writable.id;
      }
    }
    
    const response = await apiClient.post<BackendResponse<Contact>>(
      '/api/user/v1/contacts/contacts',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a contact
   */
  async updateContact(contactId: string, data: Partial<UpdateContactRequest>): Promise<Contact> {
    const response = await apiClient.put<BackendResponse<Contact>>(
      `/api/user/v1/contacts/contacts/${contactId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/contacts/contacts/${contactId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete multiple contacts
   */
  async deleteMultipleContacts(contactIds: string[]): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; count: number }>>(
      '/api/user/v1/contacts/contacts/delete',
      { contact_ids: contactIds }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Search contacts
   */
  async searchContacts(params: ContactSearchRequest): Promise<{
    results: ContactSearchResult[];
    total: number;
    query: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      results: ContactSearchResult[];
      total: number;
      query: string;
    }>>(
      '/api/user/v1/contacts/search',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Autocomplete contacts (for email address input)
   */
  async autocompleteContacts(params: ContactAutocompleteRequest): Promise<ContactAutocompleteRequest[]> {
    const response = await apiClient.get<BackendResponse<ContactAutocompleteRequest[]>>(
      '/api/user/v1/contacts/autocomplete',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Contact Groups ==========

  /**
   * List contact groups in an address book
   */
  async listContactGroups(addressbookId: string): Promise<ContactGroup[]> {
    const response = await apiClient.get<BackendResponse<ContactGroup[]>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/groups`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific contact group
   */
  async getContactGroup(groupId: string): Promise<ContactGroup> {
    const response = await apiClient.get<BackendResponse<ContactGroup>>(
      `/api/user/v1/contacts/groups/${groupId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new contact group
   */
  async createContactGroup(
    addressbookId: string,
    data: Omit<ContactGroup, 'id' | 'addressbook_id' | 'member_count' | 'created_at' | 'updated_at'> & { name: string }
  ): Promise<ContactGroup> {
    const response = await apiClient.post<BackendResponse<ContactGroup>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/groups`,
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a contact group
   */
  async updateContactGroup(groupId: string, data: Partial<ContactGroup>): Promise<ContactGroup> {
    const response = await apiClient.put<BackendResponse<ContactGroup>>(
      `/api/user/v1/contacts/groups/${groupId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a contact group
   */
  async deleteContactGroup(groupId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/contacts/groups/${groupId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Contact Group Members ==========

  /**
   * Add members to a contact group
   */
  async addGroupMembers(
    groupId: string,
    members: Array<{ type: 'contact' | 'email' | 'group'; value: string }>
  ): Promise<{ success: boolean; group: ContactGroup }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; group: ContactGroup }>>(
      `/api/user/v1/contacts/groups/${groupId}/members`,
      { members }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Remove members from a contact group
   */
  async removeGroupMembers(
    groupId: string,
    memberIds: string[]
  ): Promise<{ success: boolean; group: ContactGroup }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; group: ContactGroup }>>(
      `/api/user/v1/contacts/groups/${groupId}/members`,
      { member_ids: memberIds }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Favorites ==========

  /**
   * Mark a contact as favorite
   */
  async favoriteContact(contactId: string): Promise<{ success: boolean; contact: Contact }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; contact: Contact }>>(
      `/api/user/v1/contacts/contacts/${contactId}/favorite`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unmark a contact as favorite
   */
  async unfavoriteContact(contactId: string): Promise<{ success: boolean; contact: Contact }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; contact: Contact }>>(
      `/api/user/v1/contacts/contacts/${contactId}/favorite`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Tags ==========

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const response = await apiClient.get<BackendResponse<string[]>>(
      '/api/user/v1/contacts/tags'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Rename a tag
   */
  async renameTag(oldName: string, newName: string): Promise<{ success: boolean; updated_count: number }> {
    const response = await apiClient.put<BackendResponse<{ success: boolean; updated_count: number }>>(
      '/api/user/v1/contacts/tags',
      { old_name: oldName, new_name: newName }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a tag
   */
  async deleteTag(name: string): Promise<{ success: boolean; deleted_count: number }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; deleted_count: number }>>(
      `/api/user/v1/contacts/tags/${encodeURIComponent(name)}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Import/Export ==========

  /**
   * Start contact import
   */
  async startImport(
    addressbookId: string,
    file: File,
    format: 'vcf' | 'csv'
  ): Promise<ContactImportJob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await apiClient.post<BackendResponse<ContactImportJob>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get import job status
   */
  async getImportJob(jobId: string): Promise<ContactImportJob> {
    const response = await apiClient.get<BackendResponse<ContactImportJob>>(
      `/api/user/v1/contacts/imports/${jobId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Start contact export
   */
  async startExport(
    addressbookId?: string,
    format: 'vcf' | 'csv' = 'vcf'
  ): Promise<ContactExportJob> {
    const endpoint = addressbookId
      ? `/api/user/v1/contacts/addressbooks/${addressbookId}/export`
      : '/api/user/v1/contacts/export';
    
    const response = await apiClient.post<BackendResponse<ContactExportJob>>(
      endpoint,
      { format }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get export job status
   */
  async getExportJob(jobId: string): Promise<ContactExportJob> {
    const response = await apiClient.get<BackendResponse<ContactExportJob>>(
      `/api/user/v1/contacts/exports/${jobId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Photo Management ==========

  /**
   * Get contact photo
   */
  async getContactPhoto(addressbookId: string, contactId: string): Promise<Blob | null> {
    const response = await apiClient.get<Blob>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/contacts/${contactId}/photo`
    );
    return response.data;
  }

  /**
   * Set contact photo
   */
  async setContactPhoto(
    addressbookId: string,
    contactId: string,
    file: File
  ): Promise<{ success: boolean; url: string; etag: string; last_modified: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await apiClient.post<BackendResponse<{
      success: boolean;
      url: string;
      etag: string;
      last_modified: string;
    }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/contacts/${contactId}/photo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete contact photo
   */
  async deleteContactPhoto(addressbookId: string, contactId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/contact/addressbooks/${addressbookId}/contacts/${contactId}/photo`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Address Book Sharing ==========

  /**
   * Share an address book
   */
  async shareAddressBook(
    addressbookId: string,
    data: {
      user_emails: string[];
      permissions: 'read' | 'write' | 'delete' | 'share' | 'all';
      send_notification?: boolean;
    }
  ): Promise<{ success: boolean; shared_with: string[] }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; shared_with: string[] }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/share`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get address book sharing information
   */
  async getAddressBookSharing(addressbookId: string): Promise<{
    owner: string;
    shared_with: Array<{
      email: string;
      permissions: string[];
      shared_at: string;
    }>;
  }> {
    const response = await apiClient.get<BackendResponse<{
      owner: string;
      shared_with: Array<{
        email: string;
        permissions: string[];
        shared_at: string;
      }>;
    }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/share`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== External Address Book Subscriptions ==========

  /**
   * Subscribe to external address book (CardDAV, LDAP, etc.)
   */
  async subscribeToAddressBook(data: {
    name: string;
    url: string;
    type: 'carddav' | 'ldap';
    username?: string;
    password?: string;
    sync_interval_minutes?: number;
  }): Promise<AddressBook> {
    const response = await apiClient.post<BackendResponse<AddressBook>>(
      '/api/user/v1/contacts/addressbooks/subscribe',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unsubscribe from external address book
   */
  async unsubscribeAddressBook(addressbookId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/unsubscribe`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Force sync of external address book
   */
  async syncAddressBook(addressbookId: string): Promise<{ success: boolean; syncedcontacts: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; syncedcontacts: number }>>(
      `/api/user/v1/contacts/addressbooks/${addressbookId}/sync`
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Contact API instance
 */
export const contactApi = new ContactApi();

export default contactApi;
