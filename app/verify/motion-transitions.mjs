/** Before/after: which components did this branch actually change the motion OF, and in which commit?
 *
 * Task-4's contract is "each change driven by a named reference and a named gap, with before/after
 * filmstrips to prove the change". A memory of which commit moved which plate is not that evidence, and
 * this session has already been bitten three times by remembering a file's shape wrongly. So the
 * attribution is derived: the motion signature of every component is rendered at every commit in a
 * range, and the commits where a signature changes are named by `git log`.
 *
 * A signature is the count of each `data-motion` kind in the component's bright render. That is a
 * deliberate proxy for "what moves": it is server-side, so 75 commits cost about a minute instead of
 * the ~11 minutes a filmstrip pass costs. It cannot see a duration or an easing — for those, the
 * filmstrip pass over the endpoints is the instrument, and both are used together:
 *
 *   # 1. a build of the branch point, on its own port
 *   git worktree add /tmp/cdb $(git merge-base origin/app/pi HEAD)
 *   ln -s <this repo>/node_modules /tmp/cdb/node_modules
 *   (cd /tmp/cdb && ./node_modules/.bin/vite --port 5300 --host 127.0.0.1 &)
 *
 *   # 2. the components whose markup differs, and their motion signatures at every commit
 *   node app/verify/motion-transitions.mjs /tmp/cdb fe73d9f..HEAD
 *
 *   # 3. filmstrips of the same keys from both builds — pixels, durations, loop turnover
 *   KEYS=$(...) BASE=http://127.0.0.1:5300 OUT=/tmp/film-before node app/verify/filmstrip.mjs
 *   KEYS=$(...) BASE=http://127.0.0.1:5299 OUT=/tmp/film-after  node app/verify/filmstrip.mjs
 *
 * Two failures this script exists instead of a shell one-liner: a `2>/dev/null` on the per-commit
 * render reported "75 signatures recorded" while every payload was empty (the module was importing
 * `./app/...` relative to /tmp), and `git rev-list` run inside a detached worktree returned no commits
 * at all. Both looked like results. Here a render that throws is recorded as `threw:` and counted.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [tree, range] = process.argv.slice(2);
if (!tree || !range) {
  console.error('usage: node app/verify/motion-transitions.mjs <worktree-with-that-commit> <rev-range>');
  process.exit(2);
}

// The range is resolved in the repository running the tool, never inside the tree being swept:
// that tree is checked out to a detached commit, where a range ending in HEAD names nothing at
// all, and the sweep would report a spotless history. (This happened; the empty-range error below
// is why it is now written down.)
const shas = execFileSync('git', ['rev-list', '--reverse', range], { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);
if (!shas.length) { console.error(`${range} named no commits in ${tree}`); process.exit(1); }

// The probe is copied into the tree being swept at the same relative depth it lives at here, so its
// own imports resolve there. Inlining its source as a string is what made the sweep lie once already.
const here = new URL('.', import.meta.url);
const probe = join(tree, 'app', 'verify', 'motion-signature.mjs');
copyFileSync(join(here.pathname, 'motion-signature.mjs'), probe);
const seq = [];
let broke = 0;
try {
  for (const sha of shas) {
    execFileSync('git', ['-C', tree, 'checkout', '-q', sha]);
    let sig;
    try {
      sig = JSON.parse(execFileSync('node', [join('app', 'verify', 'motion-signature.mjs')], { cwd: tree, encoding: 'utf8' }));
    } catch (err) {
      broke += 1;
      console.error(`render failed at ${sha.slice(0, 7)}: ${String(err.stderr || err.message).slice(0, 80)}`);
      sig = {};
    }
    seq.push({ sha, sig });
  }
} finally {
  execFileSync('git', ['-C', tree, 'checkout', '-q', shas[shas.length - 1]]);
  // Only the copy is removed — the module in this repository is a tracked file.
  rmSync(probe, { force: true });
}

const fmt = (s) => (s ? Object.entries(s).map(([k, v]) => `${k}:${v}`).sort().join(' ') : '(unrenderable)');
const last = new Map();
const moves = new Map();
for (const { sha, sig } of seq) {
  for (const key of new Set([...Object.keys(sig), ...last.keys()])) {
    const now = fmt(sig[key]);
    if (last.has(key) && last.get(key) !== now) {
      if (!moves.has(key)) moves.set(key, []);
      moves.get(key).push({ sha, from: last.get(key), to: now });
    }
    last.set(key, now);
  }
}

const subject = (sha) => execFileSync('git', ['-C', tree, 'log', '-1', '--format=%h %s', sha],
  { encoding: 'utf8' }).trim();
console.log(`signatures: ${seq.length} commit(s)${broke ? `, ${broke} failed to render` : ''}`);
for (const [key, list] of [...moves.entries()].sort()) {
  console.log(`\n${key}`);
  for (const m of list) console.log(`  ${subject(m.sha)}\n    ${m.from}  →  ${m.to}`);
}
if (!moves.size) console.log('no component changed its motion signature across the range');
