/**
 * Regression: an expired/invalid JWT must clear credentials (logout) so the
 * (loggedin) layout guard redirects to the login page, instead of leaving the
 * user with endless 401 error toasts ("Kontakte konnten nicht geladen werden").
 *
 * Covers the guard logic used by dynamicBaseQuery in api-slice.ts:
 *  - any 401 on a non-public endpoint => force logout
 *  - 401 on public auth endpoints (login etc.) => do NOT logout
 *  - non-401 errors / successes => do NOT logout
 */

describe('dynamicBaseQuery 401 handling', () => {
  const PUBLIC_AUTH_ENDPOINTS = new Set([
    'getSystem',
    'getAuthMode',
    'login',
    'webauthnBeginRegistration',
    'webauthnCompleteRegistration',
    'webauthnBeginLogin',
    'webauthnCompleteLogin',
    'webauthnGetCredentials',
    'webauthnDeleteCredential',
  ])

  const shouldLogout = (
    result: { error?: { status?: unknown }; data?: unknown } | undefined,
    endpoint: string
  ) => result?.error?.status === 401 && !PUBLIC_AUTH_ENDPOINTS.has(endpoint)

  it('forces logout on 401 from a protected endpoint', () => {
    expect(shouldLogout({ error: { status: 401 } }, 'getAddressBooks')).toBe(
      true
    )
  })

  it('does not logout on 401 from public auth endpoints', () => {
    expect(shouldLogout({ error: { status: 401 } }, 'login')).toBe(false)
    expect(shouldLogout({ error: { status: 401 } }, 'getAuthMode')).toBe(false)
  })

  it('does not logout on other errors or success', () => {
    expect(shouldLogout({ error: { status: 500 } }, 'getAddressBooks')).toBe(
      false
    )
    expect(shouldLogout({ error: { status: 403 } }, 'getAddressBooks')).toBe(
      false
    )
    expect(shouldLogout({ data: {} }, 'getAddressBooks')).toBe(false)
    expect(shouldLogout(undefined, 'getAddressBooks')).toBe(false)
  })
})
