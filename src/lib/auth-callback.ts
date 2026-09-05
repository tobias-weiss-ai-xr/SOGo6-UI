/**
 * Extract the JWT voucher from the SSO redirect URL hash: /auth/callback#token=<jwt>
 *
 * Extracted into its own module so tests can mock it (jsdom's window.location
 * is read-only and cannot be redefined).
 */
export const getTokenFromHash = (): string | null => {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.substring(1)
  return new URLSearchParams(hash).get('token')
}

export default getTokenFromHash
