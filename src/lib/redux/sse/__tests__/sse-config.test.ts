jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: jest.fn(),
  getCachedEnvVars: jest.fn(),
}))

describe('waitForSSEToken', () => {
  afterEach(() => {
    localStorage.removeItem('sogo_auth')
    sessionStorage.removeItem('sogo_auth')
  })

  it('resolves true immediately when a token is in localStorage', async () => {
    localStorage.setItem('sogo_auth', JSON.stringify({ token: 'jwt-1' }))
    await expect(waitForSSEToken(2, 1)).resolves.toBe(true)
  })

  it('resolves true from sessionStorage fallback', async () => {
    sessionStorage.setItem('sogo_auth', JSON.stringify({ token: 'jwt-2' }))
    await expect(waitForSSEToken(2, 1)).resolves.toBe(true)
  })

  it('resolves true once a late token lands', async () => {
    const pending = waitForSSEToken(20, 5)
    setTimeout(() => {
      localStorage.setItem('sogo_auth', JSON.stringify({ token: 'late' }))
    }, 10)
    await expect(pending).resolves.toBe(true)
  })

  it('gives up (false) when no token appears', async () => {
    await expect(waitForSSEToken(2, 1)).resolves.toBe(false)
  })

  it('treats malformed stored auth as absent', async () => {
    localStorage.setItem('sogo_auth', 'not-json{{{')
    await expect(waitForSSEToken(2, 1)).resolves.toBe(false)
  })
})

const { fetchEnvVars, getCachedEnvVars } = jest.requireMock(
  '@/lib/env-service'
) as {
  fetchEnvVars: jest.Mock
  getCachedEnvVars: jest.Mock
}

import {
  buildSSEConfig,
  getDefaultSSEConfig,
  getDefaultSSEConfigSync,
  getProductionSSEConfig,
  getSSEConfigForEnvironment,
  getTestSSEConfig,
  waitForSSEToken,
} from '../sse-config'

describe('sse-config', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getCachedEnvVars.mockReturnValue(undefined)
  })

  describe('buildSSEConfig', () => {
    it('builds SSE URL from API base with trailing slash stripped', () => {
      const config = buildSSEConfig('/fakeApi/')

      expect(config.url).toBe('/fakeApi/sse')
      expect(config.reconnectInterval).toBe(3000)
      expect(config.maxReconnectAttempts).toBe(5)
      expect(config.withCredentials).toBe(false)
    })

    it('enables credentials for absolute API base URLs', () => {
      const config = buildSSEConfig('https://api.example.com')

      expect(config.url).toBe('https://api.example.com/sse')
      expect(config.withCredentials).toBe(true)
    })
  })

  describe('getDefaultSSEConfigSync', () => {
    it('uses cached env base URL when available', () => {
      getCachedEnvVars.mockReturnValue({
        REACT_APP_API_BASE_URL: '/customApi',
      })

      const config = getDefaultSSEConfigSync()

      expect(config.url).toBe('/customApi/sse')
    })

    it('falls back to /fakeApi when cache is empty', () => {
      const config = getDefaultSSEConfigSync()

      expect(config.url).toBe('/fakeApi/sse')
    })
  })

  describe('getDefaultSSEConfig', () => {
    it('resolves config from fetched env vars', async () => {
      fetchEnvVars.mockResolvedValue({
        REACT_APP_API_BASE_URL: '/backend',
      })

      const config = await getDefaultSSEConfig()

      expect(config.url).toBe('/backend/sse')
    })

    it('falls back to sync config when env fetch fails', async () => {
      fetchEnvVars.mockRejectedValue(new Error('env unavailable'))

      const config = await getDefaultSSEConfig()

      expect(config.url).toBe('/fakeApi/sse')
    })
  })

  describe('getProductionSSEConfig', () => {
    // Helper: create a valid JWT that expires in 1 hour
    function makeTestJwt(expOffsetSeconds = 3600): string {
      const payload = { uid: 'testuser', exp: Math.floor(Date.now() / 1000) + expOffsetSeconds }
      const encodedPayload = btoa(JSON.stringify(payload))
      return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`
    }

    it('uses same-origin API SSE endpoint with token as query param', () => {
      const jwt = makeTestJwt()
      const authData = JSON.stringify({ token: jwt, user: 'testuser' })

      localStorage.setItem('sogo_auth', authData)

      const config = getProductionSSEConfig()

      expect(config).not.toBeNull()
      expect(config!.url).toContain(`${window.location.origin}/api/sse`)
      expect(config!.url).toContain(`token=${encodeURIComponent(jwt)}`)
      expect(config!.headers?.Authorization).toBe(`Bearer ${jwt}`)
      expect(config!.reconnectInterval).toBe(5000)

    })

    it('falls back to sessionStorage when localStorage is empty', () => {
      localStorage.removeItem('sogo_auth')
      const jwt = makeTestJwt()
      const authData = JSON.stringify({ token: jwt })
      sessionStorage.setItem('sogo_auth', authData)

      const config = getProductionSSEConfig()

      expect(config).not.toBeNull()
      expect(config!.headers?.Authorization).toBe(`Bearer ${jwt}`)


      sessionStorage.removeItem('sogo_auth')
    })

    it('returns null when no token is stored (expired/missing)', () => {

      localStorage.removeItem('sogo_auth')
      sessionStorage.removeItem('sogo_auth')

      const config = getProductionSSEConfig()

      expect(config).toBeNull()
    })

    it('returns null when token is expired', () => {
      const expiredJwt = makeTestJwt(-3600) // expired 1 hour ago
      const authData = JSON.stringify({ token: expiredJwt })
      localStorage.setItem('sogo_auth', authData)

      const config = getProductionSSEConfig()

      expect(config).toBeNull()

    })

    it('handles malformed stored auth gracefully', () => {
      localStorage.setItem('sogo_auth', 'not-json')

      const config = getProductionSSEConfig()

      expect(config).toBeNull()

    })
  })

  describe('getTestSSEConfig', () => {
    it('returns minimal reconnect settings for fakeApi', () => {
      const config = getTestSSEConfig()

      expect(config.url).toBe('/fakeApi/sse')
      expect(config.maxReconnectAttempts).toBe(1)
      expect(config.withCredentials).toBe(false)
    })
  })

  describe('getSSEConfigForEnvironment', () => {
    it('returns a config with SSE endpoint URL', async () => {
      const config = await getSSEConfigForEnvironment()

      // In test env, getTestSSEConfig() is used
      expect(config).not.toBeNull()
      expect(config!.url).toMatch(/\/sse$/)
      expect(config!.reconnectInterval).toBeGreaterThan(0)
    })
  })
})
