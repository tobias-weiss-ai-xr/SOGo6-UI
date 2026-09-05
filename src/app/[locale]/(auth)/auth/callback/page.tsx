'use client'

import { setCredentials } from '@/features/auth/components/store/auth.slice'
import { getTokenFromHash } from '@/lib/auth-callback'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Extract JWT token from URL hash: #token=<jwt>
    const token = getTokenFromHash()

    if (!token) {
      // No token in hash — redirect to login
      router.push('/auth/login')
      return
    }

    // Decode JWT payload to extract user info
    const decodeJwt = (jwt: string): any => {
      try {
        const payload = jwt.split('.')[1]
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decoded)
      } catch {
        return null
      }
    }

    const payload = decodeJwt(token)
    if (!payload) {
      router.push('/auth/login')
      return
    }

    // Store token and user info in localStorage (same keys as password login)
    const JWT_TOKEN_KEY = 'NEXT_PUBLIC_JWT_STORAGE_KEY'
    const STORAGE_KEY = 'sogo_auth'

    // Store JWT token (this is what the api client reads)
    localStorage.setItem(JWT_TOKEN_KEY, token)

    // Store auth state for redux sync
    const user = {
      uid: payload.uid || payload.email || '',
      cn: payload.cn || payload.uid || '',
      email: payload.email || payload.uid || '',
    }
    const rememberMe = true

    // Persist to localStorage so a full-page reload keeps the session
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user, rememberMe })
    )
    sessionStorage.removeItem(STORAGE_KEY)

    // CRITICAL: populate the Redux store BEFORE navigating to the mailbox.
    // The (loggedin) layout guard checks state.auth.token — if it's empty it
    // redirects back to /auth/login. With auto-SSO enabled that bounces back
    // to the IdP (existing SSO session → instant callback → INBOX → login …)
    // creating an infinite relog loop. The store is created once at page load
    // and preloads from storage at boot only, so only dispatching
    // setCredentials here (exactly like the password login path) updates it.
    dispatch(
      setCredentials({
        token,
        user,
        rememberMe,
      })
    )

    // redirect to the user's mailbox (inbox) - default to account 0
    // The u/0/INBOX route is the standard mailbox view
    const mailboxUrl = '/u/0/INBOX'

    // Clean the hash from URL
    window.history.replaceState({}, document.title, window.location.pathname)

    router.push(mailboxUrl)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      <p className="ml-3">Redirecting...</p>
    </div>
  )
}
