// The token ratchet, extended to the showcase.
//
// The library already refuses colour literals in `src/` -- `components.test.mjs`
// and its siblings assert it per component. The app is where that rule is most
// likely to leak, because chrome tempts you: one hex for a border, one rgba for
// a wash, and the palette is now defined in two places, which is the exact
// failure the token file exists to prevent. So the ratchet reads the app too,
// and the app reads the tokens.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HEX = /#[0-9a-fA-F]{3,6}\b/g;
const EXTENSIONS = new Set(['.js', '.mjs', '.jsx', '.css']);
// The one file allowed to name a colour. Everything else reads it.
const ALLOWED = ['src/tokens.css'];

function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(join(ROOT, full));
    if (stat.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(extname(entry))) out.push(full);
  }
  return out;
}

test('no colour literal outside src/tokens.css, in the library or the app', () => {
  const offenders = [];
  for (const dir of ['src', 'app', 'react']) {
    for (const file of walk(dir)) {
      if (ALLOWED.includes(file)) continue;
      const hits = readFileSync(join(ROOT, file), 'utf8').match(HEX) || [];
      if (hits.length) offenders.push(`${file}: ${hits.join(' ')}`);
    }
  }
  assert.deepEqual(offenders, [], 'colour literals outside the token file');
});

test('tokens.css is the only file that declares a colour, and it still declares them', () => {
  const tokens = readFileSync(join(ROOT, 'src/tokens.css'), 'utf8');
  assert.ok((tokens.match(HEX) || []).length > 40, 'the token file should still be the palette');
});

test('the three theme states are all present, and the media query stays guarded', () => {
  const tokens = readFileSync(join(ROOT, 'src/tokens.css'), 'utf8');
  assert.match(tokens, /:root\s*\{/, 'a bare :root carries the light palette');
  assert.match(tokens, /@media \(prefers-color-scheme: dark\)/, 'the OS decides when nothing is chosen');
  assert.match(tokens, /:root:not\(\[data-theme="light"\]\)/,
    'the dark media query must not win over an explicit light choice');
  assert.match(tokens, /:root\[data-theme="dark"\]/, 'an explicit dark choice beats a light OS');
});

test('the app sets the font token the library leaves to its host', () => {
  const css = readFileSync(join(ROOT, 'app/styles/app.css'), 'utf8');
  assert.match(css, /--cd-mono:/, 'components.css reads --cd-mono with an inherit fallback');
  assert.match(css, /box-sizing: border-box/,
    'a component sized with padding and a 1px frame overflows its cell without this');
});
