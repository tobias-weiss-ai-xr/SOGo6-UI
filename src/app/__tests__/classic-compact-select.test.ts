import { readFileSync } from 'fs'
import * as path from 'path'

function readValue(block: string, prop: string): string {
  const match = block.match(new RegExp(`${prop}\\s*:\\s*([^;}]+)`))
  if (!match) throw new Error(`missing ${prop} in: ${block.slice(0, 80)}`)
  return match[1].trim().replace(/;$/, '')
}

describe('classic compact select triggers (spec 1.2)', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf8'
  )

  const classicRule = css.match(
    /\.sogo5-classic [^{]*combobox[^{]*\{[^}]*\}/
  )?.[0]

  it('classic-scoped combobox height rule exists (≤32px)', () => {
    expect(classicRule).toBeTruthy()
    const height = readValue(classicRule!, 'height')
    const rem = parseFloat(height.replace('rem', ''))
    if (height.includes('rem')) {
      expect(rem * 16).toBeLessThanOrEqual(32)
    } else {
      expect(parseFloat(height)).toBeLessThanOrEqual(32)
    }
  })
})
