import { readFileSync } from 'fs'
import * as path from 'path'

/**
 * Regression tests for i18n keys that existed ONLY in the checked-in
 * compiled-messages artifacts (hand-edited build output) but never in the
 * source messages under src/messages/. The build regenerates compiled
 * messages from source, wiping those keys — the UI then renders raw keys:
 *
 *  - CALENDARS.forms.copyEvent (commit 27c4692 "copy event with attendees")
 *  - PWA.* / Login.offlineNotice (offline banner, PWA install prompt)
 *  - ADDRESS_BOOKS_SIDEBAR.options.{sharing,import,export,ios_download} (de
 *    was missing them; en already had them in source)
 *
 * Every locale must define these in SOURCE, not in compiled artifacts.
 */
const LOCALES = [
  'ar',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sv',
  'th',
  'tr',
  'vi',
  'zh',
] as const

function readMessages(locale: string, file: string) {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), 'src/messages', locale, file), 'utf8')
  )
}

describe('CALENDARS.forms.copyEvent.string exists in every locale', () => {
  it.each(LOCALES)(
    '%s calendars.json defines forms.copyEvent.string',
    (locale) => {
      const messages = readMessages(locale, 'calendars.json')
      const value = messages.CALENDARS?.forms?.copyEvent?.string
      expect(typeof value).toBe('string')
      expect(value!.length).toBeGreaterThan(0)
    }
  )

  it('en and de carry real translations (not the raw key)', () => {
    expect(
      readMessages('en', 'calendars.json').CALENDARS.forms.copyEvent.string
    ).toBe('Copy event')
    expect(
      readMessages('de', 'calendars.json').CALENDARS.forms.copyEvent.string
    ).toBe('Ereignis kopieren')
  })

  it('de create-event strings are translated (user-reported)', () => {
    const de = readMessages('de', 'calendars.json').CALENDARS
    expect(de.events.create.string).toBe('Ereignis erstellen')
    expect(de.eventForm.create.string).toBe('Ereignis erstellen')
    expect(de.toolbar.createEvent.string).toBe('Ereignis erstellen')
  })

  it('de calendars.json has no untranslated English prose left (ratchet)', () => {
    const en = readMessages('en', 'calendars.json').CALENDARS
    const de = readMessages('de', 'calendars.json').CALENDARS
    const collect = (node: unknown, path: string[] = []): string[][] => {
      if (typeof node === 'string') return [[path, node]]
      if (node && typeof node === 'object') {
        return Object.entries(node as Record<string, unknown>).flatMap(
          ([k, v]) => collect(v, [...path, k])
        )
      }
      return []
    }
    const enFlat = Object.fromEntries(
      collect(en).map(([p, v]) => [p.join('/'), v])
    )
    const leftovers = collect(de).filter(
      ([p, v]) =>
        !p.join('/').endsWith('/context') && // translator notes stay English
        enFlat[p.join('/')] === v &&
        v.length > 12 &&
        v.includes(' ') &&
        v !== 'Name (optional)'
    )
    expect(leftovers).toEqual([])
  })
})

describe('PWA + Login offline keys exist in every locale (source, not compiled)', () => {
  it.each(LOCALES)('%s offline.json defines Login + PWA keys', (locale) => {
    const messages = readMessages(locale, 'offline.json')
    expect(typeof messages.Login.offlineNotice).toBe('string')
    expect(typeof messages.PWA.installPrompt.title).toBe('string')
    expect(typeof messages.PWA.installPrompt.description).toBe('string')
    expect(typeof messages.PWA.installPrompt.install).toBe('string')
    expect(typeof messages.PWA.installPrompt.dismiss).toBe('string')
    expect(typeof messages.PWA.offlineBanner.label).toBe('string')
    expect(messages.PWA.featureUnavailable).toContain('{feature}')
  })

  it('en and de carry the expected offline strings', () => {
    expect(readMessages('en', 'offline.json').Login.offlineNotice).toBe(
      'You are currently offline. Some features may be limited.'
    )
    expect(readMessages('de', 'offline.json').PWA.installPrompt.title).toBe(
      'SOGo installieren'
    )
  })
})

describe('ADDRESS_BOOKS_SIDEBAR options actions exist in every locale', () => {
  it.each(LOCALES)(
    '%s sidebar.json defines options.{sharing,import,export,ios_download}',
    (locale) => {
      const messages = readMessages(locale, 'address-books/sidebar.json')
      const options = messages.ADDRESS_BOOKS_SIDEBAR.options
      for (const key of ['sharing', 'import', 'export', 'ios_download']) {
        expect(typeof options[key]?.string).toBe('string')
      }
    }
  )
})

describe('mail view toggle keys exist in every locale (root namespace)', () => {
  // mail-view-toggle.tsx calls root useTranslations() with t('viewFlat') /
  // t('viewConversation') — the strings live at the ROOT of mails/list.json.
  it.each(LOCALES)(
    '%s mails/list.json defines viewConversation + viewFlat',
    (locale) => {
      const messages = readMessages(locale, 'mails/list.json')
      expect(typeof messages.viewConversation).toBe('string')
      expect(typeof messages.viewFlat).toBe('string')
    }
  )
})
