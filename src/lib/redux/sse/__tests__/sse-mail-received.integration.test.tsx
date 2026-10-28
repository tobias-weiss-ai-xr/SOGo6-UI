/**
 * Integration: SSE named event -> SSEService -> useMailReceivedListener -> RTK cache.
 * Uses the REAL SSEService and the REAL hook with a fake EventSource.
 */
import { mailComposeReducer } from '@/features/mails/store'
import { mailsApiEndpoints } from '@/features/mails/store/mails-api'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

type Listener = (ev: { data: string }) => void

const eventSourceInstances: FakeEventSource[] = []

class FakeEventSource {
  url: string
  listeners = new Map<string, Listener[]>()
  readyState = 1
  constructor(url: string) {
    this.url = url
    eventSourceInstances.push(this)
  }
  addEventListener(name: string, fn: Listener) {
    const list = this.listeners.get(name) ?? []
    list.push(fn)
    this.listeners.set(name, list)
  }
  removeEventListener(name: string, fn: Listener) {
    this.listeners.set(
      name,
      (this.listeners.get(name) ?? []).filter((f) => f !== fn)
    )
  }
  emit(name: string, data: string) {
    for (const fn of this.listeners.get(name) ?? []) fn({ data })
  }
}

let mockInstance: SSEService | null

jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: jest.fn(async () => ({ SSE_ENABLED: true })),
}))

// build the real service singleton the same way sse-api's connect does
import { useMailReceivedListener } from '../hooks/use-mail-received-listener'
import { SSEService } from '../sse-service'

jest.mock('../sse-api', () => ({
  getSSEServiceInstance: () => mockInstance,
}))

// install the fake transport before the service connects
;(global as unknown as { EventSource: unknown }).EventSource = FakeEventSource

beforeEach(async () => {
  eventSourceInstances.length = 0
  mockInstance = new SSEService({
    url: 'http://localhost/fake-sse',
  } as never)
  await mockInstance.connect()
})

afterEach(() => {
  mockInstance = null
})

const renderHookComponent = (store: ReturnType<typeof makeStore>) => {
  function Probe() {
    useMailReceivedListener('INBOX', undefined, undefined, '0')
    return null
  }
  render(
    <Provider store={store}>
      <Probe />
    </Provider>
  )
}

const makeStore = () =>
  configureStore({
    reducer: {
      mailCompose: mailComposeReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },

    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware().concat(apiSlice.middleware as never),
  })

it('prepends the received mail into the INBOX cache', async () => {
  // real fetch response so the INBOX query fulfills with data
  // any query resolves with a one-mail INBOX page
  ;(global as unknown as { fetch: unknown }).fetch = jest.fn(() => {
    const body = JSON.stringify({
      mails: [{ id: '10' }],
      total: 1,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => JSON.parse(body),
      text: async () => body,
      headers: {
        get: (h: string) =>
          h.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
    })
  })
  const store = makeStore()
  renderHookComponent(store)

  // the page's INBOX cache entry, seeded the way a fulfilled list looks
  const args = {
    accountId: '0',
    folder: 'INBOX',
    params: {
      page_size: 50,
      page: 1,
      fields: 'contents',
      fields_action: 'exclude' as const,
    },
  }

  void (store.dispatch as any)(
    mailsApiEndpoints.util.upsertQueryData('getFolderMessages', args, {
      mails: [{ id: '10' }],
      total: 1,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    } as never)
  )

  await new Promise((r) => setTimeout(r, 20))
  const s0: any = store.getState()
  console.log(
    'ALL QUERIES:',
    JSON.stringify(
      Object.entries(s0.api.queries).map(([k, e]: any) => ({
        k,
        ep: e?.endpointName,
        status: e?.status,
        hasData: !!e?.data,
        keys: e?.data ? Object.keys(e.data) : null,
      }))
    )
  )

  const es = eventSourceInstances[eventSourceInstances.length - 1]
  es.emit(
    'mail:received',
    JSON.stringify({
      id: '11',
      subject: 'SSE live check 3',
      from: { name: '', email: 't@e.c' },
      receivedAt: 'Mon, 14 Sep 2026 16:35:37 +0000',
      preview: '',
    })
  )

  const state: any = store.getState()
  const entry = Object.values<any>(state.api.queries).find(
    (e) =>
      e?.endpointName === 'getFolderMessages' &&
      e.originalArgs?.folder === 'INBOX'
  )
  expect(entry?.data?.mails?.map((m: any) => m.id)).toEqual(['11', '10'])
  expect(entry?.data?.total).toBe(2)
})
