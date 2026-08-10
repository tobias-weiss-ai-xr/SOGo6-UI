import type {
  //AdminConfig,
  AdminConfigSection,
} from '@/features/admin-panel/types/admin-panel'
import {
  ADMIN_CONFIG_SLICE,
  ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_SLICE,
  ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE,
  ADMIN_V1_CONFIG_RULES_SLICE,
  ADMIN_V1_CONFIG_SYSTEM_SLICE,
  apiSlice,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { Rule } from '../types/admin-panel'
import type { DnsRecord, DnsValidation } from './dns-wizard-api'
import type { Resource } from './resource-booking-api'

export type DomainItem = {
  name: string
  extra_infos?: Record<string, string>
}

// Shared Mailbox Types
export type SharedMailboxMemberRole = {
  uid: string
  role: 'admin' | 'moderator' | 'member'
  added_at?: string
  last_activity_at?: string
}

export type SharedMailbox = {
  id: string
  email: string
  name: string
  description: string
  member_uids: string[]
  member_roles?: SharedMailboxMemberRole[]
  is_active: boolean
  created_at: string
  updated_at: string
  // Quota
  quota_enabled?: boolean
  quota_max_size?: number | null
  quota_max_emails?: number | null
  // Auto-responder
  auto_respond_enabled?: boolean
  auto_respond_subject?: string | null
  auto_respond_message?: string | null
  // Forwarding
  forward_to?: string[]
  forward_keep_copy?: boolean
  // Signatures
  signature_enabled?: boolean
  signature_html?: string | null
  signature_plain?: string | null
}

export type SharedMailboxNote = {
  id: string
  mailbox_id: string
  email_id: string | null
  author_uid: string
  content: string
  is_private: boolean
  mentions: string[]
  created_at: string
  updated_at: string
}

export type SharedMailboxAssignment = {
  id: string
  mailbox_id: string
  email_id: string
  assigned_to: string
  assigned_by: string
  reason: string | null
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  notified: boolean
  created_at: string
  completed_at: string | null
}

export type SharedMailboxAnalytics = {
  mailbox_id: string
  notes: {
    total: number
    public: number
    private: number
    last_7_days: number
    last_30_days: number
  }
  assignments: {
    total: number
    pending: number
    accepted: number
    completed: number
    cancelled: number
    last_7_days: number
    last_30_days: number
    completion_rate: number
    avg_completion_seconds: number
  }
  generated_at: string
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getSystem: builder.query<Record<string, any>, void>({
      query: () => ({
        url: '/admin/v1/config/system',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_SYSTEM_SLICE],
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
    }),

    patchSystem: builder.mutation<
      Record<string, unknown>,
      { config: Record<string, unknown> }
    >({
      query: ({ config }) => ({
        url: '/admin/v1/config/system',
        method: 'PATCH',
        body: { settings: config },
      }),
      invalidatesTags: [ADMIN_V1_CONFIG_SYSTEM_SLICE],
    }),
    getDomains: builder.query<DomainItem[], void>({
      query: () => ({
        url: '/admin/v1/config/domains',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DOMAINS_SLICE],
    }),
    getRules: builder.query<Rule[], void>({
      query: () => ({
        url: '/admin/v1/config/rules',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_RULES_SLICE],
    }),
    getDynamicForm: builder.query<string[], void>({
      query: () => ({
        url: '/admin/v1/config/dynamic-form',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE],
    }),
    // New: fetch domain default settings
    getDomainDefault: builder.query<Record<string, any>, void>({
      query: () => ({
        url: '/admin/v1/config/domain-default',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE],
    }),
    getCustomDomainConfig: builder.query<AdminConfigSection, string>({
      query: (domainName) => ({
        url: `/admin/v1/config/domains/${domainName}`,
        method: 'GET',
      }),
      providesTags: (result, error, domainName) => [
        ADMIN_CONFIG_SLICE,
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE, id: domainName },
      ],
    }),
    saveCustomDomainConfig: builder.mutation<
      Record<string, unknown>,
      { customDomainId: string; config: Record<string, unknown> }
    >({
      query: ({ config }) => ({
        url: `/admin/v1/config/domains`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
      ],
    }),

    // PATCH for domain-default
    patchDomainDefault: builder.mutation<
      Record<string, unknown>,
      { config: Record<string, unknown> }
    >({
      query: ({ config }) => ({
        url: `/admin/v1/config/domain-default`,
        method: 'PATCH',
        body: { settings: config },
      }),
      // you can invalidate specific tags if needed — here we invalidate domain config tag
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
        ADMIN_CONFIG_SLICE,
        ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE,
      ],
    }),

    // PATCH for a specific custom domain
    patchCustomDomainConfig: builder.mutation<
      Record<string, unknown>,
      { customDomainId: string; config: Record<string, unknown> }
    >({
      query: ({ customDomainId, config }) => ({
        url: `/admin/v1/config/domains/${customDomainId}`,
        method: 'PATCH',
        body: config,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE, id: arg?.customDomainId },
        ADMIN_CONFIG_SLICE,
      ],
    }),

    // DELETE domain mutation
    deleteDomain: builder.mutation<Record<string, unknown>, string>({
      query: (domainName) => ({
        url: `/admin/v1/config/domains/${domainName}`,
        method: 'DELETE',
      }),
      // invalidate domains list so getDomains refetches
      invalidatesTags: (result, error) => [
        { type: ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE },
      ],
    }),

    // === Session Management ===

    /**
     * Active User Session type returned by the API.
     */
    getActiveUsers: builder.query<
      Array<{
        uid: string
        domain: string
        last_activity: string
        session_key: string
      }>,
      void
    >({
      query: () => ({
        url: '/admin/v1/users/active',
        method: 'GET',
      }),
      providesTags: ['AdminSessions'],
    }),

    /**
     * Revoke specific user sessions.
     */
    revokeSessions: builder.mutation<
      { revoked: number },
      { uid: string[] } | { redis_key: string[] }
    >({
      query: (body) => ({
        url: '/admin/v1/users/revoke',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminSessions'],
    }),

    /**
     * Revoke all sessions inactive since a given timestamp.
     */
    revokeInactiveSessions: builder.mutation<
      { revoked: number },
      { timestamp: number }
    >({
      query: (body) => ({
        url: '/admin/v1/users/inactive',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminSessions'],
    }),

    // === User CRUD ===

    /**
     * List/search users from the LDAP directory.
     */
    listUsers: builder.query<
      Array<Record<string, unknown>>,
      {
        query?: string
        page?: number
        per_page?: number
        sort_by?: string
        sort_order?: string
      } | void
    >({
      query: (params) => ({
        url: '/admin/v1/users/list',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['AdminUsers'],
    }),

    /**
     * Get a single user by UID.
     */
    getUser: builder.query<Record<string, unknown>, string>({
      query: (uid) => ({
        url: `/admin/v1/users/${encodeURIComponent(uid)}`,
        method: 'GET',
      }),
      providesTags: (result, error, uid) => [{ type: 'AdminUsers', id: uid }],
    }),

    /**
     * Create a new user in LDAP.
     */
    createUser: builder.mutation<
      Record<string, unknown>,
      {
        uid: string
        cn: string
        sn: string
        givenName: string
        mail: string
        password: string
        uidNumber?: number
        gidNumber?: number
        homeDirectory?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/users/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    /**
     * Update an existing user's attributes in LDAP.
     */
    updateUser: builder.mutation<
      Record<string, unknown>,
      {
        uid: string
        body: {
          cn?: string
          sn?: string
          givenName?: string
          mail?: string
          password?: string
        }
      }
    >({
      query: ({ uid, body }) => ({
        url: `/admin/v1/users/${encodeURIComponent(uid)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { uid }) => [
        'AdminUsers',
        { type: 'AdminUsers', id: uid },
      ],
    }),

    /**
     * Delete a user from LDAP.
     */
    deleteUser: builder.mutation<Record<string, unknown>, string>({
      query: (uid) => ({
        url: `/admin/v1/users/${encodeURIComponent(uid)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uid) => [
        'AdminUsers',
        { type: 'AdminUsers', id: uid },
      ],
    }),

    // ========================================================================
    // Shared Mailboxes Endpoints
    // ========================================================================

    /**
     * Get all shared mailboxes.
     */
    listSharedMailboxes: builder.query<
      { mailboxes: SharedMailbox[]; total_count: number },
      void
    >({
      query: () => ({
        url: '/admin/v1/shared-mailboxes',
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { mailboxes: [], total_count: 0 },
      providesTags: ['SharedMailboxes'],
    }),

    /**
     * Search shared mailboxes by name, email or description.
     */
    searchSharedMailboxes: builder.query<
      { mailboxes: SharedMailbox[]; total_count: number },
      string
    >({
      query: (q) => ({
        url: '/admin/v1/shared-mailboxes/search',
        method: 'GET',
        params: { q },
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { mailboxes: [], total_count: 0 },
      providesTags: ['SharedMailboxes'],
    }),

    /**
     * Export all shared mailboxes as portable configuration.
     */
    exportSharedMailboxes: builder.query<
      { mailboxes: Array<Record<string, any>>; total_count: number },
      void
    >({
      query: () => ({
        url: '/admin/v1/shared-mailboxes/export',
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { mailboxes: [], total_count: 0 },
    }),

    /**
     * Import shared mailbox configurations (idempotent).
     */
    importSharedMailboxes: builder.mutation<
      { imported: number; results: Array<Record<string, any>> },
      { mailboxes: Array<Record<string, any>>; dry_run?: boolean }
    >({
      query: (body) => ({
        url: '/admin/v1/shared-mailboxes/import',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { imported: 0, results: [] },
      invalidatesTags: ['SharedMailboxes'],
    }),

    /**
     * Export shared mailbox analytics as CSV.
     */
    exportSharedMailboxAnalyticsCsv: builder.mutation<Blob, string>({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/analytics/export`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    /**
     * Get a shared mailbox by ID.
     */
    getSharedMailbox: builder.query<SharedMailbox, string>({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      providesTags: (result, error, mailboxId) => [
        'SharedMailboxes',
        { type: 'SharedMailboxes', id: mailboxId },
      ],
    }),

    /**
     * Create a new shared mailbox.
     */
    createSharedMailbox: builder.mutation<
      SharedMailbox,
      {
        email: string
        name: string
        description?: string
        member_uids?: string[]
        quota_enabled?: boolean
        quota_max_size?: number
        quota_max_emails?: number
        auto_respond_enabled?: boolean
        auto_respond_subject?: string
        auto_respond_message?: string
        forward_to?: string[]
        forward_keep_copy?: boolean
        signature_enabled?: boolean
        signature_html?: string
        signature_plain?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/shared-mailboxes',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: ['SharedMailboxes'],
    }),

    /**
     * Update a shared mailbox.
     */
    updateSharedMailbox: builder.mutation<
      SharedMailbox,
      {
        mailboxId: string
        name?: string
        description?: string
        is_active?: boolean
        member_uids?: string[]
        quota_enabled?: boolean
        quota_max_size?: number
        quota_max_emails?: number
        auto_respond_enabled?: boolean
        auto_respond_subject?: string
        auto_respond_message?: string
        forward_to?: string[]
        forward_keep_copy?: boolean
        signature_enabled?: boolean
        signature_html?: string
        signature_plain?: string
      }
    >({
      query: ({ mailboxId, ...body }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        'SharedMailboxes',
        { type: 'SharedMailboxes', id: mailboxId },
      ],
    }),

    /**
     * Delete a shared mailbox.
     */
    deleteSharedMailbox: builder.mutation<{ deleted: boolean }, string>({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: ['SharedMailboxes'],
    }),

    /**
     * Get members of a shared mailbox.
     */
    getSharedMailboxMembers: builder.query<
      { members: string[]; member_roles: SharedMailboxMemberRole[] },
      string
    >({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/members`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { members: [], member_roles: [] },
      providesTags: (result, error, mailboxId) => [
        { type: 'SharedMailboxMembers', id: mailboxId },
      ],
    }),

    /**
     * Add a member to a shared mailbox.
     */
    addSharedMailboxMember: builder.mutation<
      SharedMailbox,
      {
        mailboxId: string
        user_uid: string
        role?: 'admin' | 'moderator' | 'member'
      }
    >({
      query: ({ mailboxId, user_uid, role }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/members`,
        method: 'POST',
        body: { user_uid, ...(role ? { role } : {}) },
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        'SharedMailboxes',
        { type: 'SharedMailboxes', id: mailboxId },
        { type: 'SharedMailboxMembers', id: mailboxId },
      ],
    }),

    /**
     * Remove a member from a shared mailbox.
     */
    removeSharedMailboxMember: builder.mutation<
      SharedMailbox,
      { mailboxId: string; user_uid: string }
    >({
      query: ({ mailboxId, user_uid }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/members/${user_uid}`,
        method: 'DELETE',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        'SharedMailboxes',
        { type: 'SharedMailboxes', id: mailboxId },
        { type: 'SharedMailboxMembers', id: mailboxId },
      ],
    }),

    /**
     * Update a shared mailbox member's role.
     */
    updateSharedMailboxMemberRole: builder.mutation<
      SharedMailbox,
      {
        mailboxId: string
        user_uid: string
        role: 'admin' | 'moderator' | 'member'
      }
    >({
      query: ({ mailboxId, user_uid, role }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/members/${user_uid}`,
        method: 'PUT',
        body: { role },
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        'SharedMailboxes',
        { type: 'SharedMailboxes', id: mailboxId },
        { type: 'SharedMailboxMembers', id: mailboxId },
      ],
    }),

    /**
     * Get analytics for a shared mailbox.
     */
    getSharedMailboxAnalytics: builder.query<SharedMailboxAnalytics, string>({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/analytics`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      providesTags: (result, error, mailboxId) => [
        { type: 'SharedMailboxAnalytics', id: mailboxId },
      ],
    }),

    /**
     * List notes for a shared mailbox.
     */
    listSharedMailboxNotes: builder.query<
      { notes: SharedMailboxNote[]; total_count: number },
      string
    >({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/notes`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { notes: [], total_count: 0 },
      providesTags: (result, error, mailboxId) => [
        { type: 'SharedMailboxNotes', id: mailboxId },
      ],
    }),

    /**
     * Create a note for a shared mailbox.
     */
    createSharedMailboxNote: builder.mutation<
      SharedMailboxNote,
      {
        mailboxId: string
        content: string
        email_id?: string
        is_private?: boolean
        mentions?: string[]
      }
    >({
      query: ({ mailboxId, ...body }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/notes`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        { type: 'SharedMailboxNotes', id: mailboxId },
      ],
    }),

    /**
     * Delete a note from a shared mailbox.
     */
    deleteSharedMailboxNote: builder.mutation<
      { deleted: boolean },
      { mailboxId: string; noteId: string }
    >({
      query: ({ mailboxId, noteId }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/notes/${noteId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        { type: 'SharedMailboxNotes', id: mailboxId },
      ],
    }),

    /**
     * List assignments for a shared mailbox.
     */
    listSharedMailboxAssignments: builder.query<
      { assignments: SharedMailboxAssignment[]; total_count: number },
      string
    >({
      query: (mailboxId) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/assignments`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? { assignments: [], total_count: 0 },
      providesTags: (result, error, mailboxId) => [
        { type: 'SharedMailboxAssignments', id: mailboxId },
      ],
    }),

    /**
     * Create an assignment for a shared mailbox.
     */
    createSharedMailboxAssignment: builder.mutation<
      SharedMailboxAssignment,
      {
        mailboxId: string
        email_id: string
        assigned_to: string
        reason?: string
      }
    >({
      query: ({ mailboxId, ...body }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/assignments`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        { type: 'SharedMailboxAssignments', id: mailboxId },
      ],
    }),

    /**
     * Update an assignment for a shared mailbox.
     */
    updateSharedMailboxAssignment: builder.mutation<
      SharedMailboxAssignment,
      {
        mailboxId: string
        assignmentId: string
        status?: string
        reason?: string
        notified?: boolean
      }
    >({
      query: ({ mailboxId, assignmentId, ...body }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/assignments/${assignmentId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        { type: 'SharedMailboxAssignments', id: mailboxId },
      ],
    }),

    /**
     * Delete an assignment from a shared mailbox.
     */
    deleteSharedMailboxAssignment: builder.mutation<
      { deleted: boolean },
      { mailboxId: string; assignmentId: string }
    >({
      query: ({ mailboxId, assignmentId }) => ({
        url: `/admin/v1/shared-mailboxes/${mailboxId}/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: Record<string, any>) =>
        response?.data ?? {},
      invalidatesTags: (result, error, { mailboxId }) => [
        { type: 'SharedMailboxAssignments', id: mailboxId },
      ],
    }),

    // End Shared Mailboxes Endpoints

    /**
     * Get the current theme configuration.
     */
    getTheme: builder.query<Record<string, any>, void>({
      query: () => ({
        url: '/admin/v1/config/theme',
        method: 'GET',
      }),
      providesTags: ['AdminTheme'],
    }),

    /**
     * Update the theme configuration.
     */
    patchTheme: builder.mutation<
      Record<string, any>,
      { config: Record<string, any> }
    >({
      query: ({ config }) => ({
        url: '/admin/v1/config/theme',
        method: 'PATCH',
        body: { settings: config },
      }),
      invalidatesTags: ['AdminTheme'],
    }),

    // === Rules CRUD ===

    /**
     * Create a new rule.
     */
    createRule: builder.mutation<
      Record<string, unknown>,
      {
        rule_name: string
        rule_description?: string
        rule_domains?: string[]
        rule_setting?: Record<string, unknown>
      }
    >({
      query: (body) => ({
        url: '/admin/v1/config/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: [ADMIN_V1_CONFIG_RULES_SLICE],
    }),

    /**
     * Update a rule.
     */
    updateRule: builder.mutation<
      Record<string, unknown>,
      {
        ruleId: number
        body: {
          rule_name?: string
          rule_description?: string
          rule_domains?: string[]
          rule_setting?: Record<string, unknown>
        }
      }
    >({
      query: ({ ruleId, body }) => ({
        url: `/admin/v1/config/rules/${ruleId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { ruleId }) => [
        ADMIN_V1_CONFIG_RULES_SLICE,
        { type: ADMIN_V1_CONFIG_RULES_SLICE, id: ruleId },
      ],
    }),

    /**
     * Delete a rule.
     */
    deleteRule: builder.mutation<Record<string, unknown>, number>({
      query: (ruleId) => ({
        url: `/admin/v1/config/rules/${ruleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ADMIN_V1_CONFIG_RULES_SLICE],
    }),

    // === DNS Wizard ===

    generateSpfRecord: builder.mutation<
      DnsRecord,
      {
        domain: string
        mx_servers?: string[]
        ip4_addresses?: string[]
        ip6_addresses?: string[]
        include_domains?: string[]
        policy?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/dns/spf/generate',
        method: 'POST',
        body,
      }),
    }),

    validateSpfRecord: builder.mutation<DnsValidation, { spf_value: string }>({
      query: (body) => ({
        url: '/admin/v1/dns/spf/validate',
        method: 'POST',
        body,
      }),
    }),

    generateDkimRecord: builder.mutation<
      DnsRecord,
      {
        domain: string
        selector?: string
        key_type?: string
        public_key?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/dns/dkim/generate',
        method: 'POST',
        body,
      }),
    }),

    generateDmarcRecord: builder.mutation<
      DnsRecord,
      {
        domain: string
        policy?: string
        rua_email?: string
        ruf_email?: string
        pct?: number
        subdomain_policy?: string
        aspf?: string
        adkim?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/dns/dmarc/generate',
        method: 'POST',
        body,
      }),
    }),

    validateDmarcRecord: builder.mutation<
      DnsValidation,
      { dmarc_value: string }
    >({
      query: (body) => ({
        url: '/admin/v1/dns/dmarc/validate',
        method: 'POST',
        body,
      }),
    }),

    // === Resource Booking ===

    getResources: builder.query<Resource[], { active_only?: boolean } | void>({
      query: (params) => ({
        url: '/admin/v1/resources/',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['AdminResources'],
    }),

    getResource: builder.query<Resource, string>({
      query: (id) => ({
        url: `/admin/v1/resources/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'AdminResources', id }],
    }),

    createResource: builder.mutation<
      Resource,
      {
        name: string
        email: string
        resource_type?: string
        description?: string
        capacity?: number
        location?: string
        features?: string[]
        booking_policy?: string
        allowed_groups?: string[]
        auto_accept?: boolean
      }
    >({
      query: (body) => ({
        url: '/admin/v1/resources/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminResources'],
    }),

    updateResource: builder.mutation<
      Resource,
      { id: string; body: Partial<Resource> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/v1/resources/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'AdminResources',
        { type: 'AdminResources', id },
      ],
    }),

    deleteResource: builder.mutation<{ deleted: string }, string>({
      query: (id) => ({
        url: `/admin/v1/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminResources'],
    }),

    // === Health Dashboard ===

    getHealthDashboard: builder.query<
      {
        services: Array<{
          name: string
          status: string
          latency_ms: number
          detail: string
        }>
        uptime_seconds: number
        version: string
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/health-dashboard/',
        method: 'GET',
      }),
      providesTags: ['AdminHealth'],
    }),

    // === Audit Log ===

    getAuditLog: builder.query<
      {
        entries: Array<{
          timestamp: number
          action: string
          actor: string
          target: string | null
          detail: string | null
          ip: string | null
        }>
      },
      { limit?: number } | void
    >({
      query: (params) => ({
        url: '/admin/v1/audit-log/',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['AdminAuditLog'],
    }),

    // === Bulk Users ===

    exportUsersCsv: builder.mutation<Blob, void>({
      query: () => ({
        url: '/admin/v1/bulk-users/export/csv',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    importUsersCsv: builder.mutation<
      {
        created: number
        updated: number
        errors: Array<{ row: number; error: string }>
      },
      FormData
    >({
      query: (body) => ({
        url: '/admin/v1/bulk-users/import/csv',
        method: 'POST',
        body,
      }),
    }),

    // === Usage Quotas ===

    getUserQuota: builder.query<
      {
        mailbox_size_mb: number
        mailbox_used_mb: number
        calendar_count: number
        calendar_used: number
        contact_count: number
        contact_used: number
      },
      string
    >({
      query: (userUid) => ({
        url: `/admin/v1/quotas/${userUid}`,
        method: 'GET',
      }),
    }),

    setUserQuota: builder.mutation<
      Record<string, unknown>,
      {
        user_uid: string
        mailbox_size_mb?: number
        calendar_count?: number
        contact_count?: number
      }
    >({
      query: (body) => ({
        url: `/admin/v1/quotas/${body.user_uid}`,
        method: 'POST',
        body: {
          mailbox_size_mb: body.mailbox_size_mb,
          calendar_count: body.calendar_count,
          contact_count: body.contact_count,
        },
      }),
    }),

    // === Mailbox Debug ===

    getMailboxDebugRaw: builder.query<
      string,
      { userUid: string; folder: string; mailUid: string }
    >({
      query: ({ userUid, folder, mailUid }) => ({
        url: `/admin/v1/mailbox-debug/${userUid}/raw/${folder}/${mailUid}`,
        method: 'GET',
      }),
    }),

    getMailboxDebugHeaders: builder.query<
      Record<string, string>,
      { userUid: string; folder: string; mailUid: string }
    >({
      query: ({ userUid, folder, mailUid }) => ({
        url: `/admin/v1/mailbox-debug/${userUid}/headers/${folder}/${mailUid}`,
        method: 'GET',
      }),
    }),

    // === Domain Branding ===

    getDomainBranding: builder.query<
      {
        logo: string | null
        primary_color: string | null
        custom_css: string | null
        login_header: string | null
        login_footer: string | null
        favicon: string | null
      },
      string
    >({
      query: (domain) => ({
        url: `/admin/v1/branding/${domain}`,
        method: 'GET',
      }),
      providesTags: ['AdminBranding'],
    }),

    setDomainBranding: builder.mutation<
      Record<string, unknown>,
      {
        domain: string
        logo?: string | null
        primary_color?: string | null
        custom_css?: string | null
        login_header?: string | null
        login_footer?: string | null
        favicon?: string | null
      }
    >({
      query: ({ domain, ...body }) => ({
        url: `/admin/v1/branding/${domain}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminBranding'],
    }),

    // === Backup ===

    getBackupHistory: builder.query<
      {
        entries: Array<{
          id: string
          timestamp: number
          status: string
          type: string
          size_mb: number
          duration_s: number
          filename: string | null
        }>
        config: {
          retention_days: number
          s3_enabled: boolean
          s3_bucket: string | null
          s3_prefix: string | null
          include_mailstore: boolean
        }
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/backup/',
        method: 'GET',
      }),
      providesTags: ['AdminBackup'],
    }),

    triggerBackup: builder.mutation<
      {
        id: string
        timestamp: number
        status: string
        type: string
        size_mb: number
        duration_s: number
        filename: string | null
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/backup/trigger',
        method: 'POST',
      }),
      invalidatesTags: ['AdminBackup'],
    }),

    getBackupConfig: builder.query<
      {
        retention_days: number
        s3_enabled: boolean
        s3_bucket: string | null
        s3_prefix: string | null
        include_mailstore: boolean
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/backup/config',
        method: 'GET',
      }),
      providesTags: ['AdminBackup'],
    }),

    setBackupConfig: builder.mutation<
      Record<string, unknown>,
      {
        retention_days?: number
        s3_enabled?: boolean
        s3_bucket?: string | null
        s3_prefix?: string | null
        include_mailstore?: boolean
      }
    >({
      query: (body) => ({
        url: '/admin/v1/backup/config',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminBackup'],
    }),

    // === DB Migration ===

    getDbMigration: builder.query<
      {
        current_version: string
        migrations: Array<{
          id: string
          version: string
          description: string
          applied_at: number
          applied_by: string
          status: string
        }>
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/db-migration/',
        method: 'GET',
      }),
      providesTags: ['AdminDbMigration'],
    }),

    runDbMigration: builder.mutation<
      {
        id: string
        version: string
        description: string
        applied_at: number
        applied_by: string
        status: string
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/db-migration/run',
        method: 'POST',
      }),
      invalidatesTags: ['AdminDbMigration'],
    }),

    // === Migration Tools ===

    getMigrationHistory: builder.query<
      {
        entries: Array<{
          id: string
          source: string
          user_uid: string
          status: string
          started_at: number
          completed_at: number | null
          items_migrated: number
          items_failed: number
          details: string | null
        }>
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/migration/history',
        method: 'GET',
      }),
      providesTags: ['AdminMigration'],
    }),

    getMigrationSources: builder.query<
      {
        sources: Array<{
          id: string
          name: string
          description: string
          fields: string[]
        }>
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/migration/sources',
        method: 'GET',
      }),
    }),

    startMigration: builder.mutation<
      {
        id: string
        source: string
        user_uid: string
        status: string
        started_at: number
        details: string
      },
      { source: string; user_uid: string; options?: Record<string, unknown> }
    >({
      query: (body) => ({
        url: '/admin/v1/migration/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminMigration'],
    }),

    // === Config as Code ===

    getConfigExport: builder.query<
      {
        config: Record<string, unknown>
        version: number
        checksum: string
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/config-as-code/export',
        method: 'GET',
      }),
    }),

    getConfigHistory: builder.query<
      {
        snapshots: Array<{
          id: string
          version: number
          created_at: number
          created_by: string
          description: string
          checksum: string
        }>
      },
      void
    >({
      query: () => ({
        url: '/admin/v1/config-as-code/history',
        method: 'GET',
      }),
    }),

    importConfig: builder.mutation<
      {
        version: number
        checksum: string
        id: string
      },
      { config: Record<string, unknown>; description?: string }
    >({
      query: (body) => ({
        url: '/admin/v1/config-as-code/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminConfig'],
    }),

    // === Webhooks ===

    listWebhooks: builder.query<
      Array<{
        id: string
        name: string
        url: string
        events: string[]
        secret: string
        enabled: boolean
        created_at: number
      }>,
      void
    >({
      query: () => ({
        url: '/admin/v1/webhooks/',
        method: 'GET',
      }),
      providesTags: ['AdminWebhooks'],
    }),

    createWebhook: builder.mutation<
      {
        id: string
        name: string
        url: string
        events: string[]
        secret: string
        enabled: boolean
      },
      { url: string; events: string[]; secret?: string; name?: string }
    >({
      query: (body) => ({
        url: '/admin/v1/webhooks/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminWebhooks'],
    }),

    deleteWebhook: builder.mutation<{ status: string }, string>({
      query: (id) => ({
        url: `/admin/v1/webhooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminWebhooks'],
    }),

    // === OAuth2 Provider ===

    listOAuthClients: builder.query<
      Array<{
        client_id: string
        client_secret: string
        name: string
        redirect_uris: string[]
        scopes: string[]
        created_at: number
      }>,
      void
    >({
      query: () => ({
        url: '/api/user/v1/oauth/clients',
        method: 'GET',
      }),
      providesTags: ['AdminOAuth'],
    }),

    registerOAuthClient: builder.mutation<
      {
        client_id: string
        client_secret: string
        name: string
        redirect_uris: string[]
        scopes: string[]
      },
      { name: string; redirect_uris: string[]; scopes?: string[] }
    >({
      query: (body) => ({
        url: '/api/user/v1/oauth/clients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminOAuth'],
    }),

    // ── Scheduling Polls (#46) ─────────────────────────────────────────
    listSchedulingPolls: builder.query<
      Array<{
        id: string
        title: string
        status: string
        response_count: number
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/api/v1/calendar/polls', method: 'GET' }),
      providesTags: ['AdminPolls'],
    }),
    createSchedulingPoll: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/v1/calendar/polls',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminPolls'],
    }),

    // ── Appointment Slots (#47) ─────────────────────────────────────────
    listAppointmentSlots: builder.query<
      Array<{
        id: string
        title: string
        duration_minutes: number
        enabled: boolean
        booking_url: string
      }>,
      void
    >({
      query: () => ({
        url: '/api/v1/calendar/appointment-slots',
        method: 'GET',
      }),
      providesTags: ['AdminSlots'],
    }),
    createAppointmentSlot: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/v1/calendar/appointment-slots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminSlots'],
    }),
    listSlotBookings: builder.query<
      Array<{
        id: string
        name: string
        email: string
        date: string
        time: string
      }>,
      void
    >({
      query: () => ({
        url: '/api/v1/calendar/appointment-slots/bookings',
        method: 'GET',
      }),
      providesTags: ['AdminSlots'],
    }),

    // ── Collaborative Drafts (#49) ────────────────────────────────────
    listSharedDrafts: builder.query<
      Array<{
        id: string
        subject: string
        author: string
        status: string
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/api/v1/mail/shared-drafts', method: 'GET' }),
      providesTags: ['AdminDrafts'],
    }),
    createSharedDraft: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/v1/mail/shared-drafts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminDrafts'],
    }),
    reviewSharedDraft: builder.mutation<
      any,
      {
        draft_id: string
        reviewer: string
        comment?: string
        approved: boolean
      }
    >({
      query: ({ draft_id, ...body }) => ({
        url: `/api/v1/mail/shared-drafts/${draft_id}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminDrafts'],
    }),

    // ── File Sharing (#52) ──────────────────────────────────────────────
    listFileShares: builder.query<
      Array<{
        id: string
        filename: string
        size: number
        downloads: number
        expires_at: number
        url: string
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/files/shares', method: 'GET' }),
      providesTags: ['AdminFileShares'],
    }),
    createFileShare: builder.mutation<
      { id: string; token: string; url: string; expires_at: number },
      {
        filename: string
        size: number
        expires_in_days?: number
        password?: string
      }
    >({
      query: (body) => ({
        url: '/admin/v1/files/shares',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminFileShares'],
    }),

    // ── Approval Workflows (#50) ───────────────────────────────────────
    listApprovals: builder.query<
      Array<{
        id: string
        title: string
        status: string
        category: string
        current_step: number
        steps: any[]
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/approvals', method: 'GET' }),
      providesTags: ['AdminApprovals'],
    }),
    createApproval: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/v1/approvals', method: 'POST', body }),
      invalidatesTags: ['AdminApprovals'],
    }),
    actionApproval: builder.mutation<
      any,
      { approval_id: string; action: string; comment?: string }
    >({
      query: ({ approval_id, ...body }) => ({
        url: `/admin/v1/approvals/${approval_id}/action`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminApprovals'],
    }),

    // ── Helpdesk / Ticketing (#51) ──────────────────────────────────────
    listTickets: builder.query<
      Array<{
        id: string
        subject: string
        status: string
        priority: string
        requester_email: string
        assignee_email: string
        created_at: number
        sla_deadline: number
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/tickets', method: 'GET' }),
      providesTags: ['AdminTickets'],
    }),
    createTicket: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/v1/tickets', method: 'POST', body }),
      invalidatesTags: ['AdminTickets'],
    }),
    updateTicket: builder.mutation<
      any,
      { ticket_id: string } & Record<string, any>
    >({
      query: ({ ticket_id, ...body }) => ({
        url: `/admin/v1/tickets/${ticket_id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminTickets'],
    }),

    // ── CRM-light (#53) ─────────────────────────────────────────────────
    listCrmAccounts: builder.query<
      Array<{
        id: string
        name: string
        domain: string
        industry: string
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/crm/accounts', method: 'GET' }),
      providesTags: ['AdminCrm'],
    }),
    createCrmAccount: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/v1/crm/accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCrm'],
    }),

    // ── Workflow Builder (#54) ────────────────────────────────────────
    listWorkflows: builder.query<
      Array<{
        id: string
        name: string
        trigger_type: string
        enabled: boolean
        trigger_count: number
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/workflows', method: 'GET' }),
      providesTags: ['AdminWorkflows'],
    }),
    createWorkflow: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/v1/workflows', method: 'POST', body }),
      invalidatesTags: ['AdminWorkflows'],
    }),
    toggleWorkflow: builder.mutation<
      any,
      { workflow_id: string; enabled: boolean }
    >({
      query: ({ workflow_id, ...body }) => ({
        url: `/admin/v1/workflows/${workflow_id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminWorkflows'],
    }),
    deleteWorkflow: builder.mutation<{ status: string }, string>({
      query: (workflow_id) => ({
        url: `/admin/v1/workflows/${workflow_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminWorkflows'],
    }),

    // ── Quick Actions (#55) ────────────────────────────────────────────
    listQuickActions: builder.query<
      Array<{
        id: string
        name: string
        icon: string
        steps: any[]
        created_at: number
      }>,
      void
    >({
      query: () => ({ url: '/admin/v1/quick-actions', method: 'GET' }),
      providesTags: ['AdminQuickActions'],
    }),
    createQuickAction: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/v1/quick-actions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminQuickActions'],
    }),
    deleteQuickAction: builder.mutation<{ status: string }, string>({
      query: (action_id) => ({
        url: `/admin/v1/quick-actions/${action_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminQuickActions'],
    }),

    // ── Free/Busy Lookup (#48) ──────────────────────────────────────────
    getFreeBusy: builder.mutation<
      any,
      { target_uids: string[]; start: string; end: string }
    >({
      query: (body) => ({
        url: '/api/v1/calendar/freebusy',
        method: 'POST',
        body,
      }),
    }),

    // ── Tier 5: AI & Intelligence (#56-#65) ────────────────────────────

    // #56 Email Summarization
    aiSummarize: builder.mutation<
      { summary: string; model: string },
      { text: string; max_sentences?: number }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/summarize',
        method: 'POST',
        body,
      }),
    }),

    // #57 Smart Email Classification
    aiClassify: builder.mutation<
      { labels: Array<{ label: string; confidence: number }> },
      { text: string; subject?: string; sender?: string }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/classify',
        method: 'POST',
        body,
      }),
    }),

    // #58 AI Draft Assistant (suggest-reply)
    aiSuggestReply: builder.mutation<
      { suggestion: string },
      { email_text: string; tone?: string }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/suggest-reply',
        method: 'POST',
        body,
      }),
    }),

    // #59 Natural Language Search
    aiNaturalSearch: builder.mutation<
      { query: string; filters: Record<string, any> },
      { query: string }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/natural-search',
        method: 'POST',
        body,
      }),
    }),

    // #60 Smart Calendar Scheduling
    aiSuggestMeetingTimes: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/user/v1/ai/smart-calendar/suggest-times',
        method: 'POST',
        body,
      }),
    }),

    // #61 Anomaly Detection
    aiDetectAnomaly: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/user/v1/ai/detect-anomaly',
        method: 'POST',
        body,
      }),
    }),

    // #62 Contact Auto-Enrichment
    aiEnrichContact: builder.mutation<
      { phone?: string; title?: string; company?: string; location?: string },
      { text: string }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/enrich-contact',
        method: 'POST',
        body,
      }),
    }),

    // #63 Smart Attachment Actions
    aiClassifyAttachment: builder.mutation<
      { type: string; suggestion: string; can_preview: boolean },
      { filename: string; content_type?: string }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/classify-attachment',
        method: 'POST',
        body,
      }),
    }),

    // #64 Intelligent Spam Filtering
    aiSpamScore: builder.mutation<
      any,
      {
        subject: string
        body: string
        sender?: string
        has_attachments?: boolean
      }
    >({
      query: (body) => ({
        url: '/api/user/v1/ai/spam/score',
        method: 'POST',
        body,
      }),
    }),

    // #65 Meeting Transcripts
    listTranscripts: builder.query<any[], void>({
      query: () => ({ url: '/api/user/v1/ai/transcripts', method: 'GET' }),
      providesTags: ['AdminTranscripts'],
    }),
    createTranscript: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/user/v1/ai/transcripts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminTranscripts'],
    }),

    // === Tier 6: #66 SCIM Provisioning ===
    getScimUsers: builder.query<any, void>({
      query: () => ({ url: '/scim/v2/Users', method: 'GET' }),
    }),
    createScimUser: builder.mutation<any, any>({
      query: (body) => ({ url: '/scim/v2/Users', method: 'POST', body }),
    }),
    patchScimUser: builder.mutation<any, { userId: string; body: any }>({
      query: ({ userId, body }) => ({
        url: `/scim/v2/Users/${userId}`,
        method: 'PATCH',
        body,
      }),
    }),
    deleteScimUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/scim/v2/Users/${userId}`,
        method: 'DELETE',
      }),
    }),

    // === Tier 6: #67 Student Groups ===
    listStudentGroups: builder.query<any, void>({
      query: () => '/admin/student-groups/',
    }),
    createStudentGroup: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/student-groups/',
        method: 'POST',
        body,
      }),
    }),
    deleteStudentGroup: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/student-groups/${id}`, method: 'DELETE' }),
    }),
    enrollStudents: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/student-groups/enroll',
        method: 'POST',
        body,
      }),
    }),
    dropStudents: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/student-groups/drop',
        method: 'POST',
        body,
      }),
    }),

    // === Tier 6: #68 HIPAA Compliance ===
    getHipaaConfig: builder.query<any, void>({
      query: () => '/admin/hipaa/config',
    }),
    setHipaaConfig: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/hipaa/config', method: 'POST', body }),
    }),
    detectPhi: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/hipaa/detect-phi',
        method: 'POST',
        body,
      }),
    }),
    getHipaaAuditTrail: builder.query<any, void>({
      query: () => '/admin/hipaa/audit-trail',
    }),
    logHipaaAccess: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/hipaa/audit-trail',
        method: 'POST',
        body,
      }),
    }),

    // === Tier 6: #69 eIDAS Signatures ===
    signDocument: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/eidas/sign', method: 'POST', body }),
    }),
    verifySignature: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/eidas/verify', method: 'POST', body }),
    }),
    listEidasCertificates: builder.query<any, void>({
      query: () => '/admin/eidas/certificates',
    }),
    listEidasSignatures: builder.query<any, void>({
      query: () => '/admin/eidas/signatures',
    }),

    // === Tier 6: #70 Donor Management ===
    listDonors: builder.query<any, void>({
      query: () => '/admin/donors/',
    }),
    createDonor: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/donors/', method: 'POST', body }),
    }),
    getDonor: builder.query<any, string>({
      query: (id) => `/admin/donors/${id}`,
    }),
    recordDonation: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/admin/donors/${id}/donate`,
        method: 'POST',
        body,
      }),
    }),
    updateGdprConsent: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/admin/donors/${id}/gdpr`,
        method: 'POST',
        body,
      }),
    }),

    // === Tier 6: #71 Volunteer Scheduling ===
    listVolunteers: builder.query<any, void>({
      query: () => '/admin/volunteers/',
    }),
    createVolunteer: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/volunteers/', method: 'POST', body }),
    }),
    listVolunteerShifts: builder.query<any, void>({
      query: () => '/admin/volunteers/shifts',
    }),
    createVolunteerShift: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/volunteers/shifts',
        method: 'POST',
        body,
      }),
    }),
    volunteerCheckin: builder.mutation<any, string>({
      query: (shiftId) => ({
        url: `/admin/volunteers/shifts/${shiftId}/checkin`,
        method: 'POST',
      }),
    }),
    volunteerCheckout: builder.mutation<any, any>({
      query: ({ shiftId, body }) => ({
        url: `/admin/volunteers/shifts/${shiftId}/checkout`,
        method: 'POST',
        body,
      }),
    }),
    generateCertificate: builder.mutation<any, string>({
      query: (volId) => ({
        url: `/admin/volunteers/${volId}/certificate`,
        method: 'POST',
      }),
    }),

    // === Tier 7: #72 Import/Export ===
    analyzePst: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/import/pst/analyze',
        method: 'POST',
        body,
      }),
    }),
    startPstImport: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/import/pst/import',
        method: 'POST',
        body,
      }),
    }),
    discoverM365: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/import/m365/discover',
        method: 'POST',
        body,
      }),
    }),
    startM365Import: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/import/m365/import',
        method: 'POST',
        body,
      }),
    }),
    listImportJobs: builder.query<any, void>({
      query: () => '/admin/import/jobs',
    }),
    cancelImportJob: builder.mutation<any, string>({
      query: (jobId) => ({
        url: `/admin/import/jobs/${jobId}`,
        method: 'DELETE',
      }),
    }),

    // === Tier 7: #73 Matrix Chat ===
    getMatrixConfig: builder.query<any, void>({
      query: () => '/admin/matrix/config',
    }),
    setMatrixConfig: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/matrix/config', method: 'POST', body }),
    }),
    listMatrixRooms: builder.query<any, void>({
      query: () => '/admin/matrix/rooms',
    }),
    createMatrixRoom: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/matrix/rooms', method: 'POST', body }),
    }),
    getMatrixRoom: builder.query<any, string>({
      query: (roomId) => `/admin/matrix/rooms/${roomId}`,
    }),
    sendMatrixMessage: builder.mutation<any, any>({
      query: ({ roomId, body }) => ({
        url: `/admin/matrix/rooms/${roomId}/send`,
        method: 'POST',
        body,
      }),
    }),
    listMatrixLinks: builder.query<any, void>({
      query: () => '/admin/matrix/link',
    }),

    // === Tier 7: #74 JMAP Protocol ===
    getJmapStatus: builder.query<any, void>({
      query: () => '/jmap/status',
    }),

    // === Tier 7: #75 ActiveSync ===
    getActiveSyncStatus: builder.query<any, void>({
      query: () => '/Microsoft-Server-ActiveSync/status',
    }),

    // === Tier 7: #76 Mobile App ===
    listMobileDevices: builder.query<any, void>({
      query: () => '/admin/mobile/devices',
    }),
    getMobileConfig: builder.query<any, void>({
      query: () => '/admin/mobile/config',
    }),
    setMobileConfig: builder.mutation<any, any>({
      query: (body) => ({ url: '/admin/mobile/config', method: 'POST', body }),
    }),
    unregisterMobileDevice: builder.mutation<any, string>({
      query: (deviceId) => ({
        url: `/admin/mobile/devices/${deviceId}`,
        method: 'DELETE',
      }),
    }),
    broadcastPush: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/mobile/push/broadcast',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSystemQuery,
  usePatchSystemMutation,
  useGetDomainsQuery,
  useGetRulesQuery,
  useGetDynamicFormQuery,
  useGetDomainDefaultQuery,
  useGetCustomDomainConfigQuery,
  useSaveCustomDomainConfigMutation,
  usePatchDomainDefaultMutation,
  usePatchCustomDomainConfigMutation,
  useDeleteDomainMutation,
  useGetActiveUsersQuery,
  useRevokeSessionsMutation,
  useRevokeInactiveSessionsMutation,
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Shared Mailboxes
  useListSharedMailboxesQuery,
  useSearchSharedMailboxesQuery,
  useExportSharedMailboxesQuery,
  useImportSharedMailboxesMutation,
  useExportSharedMailboxAnalyticsCsvMutation,
  useGetSharedMailboxQuery,
  useCreateSharedMailboxMutation,
  useUpdateSharedMailboxMutation,
  useDeleteSharedMailboxMutation,
  useGetSharedMailboxMembersQuery,
  useAddSharedMailboxMemberMutation,
  useRemoveSharedMailboxMemberMutation,
  useUpdateSharedMailboxMemberRoleMutation,
  useGetSharedMailboxAnalyticsQuery,
  useListSharedMailboxNotesQuery,
  useCreateSharedMailboxNoteMutation,
  useDeleteSharedMailboxNoteMutation,
  useListSharedMailboxAssignmentsQuery,
  useCreateSharedMailboxAssignmentMutation,
  useUpdateSharedMailboxAssignmentMutation,
  useDeleteSharedMailboxAssignmentMutation,
  useGetThemeQuery,
  usePatchThemeMutation,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGenerateSpfRecordMutation,
  useValidateSpfRecordMutation,
  useGenerateDkimRecordMutation,
  useGenerateDmarcRecordMutation,
  useValidateDmarcRecordMutation,
  useGetResourcesQuery,
  useGetResourceQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useGetHealthDashboardQuery,
  useGetAuditLogQuery,
  useExportUsersCsvMutation,
  useImportUsersCsvMutation,
  useGetUserQuotaQuery,
  useSetUserQuotaMutation,
  useLazyGetMailboxDebugRawQuery,
  useLazyGetMailboxDebugHeadersQuery,
  useGetDomainBrandingQuery,
  useSetDomainBrandingMutation,
  useGetBackupHistoryQuery,
  useTriggerBackupMutation,
  useGetBackupConfigQuery,
  useSetBackupConfigMutation,
  useGetDbMigrationQuery,
  useRunDbMigrationMutation,
  useGetMigrationHistoryQuery,
  useGetMigrationSourcesQuery,
  useStartMigrationMutation,
  useGetConfigExportQuery,
  useGetConfigHistoryQuery,
  useImportConfigMutation,
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
  useListOAuthClientsQuery,
  useRegisterOAuthClientMutation,
  useListSchedulingPollsQuery,
  useCreateSchedulingPollMutation,
  useListAppointmentSlotsQuery,
  useCreateAppointmentSlotMutation,
  useListSlotBookingsQuery,
  useListSharedDraftsQuery,
  useCreateSharedDraftMutation,
  useReviewSharedDraftMutation,
  useListFileSharesQuery,
  useCreateFileShareMutation,
  useListApprovalsQuery,
  useCreateApprovalMutation,
  useActionApprovalMutation,
  useListTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useListCrmAccountsQuery,
  useCreateCrmAccountMutation,
  useListWorkflowsQuery,
  useCreateWorkflowMutation,
  useToggleWorkflowMutation,
  useDeleteWorkflowMutation,
  useListQuickActionsQuery,
  useCreateQuickActionMutation,
  useDeleteQuickActionMutation,
  useGetFreeBusyMutation,
  useAiSummarizeMutation,
  useAiClassifyMutation,
  useAiSuggestReplyMutation,
  useAiNaturalSearchMutation,
  useAiSuggestMeetingTimesMutation,
  useAiDetectAnomalyMutation,
  useAiEnrichContactMutation,
  useAiClassifyAttachmentMutation,
  useAiSpamScoreMutation,
  useListTranscriptsQuery,
  useCreateTranscriptMutation,
  // Tier 6
  useGetScimUsersQuery,
  useCreateScimUserMutation,
  usePatchScimUserMutation,
  useDeleteScimUserMutation,
  useListStudentGroupsQuery,
  useCreateStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useEnrollStudentsMutation,
  useDropStudentsMutation,
  useGetHipaaConfigQuery,
  useSetHipaaConfigMutation,
  useDetectPhiMutation,
  useGetHipaaAuditTrailQuery,
  useLogHipaaAccessMutation,
  useSignDocumentMutation,
  useVerifySignatureMutation,
  useListEidasCertificatesQuery,
  useListEidasSignaturesQuery,
  useListDonorsQuery,
  useCreateDonorMutation,
  useGetDonorQuery,
  useRecordDonationMutation,
  useUpdateGdprConsentMutation,
  useListVolunteersQuery,
  useCreateVolunteerMutation,
  useListVolunteerShiftsQuery,
  useCreateVolunteerShiftMutation,
  useVolunteerCheckinMutation,
  useVolunteerCheckoutMutation,
  useGenerateCertificateMutation,
  // Tier 7
  useAnalyzePstMutation,
  useStartPstImportMutation,
  useDiscoverM365Mutation,
  useStartM365ImportMutation,
  useListImportJobsQuery,
  useCancelImportJobMutation,
  useGetMatrixConfigQuery,
  useSetMatrixConfigMutation,
  useListMatrixRoomsQuery,
  useCreateMatrixRoomMutation,
  useGetMatrixRoomQuery,
  useSendMatrixMessageMutation,
  useListMatrixLinksQuery,
  useGetJmapStatusQuery,
  useGetActiveSyncStatusQuery,
  useListMobileDevicesQuery,
  useGetMobileConfigQuery,
  useSetMobileConfigMutation,
  useUnregisterMobileDeviceMutation,
  useBroadcastPushMutation,
} = injectedEndpoints
