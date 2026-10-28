/**
 * Regression guard: resources endpoints must build single-namespaced URLs.
 * Bug history: endpoints used '/user/v1/resources' while the base URL already
 * ends in '/api/user/v1', producing '/api/user/v1/user/v1/resources' → 404.
 */
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore } from '@reduxjs/toolkit'
import { resourcesApi } from '../resources-api'

const fetchMock = jest.fn()
const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 })

// jsdom lacks Request (fetchBaseQuery constructs one per call). Minimal shim:
// our mocked fetch only reads `.url`.
if (typeof (globalThis as { Request?: unknown }).Request === 'undefined') {
  Object.defineProperty(globalThis, 'Request', {
    value: class {
      url: string

      constructor(input: any, init: Record<string, unknown> = {}) {
        this.url = typeof input === 'string' ? input : (input?.url ?? '')
        Object.assign(this, init)
      }
    },
    writable: true,
  })
}

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockImplementation((input: unknown) => {
    const url =
      typeof input === 'string'
        ? input
        : ((input as { url?: string })?.url ?? '')
    if (url.includes('/env')) return Promise.resolve(jsonResponse({}))
    return Promise.resolve(
      jsonResponse({ resources: [], total_count: 0, limit: 0, offset: 0 })
    )
  })
  ;(global as any).fetch = fetchMock
})

function makeStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  })
}

const lastUrl = () => {
  const call = fetchMock.mock.calls.at(-1)?.[0] as unknown
  return typeof call === 'string'
    ? call
    : ((call as { url?: string })?.url ?? '')
}

describe('resources API URL construction', () => {
  it('list endpoint hits /resources without double /user/v1 prefix', async () => {
    const store = makeStore()
    await store.dispatch(
      resourcesApi.endpoints.getResources.initiate({ limit: 100, offset: 0 })
    )
    const url = lastUrl()
    expect(url).toContain('/resources')
    expect(url).not.toContain('user/v1/user/v1')
    expect(url).not.toMatch(/user\/v1\/resources/)
  })

  it('detail endpoint hits /resources/:id without double prefix', async () => {
    const store = makeStore()
    await store.dispatch(resourcesApi.endpoints.getResource.initiate('r1'))
    expect(lastUrl()).toMatch(/\/resources\/r1/)
    expect(lastUrl()).not.toContain('user/v1/user/v1')
  })

  it('bookings endpoint hits /resources/my-bookings without double prefix', async () => {
    const store = makeStore()
    await store.dispatch(resourcesApi.endpoints.getMyBookings.initiate())
    expect(lastUrl()).toMatch(/\/resources\/my-bookings/)
    expect(lastUrl()).not.toContain('user/v1/user/v1')
  })
})
