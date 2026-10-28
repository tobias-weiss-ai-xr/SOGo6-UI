#!/usr/bin/env node
/**
 * German locale checker — flags untranslated English strings in src/messages/de/.
 *
 * Usage: node scripts/check-german-strings.mjs [file ...]
 *   With no args, checks ALL de/**\/*.json files.
 *   Exits 1 if any suspect (likely-untranslated) string is found.
 *
 * Heuristic: whole-word English function words / common UI verbs that do not
 * occur in German UI copy (conservative list — avoids loanwords like
 * "Mail", "Download", "Login" that are valid German UI terms).
 */
import fs from 'fs'
import path from 'path'

const EN_WORDS = /\b(the|and|of|with|for|from|Search|Options|Folders|Settings|Delete|Cancel|Save|Loading|Reply|Forward|New|Open|Close|Edit|Send|All|More|Back|Next)\b/

const args = process.argv.slice(2)
const root = path.resolve('src/messages/de')
let files = args.map((f) => path.resolve(f))
if (files.length === 0) {
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(d, e.name)
      return e.isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : []
    })
  files = walk(root)
}

let bad = 0
for (const file of files) {
  let data
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON — ${e.message}`)
    bad++
    continue
  }
  const rel = path.relative(process.cwd(), file)
  const hit = (obj, keyPath) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'string' && typeof v === 'string' && EN_WORDS.test(v)) {
        console.error(`  ${rel}  ${[...keyPath, k].join('.')}  =>  "${v}"`)
        bad++
      } else if (typeof v === 'object' && v !== null) {
        hit(v, [...keyPath, k])
      }
    }
  }
  hit(data, [])
}

if (bad > 0) {
  console.error(`\n✗ ${bad} suspect untranslated string(s) in de locale`)
  process.exit(1)
}
console.log('✓ no untranslated English strings detected')
