/**
 * Unit tests for global-search-api.ts RTK Query endpoint
 * Global Quick Search (Cmd+K) Feature - Tier 1
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
        const definitions =
          typeof config.endpoints === 'function'
            ? config.endpoints(builder)
            : config.endpoints
        const hooks: Record<string, any> = {}
        Object.keys(definitions).forEach(key => {
          const kind = (definitions[key] as any)?.__kind ?? 'query'
          const suffix = kind === 'mutation' ? 'Mutation' : 'Query'
          hooks[`use${key[0].toUpperCase()}${key.slice(1)}${suffix}`] = jest.fn()
        })
        return {
          endpoints: definitions,
          ...hooks,
          injectedEndpoints: {
            endpoints: definitions,
            ...hooks,
          },
        }
      },
    },
  }
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const globalSearchApi = require('../store/global-search-api')

// The store exports globalSearchApiEndpoints = injectedEndpoints.endpoints,
// i.e. the evaluated endpoint definitions object.
function getEndpoints(): any {
  return (globalSearchApi as any).globalSearchApiEndpoints
}

describe('global-search-api', () => {
  it('exports the useGlobalSearchQuery hook', () => {
    expect(typeof globalSearchApi.useGlobalSearchQuery).toBe('function')
  })

  it('defines a single globalSearch endpoint', () => {
    const keys = Object.keys(getEndpoints() ?? {})
    expect(keys).toContain('globalSearch')
    expect(keys.length).toBe(1)
  })

  it('globalSearch is a GET query to search/global', () => {
    const def = getEndpoints()?.globalSearch
    expect(def).toBeTruthy()
    const query = def.query({ q: 'alice', limit: 8 })
    expect(query.url).toBe('search/global')
    expect(query.params).toEqual({ q: 'alice', limit: 8 })
  })

  it('globalSearch transforms the envelope to the result', () => {
    const def = getEndpoints()?.globalSearch
    const transformed = def.transformResponse({
      data: { contacts: [{ key: 'c1' }], events: [], users: [] },
      error_code: 0,
      error_msg: '',
    })
    expect(transformed.contacts).toHaveLength(1)
  })

  it('globalSearch handles a missing envelope gracefully', () => {
    const def = getEndpoints()?.globalSearch
    const transformed = def.transformResponse(undefined)
    expect(transformed).toEqual({ contacts: [], events: [], users: [] })
  })

  it('provides a tag keyed by the query', () => {
    const def = getEndpoints()?.globalSearch
    const tags = def.providesTags(null, null, { q: 'hello' })
    expect(tags).toEqual([{ type: 'global_search', id: 'hello' }])
  })
})
