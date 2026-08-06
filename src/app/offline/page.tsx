import '@/app/globals.css'
import { geistMono, geistSans, openDyslexic } from '@/lib/fonts'
import { WifiOff } from 'lucide-react'

/**
 * Offline fallback page — served by the service worker when a navigation
 * request fails while the app is offline (see `public/sw.js`).
 */
export default function OfflinePage() {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable}`}
    >
      <body className="flex min-h-screen items-center justify-center bg-background antialiased">
        <main className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <WifiOff className="h-16 w-16 text-muted-foreground" />
          <p className="text-2xl font-semibold tracking-tight">
            You are offline
          </p>
          <p className="text-muted-foreground">
            Check your connection and try again. Your cached data is still
            available.
          </p>
          <a
            href="/"
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retry
          </a>
        </main>
      </body>
    </html>
  )
}
