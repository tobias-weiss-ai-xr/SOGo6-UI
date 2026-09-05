export interface EnvRoutePayload {
  REACT_APP_API_BASE_URL?: string
  REACT_APP_API_URL?: string
  NEXT_PUBLIC_ADMIN_DOMAINS: string
  SSE_ENABLED: boolean
  LOGIN_PREFILL_EMAIL: string
  LOGIN_PREFILL_PASSWORD: string
  /** When "true", the login page auto-redirects to the configured SSO provider (skips the email form). */
  SSO_AUTO_REDIRECT: boolean
  /** Synthetic username (`sso@<domain>`) passed to GET /api/user/v1/auth/mode to obtain the SSO authorization URL. */
  SSO_AUTO_REDIRECT_USERNAME: string
}

const defaultDevApiBaseUrl = 'http://127.0.0.1:5000/api/user/v1'

type EnvSource = Record<string, string | undefined>

/** Build the public JSON payload served by GET /env. */
export function buildEnvRoutePayload(
  env: EnvSource = process.env
): EnvRoutePayload {
  const isProduction = env.NODE_ENV === 'production'

  const loginPrefillEmail =
    env.LOGIN_PREFILL_EMAIL?.trim() ||
    env.NEXT_PUBLIC_LOGIN_PREFILL_EMAIL?.trim() ||
    ''

  const loginPrefillPassword =
    env.LOGIN_PREFILL_PASSWORD ?? env.NEXT_PUBLIC_LOGIN_PREFILL_PASSWORD ?? ''

  // When NEXT_PUBLIC_API_BASE_URL is set (reverse-proxy deployments),
  // build a public URL so the browser can reach the API.
  // Otherwise fall back to REACT_APP_API_BASE_URL (internal Docker URL)
  // or the local dev default.
  const reactAppApiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL?.trim()
    ? env.NEXT_PUBLIC_API_BASE_URL.trim() + '/api/user/v1'
    : env.REACT_APP_API_BASE_URL?.trim() ||
      (env.NODE_ENV === 'development' ? defaultDevApiBaseUrl : undefined)

  const sseEnabled =
    env.NODE_ENV === 'development'
      ? env.SSE_ENABLED === 'true'
      : env.SSE_ENABLED !== 'false'

  const ssoAutoRedirect = env.SSO_AUTO_REDIRECT?.trim().toLowerCase() === 'true'

  const ssoAutoRedirectUsername = (() => {
    const explicit = env.SSO_AUTO_REDIRECT_USERNAME?.trim()
    if (explicit) return explicit
    const domain = env.SOGO_DOMAIN?.trim()
    if (domain && !domain.includes('@')) return `sso@${domain}`
    return domain || ''
  })()

  return {
    REACT_APP_API_BASE_URL: reactAppApiBaseUrl,
    REACT_APP_API_URL: env.REACT_APP_API_URL,
    NEXT_PUBLIC_ADMIN_DOMAINS:
      env.NEXT_PUBLIC_ADMIN_DOMAINS || 'admin.localhost',
    SSE_ENABLED: sseEnabled,
    LOGIN_PREFILL_EMAIL: isProduction ? '' : loginPrefillEmail,
    LOGIN_PREFILL_PASSWORD: isProduction ? '' : loginPrefillPassword,
    SSO_AUTO_REDIRECT: ssoAutoRedirect,
    SSO_AUTO_REDIRECT_USERNAME: ssoAutoRedirectUsername,
  }
}
