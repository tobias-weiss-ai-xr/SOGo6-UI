#!/usr/bin/env node
/**
 * check-de-untranslated.mjs — gate for the German i18n campaign.
 *
 * For each given de locale file, compares it against its en sibling and fails
 * on:
 *   1. untranslated leftovers: de value === en value for prose-length strings
 *      (>12 chars, contains a space), excluding translator-note `context`
 *      keys and the ALLOWLIST of strings that are legitimately identical in
 *      German (technical terms, language names, example placeholders)
 *   2. raw-key fallbacks: de value === its own leaf key name
 *   3. invalid JSON / missing en sibling
 *
 * Exit 0 = clean, exit 1 = violations listed on stderr.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

// Values that are identical in en and de on purpose.
const ALLOWLIST = new Set([
  'Name (optional)',
  'body { font-family: sans-serif; }',
  'example.org, domain2.org',
  'JMAP / ActiveSync',
  'Bahasa Indonesia',
  'Passkeys (WebAuthn)',
  'PST / M365 Import & Export',
  'Helpdesk / Ticketing',
])

function flatten(obj, path = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj ?? {})) {
    const p = path ? `${path}/${k}` : `/${k}`
    if (v && typeof v === 'object') Object.assign(out, flatten(v, p))
    else out[p] = v
  }
  return out
}

let failed = false
const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('usage: node scripts/check-de-untranslated.mjs <de-file.json> [...]')
  process.exit(2)
}

for (const dePath of files) {
  const abs = resolve(dePath)
  const enPath = abs.replace('/messages/de/', '/messages/en/')
  let de, en
  try {
    de = JSON.parse(readFileSync(abs, 'utf8'))
  } catch (e) {
    console.error(`INVALID JSON: ${dePath}: ${e.message}`)
    failed = true
    continue
  }
  try {
    en = JSON.parse(readFileSync(enPath, 'utf8'))
  } catch {
    console.error(`MISSING/INVALID EN SIBLING: ${enPath}`)
    failed = true
    continue
  }
  const fd = flatten(de)
  const fe = flatten(en)
  const violations = []
  for (const [k, v] of Object.entries(fd)) {
    if (typeof v !== 'string') continue
    if (k.endsWith('/context')) continue // translator notes stay English
    const leaf = k.split('/').pop()
    if (v === leaf) violations.push([k, v, 'raw-key fallback'])
    else if (
      fe[k] === v &&
      v.length > 12 &&
      v.includes(' ') &&
      !ALLOWLIST.has(v)
    ) {
      violations.push([k, v, 'untranslated (identical to en)'])
    }
  }
  if (violations.length > 0) {
    failed = true
    console.error(`\n${dePath}: ${violations.length} violation(s)`)
    for (const [k, v, why] of violations) {
      console.error(`  ${why}\n    ${k} = ${JSON.stringify(v)}`)
    }
  }
}

if (failed) {
  console.error('\nFAIL: untranslated German strings remain.')
  process.exit(1)
}
console.log(`OK: ${files.length} file(s) fully translated.`)
