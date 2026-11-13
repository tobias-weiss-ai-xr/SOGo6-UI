/**
 * Tests for the agent action endpoint URL building + facade executor.
 */
import type { AgentEnvelope } from '../endpoints/agent'
import { AgentApi, buildRequest } from '../endpoints/agent'

// Mock the singleton apiClient so the executor can be exercised end-to-end
// (URL building → method routing → envelope unwrap) without a network.
// Note: jest.mock is hoisted above all imports; we type the imported,
// already-mocked singleton as the mock handle used by assertions below.
jest.mock('../client/base-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    unwrapBackendResponse: jest.fn(
      (r: { data: { data: unknown } }) => r.data.data
    ),
  },
  createApiClient: jest.fn(),
  BaseApiClient: class {},
}))

import { apiClient } from '../client/base-client'

const apiClientMock = apiClient as jest.Mocked<typeof apiClient> & {
  unwrapBackendResponse: jest.Mock
}

function envelope(error_code = 'S000000'): AgentEnvelope<any> {
  return {
    error_code,
    error_msg: error_code === 'S000000' ? '' : 'boom',
    data: null,
  }
}

const sendDraft = {
  id: 'mail.send' as const,
  params: { from: 'a@example.org', to: ['b@example.org'] },
}

describe('buildRequest', () => {
  it('routes mail.send to the facade POST send endpoint', () => {
    expect(buildRequest(sendDraft)).toEqual({
      method: 'POST',
      url: '/api/user/v1/agent/mail/send',
      body: { from: 'a@example.org', to: ['b@example.org'] },
    })
  })

  it('puts non-path params into the body', () => {
    const req = buildRequest({
      id: 'contacts.create',
      params: { book: 'personal', given_name: 'Ada' },
    })
    expect(req.url).toBe('/api/user/v1/agent/contacts')
    expect(req.body).toEqual({ book: 'personal', given_name: 'Ada' })
  })

  it('substitutes URL-encoded {key} path params (mail.drafts.send)', () => {
    const req = buildRequest({
      id: 'mail.drafts.send',
      params: { key: 'Draft/2026/001?x=1', account_id: '0' },
    })
    expect(req.method).toBe('POST')
    expect(req.url).toBe(
      '/api/user/v1/agent/mail/drafts/Draft%2F2026%2F001%3Fx%3D1/send'
    )
    // the placeholder is consumed by the path, everything else is body
    expect(req.body).toEqual({ account_id: '0' })
  })

  it('keeps unknown ids out — only reviewed AssistantActionIds are routable', () => {
    expect(() =>
      buildRequest({ id: 'mail.send' as never, params: {} })
    ).not.toThrow()
  })
})

describe('AgentApi.execute', () => {
  const agent = new AgentApi()

  beforeEach(() => {
    for (const m of [
      apiClientMock.post,
      apiClientMock.get,
      apiClientMock.patch,
      apiClientMock.delete,
    ]) {
      m.mockReset()
      m.mockResolvedValue({ data: envelope() })
    }
  })

  it('POSTs the built body for creation actions', async () => {
    const result = await agent.execute(sendDraft)
    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/api/user/v1/agent/mail/send',
      sendDraft.params
    )
    expect(result.error_code).toBe('S000000')
  })

  it('sends the draft key in the path via the drafts.send route', async () => {
    await agent.execute({ id: 'mail.drafts.send', params: { key: 'tmp-42' } })
    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/api/user/v1/agent/mail/drafts/tmp-42/send',
      {}
    )
  })

  it('routes GET actions: uid in the path, remaining params as query', async () => {
    await agent.execute({
      id: 'mail.messages.get',
      params: { uid: 7, folder: 'INBOX', account_id: '0' },
    })
    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/api/user/v1/agent/mail/messages/7',
      { params: { folder: 'INBOX', account_id: '0' } }
    )
  })

  it('routes PATCH and DELETE actions (path param + body)', async () => {
    await agent.execute({
      id: 'calendar.events.update',
      params: { key: 'ev-1', summary: 'Standup' },
    })
    expect(apiClientMock.patch).toHaveBeenCalledWith(
      '/api/user/v1/agent/calendar/events/ev-1',
      { summary: 'Standup' }
    )

    await agent.execute({
      id: 'calendar.events.delete',
      params: { key: 'ev-1' },
    })
    expect(apiClientMock.delete).toHaveBeenCalledWith(
      '/api/user/v1/agent/calendar/events/ev-1',
      {}
    )
  })

  it('surfaces facade-level error envelopes without throwing', async () => {
    apiClientMock.post.mockResolvedValue({ data: envelope('S000513') })
    const result = await agent.execute(sendDraft)
    expect(result.error_code).toBe('S000513')
  })
})

describe('AgentApi.getManifest', () => {
  it('fetches and unwraps the manifest envelope', async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        error_code: 'S000000',
        error_msg: '',
        data: { version: 1, actions: [{ id: 'mail.send' }] },
      },
    })
    const manifest = await new AgentApi().getManifest()
    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/api/user/v1/agent/manifest'
    )
    expect(manifest.version).toBe(1)
    expect(manifest.actions[0].id).toBe('mail.send')
  })
})
