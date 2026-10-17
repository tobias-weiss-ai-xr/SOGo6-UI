import { readFileSync } from 'fs'
import * as path from 'path'

/**
 * Regression tests for the button target-size strategy.
 *
 * History: a WCAG 2.5.5 (AAA) blanket rule set min-height/min-width: 44px
 * on EVERY `button` and added `button + button { margin: 4px }`. Side
 * effects users actually saw:
 *  - unsized icon buttons (dialog/sheet close X) inflated to 44x44 with
 *    the icon stuck top-left — asymmetric hover/focus ring, off-center
 *  - every toolbar (mark all read/unread, bulk actions) got asymmetric
 *    extra 4px margins stacked on top of designed gap spacing
 *  - Radix Checkbox/Radio/Switch (rendered as <button role=…>) forced to
 *    44px regardless of Tailwind size classes (fixed in 2cecf6d)
 *
 * Strategy now: NO blanket floor, NO sibling margins. Target size is an
 * OPT-IN utility (.touch-target, 44px, WCAG 2.5.5 AAA) applied
 * deliberately; component sizes + layout gaps cover WCAG 2.5.8 (AA).
 */
describe('button target-size strategy is opt-in, not blanket', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf8'
  )

  it('no blanket 44px floor on bare button/[role=button]/[role=link]', () => {
    expect(css).not.toMatch(/button,[^{]*\{[^}]*min-height:\s*44px[^}]*\}/)
  })

  it('no blanket sibling margin rule (button + button / input + input)', () => {
    expect(css).not.toMatch(/button\s*\+\s*button[^{]*\{[^}]*margin/)
    expect(css).not.toMatch(/input\s*\+\s*input[^{]*\{[^}]*margin/)
  })

  it('opt-in .touch-target utility exists (44px, WCAG 2.5.5 AAA)', () => {
    const utility = css.match(/@utility touch-target[^{]*\{[^}]*\}/)
    expect(utility).toBeTruthy()
    expect(utility![0]).toMatch(/min-height:\s*44px/)
    expect(utility![0]).toMatch(/min-width:\s*44px/)
  })
})
