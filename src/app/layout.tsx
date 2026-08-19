import { ThemeProvider } from '@/components/theme-provider'
import { geistMono, geistSans, openDyslexic } from '@/lib/fonts'
import { getDefaultLocale } from '@/lib/i18n/config'
import StoreProvider from '@/lib/redux/store-provider'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import React from 'react'
import './globals.css'

// import { ModeToggle } from "@/components/theme-switcher";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: 'SOGo',
  description: 'SOGo Webmail',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/sogo-compact.svg',
    shortcut: '/images/sogo-compact.svg',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SOGo',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
}

// Locales that render right-to-left. Keep in sync with next-intl locale config.
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

function getDirection(locale: string): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let locale = getDefaultLocale()
  try {
    locale = await getLocale()
  } catch {
    // Root layout may render before locale is resolved (e.g. in tests)
  }

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={getDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable}`}
    >
      <body className="overflow-hidden antialiased">
        {/* Service Worker registration for PWA support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          themes={[
            'light',
            'dark',
            'dyslexia',
            'tritanopia',
            'deuteranopia',
            'protanopia',
            'system',
          ]}
          enableSystem
        >
          <StoreProvider>{children}</StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
