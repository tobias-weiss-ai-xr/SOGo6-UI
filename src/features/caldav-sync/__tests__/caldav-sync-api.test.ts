/**
 * Unit tests for caldav-sync-api.ts RTK Query endpoints
 * CalDAV & Sync Feature - Tier 0 Foundation
 */

// Mock the api slice before importing
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

// Load the module under test AFTER the mock is registered (require ensures ordering)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const caldavSyncApi = require('../store/caldav-sync-api') as typeof import('../store/caldav-sync-api')

// The mock returns the evaluated endpoints object (builder already invoked)
const evaluatedEndpoints =
  (caldavSyncApi as any).caldavSyncApiEndpoints?.endpoints ??
  (caldavSyncApi as any).caldavSyncApiEndpoints

describe('caldav-sync-api', () => {
  it('injects two endpoints', () => {
    expect(caldavSyncApi).toBeTruthy()
    expect(Object.keys(evaluatedEndpoints).sort()).toEqual([
      'getCalDavConnection',
      'getCalDavSyncOverview',
    ])
  })

  it('getCalDavConnection is a GET query', () => {
    const def = evaluatedEndpoints.getCalDavConnection
    expect(def.__kind).toBe('query')
    const query = def.query()
    expect(query.url).toBe('calendars/caldav/connection')
  })

  it('getCalDavConnection provides a connection tag', () => {
    const def = evaluatedEndpoints.getCalDavConnection
    expect(def.providesTags()).toEqual([{ type: 'caldav_connection', id: 'ME' }])
  })

  it('getCalDavSyncOverview is a GET query', () => {
    const def = evaluatedEndpoints.getCalDavSyncOverview
    expect(def.__kind).toBe('query')
    const query = def.query()
    expect(query.url).toBe('calendars/caldav/overview')
  })

  it('getCalDavSyncOverview provides a sync tag', () => {
    const def = evaluatedEndpoints.getCalDavSyncOverview
    expect(def.providesTags()).toEqual([{ type: 'caldav_sync', id: 'OVERVIEW' }])
  })

  it('exports the expected hooks', () => {
    expect(typeof caldavSyncApi.useGetCalDavConnectionQuery).toBe('function')
    expect(typeof caldavSyncApi.useGetCalDavSyncOverviewQuery).toBe('function')
  })
})