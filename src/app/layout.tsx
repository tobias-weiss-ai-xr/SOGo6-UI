import { ThemeProvider } from '@/components/theme-provider'
import { SerwistProviderGate } from '@/features/offline/components/serwist-provider-gate'
import { firaSans, geistMono, geistSans, openDyslexic } from '@/lib/fonts'
import { getDefaultLocale } from '@/lib/i18n/config'
import StoreProvider from '@/lib/redux/store-provider'
import type { Metadata, Viewport } from 'next'
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
  applicationName: 'SOGo',
  title: {
    default: 'SOGo',
    template: '%s · SOGo',
  },
  description: 'Next-generation groupware — mail, calendar, contacts',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/sogo-compact.svg' },
    ],
    shortcut: '/icons/icon-192.png',
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b6868' },
    { media: '(prefers-color-scheme: dark)', color: '#257f7f' },
  ],
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
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable} ${firaSans.variable}`}
    >
      <body className="overflow-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          themes={[
            'light',
            'dark',
            'sogo5-classic',
            'dyslexia',
            'tritanopia',
            'deuteranopia',
            'protanopia',
            'system',
          ]}
          enableSystem
        >
          <StoreProvider>
            <SerwistProviderGate>{children}</SerwistProviderGate>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
