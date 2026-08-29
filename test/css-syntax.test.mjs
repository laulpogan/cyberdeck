// CSS comments, not C++ ones.
//
// `app/styles/app.css` opened with seven `//` lines from the day it was written. Dev server
// served them, browsers ignored them as invalid declarations, and the production build died in
// `lightningcss minify` with "Invalid empty selector" — a failure nobody saw because the showcase
// is run with `npm run app`, and the first `npm run app:build` since Phase 1 was the one that
// found this. A defect that only bites at build time needs a test, not a memory.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// Takes an absolute directory. The first draft joined `root` at every level of the recursion,
// which walked into a path that cannot exist.
function cssFiles(absDir) {
  const out = [];
  for (const entry of readdirSync(absDir)) {
    const full = join(absDir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFiles(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

test('no stylesheet in the library or the rack uses a // comment', () => {
  const offenders = [];
  for (const dir of ['src', 'app']) {
    for (const file of cssFiles(join(root, dir))) {
      // Strip the comments that ARE legal first: a `//` inside a prose block comment, or in a
      // url(), is not the defect. What is left is the stylesheet proper, and a double slash in
      // it is a line lightningcss will not parse.
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (block) =>
        block.replace(/[^\n]/g, ' '));
      css.split('\n').forEach((line, i) => {
        if (/\/\//.test(line) && !/url\(/.test(line)) offenders.push(`${file.replace(root, '')}:${i + 1}`);
      });
    }
  }
  assert.deepEqual(offenders, [],
    `${offenders.join(', ')} use a // comment; lightningcss calls the next line an empty `
    + `selector and "npm run app:build" dies with it`);
});
