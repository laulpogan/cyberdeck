/** Run the whole verify sweep in parallel shards and aggregate one verdict.
 *
 * `app/verify/index.mjs` is single-browser and honest about it: 63 routes × two widths ×
 * two colour schemes plus the reduced-motion condition is ~260 page loads, and serially
 * that is an hour nobody spends twice. This spawns N of them, each taking every Nth
 * route, and merges their result files so the exit code still means one thing — the
 * suite passed or it did not.
 *
 * It is the CI-shaped entry point; `npm run verify` stays single-process because a
 * person changing one family page should watch one route.
 *
 *   npm run verify:all
 *   SHARDS=6 OUT=/tmp/v node app/verify/all.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SHARDS = Number(process.env.SHARDS || 4);
const OUT = process.env.OUT || '/tmp/cyberdeck-verify';

const dirs = [];
const children = [];
const failed = [];

for (let i = 1; i <= SHARDS; i += 1) {
  const dir = `${OUT}-${i}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  dirs.push(dir);
  const child = spawn(process.execPath, [`${HERE}index.mjs`], {
    env: { ...process.env, SHARD: `${i}/${SHARDS}`, OUT: dir },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const tag = `[${i}/${SHARDS}] `;
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      // The per-shard log is only useful if the shards stay distinguishable, and a
      // summary line from each is the thing worth reading at the end.
      for (const line of chunk.split('\n').filter(Boolean)) process.stdout.write(tag + line + '\n');
    });
  }
  child.on('exit', (code) => { if (code) failed.push(`shard ${i} exited ${code}`); });
  children.push(child);
}

const codes = await Promise.all(children.map((child) => new Promise((resolve) => {
  child.on('exit', (code) => resolve(code ?? 0));
})));

const all = [];
for (const dir of dirs) {
  const file = `${dir}/results.json`;
  if (existsSync(file)) all.push(...JSON.parse(readFileSync(file, 'utf8')));
}
const problems = all.filter((row) => row.bad.length);
console.log(`\n${all.length} passes over ${SHARDS} shards`
  + ` — ${codes.reduce((a, b) => a + b, 0) === 0 && !problems.length ? 'clean' : 'problems'}`);
for (const row of problems) {
  console.log(`✗ ${row.name}\n    ${[...new Set(row.bad)].join('\n    ')}`);
}
for (const note of failed) console.log(`✗ ${note}`);
if (!problems.length && codes.every((code) => code === 0)) {
  console.log(`✓ every claim held. ${dirs.length} result files under ${OUT}-*`);
} else {
  process.exit(1);
}
