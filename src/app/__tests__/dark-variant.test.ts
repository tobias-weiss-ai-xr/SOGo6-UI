import { readFileSync } from 'fs'
import * as path from 'path'

/**
 * Regression test: the app toggles dark mode via next-themes with
 * attribute="class" (a .dark class on <html>), but Tailwind CSS v4
 * defaults the `dark:` variant to @media (prefers-color-scheme: dark).
 * Without an explicit class-based mapping, every `dark:` utility in the
 * codebase followed the OS setting while the .dark token overrides in
 * globals.css followed the in-app toggle — producing a broken half-dark
 * UI whenever OS and app setting disagreed.
 *
 * globals.css must map the dark variant to the .dark class.
 */
describe('dark variant is class-based (next-themes .dark class)', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf8'
  )

  it('defines @custom-variant dark targeting the .dark class', () => {
    const variant = css.match(/@custom-variant dark\s*\(([^)]*)\)/)
    expect(variant).toBeTruthy()
    expect(variant![1]).toMatch(/\.dark/)
    // must NOT rely on the prefers-color-scheme media query
    expect(variant![1]).not.toMatch(/prefers-color-scheme/)
  })

  it('the .dark class token overrides exist', () => {
    expect(css).toMatch(/\.dark\s*\{[^}]*--background:/)
  })
})
