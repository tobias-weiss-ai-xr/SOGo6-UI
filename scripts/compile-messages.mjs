/**
 * Build-time message compiler for next-intl standalone mode.
 *
 * Reads all JSON message files from ``src/messages/<locale>/``,
 * deep-merges them into one ``compiled-messages/<locale>.json``,
 * so that ``request.ts`` can use a single static import instead of
 * runtime ``fs.readdirSync`` + dynamic ``import()``.
 *
 * This is required because Next.js standalone output does not support
 * dynamic filesystem access at runtime.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '..');
const SRC_MESSAGES = join(ROOT, 'src', 'messages');
// request.ts (src/lib/i18n/) requires './compiled-messages/<locale>.json',
// which resolves relative to src/lib/i18n/ — so the output MUST live there,
// not in src/compiled-messages/ (previously a silent mismatch that made the
// pre-compiled imports fail at build/dev time and fall back to slow dynamic
// fs loading).
const OUT_DIR = join(ROOT, 'src', 'lib', 'i18n', 'compiled-messages');

// Locales to compile (mirrors src/lib/i18n/config.ts)
const LOCALES = [
  // Existing locales
  'en', 'de', 'fr', 'es', 'zh',
  // European locales
  'it', 'pt', 'nl', 'pl', 'ru', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'tr', 'hu', 'ro',
  // Global locales
  'ja', 'hi', 'ar', 'ko', 'th', 'vi', 'id',
];

function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

function collectMessages(locale) {
  const localeDir = join(SRC_MESSAGES, locale);
  if (!existsSync(localeDir)) {
    console.warn(`[compile-messages] No messages directory for locale "${locale}"`);
    return {};
  }

  const messages = {};

  function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.json')) {
        const raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
        Object.assign(messages, raw);
      }
    }
  }

  walk(localeDir);
  return messages;
}

// ---- Main ----

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

for (const locale of LOCALES) {
  const merged = collectMessages(locale);
  const outPath = join(OUT_DIR, `${locale}.json`);
  writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf-8');
  const count = Object.keys(merged).length;
  console.log(`[compile-messages] ✓ ${locale} → ${outPath} (${count} keys)`);
}

console.log('[compile-messages] Done — all locales compiled.');
