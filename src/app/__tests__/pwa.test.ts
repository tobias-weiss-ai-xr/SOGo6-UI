/**
 * Structural tests for PWA / Mobile Web (Tier 1 #17).
 * Verifies the web app manifest, service worker and offline page exist and
 * reference each other consistently.
 */

import * as fs from 'fs'
import * as path from 'path'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const APP_DIR = path.join(process.cwd(), 'src', 'app')
const FEATURES_DIR = path.join(process.cwd(), 'src', 'features')

describe('PWA manifest', () => {
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json')
  let manifest: any

  beforeAll(() => {
    // Support both manifest.json and manifest.webmanifest
    const possiblePaths = [
      path.join(PUBLIC_DIR, 'manifest.webmanifest'),
      path.join(PUBLIC_DIR, 'manifest.json'),
    ]
    const foundPath = possiblePaths.find((p) => fs.existsSync(p))
    expect(foundPath).toBeTruthy()
    manifest = JSON.parse(fs.readFileSync(foundPath!, 'utf-8'))
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
      const filePath = path.join(PUBLIC_DIR, icon.src.replace(/^\//, ''))
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('defines app shortcuts', () => {
    expect(Array.isArray(manifest.shortcuts)).toBe(true)
    expect(manifest.shortcuts.length).toBeGreaterThan(0)
  })
})

describe('Service worker with Serwist', () => {
  const swPath = path.join(APP_DIR, 'sw.ts')
  let sw: string

  beforeAll(() => {
    expect(fs.existsSync(swPath)).toBe(true)
    sw = fs.readFileSync(swPath, 'utf-8')
  })

  it('has Serwist integration', () => {
    expect(sw).toContain('Serwist')
    expect(sw).toContain('serwist.addEventListeners()')
  })

  it('configures precaching', () => {
    expect(sw).toContain('precacheEntries')
    expect(sw).toContain('filterPrecacheEntries')
  })

  it('configures runtime caching strategies', () => {
    expect(sw).toContain('runtimeCaching')
    expect(sw).toContain('CacheFirst')
    expect(sw).toContain('NetworkFirst')
    expect(sw).toContain('NetworkOnly')
  })

  it('has fallback entries for offline navigation', () => {
    expect(sw).toContain('fallbacks')
    expect(sw).toContain('~offline')
  })

  it('handles skip waiting messages', () => {
    expect(sw).toContain('SKIP_WAITING')
    expect(sw).toContain('skipWaiting')
  })
})

describe('Service worker runtime utilities', () => {
  const swRuntimePath = path.join(APP_DIR, 'sw-runtime.ts')

  it('exists with navigation helpers', () => {
    expect(fs.existsSync(swRuntimePath)).toBe(true)
    const content = fs.readFileSync(swRuntimePath, 'utf-8')
    expect(content).toContain('isNavigationRequest')
    expect(content).toContain('pathnameFromRequestUrl')
    expect(content).toContain('offlineFallbackPath')
  })
})

describe('Offline page', () => {
  const offlinePage = path.join(APP_DIR, '~offline', 'page.tsx')

  it('exists', () => {
    expect(fs.existsSync(offlinePage)).toBe(true)
  })

  it('renders an offline message', () => {
    const content = fs.readFileSync(offlinePage, 'utf-8')
    expect(content).toContain('offline')
  })
})

describe('Serwist registration route', () => {
  const serwistRoute = path.join(APP_DIR, 'serwist', 'route.ts')

  it('exists for service worker registration', () => {
    expect(fs.existsSync(serwistRoute)).toBe(true)
  })
})

describe('PWA configuration in root layout', () => {
  const layoutPath = path.join(APP_DIR, 'layout.tsx')
  const layout = fs.readFileSync(layoutPath, 'utf-8')

  it('references the manifest', () => {
    expect(layout).toContain("manifest: '/manifest.json'")
  })

  it('includes SerwistProviderGate for PWA support', () => {
    expect(layout).toContain('SerwistProviderGate')
  })

  it('sets apple-web-app metadata for iOS', () => {
    expect(layout).toContain('appleWebApp')
  })

  it('sets viewport metadata', () => {
    expect(layout).toContain('viewport:')
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

describe('PWA environment configuration', () => {
  const envExamplePath = path.join(process.cwd(), '.env.example')
  const envExample = fs.readFileSync(envExamplePath, 'utf-8')

  it('documents PWA feature flags', () => {
    expect(envExample).toContain('NEXT_PUBLIC_PWA_ENABLED')
    expect(envExample).toContain('PWA')
  })
})
