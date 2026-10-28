'use client'

/**
 * Global Error Boundary
 *
 * This is Next.js's top-level error boundary. It replaces the built-in
 * "This page couldn't load" screen with a user-friendly error page that
 * provides a reload button and optionally an error digest.
 *
 * Must be a client component. Must render <html> and <body>.
 */

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error boundary caught error', {
      error: String(error),
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <html>
      <body>
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
          <div
            style={{
              maxWidth: '480px',
              textAlign: 'center',
            }}
          >
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
              An unexpected error occurred. Please try reloading the page.
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
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
