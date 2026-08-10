import { defineRouting } from 'next-intl/routing'

export function getLocales() {
  return [
    // Existing locales
    'en', 'de', 'fr', 'es', 'zh',
    // European locales
    'it', 'pt', 'nl', 'pl', 'ru', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'tr', 'hu', 'ro',
    // Global locales
    'ja', 'hi', 'ar', 'ko', 'th', 'vi', 'id',
  ]
}

export function getDefaultLocale() {
  return 'en'
}

export const routing = defineRouting({
  locales: getLocales(),
  defaultLocale: getDefaultLocale(),
  localePrefix: 'always',
  localeDetection: true,
})
