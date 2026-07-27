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
} = injectedEndpoints
