/**
 * Full-page navigation helper (used for hard redirects such as bouncing to an
 * external SSO provider). Centralized so that tests can mock it without
 * needing to redefine the read-only jsdom `window.location`.
 */
export const redirectTo = (url: string): void => {
  if (typeof window === 'undefined') return
  window.location.assign(url)
}

export default redirectTo
