/** Which components actually hold a reference, and which only have a wish.
 *
 * Two coverage numbers exist in this vault and they measure different things, which is how they
 * started disagreeing in prose:
 *
 *   - `vault/map.py` joins **files** — a ranked, eye-marked moving file whose subject resembles the
 *     component. A component can have eleven files and no measurement taken from any of them.
 *   - `vault/SPECS-FOR.json` records that a **spec was read off a verified file and quoted against
 *     the component** — the thing step 3 of the goal actually asks for.
 *
 * Only the second one makes a component buildable against a reference, so it is the number quoted
 * as coverage. This prints all three tiers and names every component that has no reference at all,
 * because "34 components lack references" is not a work list and a named list is.
 *
 *   node vault/coverage.mjs          # writes vault/COVERAGE.md and prints the one-line truth
 *   node vault/coverage.mjs --check  # exits 1 if the tiers stop adding up to the registry
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { COMPONENT_KEYS } from '../app/src/registry/index.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SPECS_FOR = JSON.parse(readFileSync(join(HERE, 'SPECS-FOR.json'), 'utf8'));
const MAPPING = readFileSync(join(HERE, 'MAPPING.md'), 'utf8');
const MANIFEST = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));

/** Files held per component, read out of the table `map.py` generates. */
function filesHeld () {
  const held = new Map();
  for (const line of MAPPING.split('\n')) {
    const m = line.match(/^\|\s*`([A-Za-z][A-Za-z0-9]*)`\s*\|([^|]*)\|[^|]*\|\s*(\d+)\s*\|/);
    if (m) held.set(m[1], { seed: m[2].trim(), files: Number(m[3]) });
  }
  return held;
}

/** Components named by a **content-verified** manifest record. This is the only tier below
 * `spec` that means anything: everything else on disk is a search hit. Two of the biggest seeds
 * were opened after this distinction was introduced — `rig` (25 candidates, meant to inform
 * `gauge`, `ice` and `individuation`) and `spinner-console` (11 candidates, meant to inform
 * `collar` and `joiOverlay`) — and between them they yielded nothing usable: a cutscene, a 3D
 * suit turntable on a blue background, a flying spaceship, an Undertale fan animation, and a set
 * of film-UI stills from a show whose spinner has no time in it. A count of seed-mates counted as
 * "files held" was therefore a number that made the vault look deeper than it is. */
function verifiedNamed () {
  const named = new Map();
  const registry = new Set(COMPONENT_KEYS);
  for (const rec of Object.values(MANIFEST.files)) {
    if (!rec.contentVerified) continue;
    const file = String(rec.file || '').split('/').pop();
    for (const name of rec.for || []) {
      if (!registry.has(name)) continue;
      if (!named.has(name)) named.set(name, []);
      named.get(name).push(file);
    }
  }
  return named;
}

/** Components quoted in SPECS-FOR, restricted to names the registry can render. */
function specQuoted () {
  const registry = new Set(COMPONENT_KEYS);
  const quoted = new Map();
  for (const [file, entry] of Object.entries(SPECS_FOR)) {
    if (file === '_about') continue;
    for (const name of entry.for || []) {
      if (!registry.has(name)) continue;
      if (!quoted.has(name)) quoted.set(name, []);
      quoted.get(name).push(file);
    }
  }
  return quoted;
}

export function coverage () {
  const files = filesHeld();
  const quoted = specQuoted();
  const verified = verifiedNamed();
  const tiers = { spec: [], verifiedOnly: [], candidates: [], none: [] };
  for (const key of COMPONENT_KEYS) {
    if (quoted.has(key)) tiers.spec.push({ key, files: quoted.get(key) });
    else if (verified.has(key)) tiers.verifiedOnly.push({ key, files: verified.get(key) });
    else if ((files.get(key) || {}).files > 0) tiers.candidates.push({ key, files: (files.get(key)).files, seed: (files.get(key)).seed });
    else tiers.none.push(key);
  }
  return { tiers, total: COMPONENT_KEYS.length, files, quoted, verified };
}

const { tiers, total } = coverage();

if (process.argv.slice(2).includes('--check')) {
  const sum = tiers.spec.length + tiers.verifiedOnly.length + tiers.candidates.length + tiers.none.length;
  if (sum !== total) {
    console.error(`coverage tiers sum to ${sum}, the registry renders ${total} — a component is counted twice or not at all`);
    process.exit(1);
  }
  if (!tiers.spec.length) { console.error('no component is quoted in SPECS-FOR; coverage is zero'); process.exit(1); }
  console.log(`coverage tiers add up: ${tiers.spec.length} spec-held + ${tiers.verifiedOnly.length} verified-unquoted `
    + `+ ${tiers.candidates.length} search candidates only + ${tiers.none.length} with nothing = ${total}`);
  process.exit(0);
}

const lines = [
  '# Reference coverage, by tier',
  '',
  `Generated by \`vault/coverage.mjs\`. The registry renders **${total}** components.`,
  '',
  '| tier | meaning | count |',
  '| --- | --- | --- |',
  `| spec-held | a verified file's measurement is quoted against it in \`SPECS-FOR.json\` — buildable against a reference | ${tiers.spec.length} |`,
  `| verified, unquoted | a content-verified file names it in the manifest, but no measurement has been read off it | ${tiers.verifiedOnly.length} |`,
  `| search candidates only | files sit in \`raw/\` under the seed chosen for it, and **not one has been verified** — these are search hits, not references | ${tiers.candidates.length} |`,
  `| nothing | neither | ${tiers.none.length} |`,
  '',
  'These are not interchangeable, and the middle tier used to lie. It read "files only" off',
  '`MAPPING.md`, which counts *seed-mates* — everything a search returned for the subject chosen',
  'for that component. Opening two of the biggest seeds to check: `rig` (25 candidates, meant for',
  '`gauge`, `ice`, `individuation`) — its four biggest tenor candidates were a cutscene, a 3D suit',
  'turntable on a blue background, a flying spaceship and an Undertale fan animation (the seed does',
  'hold one verified file, a gifcities capture already quoted for `radar`; the drift is in the bulk',
  'nobody opened). `spinner-console` (11 candidates, meant for `collar` and `joiOverlay`) is film-UI',
  'stills of a device with no time in it, and step 3 asks for durations, easing and loop period.',
  'Between 36 unverified candidates: zero additional references.',
  'So only the first two tiers mean anything, the number quoted as coverage in prose is the',
  'spec-held tier, and a candidate count is a statement about a search query, not about the vault.',
  '',
  `## Spec-held (${tiers.spec.length})`,
  '',
  ...tiers.spec.map((r) => `- \`${r.key}\` ← ${r.files.map((f) => `\`${f}\``).join(', ')}`),
  '',
  `## Verified, quoted nowhere (${tiers.verifiedOnly.length})`,
  '',
  ...(tiers.verifiedOnly.length
      ? tiers.verifiedOnly.map((r) => `- \`${r.key}\` ← ${r.files.map((f) => `\`${f}\``).join(', ')}`)
      : ['_(none — every verified file has had its reading written down)_']),
  '',
  `## Search candidates only — opened and, where checked, refused (${tiers.candidates.length})`,
  '',
  ...tiers.candidates.map((r) => `- \`${r.key}\` — ${r.files} candidate(s) under seed \`${r.seed}\`, 0 verified`),
  '',
  `## Nothing at all (${tiers.none.length})`,
  '',
  ...tiers.none.map((k) => `- \`${k}\``),
  '',
];
writeFileSync(join(HERE, 'COVERAGE.md'), lines.join('\n'));
console.log(`${tiers.spec.length} of ${total} spec-held · ${tiers.verifiedOnly.length} verified unquoted `
  + `· ${tiers.candidates.length} candidates only · ${tiers.none.length} with nothing — COVERAGE.md`);
