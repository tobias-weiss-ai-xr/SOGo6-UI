import { readFileSync } from 'fs'
import * as path from 'path'

// WCAG relative luminance + contrast ratio (per W3C formula)
function channel(c: number) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function luminance(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

function readValue(block: string, prop: string): string {
  const match = block.match(new RegExp(`${prop}\\s*:\\s*([^;}]+)`))
  if (!match) throw new Error(`missing ${prop} in: ${block.slice(0, 80)}`)
  return match[1].trim().replace(/;$/, '')
}

describe('classic header search contrast (WCAG on teal #4D8080)', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf8'
  )

  const idleBlock = css.match(
    /\.sogo5-classic header \.text-gray-500 \{[^}]*\}/
  )?.[0]
  const inputBlock = css.match(
    /\.sogo5-classic header input::placeholder \{[^}]*\}/
  )?.[0]

  it('classic header search rules exist in globals.css', () => {
    expect(idleBlock).toBeTruthy()
    expect(inputBlock).toBeTruthy()
  })

  it('idle pill text is >=4.5:1 against the white pill background', () => {
    const text = readValue(idleBlock!, 'color')
    const bg = readValue(idleBlock!, 'background-color')
    expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('placeholder text is >=4.5:1 against the white input background', () => {
    const text = readValue(inputBlock!, 'color')
    // classic header inputs are forced white (same block family); here we
    // verify against the white surface the CSS guarantees
    expect(contrast(text, '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })
})
