/**
 * SSE Connection Configuration
 *
 * Default configuration for SSE connections used by useConnectSSEMutation.
 * Endpoints follow REACT_APP_API_BASE_URL (e.g. /fakeApi/sse or backend /sse).
 */

import { fetchEnvVars, getCachedEnvVars } from '@/lib/env-service'
import type { SSEConfig } from './types'

const DEFAULT_SSE_OPTIONS = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatTimeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'text/event-stream',
    Accept: 'text/event-stream',
  },
} as const satisfies Partial<SSEConfig>

/** Build SSE URL from the same base URL as RTK Query API calls. */
export function buildSSEConfig(apiBaseUrl: string): SSEConfig {
  const normalized = apiBaseUrl.replace(/\/$/, '')
  const withCredentials = !apiBaseUrl.startsWith('/')

  return {
    ...DEFAULT_SSE_OPTIONS,
    url: `${normalized}/sse`,
    withCredentials,
    headers: { ...DEFAULT_SSE_OPTIONS.headers },
  }
}

/**
 * Get default SSE configuration
 *
 * Dynamically resolves the SSE endpoint based on environment variables.
 */
export async function getDefaultSSEConfig(): Promise<SSEConfig> {
  try {
    const envVars = await fetchEnvVars()
    const baseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'
    return buildSSEConfig(baseUrl)
  } catch (error) {
    console.warn(
      'Failed to load environment variables for SSE config, using defaults',
      error
    )
    return getDefaultSSEConfigSync()
  }
}

/**
 * Synchronous fallback when env is already loaded or on the server.
 */
export function getDefaultSSEConfigSync(): SSEConfig {
  const cached = getCachedEnvVars()?.REACT_APP_API_BASE_URL
  return buildSSEConfig(cached || '/fakeApi')
}

/**
 * Decode a JWT token payload (without verifying signature).
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Check if a JWT token is expired (with a 30s buffer).
 * Returns true if the token is expired or cannot be decoded.
 */
function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  const expiresAt = payload.exp * 1000
  const now = Date.now()
  const buffer = bufferSeconds * 1000
  return expiresAt - buffer < now
}

/**
 * Production SSE configuration (reverse-proxy same-origin).
 *
 * EventSource cannot set custom HTTP headers, so the auth token must be
 * passed as a query parameter (?token=<jwt>). The backend SSEView reads
 * it from request.args.get('token').
 *
 * Returns null if the token is expired or missing — the caller should
 * skip connecting and trigger a logout/redirect to /auth/login.
 */
export function getProductionSSEConfig(): SSEConfig | null {
  // Get auth token from storage - check localStorage first (rememberMe), then sessionStorage
  const STORAGE_KEY = 'sogo_auth'
  let token = ''
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const auth = JSON.parse(stored)
      token = auth.token || ''
    }
  } catch {
    // If parsing fails, fall back to empty token
    token = ''
  }

  // Don't connect SSE if the token is expired or missing — the backend
  // would return 401 and EventSource would loop reconnection attempts.
  if (!token || isTokenExpired(token)) {
    return null
  }

  // EventSource cannot send Authorization headers — pass token as query param
  const sseUrl = new URL(`${window.location.origin}/api/sse`)
  sseUrl.searchParams.set('token', token)

  return {
    url: sseUrl.toString(),
    reconnectInterval: 5000,
    maxReconnectAttempts: 3,
    heartbeatTimeout: 60000,
    withCredentials: true,
    headers: {
      'Content-Type': 'text/event-stream',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
  }
}

/**
 * @deprecated Use getDefaultSSEConfig() — resolves from REACT_APP_API_BASE_URL.
 */
export function getDevelopmentSSEConfig(): SSEConfig {
  return getDefaultSSEConfigSync()
}

/**
 * Test SSE configuration (fakeApi, minimal reconnect).
 */
export function getTestSSEConfig(): SSEConfig {
  return {
    url: '/fakeApi/sse',
    reconnectInterval: 1000,
    maxReconnectAttempts: 1,
    heartbeatTimeout: 5000,
    withCredentials: false,
    headers: {
      'Content-Type': 'text/event-stream',
    },
  }
}

/**
 * Resolve SSE configuration for the current runtime environment.
 *
 * Returns null in production when the auth token is expired or missing,
 * signalling the caller to skip SSE connection and trigger logout.
 */
export async function getSSEConfigForEnvironment(): Promise<SSEConfig | null> {
  if (typeof window === 'undefined') {
    return getDefaultSSEConfigSync()
  }

  if (process.env.NODE_ENV === 'test') {
    return getTestSSEConfig()
  }

  if (process.env.NODE_ENV === 'production') {
    return getProductionSSEConfig()
  }

  return getDefaultSSEConfig()
}
