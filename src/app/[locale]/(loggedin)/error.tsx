'use client'

/**
 * Route-level Error Boundary for the logged-in area.
 *
 * Catches rendering errors in the (loggedin) route group and displays
 * a user-friendly error page with a reload button. This prevents
 * unhandled errors from reaching the global error boundary and showing
 * the generic "This page couldn't load" message.
 */

import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'
import { useEffect } from 'react'

export default function LoggedInError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('LoggedIn error boundary caught error', {
      error: String(error),
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: '#6b7280',
            marginBottom: '1.5rem',
          }}
        >
          An error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#9ca3af',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
            }}
          >
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
