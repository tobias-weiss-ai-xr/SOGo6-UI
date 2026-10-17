import { readFileSync } from 'fs'
import * as path from 'path'

/**
 * Regression test: Radix Checkbox/RadioGroup/Switch render as
 * <button role="checkbox|radio|switch">, so the WCAG 2.5.5 44px
 * min-height/min-width rule on bare `button` blows them up to 44x44px
 * regardless of their Tailwind size classes (min-width/min-height beat
 * width/height in CSS). The result was giant checkboxes across the app.
 *
 * The 44px target-size rule must stay for regular buttons/links, but
 * toggle controls must be exempt so their size classes apply.
 */
describe('toggle controls are exempt from the 44px target-size floor', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf8'
  )

  const floorRule = css.match(
    /button,[^{]*\{[^}]*min-height:\s*44px[^}]*\}/
  )?.[0]

  it('the 44px target-size rule still exists (WCAG 2.5.5)', () => {
    expect(floorRule).toBeTruthy()
    expect(floorRule).toMatch(/min-width:\s*44px/)
  })

  it.each(['checkbox', 'radio', 'switch'])(
    'button[role="%s"] is exempted back to content size',
    (role) => {
      const exemption = css.match(
        new RegExp(
          `button\\[role="(?:checkbox|radio|switch)"[^{]*\\][^{]*\\{[^}]*\\}`
        )
      )?.[0]
      expect(exemption).toBeTruthy()
      expect(exemption).toMatch(new RegExp(`\\[role="${role}"\\]`))
      expect(exemption).toMatch(/min-height:\s*0/)
      expect(exemption).toMatch(/min-width:\s*0/)
    }
  )
})
