import type {
  //AdminConfig,
  AdminConfigSection,
} from '@/features/admin-panel/types/admin-panel'
import type { DnsRecord, DnsValidation } from './dns-wizard-api'
import type { Resource } from './resource-booking-api'
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

export type DomainItem = {
  name: string
  extra_infos?: Record<string, string>
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getSystem: builder.query<Record<string, any>, void>({
      query: () => ({
        url: '/admin/v1/config/system',
        method: 'GET',
      }),
      providesTags: [ADMIN_V1_CONFIG_SYSTEM_SLICE],
      transformResponse: (response: Record<string, any>) => response?.data ?? {},
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
    deleteUser: builder.mutation<
      Record<string, unknown>,
      string
    >({
      query: (uid) => ({
        url: `/admin/v1/users/${encodeURIComponent(uid)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uid) => [
        'AdminUsers',
        { type: 'AdminUsers', id: uid },
      ],
    }),

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
    patchTheme: builder.mutation<Record<string, any>, { config: Record<string, any> }>({
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

    generateSpfRecord: builder.mutation<DnsRecord, {
      domain: string
      mx_servers?: string[]
      ip4_addresses?: string[]
      ip6_addresses?: string[]
      include_domains?: string[]
      policy?: string
    }>({
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

    generateDkimRecord: builder.mutation<DnsRecord, {
      domain: string
      selector?: string
      key_type?: string
      public_key?: string
    }>({
      query: (body) => ({
        url: '/admin/v1/dns/dkim/generate',
        method: 'POST',
        body,
      }),
    }),

    generateDmarcRecord: builder.mutation<DnsRecord, {
      domain: string
      policy?: string
      rua_email?: string
      ruf_email?: string
      pct?: number
      subdomain_policy?: string
      aspf?: string
      adkim?: string
    }>({
      query: (body) => ({
        url: '/admin/v1/dns/dmarc/generate',
        method: 'POST',
        body,
      }),
    }),

    validateDmarcRecord: builder.mutation<DnsValidation, { dmarc_value: string }>({
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

    createResource: builder.mutation<Resource, {
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
    }>({
      query: (body) => ({
        url: '/admin/v1/resources/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminResources'],
    }),

    updateResource: builder.mutation<Resource, { id: string; body: Partial<Resource> }>({
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

    getHealthDashboard: builder.query<{
      services: Array<{ name: string; status: string; latency_ms: number; detail: string }>
      uptime_seconds: number
      version: string
    }, void>({
      query: () => ({
        url: '/admin/v1/health-dashboard/',
        method: 'GET',
      }),
      providesTags: ['AdminHealth'],
    }),

    // === Audit Log ===

    getAuditLog: builder.query<{
      entries: Array<{
        timestamp: number
        action: string
        actor: string
        target: string | null
        detail: string | null
        ip: string | null
      }>
    }, { limit?: number } | void>({
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

    importUsersCsv: builder.mutation<{
      created: number
      updated: number
      errors: Array<{ row: number; error: string }>
    }, FormData>({
      query: (body) => ({
        url: '/admin/v1/bulk-users/import/csv',
        method: 'POST',
        body,
      }),
    }),

    // === Usage Quotas ===

    getUserQuota: builder.query<{
      mailbox_size_mb: number
      mailbox_used_mb: number
      calendar_count: number
      calendar_used: number
      contact_count: number
      contact_used: number
    }, string>({
      query: (userUid) => ({
        url: `/admin/v1/quotas/${userUid}`,
        method: 'GET',
      }),
    }),

    setUserQuota: builder.mutation<Record<string, unknown>, {
      user_uid: string
      mailbox_size_mb?: number
      calendar_count?: number
      contact_count?: number
    }>({
      query: (body) => ({
        url: `/admin/v1/quotas/${body.user_uid}`,
        method: 'POST',
        body: { mailbox_size_mb: body.mailbox_size_mb, calendar_count: body.calendar_count, contact_count: body.contact_count },
      }),
    }),

    // === Mailbox Debug ===

    getMailboxDebugRaw: builder.query<string, { userUid: string; folder: string; mailUid: string }>({
      query: ({ userUid, folder, mailUid }) => ({
        url: `/admin/v1/mailbox-debug/${userUid}/raw/${folder}/${mailUid}`,
        method: 'GET',
      }),
    }),

    getMailboxDebugHeaders: builder.query<Record<string, string>, { userUid: string; folder: string; mailUid: string }>({
      query: ({ userUid, folder, mailUid }) => ({
        url: `/admin/v1/mailbox-debug/${userUid}/headers/${folder}/${mailUid}`,
        method: 'GET',
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
} = injectedEndpoints
