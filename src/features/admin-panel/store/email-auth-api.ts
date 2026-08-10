import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  DkimConfig,
  DkimKeyPair,
  DkimValidation,
  DmarcAggregateReport,
  DmarcConfig,
  DmarcValidation,
  EmailAuthDomain,
  EmailAuthDomainStatus,
  EmailAuthTestResult,
  SpfConfig,
  SpfValidation,
} from '../email-auth-types'

// Local tag constants (kept in-slice to stay mock-friendly in Jest tests)
const EMAIL_AUTH_DOMAINS_SLICE = 'email_auth_domains'
const EMAIL_AUTH_DKIM_SLICE = 'email_auth_dkim'
const EMAIL_AUTH_DMARC_SLICE = 'email_auth_dmarc'
const EMAIL_AUTH_SPF_SLICE = 'email_auth_spf'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    // ── Domains ──────────────────────────────────────────────────────────
    listEmailAuthDomains: builder.query<
      { domains: EmailAuthDomain[]; total_count: number },
      void
    >({
      query: () => ({ url: '/admin/v1/email-auth/domains', method: 'GET' }),
      providesTags: [EMAIL_AUTH_DOMAINS_SLICE],
    }),
    addEmailAuthDomain: builder.mutation<
      { domain: EmailAuthDomain },
      { name: string; description?: string; is_active?: boolean }
    >({
      query: (body) => ({ url: '/admin/v1/email-auth/domains', method: 'POST', body }),
      invalidatesTags: [EMAIL_AUTH_DOMAINS_SLICE],
    }),
    deleteEmailAuthDomain: builder.mutation<{ deleted: string }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/domains/${encodeURIComponent(domain)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        EMAIL_AUTH_DOMAINS_SLICE,
        EMAIL_AUTH_DKIM_SLICE,
        EMAIL_AUTH_DMARC_SLICE,
        EMAIL_AUTH_SPF_SLICE,
      ],
    }),
    getEmailAuthDomainStatus: builder.query<
      { status: EmailAuthDomainStatus },
      string
    >({
      query: (domain) => ({
        url: `/admin/v1/email-auth/domains/${encodeURIComponent(domain)}/status`,
        method: 'GET',
      }),
    }),

    // ── DKIM ─────────────────────────────────────────────────────────────
    listDkimConfigs: builder.query<
      { dkim_configs: DkimConfig[]; total_count: number },
      void
    >({
      query: () => ({ url: '/admin/v1/email-auth/dkim', method: 'GET' }),
      providesTags: [EMAIL_AUTH_DKIM_SLICE],
    }),
    generateDkimKeyPair: builder.mutation<
      { key_pair: DkimKeyPair },
      { key_length?: number }
    >({
      query: ({ key_length }) => ({
        url: '/admin/v1/email-auth/dkim/generate',
        method: 'POST',
        body: { key_length },
      }),
    }),
    setDkimConfig: builder.mutation<
      { dkim: DkimConfig },
      {
        domain: string
        body: {
          public_key?: string
          selector?: string
          key_length?: number
          enabled?: boolean
        }
      }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_DKIM_SLICE],
    }),
    getDkimConfig: builder.query<{ dkim: DkimConfig }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}`,
        method: 'GET',
      }),
    }),
    updateDkimConfig: builder.mutation<
      { dkim: DkimConfig },
      { domain: string; body: Partial<DkimConfig> }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_DKIM_SLICE],
    }),
    deleteDkimConfig: builder.mutation<{ deleted: string }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [EMAIL_AUTH_DKIM_SLICE],
    }),
    rotateDkimKeys: builder.mutation<
      { dkim: DkimConfig },
      { domain: string; key_length?: number }
    >({
      query: ({ domain, key_length }) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}/rotate`,
        method: 'POST',
        body: { key_length },
      }),
      invalidatesTags: [EMAIL_AUTH_DKIM_SLICE],
    }),
    validateDkimDns: builder.mutation<{ validation: DkimValidation }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dkim/${encodeURIComponent(domain)}/validate`,
        method: 'POST',
      }),
    }),

    // ── DMARC ────────────────────────────────────────────────────────────
    listDmarcPolicies: builder.query<
      { dmarc_policies: DmarcConfig[]; total_count: number },
      void
    >({
      query: () => ({ url: '/admin/v1/email-auth/dmarc', method: 'GET' }),
      providesTags: [EMAIL_AUTH_DMARC_SLICE],
    }),
    setDmarcPolicy: builder.mutation<
      { dmarc: DmarcConfig },
      {
        domain: string
        body: Partial<DmarcConfig> & { policy?: 'none' | 'quarantine' | 'reject' }
      }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_DMARC_SLICE],
    }),
    getDmarcPolicy: builder.query<{ dmarc: DmarcConfig }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}`,
        method: 'GET',
      }),
    }),
    updateDmarcPolicy: builder.mutation<
      { dmarc: DmarcConfig },
      { domain: string; body: Partial<DmarcConfig> }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_DMARC_SLICE],
    }),
    deleteDmarcPolicy: builder.mutation<{ deleted: string }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [EMAIL_AUTH_DMARC_SLICE],
    }),
    validateDmarcDns: builder.mutation<{ validation: DmarcValidation }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}/validate`,
        method: 'POST',
      }),
    }),
    getDmarcReports: builder.query<
      { reports: DmarcAggregateReport[]; total_count: number },
      string
    >({
      query: (domain) => ({
        url: `/admin/v1/email-auth/dmarc/${encodeURIComponent(domain)}/reports`,
        method: 'GET',
      }),
    }),

    // ── SPF ──────────────────────────────────────────────────────────────
    listSpfRecords: builder.query<
      { spf_records: SpfConfig[]; total_count: number },
      void
    >({
      query: () => ({ url: '/admin/v1/email-auth/spf', method: 'GET' }),
      providesTags: [EMAIL_AUTH_SPF_SLICE],
    }),
    setSpfConfig: builder.mutation<
      { spf: SpfConfig },
      { domain: string; body: Partial<SpfConfig> }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/spf/${encodeURIComponent(domain)}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_SPF_SLICE],
    }),
    getSpfRecord: builder.query<{ spf: SpfConfig }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/spf/${encodeURIComponent(domain)}`,
        method: 'GET',
      }),
    }),
    updateSpfRecord: builder.mutation<
      { spf: SpfConfig },
      { domain: string; body: Partial<SpfConfig> }
    >({
      query: ({ domain, body }) => ({
        url: `/admin/v1/email-auth/spf/${encodeURIComponent(domain)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [EMAIL_AUTH_SPF_SLICE],
    }),
    deleteSpfRecord: builder.mutation<{ deleted: string }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/spf/${encodeURIComponent(domain)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [EMAIL_AUTH_SPF_SLICE],
    }),
    validateSpfDns: builder.mutation<{ validation: SpfValidation }, string>({
      query: (domain) => ({
        url: `/admin/v1/email-auth/spf/${encodeURIComponent(domain)}/validate`,
        method: 'POST',
      }),
    }),

    // ── Test & bulk ──────────────────────────────────────────────────────
    testEmailAuth: builder.mutation<
      { test: EmailAuthTestResult },
      { from_address: string; smtp_server?: string; smtp_port?: number }
    >({
      query: (body) => ({ url: '/admin/v1/email-auth/test', method: 'POST', body }),
    }),
    validateAllDomains: builder.mutation<
      { statuses: EmailAuthDomainStatus[]; total_count: number },
      void
    >({
      query: () => ({ url: '/admin/v1/email-auth/validate-all', method: 'POST' }),
    }),
  }),
})

export const {
  useListEmailAuthDomainsQuery,
  useAddEmailAuthDomainMutation,
  useDeleteEmailAuthDomainMutation,
  useGetEmailAuthDomainStatusQuery,
  useListDkimConfigsQuery,
  useGenerateDkimKeyPairMutation,
  useSetDkimConfigMutation,
  useGetDkimConfigQuery,
  useUpdateDkimConfigMutation,
  useDeleteDkimConfigMutation,
  useRotateDkimKeysMutation,
  useValidateDkimDnsMutation,
  useListDmarcPoliciesQuery,
  useSetDmarcPolicyMutation,
  useGetDmarcPolicyQuery,
  useUpdateDmarcPolicyMutation,
  useDeleteDmarcPolicyMutation,
  useValidateDmarcDnsMutation,
  useGetDmarcReportsQuery,
  useListSpfRecordsQuery,
  useSetSpfConfigMutation,
  useGetSpfRecordQuery,
  useUpdateSpfRecordMutation,
  useDeleteSpfRecordMutation,
  useValidateSpfDnsMutation,
  useTestEmailAuthMutation,
  useValidateAllDomainsMutation,
} = injectedEndpoints

export const emailAuthApiEndpoints = injectedEndpoints