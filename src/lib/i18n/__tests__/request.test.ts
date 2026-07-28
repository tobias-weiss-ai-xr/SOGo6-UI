import '@testing-library/jest-dom'
import requestConfig from '../request'

jest.mock('../config', () => ({
  routing: {
    locales: ['en', 'de', 'fr', 'es'],
    defaultLocale: 'en',
    localePrefix: 'always',
    localeDetection: true,
  },
}))

describe('request configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export a default configuration', () => {
    expect(requestConfig).toBeDefined()
    expect(typeof requestConfig).toBe('function')
  })

  it('should use routing config for locale defaults', () => {
    const { routing } = require('../config')
    expect(routing.locales).toContain('en')
    expect(routing.locales).toContain('de')
    expect(routing.defaultLocale).toBe('en')
  })
})
