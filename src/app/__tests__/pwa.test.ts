/**
 * Structural tests for PWA / Mobile Web (Tier 1 #17).
 * Verifies the web app manifest, service worker and offline page exist and
 * reference each other consistently.
 */

import * as fs from 'fs'
import * as path from 'path'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const APP_DIR = path.join(process.cwd(), 'src', 'app')

describe('PWA manifest', () => {
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json')
  let manifest: any

  beforeAll(() => {
    expect(fs.existsSync(manifestPath)).toBe(true)
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  })

  it('has a name and short_name', () => {
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
  })

  it('uses standalone display and a start_url', () => {
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBeTruthy()
  })

  it('has theme and background colors', () => {
    expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('references 192 and 512 icons that exist on disk', () => {
    const sizes = manifest.icons.map((i: any) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    for (const icon of manifest.icons) {
      const filePath = path.join(
        PUBLIC_DIR,
        icon.src.replace(/^\//, '')
      )
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('defines app shortcuts', () => {
    expect(Array.isArray(manifest.shortcuts)).toBe(true)
    expect(manifest.shortcuts.length).toBeGreaterThan(0)
  })
})

describe('Service worker (sw.js)', () => {
  const swPath = path.join(PUBLIC_DIR, 'sw.js')
  let sw: string

  beforeAll(() => {
    expect(fs.existsSync(swPath)).toBe(true)
    sw = fs.readFileSync(swPath, 'utf-8')
  })

  it('registers install/activate/fetch/push handlers', () => {
    expect(sw).toContain("self.addEventListener('install'")
    expect(sw).toContain("self.addEventListener('activate'")
    expect(sw).toContain("self.addEventListener('fetch'")
    expect(sw).toContain("self.addEventListener('push'")
  })

  it('precaches the app shell including the offline page', () => {
    expect(sw).toContain("'/offline'")
    expect(sw).toContain('caches.open')
  })

  it('never caches API or fakeApi endpoints', () => {
    expect(sw).toContain("'/api/'")
    expect(sw).toContain("'/fakeApi/'")
  })

  it('uses icon paths that exist on disk', () => {
    const iconMatches = sw.match(/\/icons\/[a-z0-9-]+\.png/g) || []
    expect(iconMatches.length).toBeGreaterThan(0)
    for (const icon of iconMatches) {
      const filePath = path.join(PUBLIC_DIR, icon.replace(/^\//, ''))
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('provides an offline fallback for failed navigations', () => {
    expect(sw).toContain("event.request.mode === 'navigate'")
    expect(sw).toContain('OFFLINE_URL')
  })
})

describe('Offline page', () => {
  const offlinePage = path.join(APP_DIR, 'offline', 'page.tsx')

  it('exists', () => {
    expect(fs.existsSync(offlinePage)).toBe(true)
  })

  it('renders an offline message', () => {
    const content = fs.readFileSync(offlinePage, 'utf-8')
    expect(content).toContain('offline')
  })
})

describe('PWA registration in root layout', () => {
  const layoutPath = path.join(APP_DIR, 'layout.tsx')
  const layout = fs.readFileSync(layoutPath, 'utf-8')

  it('references the manifest', () => {
    expect(layout).toContain("manifest: '/manifest.json'")
  })

  it('registers the service worker', () => {
    expect(layout).toContain("navigator.serviceWorker.register('/sw.js')")
  })

  it('sets apple-web-app metadata for iOS', () => {
    expect(layout).toContain('appleWebApp')
    expect(layout).toContain('apple:')
  })
})

describe('PWA icons', () => {
  it('generates 192, 512 and badge icons', () => {
    for (const name of ['icon-192.png', 'icon-512.png', 'badge-72x72.png']) {
      const p = path.join(PUBLIC_DIR, 'icons', name)
      expect(fs.existsSync(p)).toBe(true)
    }
  })
})
