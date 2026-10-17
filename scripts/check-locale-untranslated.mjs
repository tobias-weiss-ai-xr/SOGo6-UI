#!/usr/bin/env node
/**
 * check-locale-untranslated.mjs — i18n gate for any locale.
 *
 * Usage:
 *   node scripts/check-locale-untranslated.mjs <locale> [file.json ...]
 *
 * With no files, scans src/messages/<locale> for all *.json that have an en
 * sibling (de-only / locale-only files without src/messages/en counterpart
 * are skipped — nothing to compare them against).
 *
 * Fails when:
 *   1. de/<locale> value === en value for prose-length strings (>12 chars,
 *      contains a space), excluding translator-note leaves (`context`, and
 *      `description` ONLY when a sibling `string` exists = note pattern;
 *      standalone `description` values are user-facing and MUST translate)
 *   2. value === its own leaf key name (raw-key fallback)
 *   3. invalid JSON / missing en sibling for explicitly passed files
 *
 * Exit 0 = clean, exit 1 = violations listed on stderr.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'

// Values that are identical in en and <locale> on purpose (tech terms etc.)
const GLOBAL_ALLOWLIST = new Set([
  'Bahasa Indonesia',
  'JMAP / ActiveSync',
  'Passkeys (WebAuthn)',
  'PST / M365 Import & Export',
  'Helpdesk / Ticketing',
  'body { font-family: sans-serif; }',
  'example.org, domain2.org',
])

// Per-locale extras: strings that legitimately stay identical in that language
const LOCALE_ALLOWLIST = {
  de: ['Name (optional)'],
  it: ['Nome (facoltativo)'],
  es: ['Nombre (opcional)'],
  fr: ['Nom (facultatif)'],
}

const SIBLINGS = {}

function flatten(obj, path = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj ?? {})) {
    const p = path ? `${path}/${k}` : `/${k}`
    if (v && typeof v === 'object') {
      flatten(v, p)
    } else {
      out[p] = v
      SIBLINGS[p] = Object.keys(obj) // leaves remember their parent's keys
    }
  }
  return out
}

function isTranslatorNote(relLeafPath) {
  if (relLeafPath.endsWith('/context')) return true
  const leaf = relLeafPath.split('/').pop()
  if (leaf === 'description' && (SIBLINGS[relLeafPath] ?? []).includes('string')) {
    return true
  }
  return false
}

const locale = process.argv[2]
if (!locale || !/^[a-z]{2,4}(-[a-z]+)?$/i.test(locale)) {
  console.error(
    'usage: node scripts/check-locale-untranslated.mjs <locale> [file.json ...]'
  )
  process.exit(2)
}
const root = process.cwd()
const localeDir = join(root, 'src', 'messages', locale)

let files = process.argv.slice(3).map((f) => resolve(f))
if (files.length === 0) {
  const walk = (dir) => {
    let acc = []
    for (const e of readdirSync(dir)) {
      const p = join(dir, e)
      if (statSync(p).isDirectory()) acc = acc.concat(walk(p))
      else if (e.endsWith('.json')) acc.push(p)
    }
    return acc
  }
  files = walk(localeDir).filter((f) => {
    const en = f.replace(`/messages/${locale}/`, '/messages/en/')
    try {
      statSync(en)
      return true
    } catch {
      return false
    }
  })
  if (files.length === 0) {
    console.error(`no locale files with en siblings found under ${localeDir}`)
    process.exit(2)
  }
}

const allow = new Set([
  ...GLOBAL_ALLOWLIST,
  ...(LOCALE_ALLOWLIST[locale] ?? []),
])

let failed = false
let checked = 0
for (const filePath of files) {
  const enPath = filePath
    .replace(`/messages/${locale}/`, '/messages/en/')
    .replace(/\\/g, '/')
  let loc, en
  try {
    loc = JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (e) {
    console.error(`INVALID JSON: ${filePath}: ${e.message}`)
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
  checked++
  const floc = flatten(loc)
  const fen = flatten(en)
  const violations = []
  for (const [k, v] of Object.entries(floc)) {
    if (typeof v !== 'string') continue
    if (isTranslatorNote(k)) continue
    const leaf = k.split('/').pop()
    if (v === leaf) violations.push([k, v, 'raw-key fallback'])
    else if (fen[k] === v && v.length > 12 && v.includes(' ') && !allow.has(v)) {
      violations.push([k, v, 'untranslated (identical to en)'])
    }
  }
  if (violations.length > 0) {
    failed = true
    console.error(`\n${relative(root, filePath)}: ${violations.length} violation(s)`)
    for (const [k, v, why] of violations.slice(0, 20)) {
      console.error(`  ${why}\n    ${k} = ${JSON.stringify(v)}`)
    }
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more`)
    }
  }
}

if (failed) {
  console.error(`\nFAIL: untranslated ${locale} strings remain.`)
  process.exit(1)
}
console.log(`OK: ${checked} file(s) fully translated (${locale}).`)
