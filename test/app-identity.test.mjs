// Two worktrees of this repository can answer the same port. These checks keep the verify tools from
// ever measuring the wrong one silently — the failure is not a crash, it is a green run printed over
// another branch's build, which is the one outcome a gate must never produce.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { defaultBase, repoRoot } from '../app/verify/app-identity.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const verifyDir = join(root, 'app/verify');
const tools = readdirSync(verifyDir).filter((f) => f.endsWith('.mjs'));
const read = (f) => readFileSync(join(root, f), 'utf8');

test('the app stamps the checkout it was served from', () => {
  const cfg = read('vite.config.js');
  assert.ok(/__CD_WORKTREE__/.test(cfg),
    'vite.config.js must define __CD_WORKTREE__ — the page is the only thing that knows where it came from');
  assert.ok(/JSON\.stringify\(process\.cwd\(\)\)/.test(cfg),
    '__CD_WORKTREE__ has to be the dev server’s own cwd, JSON-stringified (a bare identifier ships the string unquoted)');
  const main = read('app/src/main.jsx');
  assert.ok(/data-cd-worktree/.test(main),
    'app/src/main.jsx must stamp data-cd-worktree on <html>, or no verify tool can identify the build');
});

test('no verify tool hardcodes a port any more', () => {
  const offenders = [];
  for (const f of tools) {
    if (f === 'app-identity.mjs') continue;
    read(`app/verify/${f}`).split('\n').forEach((line, i) => {
      // Structural, not comment-shaped: a usage example inside a block comment may or may not carry a
      // leading `*` (two files in this directory write them with bare spaces), and a rule that keys on
      // the comment marker either flags prose or misses code. Only a declaration can ship a port.
      if (!/^\s*(?:const|let|var)\s+BASE\s*=/.test(line)) return;
      if (/127\.0\.0\.1/.test(line) && !/defaultBase\(\)/.test(line)) {
        offenders.push(`app/verify/${f}:${i + 1}`);
      }
    });
  }
  assert.deepEqual(offenders, [],
    `${offenders.join(', ')} assign BASE to a literal address. The default has to come from this tree's `
    + `vite.config.js: four tools here said 5199 and four said 5299, and 5199 is answered by another worktree`);
});

test('every tool that opens a page identifies the server before measuring it', () => {
  const blind = tools.filter((f) => {
    if (f === 'app-identity.mjs') return false;
    const s = read(`app/verify/${f}`);
    return s.includes('chromium.launch()') && !s.includes('assertServedThisCheckout');
  });
  assert.deepEqual(blind, [],
    `${blind.join(', ')} drive a browser without checking that the server is this checkout`);
});

test('the default base is the port this tree configures, not a remembered number', () => {
  const cfg = read('vite.config.js');
  const port = /server:\s*\{[^}]*port:\s*(\d+)/.exec(cfg)[1];
  assert.equal(defaultBase(), `http://127.0.0.1:${port}/`,
    'defaultBase() must read the same number vite.config.js tells the dev server to bind');
  assert.match(repoRoot(), /cyberdeck/, 'repoRoot() resolves to the tree this file lives under');
});
