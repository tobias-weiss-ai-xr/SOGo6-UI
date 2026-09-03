'use client'

import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Extract JWT token from URL hash: #token=<jwt>
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('token')

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
    const authState = {
      token,
      user: {
        uid: payload.uid || payload.email || '',
        cn: payload.cn || payload.uid || '',
        email: payload.email || payload.uid || '',
      },
      rememberMe: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
    sessionStorage.removeItem(STORAGE_KEY)

    // redirect to the user's mailbox (inbox) - default to account 0
    // The u/0/INBOX route is the standard mailbox view
    const mailboxUrl = '/u/0/INBOX'
    
    // Clean the hash from URL
    window.history.replaceState({}, document.title, window.location.pathname)
    
    router.push(mailboxUrl)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="ml-3">Redirecting...</p>
    </div>
  )
}
