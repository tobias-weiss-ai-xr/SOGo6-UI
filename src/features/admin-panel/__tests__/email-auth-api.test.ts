/**
 * Tests for the email-auth (DKIM/DMARC/SPF) RTK Query store.
 *
 * Follows the resources-api/team-calendars pattern: mock the api-slice
 * module, then require() the store so the mocked injectEndpoints captures
 * the endpoint definitions.
 */
jest.mock('@/lib/redux/api/api-slice', () => {
  const mockInjectEndpoints = jest.fn()
  return {
    __mockInjectEndpoints: mockInjectEndpoints,
    apiSlice: {
      injectEndpoints: (config: any) => {
        mockInjectEndpoints(config)
        const builder = {
          query: (definition: any) => ({ ...definition, __kind: 'query' }),
          mutation: (definition: any) => ({ ...definition, __kind: 'mutation' }),
        }
        const endpoints =
          typeof config.endpoints === 'function'
            ? config.endpoints(builder)
            : config.endpoints
        const hooks: Record<string, any> = {}
        Object.keys(endpoints).forEach(key => {
          const kind = (endpoints[key] as any)?.__kind ?? 'query'
          const suffix = kind === 'mutation' ? 'Mutation' : 'Query'
          hooks[`use${key[0].toUpperCase()}${key.slice(1)}${suffix}`] = jest.fn()
        })
        return {
          endpoints,
          ...hooks,
          injectedEndpoints: {
            endpoints,
            ...hooks,
          },
        }
      },
    },
  }
})

// Load the module under test AFTER the mock is registered
// eslint-disable-next-line @typescript-eslint/no-var-requires
const emailAuthApi = require('../store/email-auth-api')

const endpoints = (emailAuthApi as any).emailAuthApiEndpoints?.endpoints ??
  (emailAuthApi as any).endpoints as Record<string, any>

describe('email-auth-api endpoint definitions', () => {
  test('injects endpoints via apiSlice', () => {
    expect(emailAuthApi).toBeTruthy()
    expect(endpoints).toBeTruthy()
  })

  test('defines 27 endpoints', () => {
    expect(Object.keys(endpoints)).toHaveLength(27)
  })
})

describe('domain endpoints', () => {
  test('listEmailAuthDomains queries /admin/v1/email-auth/domains', () => {
    const result = endpoints.listEmailAuthDomains.query()
    expect(result).toEqual({ url: '/admin/v1/email-auth/domains', method: 'GET' })
  })

  test('listEmailAuthDomains provides the domains tag', () => {
    expect(endpoints.listEmailAuthDomains.providesTags).toEqual(['email_auth_domains'])
  })

  test('addEmailAuthDomain POSTs to /domains', () => {
    const result = endpoints.addEmailAuthDomain.query({ name: 'example.org' })
    expect(result).toEqual({
      url: '/admin/v1/email-auth/domains',
      method: 'POST',
      body: { name: 'example.org' },
    })
  })

  test('deleteEmailAuthDomain DELETEs a specific domain', () => {
    const result = endpoints.deleteEmailAuthDomain.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/domains/example.org')
    expect(result.method).toBe('DELETE')
  })

  test('deleteEmailAuthDomain invalidates all four tag slices', () => {
    const tags = endpoints.deleteEmailAuthDomain.invalidatesTags
    expect(tags).toContain('email_auth_domains')
    expect(tags).toContain('email_auth_dkim')
    expect(tags).toContain('email_auth_dmarc')
    expect(tags).toContain('email_auth_spf')
  })

  test('getEmailAuthDomainStatus queries the status route', () => {
    const result = endpoints.getEmailAuthDomainStatus.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/domains/example.org/status')
  })
})

describe('DKIM endpoints', () => {
  test('listDkimConfigs queries /dkim', () => {
    const result = endpoints.listDkimConfigs.query()
    expect(result).toEqual({ url: '/admin/v1/email-auth/dkim', method: 'GET' })
  })

  test('generateDkimKeyPair POSTs to /dkim/generate', () => {
    const result = endpoints.generateDkimKeyPair.query({ key_length: 4096 })
    expect(result).toEqual({
      url: '/admin/v1/email-auth/dkim/generate',
      method: 'POST',
      body: { key_length: 4096 },
    })
  })

  test('setDkimConfig POSTs config for a domain', () => {
    const result = endpoints.setDkimConfig.query({
      domain: 'example.org',
      body: { selector: 'sogo' },
    })
    expect(result.url).toBe('/admin/v1/email-auth/dkim/example.org')
    expect(result.method).toBe('POST')
    expect(result.body).toEqual({ selector: 'sogo' })
  })

  test('setDkimConfig invalidates the dkim tag', () => {
    expect(endpoints.setDkimConfig.invalidatesTags).toEqual(['email_auth_dkim'])
  })

  test('rotateDkimKeys POSTs to /dkim/{domain}/rotate', () => {
    const result = endpoints.rotateDkimKeys.query({ domain: 'example.org' })
    expect(result.url).toBe('/admin/v1/email-auth/dkim/example.org/rotate')
    expect(result.method).toBe('POST')
  })

  test('validateDkimDns POSTs to /dkim/{domain}/validate', () => {
    const result = endpoints.validateDkimDns.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/dkim/example.org/validate')
    expect(result.method).toBe('POST')
  })
})

describe('DMARC endpoints', () => {
  test('listDmarcPolicies queries /dmarc', () => {
    const result = endpoints.listDmarcPolicies.query()
    expect(result).toEqual({ url: '/admin/v1/email-auth/dmarc', method: 'GET' })
  })

  test('setDmarcPolicy POSTs policy for a domain', () => {
    const result = endpoints.setDmarcPolicy.query({
      domain: 'example.org',
      body: { policy: 'quarantine', pct: 50 },
    })
    expect(result.url).toBe('/admin/v1/email-auth/dmarc/example.org')
    expect(result.method).toBe('POST')
    expect(result.body).toEqual({ policy: 'quarantine', pct: 50 })
  })

  test('getDmarcReports queries the reports route', () => {
    const result = endpoints.getDmarcReports.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/dmarc/example.org/reports')
  })

  test('validateDmarcDns POSTs to validate route', () => {
    const result = endpoints.validateDmarcDns.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/dmarc/example.org/validate')
    expect(result.method).toBe('POST')
  })
})

describe('SPF endpoints', () => {
  test('listSpfRecords queries /spf', () => {
    const result = endpoints.listSpfRecords.query()
    expect(result).toEqual({ url: '/admin/v1/email-auth/spf', method: 'GET' })
  })

  test('setSpfConfig POSTs config for a domain', () => {
    const result = endpoints.setSpfConfig.query({
      domain: 'example.org',
      body: { include_mechanisms: ['_spf.google.com'], all_qualifier: '-all' },
    })
    expect(result.url).toBe('/admin/v1/email-auth/spf/example.org')
    expect(result.body).toEqual({
      include_mechanisms: ['_spf.google.com'],
      all_qualifier: '-all',
    })
  })

  test('validateSpfDns POSTs to /spf/{domain}/validate', () => {
    const result = endpoints.validateSpfDns.query('example.org')
    expect(result.url).toBe('/admin/v1/email-auth/spf/example.org/validate')
    expect(result.method).toBe('POST')
  })

  test('deleteSpfRecord DELETEs and invalidates spf tag', () => {
    const result = endpoints.deleteSpfRecord.query('example.org')
    expect(result.method).toBe('DELETE')
    expect(endpoints.deleteSpfRecord.invalidatesTags).toEqual(['email_auth_spf'])
  })
})

describe('test & bulk endpoints', () => {
  test('testEmailAuth POSTs to /test', () => {
    const result = endpoints.testEmailAuth.query({ from_address: 'a@example.org' })
    expect(result.url).toBe('/admin/v1/email-auth/test')
    expect(result.body).toEqual({ from_address: 'a@example.org' })
  })

  test('validateAllDomains POSTs to /validate-all', () => {
    const result = endpoints.validateAllDomains.query()
    expect(result).toEqual({ url: '/admin/v1/email-auth/validate-all', method: 'POST' })
  })
})

describe('hooks are exported', () => {
  test('query hooks are available', () => {
    expect(emailAuthApi.useListEmailAuthDomainsQuery).toBeDefined()
    expect(emailAuthApi.useListDkimConfigsQuery).toBeDefined()
    expect(emailAuthApi.useListDmarcPoliciesQuery).toBeDefined()
    expect(emailAuthApi.useListSpfRecordsQuery).toBeDefined()
    expect(emailAuthApi.useGetEmailAuthDomainStatusQuery).toBeDefined()
    expect(emailAuthApi.useGetDmarcReportsQuery).toBeDefined()
  })

  test('mutation hooks are available', () => {
    expect(emailAuthApi.useAddEmailAuthDomainMutation).toBeDefined()
    expect(emailAuthApi.useGenerateDkimKeyPairMutation).toBeDefined()
    expect(emailAuthApi.useRotateDkimKeysMutation).toBeDefined()
    expect(emailAuthApi.useValidateDkimDnsMutation).toBeDefined()
    expect(emailAuthApi.useValidateAllDomainsMutation).toBeDefined()
    expect(emailAuthApi.useTestEmailAuthMutation).toBeDefined()
  })
})
