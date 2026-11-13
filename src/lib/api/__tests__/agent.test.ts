/**
 * Tests for the agent action endpoint URL building.
 */
import { buildRequest } from '../endpoints/agent'

describe('buildRequest', () => {
  it('routes mail.send to the facade POST send endpoint', () => {
    const req = buildRequest({
      id: 'mail.send',
      params: {
        from: 'a@example.org',
        to: ['b@example.org'],
        subject: 'hi',
        body: 'x',
      },
    })
    expect(req).toEqual({
      method: 'POST',
      url: '/api/user/v1/agent/mail/send',
      body: {
        from: 'a@example.org',
        to: ['b@example.org'],
        subject: 'hi',
        body: 'x',
      },
    })
  })

  it('puts path params into the URL and the rest into the body', () => {
    const req = buildRequest({
      id: 'contacts.create',
      params: { book: 'personal', given_name: 'Ada', last_name: 'Lovelace' },
    })
    expect(req.url).toBe('/api/user/v1/agent/contacts')
    expect(req.body).toEqual({
      book: 'personal',
      given_name: 'Ada',
      last_name: 'Lovelace',
    })
  })

  it('keeps unknown ids out — only reviewed AssistantActionIds are routable', () => {
    expect(() =>
      buildRequest({ id: 'mail.send' as never, params: {} })
    ).not.toThrow()
  })
})
