/**
 * Migrate unguarded ``console.error`` / ``console.warn`` calls to
 * ``logger.error`` / ``logger.warn`` (``@/lib/logger``).
 *
 * Usage:  node scripts/migrate-to-logger.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SRC = join(ROOT, 'src');
const IMPORT_LINE = `import { logger } from '@/lib/logger'`;

function isSkip(path) {
  return path.includes('fakeApi') || path.endsWith('.md') || path.includes('lib/logger.ts');
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '__tests__', '.next', 'coverage'].includes(entry.name)) {
        files.push(...walk(full));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function addImport(src) {
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i].trim())) {
      lastImport = i;
    }
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, IMPORT_LINE);
  } else {
    lines.unshift(IMPORT_LINE);
  }
  return lines.join('\n');
}

function migrate(src) {
  // Pattern 1: console.error('msg', errorVar)  -->  logger.error('msg', { error: errorVar })
  src = src.replace(
    /console\.error\(('[^']*'|`[^`]*`),\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\)/g,
    (_, msg, varName) => `logger.error(${msg}, { error: ${varName} })`
  );
  // Pattern 2: console.error('msg')
  src = src.replace(
    /console\.error\(('[^']*'|`[^`]*`)\)/g,
    (_, msg) => `logger.error(${msg})`
  );
  // Pattern 3: console.warn('msg', extra)  -->  logger.warn('msg', { detail: extra })
  src = src.replace(
    /console\.warn\(('[^']*'|`[^`]*`),\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\)/g,
    (_, msg, varName) => `logger.warn(${msg}, { detail: ${varName} })`
  );
  // Pattern 4: console.warn('msg')
  src = src.replace(
    /console\.warn\(('[^']*'|`[^`]*`)\)/g,
    (_, msg) => `logger.warn(${msg})`
  );
  // Pattern 5: Template literals with embedded expressions (e.g. console.warn(`prefix ${var} suffix`))
  src = src.replace(
    /console\.(error|warn)\((`[^`]*`)\)/g,
    (_, level, tmpl) => `logger.${level}(${tmpl})`
  );
  return src;
}

// ---- Main ----
let count = 0;
for (const f of walk(SRC)) {
  if (isSkip(f)) continue;

  let src = readFileSync(f, 'utf-8');
  const orig = src;
  src = migrate(src);

  // Add import if not present and logger is now used
  if (src.includes('logger.error') || src.includes('logger.warn')) {
    if (!src.includes(IMPORT_LINE)) {
      src = addImport(src);
    }
  }

  if (src !== orig) {
    writeFileSync(f, src, 'utf-8');
    console.log(`  ${relative(ROOT, f)}`);
    count++;
  }
}
console.log(`\nDone. ${count} files migrated.`);
